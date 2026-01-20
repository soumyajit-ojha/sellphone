import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import { productService } from '../services/productService';
import { shopService } from '../services/shopService';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Zap, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isInCart, setIsInCart] = useState(false); // New state for Cart check

    useEffect(() => {
        const fetchDetailsAndStatus = async () => {
            try {
                // 1. Fetch Product Details
                const res = await productService.getProductById(id);
                const productData = res.data;
                setProduct(productData);

                // 2. If logged in, check Cart and Wishlist status
                if (isAuthenticated) {
                    const [cartRes, wishlistRes] = await Promise.all([
                        shopService.getCart(),
                        shopService.getWishlist()
                    ]);

                    // Check if product exists in Cart
                    // Note: ensure we compare IDs as the same type (Number)
                    const inCart = cartRes.data.items.some(
                        item => Number(item.product_id) === Number(id)
                    );
                    setIsInCart(inCart);

                    // Check if product exists in Wishlist
                    const inWish = wishlistRes.data.some(
                        item => Number(item.product_id) === Number(id)
                    );
                    setIsWishlisted(inWish);
                }
            } catch (err) {
                console.error("Error fetching page data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailsAndStatus();
    }, [id, isAuthenticated]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) return navigate('/login');

        // If already in cart, just navigate to cart page
        if (isInCart) {
            return navigate('/cart');
        }

        try {
            await shopService.addToCart(product.id);
            setIsInCart(true); // Update UI state
            alert("Added to cart!");
        } catch (err) {
            alert("Failed to add to cart");
        }
    };

    const handleWishlist = async () => {
        if (!isAuthenticated) return navigate('/login');
        try {
            const res = await shopService.toggleWishlist(product.id);
            setIsWishlisted(res.data.is_wishlisted);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold">Loading product details...</div>;
    if (!product) return <div className="p-20 text-center">Product not found.</div>;

    return (
        <div className="max-w-7xl mx-auto mt-4 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-10 min-h-screen">

            {/* LEFT: Image & Actions */}
            <div className="w-full md:w-2/5 flex flex-col items-center">
                <div className="relative border p-4 w-full flex justify-center group bg-white">
                    <img src={product.image_url} alt={product.model_name} className="h-[450px] object-contain transition-transform group-hover:scale-105" />
                    <button
                        onClick={handleWishlist}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md border hover:scale-110 transition-transform"
                    >
                        <Heart
                            size={22}
                            fill={isWishlisted ? "#ff4343" : "none"}
                            color={isWishlisted ? "#ff4343" : "#dbdbdb"}
                        />
                    </button>
                </div>

                <div className="flex gap-4 w-full mt-4">
                    {/* Dynamic Button: Go to Cart vs Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 rounded-sm transition-colors ${isInCart ? 'bg-fk-blue text-white' : 'bg-fk-yellow text-white'
                            }`}
                    >
                        {isInCart ? (
                            <><ArrowRight size={20} /> GO TO CART</>
                        ) : (
                            <><ShoppingCart size={20} /> ADD TO CART</>
                        )}
                    </button>

                    <button className="flex-1 bg-orange-600 text-white py-4 font-bold flex items-center justify-center gap-2 rounded-sm hover:bg-orange-700">
                        <Zap size={20} fill="white" /> BUY NOW
                    </button>
                </div>
            </div>

            {/* RIGHT: Specs & Details */}
            <div className="flex-1">
                <nav className="text-xs text-gray-500 mb-2">Home &gt; Mobiles &gt; {product.brand}</nav>
                <h1 className="text-xl font-medium mb-2">{product.brand} {product.model_name}</h1>

                <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                    <span className="text-gray-400 line-through">₹{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
                    <span className="text-green-700 font-bold text-sm">20% off</span>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-bold border-b pb-2 mb-4">Highlights</h3>
                    <ul className="space-y-3">
                        <li className="flex text-sm"><span className="w-32 text-gray-500">RAM | ROM</span> {product.ram} GB | {product.rom} GB</li>
                        <li className="flex text-sm"><span className="w-32 text-gray-500">Display</span> {product.screen_size} inch Display</li>
                        <li className="flex text-sm"><span className="w-32 text-gray-500">Processor</span> {product.processor}</li>
                        <li className="flex text-sm"><span className="w-32 text-gray-500">Battery</span> {product.battery} mAh</li>
                        <li className="flex text-sm"><span className="w-32 text-gray-500">Network</span> {product.network_type}</li>
                    </ul>
                </div>

                <div className="mt-10 p-4 bg-blue-50 border border-blue-100 flex items-center gap-4 rounded-sm">
                    <ShieldCheck size={40} className="text-fk-blue" />
                    <div>
                        <p className="font-bold text-sm italic text-fk-blue">SellPhone Assured</p>
                        <p className="text-xs text-gray-500">100% Genuine product with easy 7-day returns.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;