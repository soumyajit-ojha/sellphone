import { useEffect, useState } from 'react';
import AccountLayout from '../components/AccountLayout';
import { shopService } from '../services/shopService';
import { Package, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await shopService.getOrders();
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <AccountLayout>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fk-blue"></div>
            </div>
        </AccountLayout>
    );

    return (
        <AccountLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-lg font-bold">My Orders</h2>
                {/* Search in Orders - UI Placeholder */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search your orders here"
                        className="w-full border py-2 px-4 pr-10 text-sm rounded-sm focus:outline-none focus:border-fk-blue"
                    />
                    <Search className="absolute right-3 top-2.5 text-fk-blue" size={16} />
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-sm">
                    <img
                        src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/myorders-empty_825da1.png"
                        alt="empty"
                        className="mx-auto w-64 mb-4 opacity-50"
                    />
                    <p className="text-lg font-medium">You have no orders</p>
                    <Link to="/" className="bg-fk-blue text-white px-10 py-2 mt-4 inline-block font-bold rounded-sm uppercase text-sm">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Link to={`/orders/${order.id}`} className="bg-white border ... cursor-pointer">
                            <div key={order.id} className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                                {/* Order Summary Line */}
                                <div className="bg-gray-50/50 px-4 py-2 border-b flex justify-between items-center text-[11px] font-bold text-gray-500">
                                    <span>ORDER ID: #{order.id}</span>
                                    <span>PLACED ON: {new Date(order.created_at).toLocaleDateString()}</span>
                                </div>

                                {/* Individual Items inside Order */}
                                <div className="divide-y divide-gray-100">
                                    {order.order_items?.map(item => (
                                        <div key={item.id} className="p-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            {/* Product Info (Left) */}
                                            <div className="flex gap-4 flex-1">
                                                <div className="w-20 h-20 flex-shrink-0 border p-1 rounded-sm">
                                                    {/* In a real app, item.product.image_url would be used */}
                                                    <img
                                                        src="https://cdn-icons-png.flaticon.com/512/3121/3121708.png"
                                                        className="w-full h-full object-contain opacity-20"
                                                        alt="phone"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 hover:text-fk-blue transition-colors truncate max-w-xs md:max-w-md">
                                                        {item.product_name_snapshot}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold">Qty: {item.quantity}</p>
                                                </div>
                                            </div>

                                            {/* Price (Center) */}
                                            <div className="w-24 font-bold text-sm">
                                                ₹{item.price_per_unit.toLocaleString()}
                                            </div>

                                            {/* Status (Right) */}
                                            <div className="w-48">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(order.order_status)}`}></div>
                                                    <span className="text-sm font-bold capitalize">
                                                        {order.order_status === 'confirmed' ? 'Confirmed' : 'Payment Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1 ml-4">
                                                    {order.order_status === 'confirmed' ? 'Your item is being processed' : 'Waiting for payment confirmation'}
                                                </p>
                                            </div>

                                            {/* Action */}
                                            <div className="hidden lg:block">
                                                <ChevronRight className="text-gray-300" size={20} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Total Footer */}
                                <div className="bg-gray-50/30 p-3 px-6 border-t flex justify-end gap-10">
                                    <span className="text-sm text-gray-500">Total Amount: <span className="text-black font-bold">₹{order.total_amount.toLocaleString()}</span></span>
                                    <button className="text-fk-blue font-bold text-xs uppercase hover:underline">Rate & Review</button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
};

// Helper for status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed': return 'bg-green-600';
        case 'initiated': return 'bg-orange-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-400';
    }
};

export default OrdersPage;