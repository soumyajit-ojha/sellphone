import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await userService.login({ email, password });
            // Extract from backend response: { access_token, token_type, user_role }
            login(res.data.access_token, res.data.user_role);

            // Redirect based on role
            if (res.data.user_role === 'seller') {
                navigate('/seller-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-12 bg-white flex shadow-2xl rounded-sm overflow-hidden min-h-[520px]">
            {/* Left Sidebar (Flipkart Style) */}
            <div className="w-2/5 bg-fk-blue p-10 text-white flex flex-col">
                <h2 className="text-3xl font-bold mb-4">Login</h2>
                <p className="text-lg opacity-80 leading-relaxed">
                    Get access to your Orders, Wishlist and Recommendations
                </p>
                <img
                    src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
                    alt="login-illustration"
                    className="mt-auto self-center w-48"
                />
            </div>

            {/* Right Form */}
            <div className="w-3/5 p-10 relative">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative border-b border-gray-300 focus-within:border-fk-blue">
                        <input
                            type="email"
                            required
                            placeholder="Enter Email"
                            className="w-full py-2 outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative border-b border-gray-300 focus-within:border-fk-blue flex items-center">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter Password"
                            className="flex-1 py-2 outline-none text-sm"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-fk-blue px-2"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                    <p className="text-[12px] text-gray-500">
                        By continuing, you agree to SellPhone's Terms of Use and Privacy Policy.
                    </p>

                    <button
                        disabled={loading}
                        className="w-full bg-fk-yellow text-white py-3 rounded-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? "Authenticating..." : "Login"}
                    </button>
                </form>

                <div className="absolute bottom-10 left-0 right-0 text-center">
                    <Link to="/register" className="text-fk-blue font-bold text-sm hover:underline">
                        New to SellPhone? Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;