import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const BloodRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [acceptedRequestIds, setAcceptedRequestIds] = useState([]);
  const [acceptingId, setAcceptingId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+',
    unitsNeeded: 1,
    hospitalName: '',
    city: '',
    contactPhone: '',
    urgencyLevel: 'Critical'
  });

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (user?.role === 'donor') {
      API.get('/commitments')
        .then(({ data }) => setAcceptedRequestIds(data.filter((item) => item.referenceType === 'General').map((item) => String(item.referenceId))))
        .catch((err) => console.error('Error fetching donor responses:', err));
    }
  }, [user?._id, user?.role]);

  const handleAcceptRequest = async (requestId) => {
    setAcceptingId(requestId);
    try {
      await API.post('/commitments', { requestId });
      setAcceptedRequestIds((current) => [...current, String(requestId)]);
    } catch (err) {
      if (err.response?.status === 409) {
        setAcceptedRequestIds((current) => [...current, String(requestId)]);
      } else {
        alert(err.response?.data?.message || 'Could not accept this request. Please sign in as a donor.');
      }
    } finally {
      setAcceptingId('');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          token = parsed.token;
        } catch (err) {
          console.error(err);
        }
      }
    }

    if (!token) {
      alert('Authentication token not found! Please login again.');
      return;
    }

    try {
      await API.post('/requests', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowModal(false);
      fetchRequests();
      setFormData({ 
        patientName: '', 
        bloodGroup: 'A+', 
        unitsNeeded: 1, 
        hospitalName: '', 
        city: '', 
        contactPhone: '', 
        urgencyLevel: 'Critical' 
      });
      alert('Emergency request posted successfully!');
    } catch (err) {
      console.error('FULL AXIOS ERROR:', err.response ? err.response.data : err.message);
      alert(err.response?.data?.message || err.message || 'Failed to create request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Emergency Blood Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Connect with donors and manage urgent blood requirements.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700 transition transform hover:-translate-y-0.5"
          >
            + Post Emergency Request
          </button>
        </div>

        {/* Requests List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">No active emergency requests found.</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 border-l-4 border-l-red-600">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800">{req.patientName}</h3>
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                    {req.bloodGroup}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p><strong>Hospital:</strong> {req.hospitalName}, {req.city}</p>
                  <p><strong>Units Needed:</strong> <span className="text-gray-900 font-semibold">{req.unitsNeeded}</span></p>
                  <p><strong>Contact:</strong> {req.contactPhone}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Urgency:</span>
                  <span className="bg-red-600/10 text-red-600 font-bold px-2.5 py-1 rounded-md">
                    {req.urgencyLevel}
                  </span>
                </div>
                {user?.role === 'donor' && (
                  <button
                    type="button"
                    disabled={acceptingId === req._id || acceptedRequestIds.includes(String(req._id))}
                    onClick={() => handleAcceptRequest(req._id)}
                    className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-emerald-600"
                  >
                    {acceptedRequestIds.includes(String(req._id)) ? 'Response sent' : acceptingId === req._id ? 'Sending…' : 'I can donate'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modern Modal for Posting Request */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative transform transition-all">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold text-gray-900">Post Emergency Request</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Patient Name</label>
                  <input
                    type="text"
                    name="patientName"
                    placeholder="Enter patient full name"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Units Needed</label>
                    <input
                      type="number"
                      name="unitsNeeded"
                      min="1"
                      value={formData.unitsNeeded}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      name="hospitalName"
                      placeholder="Hospital & Branch"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City name"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    placeholder="10-digit mobile number"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Urgency Level</label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-5 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodRequests;
