import { useState } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ isSeller = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await userService.login({ email, password });
            login(res.data.user_id, res.data.user_type);
            navigate('/');
        } catch (err) {
            alert("Login Failed: " + err.response?.data?.detail);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Sidebar - Now matching Register */}
            <div className="auth-sidebar">
                <h2 className="text-3xl font-bold mb-4">
                    {isSeller ? "Seller Login" : "Login"}
                </h2>
                <p className="text-lg opacity-80 leading-relaxed">
                    {isSeller
                        ? "Manage your inventory, track orders and grow your business."
                        : "Get access to your Orders, Wishlist and Recommendations"}
                </p>
                {/* SellPhone-style illustration placeholder */}
                <img
                    src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
                    alt="login-illustration"
                    className="mt-auto self-center w-48 mb-10"
                />
            </div>

            {/* Right side form */}
            <div className="auth-form-container">
                <form onSubmit={handleLogin} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="fk-input"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="fk-input"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="text-[12px] text-gray-500">
                        By continuing, you agree to SellPhone's Terms of Use and Privacy Policy.
                    </div>

                    <button className="fk-btn-yellow">
                        Login
                    </button>
                </form>

                <Link to={isSeller ? "/seller-register" : "/register"} className="text-center text-fk-blue font-semibold py-4 bg-gray-50 shadow-inner mt-10">
                    {isSeller ? "New Seller? Create a seller account" : "New to SellPhone? Create an account"}
                </Link>
            </div>
        </div>
    );
};

export default Login;