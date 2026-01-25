import { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, Package, ChevronDown, Smartphone, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();


    return (
        <nav className="bg-fk-blue text-white sticky top-0 z-50 py-2.5 shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 md:gap-8">

                {/* Logo */}
                <Link to="/" className="flex flex-col items-start leading-none group">
                    <span className="text-xl md:text-2xl font-bold italic tracking-tighter group-hover:opacity-90">
                        SellPhone
                    </span>
                    <span className="text-[10px] text-fk-yellow italic flex items-center gap-0.5">
                        Explore <span className="font-extrabold">Plus</span>
                    </span>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl flex items-center bg-white rounded-sm overflow-hidden shadow-sm">
                    <input
                        type="text"
                        placeholder="Search for mobiles, brands and more"
                        className="flex-1 py-2 px-4 text-black text-sm outline-none placeholder:text-gray-500 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/?q=${searchTerm}`)}
                    />
                    <button
                        onClick={() => navigate(`/?q=${searchTerm}`)}
                        className="px-3 text-fk-blue hover:opacity-80 transition-opacity bg-white flex items-center justify-center"
                    >
                        <Search size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 md:gap-8 font-semibold text-[15px]">

                    {isAuthenticated ? (
                        <div className="relative cursor-pointer group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                            <div className="flex items-center gap-1 hover:text-gray-100 py-2">
                                <User size={18} />
                                <span className="hidden md:block">Account</span>
                                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full -left-10 w-48 bg-white text-black shadow-xl border rounded-sm overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b">
                                        <User size={16} className="text-fk-blue" /> My Profile
                                    </Link>
                                    <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b">
                                        <Heart size={16} className="text-fk-blue" /> Wishlist
                                    </Link>
                                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b">
                                        <Package size={16} className="text-fk-blue" /> My Orders
                                    </Link>
                                    <Link to="/seller-dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b">
                                        <Smartphone size={16} className="text-fk-blue" /> Seller Hub
                                    </Link>
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-red-600">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="bg-white text-fk-blue px-8 py-1 rounded-sm font-bold border border-white hover:bg-gray-100 transition-colors">
                            Login
                        </Link>
                    )}

                    <Link to="/cart" className="flex items-center gap-2 hover:opacity-90">
                        <ShoppingCart size={20} />
                        <span className="hidden md:block">Cart</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;