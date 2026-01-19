# JSBlind - Smart Window Blinds E-commerce Platform

A modern, feature-rich e-commerce platform for smart window blinds built with React, Vite, and Firebase.

## 🚀 Features

### Core Features
- **Product Catalog**: Browse and search through various blind categories
- **Smart Product Customization**: Configure blinds with custom dimensions, colors, and features
- **Shopping Cart & Checkout**: Seamless shopping experience with cart management
- **User Authentication**: Secure login and account management
- **Order Tracking**: Real-time order status updates
- **Admin Dashboard**: Comprehensive management interface for products, orders, and customers

### 🎯 Integrated Order Management System (New!)
- **Complete Order Lifecycle**: From order creation to delivery tracking
- **Google Sheets Integration**: Real-time synchronization with Google Sheets
- **Factory Integration**: One-click order placement to factory
- **Multi-Channel Notifications**: Telegram + Email alerts
- **Inventory Management**: Automatic stock tracking and low-stock alerts
- **Return Management**: Complete return and refund processing
- **Batch Operations**: Update multiple orders simultaneously
- **Advanced Filtering**: Search, filter by status, date range
- **CSV Export**: Export orders for external processing

See [ORDER_MANAGEMENT_GUIDE.md](./ORDER_MANAGEMENT_GUIDE.md) for complete setup and usage guide.

### ✨ Animation Features
- **Smooth Page Transitions**: Fade animations between route changes
- **Scroll Reveal Animations**: Elements animate into view as you scroll
- **Interactive Hover Effects**: Lift, scale, and glow effects on interactive elements
- **Loading States**: Professional loading spinners and skeleton screens
- **Micro-interactions**: Subtle animations that enhance user experience

See [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) for detailed animation documentation.


## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: CSS with CSS Variables
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jsblindcom
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

## 🎨 Animation Components

### ScrollReveal
```jsx
import ScrollReveal from './components/ScrollReveal';

<ScrollReveal animation="fade" delay={100}>
  <YourComponent />
</ScrollReveal>
```

### LoadingSpinner
```jsx
import LoadingSpinner from './components/LoadingSpinner';

<LoadingSpinner fullScreen text="Loading..." />
```

### PageTransition
Already integrated in App.jsx for automatic page transitions.

## 📁 Project Structure

```
jsblindcom/
├── src/
│   ├── components/       # Reusable components
│   │   ├── ScrollReveal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PageTransition.jsx
│   │   └── ...
│   ├── pages/           # Page components
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   │   └── useScrollReveal.js
│   ├── lib/             # Firebase configuration
│   └── index.css        # Global styles + animations
├── public/              # Static assets
└── ANIMATION_GUIDE.md   # Animation documentation
```

## 🎯 Key Features Implementation

### Admin Dashboard
- Product Management (CRUD operations)
- Order Management
- Customer Management
- Analytics & Reports
- Content Management System

### Customer Features
- Product browsing with filters
- Custom blind configuration
- Shopping cart
- Secure checkout
- Order tracking
- Account management

## 🚀 Deployment

The project is configured for Cloudflare Pages deployment:

```bash
npm run build
```

The build output will be in the `dist` directory.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for JSBlind.

## 📞 Contact

For support or inquiries:
- Phone: 214-649-9992
- Address: 5699 State Highway 121, The Colony, TX 75056

---

Built with ❤️ by the JSBlind team
