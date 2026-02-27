
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Check, QrCode, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile, SubscriptionPlan } from '../types';
import { Logo } from './Logo';

const CURRENT_USER_KEY = 'mpl_current_user';
const USERS_KEY = 'mpl_users_db';

export const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const plan = searchParams.get('plan') as SubscriptionPlan | null;
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        } else {
            navigate(`/login?redirect=/checkout?plan=${plan}`);
        }

        // GA4 Begin Checkout Event
        if (window.gtag && plan) {
            window.gtag('event', 'begin_checkout', {
                items: [{ item_name: plan, item_category: 'subscription' }]
            });
        }
    }, [navigate, plan]);

    if (!plan || (plan !== 'pro' && plan !== 'business')) {
        return <div className="min-h-screen flex items-center justify-center">Invalid Plan Selected</div>;
    }

    const price = plan === 'pro' ? 399 : 699;

    const handlePaymentComplete = async () => {
        setIsProcessing(true);

        try {
            // Attempt to call the Real Backend API
            const response = await fetch('/api/payment/manual-claim', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('mpl_token')}`
                },
                body: JSON.stringify({
                    plan: plan
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (window.gtag) {
                    window.gtag('event', 'purchase', {
                        transaction_id: `tx-api-${Date.now()}`,
                        value: price,
                        currency: 'INR',
                        items: [{ item_name: plan }]
                    });
                }
                alert("Payment Verified by Server! Plan upgraded.");
                // Sync state logic...
                navigate('/admin');
            } else {
                alert(data?.error || "Could not verify payment. Please contact support.");
            }
        } catch (error) {
            console.warn("Network error connecting to backend.", error);
            alert("Network error connecting to backend. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <Logo />
                    <Link to="/" className="text-gray-500 font-bold text-sm hover:text-gray-900">Cancel</Link>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 p-8 text-white text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Complete your upgrade</h2>
                            <div className="text-4xl font-black mb-1">{plan === 'pro' ? 'Professional' : 'Business'} Plan</div>
                            <div className="text-2xl font-medium text-brand-300">₹{price} <span className="text-sm text-gray-500">/ month</span></div>
                        </div>
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand-600 rounded-full blur-3xl opacity-20"></div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-start gap-4 mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <AlertCircle className="text-blue-600 shrink-0" size={20} />
                             <p className="text-sm text-blue-800 font-medium">
                                 We are currently only accepting UPI payments. Please scan the QR code below to proceed instantly.
                             </p>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 relative group">
                                <QrCode size={64} className="text-gray-400" />
                                <div className="absolute inset-0 flex items-center justify-center bg-white/90 font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Scanning...
                                </div>
                            </div>
                            <div className="font-mono text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 font-bold select-all">
                                upi-pay@myprofilelink
                            </div>
                            <p className="text-xs text-gray-400 mt-2 font-medium">Scan with GPay, PhonePe, or Paytm</p>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={handlePaymentComplete}
                                disabled={isProcessing}
                                className="w-full bg-brand-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? 'Verifying...' : 'I have made the payment'}
                            </button>
                            <p className="text-center text-xs text-gray-400 font-medium">
                                Secure payment via UPI Protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
