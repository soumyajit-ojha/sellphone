import { useState, useEffect } from 'react';
import AccountLayout from '../components/AccountLayout';
import { userService } from '../services/userService';
import { Camera, Edit2, Check, X } from 'lucide-react';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const res = await userService.getProfile();
        console.log(res.data);
        setUser(res.data);
        setFormData({
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            gender: res.data.gender || ''
        });
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 3MB Validation
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 3) {
            alert("Image size must be less than 3MB");
            return;
        }

        const data = new FormData();
        data.append('image', file);
        try {
            await userService.updateProfilePic(data);
            loadData();
        } catch (err) { alert("Upload failed"); }
    };

    const handleSave = async () => {
        console.log("Updating Name:", formData.first_name, formData.last_name);
        console.log("Updating Gender:", formData.gender);
        try {
            await userService.updateProfile(formData);
            setEditMode(false);
            loadData();
        } catch (err) { alert("Update failed"); }
    };

    if (loading) return <AccountLayout>Loading...</AccountLayout>;

    return (
        <AccountLayout>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Personal Information</h2>
                <button
                    onClick={() => editMode ? handleSave() : setEditMode(true)}
                    className="text-fk-blue font-bold flex items-center gap-2 uppercase text-sm"
                >
                    {editMode ? <><Check size={16} /> Save</> : <><Edit2 size={16} /> Edit</>}
                </button>
            </div>

            <div className="flex items-center gap-8 mb-12">
                <div className="relative group">
                    <img
                        src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`}
                        className="w-28 h-28 rounded-full object-cover border-2 border-gray-100"
                        alt="profile"
                        onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                    />
                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera size={20} />
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
                <div>
                    <h3 className="text-xl font-bold">{user.first_name} {user.last_name}</h3>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="First Name" value={formData.first_name} disabled={!editMode} onChange={v => setFormData({ ...formData, first_name: v })} />
                <InputGroup label="Last Name" value={formData.last_name} disabled={!editMode} onChange={v => setFormData({ ...formData, last_name: v })} />
                <InputGroup label="Email Address" value={user.email} disabled={true} />
                <InputGroup label="Mobile Number" value={user.phone} disabled={true} />

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Your Gender</label>
                    <div className="flex gap-6 pt-2">
                        {['Male', 'Female'].map(g => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    disabled={!editMode}
                                    checked={formData.gender === g}
                                    onChange={() => setFormData({ ...formData, gender: g })}
                                    className="w-4 h-4 accent-fk-blue"
                                /> {g}
                            </label>
                        ))}
                    </div>
                </div>

            </div>
        </AccountLayout>
    );
};

const InputGroup = ({ label, value, disabled, onChange }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
        <input
            type="text"
            value={value || ''}
            disabled={disabled}
            onChange={(e) => onChange && onChange(e.target.value)}
            className={`w-full border p-3 rounded-sm text-sm outline-none transition-all ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-transparent' : 'border-gray-300 focus:border-fk-blue'}`}
        />
    </div>
);

export default ProfilePage;