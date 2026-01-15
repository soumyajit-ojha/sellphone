import { useState } from 'react';
import { userService } from '../services/userService';
import { useNavigate, Link } from 'react-router-dom';

const Register = ({ isSeller = false }) => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '', password: '',
        // Set type based on prop
        user_type: isSeller ? 'seller' : 'buyer'
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const response = await userService.register(formData);
            console.log("Server Response:", response)
            alert(`${isSeller ? 'Seller' : 'User'} Registered Successfully!`);
            navigate(isSeller ? '/seller-login' : '/login');
        } catch (err) {
            console.error("Error: ", err.response?.data || err.message)
            alert(err.response?.data?.detail || "Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-sidebar">
                <h2 className="text-3xl font-bold mb-4">
                    {isSeller ? "Seller Registration" : "Looks like you're new here!"}
                </h2>
                <p className="text-lg opacity-80 leading-relaxed">
                    {isSeller
                        ? "Register to start selling your mobile phones to millions of customers."
                        : "Sign up with your mobile number to get started"}
                </p>
                <img
                    src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
                    alt="register-illustration"
                    className="mt-auto self-center w-48 mb-10"
                />
            </div>

            <div className="auth-form-container">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex gap-4">
                        <input type="text" placeholder="First Name" className="fk-input"
                            onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                        <input type="text" placeholder="Last Name" className="fk-input"
                            onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                    </div>
                    <input type="email" placeholder="Email Address" className="fk-input"
                        onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    <input type="text" placeholder="Phone Number" className="fk-input"
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    <input type="password" placeholder="Set Password" className="fk-input"
                        onChange={e => setFormData({ ...formData, password: e.target.value })} required />

                    <button className="fk-btn-yellow mt-4 cursor-pointer">{isSeller ? "Register as Seller" : "Continue"}</button>
                </form>
                <Link to={isSeller ? "/seller-login" : "/login"} className="text-center text-fk-blue font-semibold py-4 bg-gray-50 shadow-inner mt-4 cursor-pointer">
                    Existing User? Log in
                </Link>
            </div>
        </div>
    );
};

export default Register;