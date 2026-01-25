import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { shopService } from '../services/shopService';
import { Check, CreditCard, ShieldCheck, Lock, ChevronRight } from 'lucide-react';

// STRIPE IMPORTS
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

// Replace with your real Stripe Publishable Key
const stripePromise = loadStripe("pk_test_51SsVr11p2hBeR45XT0fCCsuzJ2VNO018Itl24Q5wsRKBKVF0MLxmrGssaOeVyIDMmWbw5fK88flAiRJC2sW3cXGM00KQwj0ncq");

const CheckoutPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [step, setStep] = useState(2);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddrId, setSelectedAddrId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // PAYMENT STATES
    const [clientSecret, setClientSecret] = useState(null);
    const [externalOrderId, setExternalOrderId] = useState(null);

    useEffect(() => {
        // Validation: Must have items to checkout
        if (!state || !state.selectedItems || state.selectedItems.length === 0) {
            navigate('/cart');
            return;
        }

        const loadCheckoutData = async () => {
            try {
                const [addrRes, cartRes, profileRes] = await Promise.all([
                    userService.getAddresses(),
                    shopService.getCart(),
                    userService.getProfile()
                ]);
                setAddresses(addrRes.data);
                setUser(profileRes.data);

                // Only show items user checked in the cart
                const selected = cartRes.data.items.filter(item =>
                    state.selectedItems.includes(item.id)
                );
                setCartItems(selected);
            } catch (err) {
                console.error("Data loading failed", err);
            }
        };
        loadCheckoutData();
    }, [state, navigate]);

    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price_at_addition * item.quantity), 0);

    /**
     * HANDLER: Initiate Payment
     * This hits your FastAPI /checkout endpoint which now calls Stripe API directly.
     */
    const handleInitiatePayment = async () => {
        if (!selectedAddrId) return alert("Please select a delivery address");
        setLoading(true);

        try {
            const res = await shopService.checkout(selectedAddrId, state.selectedItems);

            // Extracting from your Backend response
            // Note: We check both paths to ensure compatibility with your Direct Stripe Backend
            const secret = res.data.client_secret || res.data.payment_data?.client_secret;
            const extId = res.data.external_order_id || res.data.payment_data?.provider_transaction_id;

            if (secret) {
                setClientSecret(secret);
                setExternalOrderId(extId);
            } else {
                throw new Error("Payment initialization failed");
            }
        } catch (err) {
            alert(err.response?.data?.detail || "Could not reach Stripe. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-4 items-start min-h-screen">
            <div className="flex-1 w-full space-y-3">

                {/* STEP 1: LOGIN */}
                <StepHeader number="1" title="Login" isCompleted={true} />
                <div className="bg-white p-4 shadow-sm flex justify-between items-center mb-2 text-sm border border-gray-100">
                    <p className="text-gray-500 font-bold capitalize">
                        Logged in as {user?.first_name} {user?.last_name}
                        <span className="text-gray-400 font-normal ml-4">{user?.phone}</span>
                    </p>
                </div>

                {/* STEP 2: ADDRESS */}
                <StepHeader number="2" title="Delivery Address" isActive={step === 2} isCompleted={step > 2} />
                {step === 2 && (
                    <div className="bg-white shadow-sm p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-4">
                            {addresses.map(addr => (
                                <div key={addr.id} onClick={() => setSelectedAddrId(addr.id)} className={`p-4 border rounded-sm flex gap-4 cursor-pointer transition-all ${selectedAddrId === addr.id ? 'bg-blue-50 border-fk-blue shadow-inner' : 'border-gray-50 hover:bg-gray-100/50'}`}>
                                    <input type="radio" checked={selectedAddrId === addr.id} readOnly className="mt-1 accent-fk-blue cursor-pointer" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="font-bold">{addr.full_name}</span>
                                            <span className="bg-gray-100 text-[10px] px-2 py-0.5 font-bold uppercase text-gray-500">{addr.address_type}</span>
                                            <span className="font-bold ml-auto">{addr.phone_number}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{addr.address_line}, {addr.locality}, {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span></p>
                                        {selectedAddrId === addr.id && (
                                            <button onClick={() => setStep(3)} className="mt-4 bg-orange-600 text-white px-10 py-3 font-bold uppercase rounded-sm shadow-md hover:bg-orange-700 transition-colors">Deliver Here</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: SUMMARY */}
                <StepHeader number="3" title="Order Summary" isActive={step === 3} isCompleted={step > 3} />
                {step === 3 && (
                    <div className="bg-white shadow-sm p-4 animate-in fade-in slide-in-from-top-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex gap-6 py-4 border-b last:border-0">
                                <img src={item.product?.image_url} className="w-16 h-20 object-contain" alt="" />
                                <div>
                                    <h3 className="font-medium text-sm">{item.product_name_snapshot}</h3>
                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                    <p className="font-bold mt-2">₹{item.price_at_addition.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setStep(4)} className="mt-4 bg-orange-600 text-white px-10 py-3 font-bold uppercase rounded-sm shadow-md hover:bg-orange-700">Continue</button>
                    </div>
                )}

                {/* STEP 4: PAYMENT */}
                <StepHeader number="4" title="Payment Options" isActive={step === 4} />
                {step === 4 && (
                    <div className="bg-white shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
                        {!clientSecret ? (
                            // STEP 4a: Selection & Initiation
                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-5 border border-fk-blue bg-blue-50 rounded-sm cursor-pointer">
                                    <input type="radio" checked readOnly className="accent-fk-blue w-4 h-4" />
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-fk-blue" size={24} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Credit / Debit / ATM Card</span>
                                            <span className="text-[10px] text-gray-500">Securely pay via Stripe</span>
                                        </div>
                                    </div>
                                </label>
                                <button
                                    onClick={handleInitiatePayment}
                                    disabled={loading}
                                    className="w-full bg-orange-600 text-white py-4 font-bold uppercase rounded-sm shadow-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
                                >
                                    {loading ? "Connecting to Bank..." : `Pay ₹${totalAmount.toLocaleString()}`}
                                </button>
                            </div>
                        ) : (
                            // STEP 4b: Real Stripe Card Element
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 text-green-700 mb-6 font-bold text-sm bg-green-50 p-4 border border-green-100 rounded-sm">
                                    <Lock size={18} /> Stripe 256-bit AES Encryption Active
                                </div>
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePaymentForm
                                        clientSecret={clientSecret}
                                        externalOrderId={externalOrderId}
                                        totalAmount={totalAmount}
                                        onOrderSuccess={() => navigate('/orders')}
                                    />
                                </Elements>
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 flex items-center gap-4 text-[11px] text-gray-500 border rounded-sm">
                            <ShieldCheck size={28} className="text-green-700 flex-shrink-0" />
                            <p>Safe and Secure Payments. 100% Payment Protection, Easy Returns Policy. By continuing, you agree to SellPhone's terms.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR (Price Details) */}
            <div className="w-full lg:w-96 bg-white shadow-sm rounded-sm sticky top-20 border border-gray-50">
                <div className="p-4 border-b font-bold text-gray-400 uppercase text-sm">Price Details</div>
                <div className="p-4 space-y-4 border-b">
                    <div className="flex justify-between">
                        <span className="text-sm">Price ({cartItems.length} items)</span>
                        <span className="text-sm font-medium">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Delivery Charges</span>
                        <span className="text-green-700 font-bold text-sm uppercase italic">Free</span>
                    </div>
                </div>
                <div className="p-4 flex justify-between font-bold text-xl">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-green-50 text-green-700 font-bold text-xs uppercase tracking-tight">
                    You will save ₹0 on this order
                </div>
            </div>
        </div>
    );
};

const StepHeader = ({ number, title, isActive, isCompleted }) => (
    <div className={`p-4 flex items-center gap-4 shadow-sm transition-all duration-300 ${isActive ? 'bg-fk-blue text-white' : 'bg-white text-gray-400'}`}>
        <span className={`w-5 h-5 flex items-center justify-center rounded-sm text-[10px] font-bold ${isActive ? 'bg-white text-fk-blue' : 'bg-gray-100 text-gray-400'}`}>
            {isCompleted ? <Check size={12} className="text-fk-blue" /> : number}
        </span>
        <h2 className="font-bold uppercase text-sm tracking-wide">{title}</h2>
        {isCompleted && <Check className="ml-auto text-green-600 bg-white rounded-full p-0.5 shadow-sm" size={18} />}
    </div>
);

export default CheckoutPage;