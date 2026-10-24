import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [stockForm, setStockForm] = useState({
    bloodGroup: 'A+',
    units: 1,
    hospitalName: '',
    city: '',
    contactPhone: '',
    batchNumber: '',
    expiryDate: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUserRole(parsed.role);
        setUserId(parsed._id);
        setStockForm(prev => ({
          ...prev,
          hospitalName: parsed.name || '',
          city: parsed.city || ''
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleStockChange = (e) => {
    setStockForm({ ...stockForm, [e.target.name]: e.target.value });
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setStockForm({
      bloodGroup: 'A+',
      units: 1,
      hospitalName: userInfo.name || '',
      city: userInfo.city || '',
      contactPhone: '',
      batchNumber: '',
      expiryDate: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditId(item._id);
    setStockForm({
      bloodGroup: item.bloodGroup,
      units: item.units,
      hospitalName: item.hospitalName,
      city: item.city,
      contactPhone: item.contactPhone || '',
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmitStock = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    if (!token) {
      alert('Please login again.');
      return;
    }

    try {
      if (editId) {
        await API.put(`/inventory/${editId}`, stockForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Stock updated successfully!');
      } else {
        await API.post('/inventory', stockForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Stock added successfully!');
      }
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Error saving stock:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to save stock');
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock entry?')) return;
    
    let token = localStorage.getItem('token');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) token = JSON.parse(userInfo).token;
    }

    try {
      await API.delete(`/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory();
      alert('Stock deleted successfully!');
    } catch (err) {
      console.error('Error deleting stock:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to delete stock');
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesGroup = selectedBloodGroup === 'All' || item.bloodGroup === selectedBloodGroup;
    const matchesCity = item.city?.toLowerCase().includes(cityFilter.toLowerCase()) || 
                        item.hospitalName?.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesGroup && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hospital Blood Bank Stock</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time blood units and expiry batch monitoring.</p>
          </div>
          
          {userRole === 'hospital' && (
            <button
              onClick={handleOpenAddModal}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
            >
              + Add New Stock
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Filter by Blood Group</label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
            >
              <option value="All">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Filter by City / Hospital</label>
            <input
              type="text"
              placeholder="Search city or hospital name..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading stock availability...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-medium">No blood stock found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => {
              const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
              const isOwner = userRole === 'hospital' && item.hospital === userId;

              return (
                <div key={item._id} className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 border-l-4 flex flex-col justify-between ${isExpired ? 'border-l-gray-400 bg-gray-50' : 'border-l-red-600'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{item.hospitalName}</h3>
                      <span className="bg-red-50 text-red-700 text-xs font-extrabold px-3 py-1 rounded-full border border-red-100">
                        {item.bloodGroup}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                      <p><strong>City:</strong> {item.city}</p>
                      <p><strong>Units:</strong> <span className="text-red-600 font-bold">{item.units} Units</span></p>
                      <p><strong>Batch:</strong> <span className="text-gray-700 font-mono">{item.batchNumber || 'N/A'}</span></p>
                      <p><strong>Expires On:</strong> <span className={isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'} {isExpired && '(Expired)'}</span></p>
                      {item.contactPhone && <p><strong>Contact:</strong> {item.contactPhone}</p>}
                    </div>
                  </div>

                  {/* Owner Action Buttons */}
                  {isOwner && (
                    <div className="flex space-x-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStock(item._id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{editId ? 'Edit Stock Details' : 'Add New Stock'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
              </div>

              <form onSubmit={handleSubmitStock} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={stockForm.bloodGroup}
                      onChange={handleStockChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Units</label>
                    <input
                      type="number"
                      name="units"
                      min="0"
                      value={stockForm.units}
                      onChange={handleStockChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Batch Number</label>
                    <input
                      type="text"
                      name="batchNumber"
                      placeholder="e.g. BATCH-102"
                      value={stockForm.batchNumber}
                      onChange={handleStockChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={stockForm.expiryDate}
                      onChange={handleStockChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={stockForm.hospitalName}
                      onChange={handleStockChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={stockForm.city}
                      onChange={handleStockChange}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    placeholder="Phone number"
                    value={stockForm.contactPhone}
                    onChange={handleStockChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-5 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:bg-red-700"
                  >
                    {editId ? 'Update Stock' : 'Save Stock'}
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

export default Inventory;