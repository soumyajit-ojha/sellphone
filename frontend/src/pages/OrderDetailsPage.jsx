import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AccountLayout from '../components/AccountLayout';
import { shopService } from '../services/shopService';
import { MapPin, Package, CreditCard, ChevronLeft } from 'lucide-react';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await shopService.getOrderById(id);
                setOrder(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <AccountLayout><div className="p-20 text-center">Loading Receipt...</div></AccountLayout>;
    if (!order) return <AccountLayout><div className="p-20 text-center">Order not found.</div></AccountLayout>;

    return (
        <AccountLayout>
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/orders" className="text-gray-400 hover:text-fk-blue">
                    <ChevronLeft size={24} />
                </Link>
                <h2 className="text-xl font-bold">Order Details</h2>
            </div>

            <div className="space-y-6">
                {/* 1. TOP INFO: Status and ID */}
                <div className="bg-gray-50 p-4 border rounded-sm flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Order ID</p>
                        <p className="font-bold">#{order.id}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Payment Status</p>
                        <span className={`text-xs font-bold uppercase ${order.payment_status === 'success' ? 'text-green-700' : 'text-orange-600'}`}>
                            {order.payment_status}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Total Amount</p>
                        <p className="text-xl font-bold text-fk-blue">₹{order.total_amount.toLocaleString()}</p>
                    </div>
                </div>

                {/* 2. MIDDLE: Shipping and Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-sm">
                        <h3 className="flex items-center gap-2 font-bold text-sm mb-4 uppercase border-b pb-2">
                            <MapPin size={16} className="text-fk-blue" /> Delivery Address
                        </h3>
                        {order.address ? (
                            <div className="text-sm space-y-1">
                                <p className="font-bold">{order.address.full_name}</p>
                                <p>{order.address.address_line}</p>
                                <p>{order.address.locality}, {order.address.city}</p>
                                <p>{order.address.state} - <b>{order.address.pincode}</b></p>
                                <p className="pt-2 font-bold">Phone: {order.address.phone_number}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Address information no longer available.</p>
                        )}
                    </div>

                    <div className="border p-4 rounded-sm">
                        <h3 className="flex items-center gap-2 font-bold text-sm mb-4 uppercase border-b pb-2">
                            <CreditCard size={16} className="text-fk-blue" /> Payment Summary
                        </h3>
                        <div className="text-sm space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>₹{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-green-700 font-bold">FREE</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                <span>Total Paid</span>
                                <span>₹{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM: Ordered Items (Read-Only) */}
                <div className="border rounded-sm overflow-hidden">
                    <h3 className="bg-gray-50 p-4 font-bold text-sm uppercase flex items-center gap-2">
                        <Package size={16} /> Items in this Order
                    </h3>
                    <div className="divide-y">
                        {order.order_items.map(item => (
                            <div key={item.id} className="p-6 flex gap-6 items-center">
                                <div className="w-16 h-20 bg-gray-50 rounded-sm p-2 flex-shrink-0">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/3121/3121708.png"
                                        className="w-full h-full object-contain opacity-20"
                                        alt="item"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{item.product_name_snapshot}</p>
                                    <p className="text-xs text-gray-500 mt-1">Price: ₹{item.price_per_unit.toLocaleString()}</p>
                                    <p className="text-xs font-bold mt-1 uppercase text-fk-blue">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">₹{(item.price_per_unit * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center py-4">
                    <p className="text-xs text-gray-400 italic">This is a system-generated receipt. Changes cannot be made to confirmed orders.</p>
                </div>
            </div>
        </AccountLayout>
    );
};

export default OrderDetailsPage;