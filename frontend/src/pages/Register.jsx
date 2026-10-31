import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    bloodGroup: 'A+',
    city: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'role' ? { bloodGroup: value === 'hospital' ? 'All' : current.bloodGroup === 'All' ? 'A+' : current.bloodGroup } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message;
      setError(message || (err.request
        ? 'Cannot reach the server. Make sure the BloodConnect backend is running.'
        : err.message || 'Registration failed'));
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <HeartPulse className="h-12 w-12 text-red-600 mx-auto animate-pulse" />
          <h2 className="text-2xl font-black text-gray-900 mt-2">Create Account</h2>
          <p className="text-sm text-gray-500">Join BloodConnect as a donor, recipient, or hospital</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4 text-center font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                onChange={handleChange} 
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                onChange={handleChange} 
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none" 
                placeholder="john@example.com" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                onChange={handleChange} 
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none" 
                placeholder="••••••••" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                required 
                onChange={handleChange} 
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none" 
                placeholder="9876543210" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="donor">Donor</option>
                <option value="recipient">Recipient</option>
                <option value="hospital">Hospital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
              {formData.role === 'hospital' ? (
                <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 font-semibold text-rose-700">All blood groups</div>
              ) : (
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                required 
                onChange={handleChange} 
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none" 
                placeholder="Delhi" 
              />
            </div>
          </div>

          {/* 🔴 High Contrast Register Button */}
          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition mt-4 text-base"
          >
            Register Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-red-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
