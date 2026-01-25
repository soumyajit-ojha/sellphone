import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            const res = await shopService.getCart();
            setCart(res.data);
            // Optional: Auto-select all items on first load
            if (!cart) {
                setSelectedIds(res.data.items.map(item => item.id));
            }
        } catch (err) {
            console.error("Cart Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCart(); }, []);

    // Selection Logic
    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Quantity Logic
    const handleQuantity = async (itemId, currentQty, stock, type) => {
        // Ensure we are working with Numbers
        const qty = Number(currentQty);
        const maxStock = Number(stock);

        const newQty = type === 'inc' ? qty + 1 : qty - 1;

        // Graceful Boundary Checks
        if (newQty < 1) return;
        if (newQty > maxStock) {
            alert(`Only ${maxStock} units available in stock.`);
            return;
        }

        setUpdatingId(itemId); // Disable buttons for this item during API call
        try {
            await shopService.updateQuantity(itemId, newQty);
            await loadCart(); // Refresh cart to get new totals
        } catch (err) {
            console.error("Quantity Update Error:", err);
            alert(err.response?.data?.detail || "Could not update quantity");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (itemId) => {
        if (window.confirm("Remove this item from cart?")) {
            await shopService.removeFromCart(itemId);
            loadCart();
        }
    };

    const handlePlaceOrder = () => {
        if (selectedIds.length === 0) return alert("Please select items to buy");
        navigate('/checkout', { state: { selectedItems: selectedIds } });
    };

    // Derived State: Calculate totals only for SELECTED items
    const selectedStats = useMemo(() => {
        if (!cart) return { total: 0, count: 0 };
        const items = cart.items.filter(item => selectedIds.includes(item.id));
        const total = items.reduce((acc, item) => acc + (item.price_at_addition * item.quantity), 0);
        return { total, count: items.length };
    }, [cart, selectedIds]);

    if (loading) return <div className="p-20 text-center font-bold">Loading Cart...</div>;

    if (!cart || cart.items.length === 0) return (
        <div className="bg-white m-10 p-20 text-center shadow-sm rounded-sm">
            <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png" className="w-64 mx-auto mb-6" alt="empty" />
            <h2 className="text-xl font-bold">Your cart is empty!</h2>
            <p className="text-gray-500 text-sm mb-6">Add items to it now.</p>
            <Link to="/" className="bg-fk-blue text-white px-16 py-3 font-bold uppercase rounded-sm shadow-md">Shop Now</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-4 items-start">

            {/* Left: Item List */}
            <div className="flex-1 bg-white shadow-sm rounded-sm">
                <div className="p-4 border-b font-bold text-lg flex justify-between items-center">
                    <span>My Cart ({cart.items.length})</span>
                    <span className="text-sm font-normal text-gray-500">{selectedIds.length} items selected</span>
                </div>

                {cart.items.map(item => (
                    <div key={item.id} className="p-6 border-b flex gap-4 md:gap-6 hover:bg-gray-50 transition-colors relative">
                        {/* Selector Checkbox */}
                        <div className="pt-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="w-5 h-5 accent-fk-blue cursor-pointer"
                            />
                        </div>

                        {/* Product Image */}
                        <div className="w-24 h-32 flex-shrink-0">
                            <img src={item.product?.image_url} className="w-full h-full object-contain" alt="mobile" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                            <h3 className="text-lg font-medium">{item.product_name_snapshot}</h3>
                            <p className="text-sm text-gray-400 mt-1">Qty: {item.quantity}</p>

                            <div className="mt-4 flex items-center gap-3">
                                <span className="text-2xl font-bold">₹{item.price_at_addition.toLocaleString()}</span>
                                <span className="text-green-700 text-sm font-bold">SellPhone Assured</span>
                            </div>

                            {/* Action Row: Quantity + Remove */}
                            <div className="mt-6 flex items-center gap-8">
                                <div className="flex items-center border rounded-sm bg-white">
                                    <button
                                        onClick={() => handleQuantity(item.id, item.quantity, item.product?.stock, 'dec')}
                                        className="p-1 px-3 border-r hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                                        disabled={item.quantity <= 1 || updatingId === item.id}
                                    >
                                        <Minus size={14} />
                                    </button>

                                    <span className="px-4 text-sm font-bold w-10 text-center">
                                        {updatingId === item.id ? "..." : item.quantity}
                                    </span>

                                    <button
                                        onClick={() => handleQuantity(item.id, item.quantity, item.product?.stock, 'inc')}
                                        className="p-1 px-3 border-l hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                                        disabled={item.quantity >= item.product?.stock || updatingId === item.id}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="font-bold uppercase text-sm hover:text-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="hidden md:block text-sm font-medium text-right">
                            Delivery by {new Date(Date.now() + 172800000).toDateString()} | <span className="text-green-700">Free</span>
                        </div>
                    </div>
                ))}

                {/* Sticky Action Bar */}
                <div className="p-4 flex justify-end sticky bottom-0 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
                    <button
                        onClick={handlePlaceOrder}
                        className="bg-orange-600 text-white px-16 py-4 font-bold uppercase rounded-sm shadow-lg hover:bg-orange-700 transition-colors"
                    >
                        Place Order
                    </button>
                </div>
            </div>

            {/* Right: Price Summary */}
            <div className="w-full lg:w-[400px] bg-white shadow-sm rounded-sm sticky top-20">
                <div className="p-4 border-b font-bold text-gray-400 uppercase text-sm">Price Details</div>
                <div className="p-4 space-y-4 border-b">
                    <div className="flex justify-between">
                        <span>Price ({selectedStats.count} items)</span>
                        <span>₹{selectedStats.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span className="text-green-700">- ₹0</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="text-green-700 font-bold">FREE</span>
                    </div>
                </div>
                <div className="p-4 flex justify-between font-bold text-xl border-b border-dashed">
                    <span>Total Amount</span>
                    <span>₹{selectedStats.total.toLocaleString()}</span>
                </div>
                <div className="p-4 text-green-700 font-bold text-sm">
                    You will save ₹0 on this order
                </div>
                <div className="p-4 bg-gray-50 flex items-center gap-3 text-gray-500 text-[11px] font-bold">
                    <ShieldCheck size={20} /> SAFE AND SECURE PAYMENTS. EASY RETURNS.
                </div>
            </div>
        </div>
    );
};

export default CartPage;