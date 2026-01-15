import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Package, Heart, Power, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isLoggedIn, logout, user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="navbar-wrapper">
            <div className="navbar-content">

                {/* Logo */}
                <Link to="/" className="logo-container">
                    <span className="logo-main">SellPhone</span>
                    <span className="logo-plus">Explore <span className="font-extrabold italic">Plus</span></span>
                </Link>

                {/* Search */}
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search for products, brands and more"
                        className="search-field"
                    />
                    <Search className="search-icon" size={20} />
                </div>

                {/* Actions */}
                <div className="nav-actions">

                    {isLoggedIn ? (
                        <div className={`account-dropdown ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                            <span className="flex items-center gap-1" onClick={toggleDropdown}>
                                My Account <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </span>

                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item">
                                    <User size={16} className="text-fk-blue" /> My Profile
                                </Link>
                                <Link to="/orders" className="dropdown-item">
                                    <Package size={16} className="text-fk-blue" /> Orders
                                </Link>
                                <Link to="/wishlist" className="dropdown-item">
                                    <Heart size={16} className="text-fk-blue" /> Wishlist
                                </Link>
                                <button onClick={logout} className="dropdown-item w-full text-red-600">
                                    <Power size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-login-btn">Login</Link>
                    )}

                    <Link to="/seller" className="hidden lg:block">Become a Seller</Link>

                    <Link to="/cart" className="nav-item-link">
                        <ShoppingCart size={20} />
                        <span>Cart</span>
                    </Link>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;