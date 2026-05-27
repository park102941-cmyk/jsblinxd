import React from 'react';
import { Settings, ArrowUp, ArrowDown, RefreshCw, Copy, CheckCircle2, AlertCircle, StopCircle, RadioReceiver } from 'lucide-react';

const StepCard = ({ title, steps, icon: Icon, color }) => (
    <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{
            position: 'absolute', top: '-15px', right: '-15px',
            opacity: 0.05, transform: 'scale(2.5)', color: color
        }}>
            <Icon size={100} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{
                background: `${color}15`, color: color, padding: '10px', borderRadius: '12px'
            }}>
                <Icon size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1d1d1f' }}>
                {title}
            </h3>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                        minWidth: '24px', height: '24px', borderRadius: '50%',
                        background: color, color: '#fff', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', marginTop: '2px'
                    }}>
                        {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.5' }}>
                        {step}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RemoteInfographic = () => {
    return (
        <div style={{ padding: '40px 0', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1d1d1f', marginBottom: '16px' }}>
                    Dooya Motor Remote Programming Guide
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    Follow these step-by-step instructions specifically designed for the Dooya DM25TE/S series tubular motors.
                </p>
            </div>

            {/* Remote Layout Image Reference */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <img 
                    src="https://manuals.plus/wp-content/uploads/2025/02/DOOYA-DM25TE-S-1.5-Series-DC-Tubular-Motor-Button-Instructions-550x224.jpg"
                    alt="Dooya Remote and Motor Buttons Diagram"
                    style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e5e5'
                    }}
                />
            </div>

            {/* Note alert */}
            <div style={{
                background: '#fff8e6', borderLeft: '4px solid #f59e0b',
                padding: '16px 20px', borderRadius: '0 12px 12px 0', marginBottom: '40px',
                display: 'flex', gap: '12px', alignItems: 'flex-start'
            }}>
                <AlertCircle size={20} color="#f59e0b" style={{ marginTop: '2px' }} />
                <div>
                    <strong style={{ display: 'block', color: '#b45309', marginBottom: '4px' }}>Important Tips</strong>
                    <span style={{ color: '#92400e', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        The <strong>P1 button</strong> is located on the motor head. The <strong>P2 button</strong> is usually inside the remote's battery cover. Pay close attention to timing: pressing buttons simultaneously vs. sequentially, and holding durations (2s vs 10s).
                    </span>
                </div>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px'
            }}>
                {/* 1. Pairing */}
                <StepCard 
                    title="1. Initial Pairing"
                    icon={RadioReceiver}
                    color="#3b82f6"
                    steps={[
                        <span>Press and hold <strong>P1</strong> on the motor for 2 seconds (Motor jogs 1x, beeps long).</span>,
                        <span>Within 10 seconds, press and hold <strong>STOP</strong> on the remote for 2 seconds.</span>,
                        <span>The motor will jog 2x and beep 3x. <strong>Pairing is complete!</strong></span>
                    ]}
                />

                {/* 2. Reverse Direction */}
                <StepCard 
                    title="2. Reverse Direction"
                    icon={RefreshCw}
                    color="#8b5cf6"
                    steps={[
                        <span><em>If limits are NOT set:</em> Press and hold <strong>UP and DOWN</strong> simultaneously for 2 seconds (Motor jogs 1x).</span>,
                        <span><em>If limits ARE set:</em> Press and hold <strong>P1</strong> on the motor for 10 seconds.</span>,
                        <span>The motor will jog 3x and beep 3x. <strong>Direction reversed!</strong></span>
                    ]}
                />

                {/* 3. Set Limits */}
                <StepCard 
                    title="3. Set Limits (Top & Bottom)"
                    icon={Settings}
                    color="#10b981"
                    steps={[
                        <span><strong>Upper Limit:</strong> Press UP to desired position. Press and hold <strong>UP + STOP</strong> simultaneously for 2s (Jog 2x, Beep 3x).</span>,
                        <span><strong>Lower Limit:</strong> Press DOWN to desired position. Press and hold <strong>DOWN + STOP</strong> simultaneously for 2s (Jog 2x, Beep 3x).</span>,
                        <span><em>To adjust later:</em> Hold UP+STOP or DOWN+STOP for 5s to unlock, move, then hold for 2s to lock again.</span>
                    ]}
                />

                {/* 4. Copy Remote */}
                <StepCard 
                    title="4. Add / Copy Remote"
                    icon={Copy}
                    color="#f43f5e"
                    steps={[
                        <span>Take the <strong>original</strong> working remote and press <strong>P2</strong> twice (Motor jogs 1x, beeps).</span>,
                        <span>Take the <strong>new</strong> remote and press <strong>P2</strong> once.</span>,
                        <span>The motor will jog 2x and beep 3x. <strong>Remote is copied!</strong></span>
                    ]}
                />
            </div>
            
            <div style={{
                marginTop: '40px', background: '#f8fafc', padding: '24px', borderRadius: '16px',
                border: '1px solid #e2e8f0', textAlign: 'center'
            }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>Visual feedback (Jog) means a brief up-and-down movement of the blind.</span>
                </div>
            </div>
        </div>
    );
};

export default RemoteInfographic;
