import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

const StripePaymentForm = ({ totalAmount, onOrderSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    // UI States
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Safety check: Ensure Stripe and Elements are loaded
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);
        console.log("Initiating Stripe payment confirmation...");
        // 1. Confirm the payment with Stripe
        // We use redirect: 'if_required' so we can handle the logic inside this function
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            // Handle card declines, invalid dates, etc.
            console.error("Payment Failed:", error.code, error.message);
            setErrorMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log(`Payment Status: ${paymentIntent.status}`);
            console.log(`Transaction ID: ${paymentIntent.id}`);
            /**
             * SUCCESS CASE:
             * Note: We DO NOT call our backend here. 
             * Stripe will automatically trigger our Backend Webhook.
             */
            setIsProcessing(false);

            // UX: Give the user a moment to see the success before redirecting
            setTimeout(() => {
                onOrderSuccess(); // Navigates to /orders (defined in CheckoutPage)
            }, 1000);
        } else {
            // Catch-all for unexpected statuses (e.g. processing or requires_action)
            console.log(`Unexpected Payment State: ${paymentIntent?.status}`);
            setErrorMessage("An unexpected payment state occurred.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">

            {/* Stripe Card Input Field */}
            <div className="p-4 border border-gray-100 rounded-sm bg-white shadow-inner">
                <PaymentElement />
            </div>

            {/* Error Message UI */}
            {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-sm">
                    <AlertCircle size={16} />
                    {errorMessage}
                </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
                <button
                    disabled={isProcessing || !stripe || !elements}
                    className="w-full bg-orange-600 text-white py-4 font-bold uppercase rounded-sm shadow-lg hover:bg-orange-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Verifying Transaction...
                        </>
                    ) : (
                        <>
                            <Lock size={18} />
                            Confirm and Pay ₹{totalAmount.toLocaleString()}
                        </>
                    )}
                </button>
            </div>

            {/* Trust Badges */}
            <p className="text-[10px] text-center text-gray-400 font-medium">
                Your payment is secured with 256-bit SSL encryption. Card details are never stored on our servers.
            </p>
        </form>
    );
};

export default StripePaymentForm;