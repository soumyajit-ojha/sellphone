import { Link } from 'react-router-dom';

const SellerLanding = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Sell Online with SellPhone</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Launch your mobile store in minutes and reach 45+ crore customers across India.
            </p>

            <div className="flex gap-4">
                <Link to="/seller-register" className="bg-fk-yellow text-white px-10 py-3 rounded-sm font-bold shadow-md text-lg hover:bg-opacity-90">
                    Start Selling
                </Link>
                <Link to="/seller-login" className="bg-fk-blue text-white px-10 py-3 rounded-sm font-bold shadow-md text-lg hover:bg-opacity-90">
                    Seller Login
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">0% Commission</h3>
                    <p className="text-gray-500 text-sm">Sell your products without paying any commission fees.</p>
                </div>
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">Fast Payments</h3>
                    <p className="text-gray-500 text-sm">Get paid directly into your bank account within 7 days.</p>
                </div>
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">Large Customer Base</h3>
                    <p className="text-gray-500 text-sm">Access to millions of customers who trust SellPhone.</p>
                </div>
            </div>
        </div>
    );
};

export default SellerLanding;