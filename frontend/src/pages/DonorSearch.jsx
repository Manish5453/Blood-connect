import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Phone, Droplet, User, ShieldCheck } from 'lucide-react';

export default function DonorSearch() {
  const [donors, setDonors] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDonors = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Backend Port 5000 / API endpoint check karein
      const res = await axios.get(`http://localhost:5001/api/donors`, {
        params: { bloodGroup, city }
      });
      console.log("Backend response donors:", res.data);
      setDonors(res.data);
    } catch (err) {
      console.error("Error fetching donors:", err);
      setErrorMsg("Backend server se data nahi mil pa raha hai. Port or API path check karein.");
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, city]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-full mb-3 shadow-inner">
            <Droplet className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find Available Blood Donors
          </h1>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
            Search verified blood donors by blood group and city for emergency support instantly.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Blood Group Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by city (e.g. Delhi, Mumbai)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Donors Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : donors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <div 
                key={donor._id || donor.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-500 to-rose-600"></div>

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg border border-red-100">
                        {donor.name ? donor.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {donor.name || "Anonymous Donor"}
                        </h3>
                        <div className="flex items-center text-xs text-emerald-600 font-medium mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Donor
                        </div>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                      <Droplet className="w-3.5 h-3.5 mr-1 fill-current" />
                      {donor.bloodGroup || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{donor.city || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-800">{donor.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${donor.phone}`}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-center transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Donor</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No real donors found in database</h3>
            <p className="text-gray-500 text-sm mt-1">Make sure your backend server is running and users have registered.</p>
          </div>
        )}

      </div>
    </div>
  );
}
