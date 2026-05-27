import Stripe from 'stripe';

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // Ensure the secret key is configured
        if (!env.STRIPE_SECRET_KEY) {
            return new Response(JSON.stringify({ error: "Stripe Secret Key is not configured." }), { status: 500 });
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient() // IMPORTANT for Cloudflare Workers
        });

        const data = await request.json();
        const { items, orderId, finalTotal, customerEmail } = data;

        // Map cart items to Stripe line items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.title,
                    description: `${item.product.width || ''}"W x ${item.product.height || ''}"H - ${item.product.selectedColor || ''}`,
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
            },
            quantity: item.quantity,
        }));

        // If there's a difference between total line items and finalTotal (e.g. discounts)
        // We can add a coupon/discount line item, but the simplest way is to pass the adjusted items,
        // or just apply an overall discount. For dynamic discounts, it's complex in Stripe.
        // For now, we'll just trust the line items.
        // Wait! We should adjust the price if there's a coupon or volume discount.
        // Let's calculate the difference.
        const sumLineItems = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const discountAmount = sumLineItems - finalTotal;

        if (discountAmount > 0) {
            // Add a negative line item? Stripe doesn't allow negative line items easily.
            // Alternative: Stripe Coupons. Or adjust the line items proportionally?
            // A simpler way for a dynamic cart is to just pass ONE custom line item called "Order Total",
            // OR use a Stripe Coupon dynamically created, OR just adjust the first item's price.
            // For now, let's keep line items but note that complex discounts might need server-side logic.
            // Let's pass a generic "Discount" if needed, but wait: Stripe Checkout does not allow negative `unit_amount`.
            // Instead, we will use a dynamically created Stripe Coupon.
            let couponId = undefined;
            if (discountAmount > 0) {
                const coupon = await stripe.coupons.create({
                    amount_off: Math.round(discountAmount * 100),
                    currency: 'usd',
                    duration: 'once',
                    name: 'Order Discount',
                });
                couponId = coupon.id;
            }

            const sessionParams = {
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${new URL(request.url).origin}/track-order?id=${orderId}&email=${encodeURIComponent(customerEmail || '')}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${new URL(request.url).origin}/checkout`,
                customer_email: customerEmail || undefined,
                client_reference_id: orderId,
            };

            if (couponId) {
                sessionParams.discounts = [{ coupon: couponId }];
            }

            const session = await stripe.checkout.sessions.create(sessionParams);

            return new Response(JSON.stringify({ id: session.id, url: session.url }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${new URL(request.url).origin}/track-order?id=${orderId}&email=${encodeURIComponent(customerEmail || '')}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${new URL(request.url).origin}/checkout`,
                customer_email: customerEmail || undefined,
                client_reference_id: orderId,
            });

            return new Response(JSON.stringify({ id: session.id, url: session.url }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
