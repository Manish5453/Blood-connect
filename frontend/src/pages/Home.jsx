import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  Search, 
  AlertCircle, 
  Building2, 
  Users, 
  Droplet, 
  ArrowRight,
  ShieldCheck,
  Clock,
  PhoneCall
} from 'lucide-react';

const Home = () => {
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const compatibilityMap = {
    'A+': { give: ['A+', 'AB+'], receive: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { give: ['A+', 'A-', 'AB+', 'AB-'], receive: ['A-', 'O-'] },
    'B+': { give: ['B+', 'AB+'], receive: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { give: ['B+', 'B-', 'AB+', 'AB-'], receive: ['B-', 'O-'] },
    'AB+': { give: ['AB+'], receive: ['Universal Recipient (All Groups)'] },
    'AB-': { give: ['AB+', 'AB-'], receive: ['A-', 'B-', 'AB-', 'O-'] },
    'O+': { give: ['A+', 'B+', 'AB+', 'O+'], receive: ['O+', 'O-'] },
    'O-': { give: ['Universal Donor (All Groups)'], receive: ['O-'] },
  };

  return (
    <div className="space-y-10 pb-16 bg-gray-50 min-h-screen">
      {/* 🚨 Emergency Alert Banner */}
      <div className="bg-red-950 border-b border-red-800 text-white py-3 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider animate-pulse">
              Urgent Need
            </span>
            <span className="font-medium text-red-100">
              Critical demand for <strong className="text-white underline">O-Negative</strong> & <strong className="text-white underline">B-Negative</strong> donors!
            </span>
          </div>
          <Link 
            to="/requests" 
            className="bg-red-600 hover:bg-red-500 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            Respond Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 🔴 Premium Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-red-950 via-red-900 to-red-800 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-red-700/50">
          
          {/* Subtle Glow Background Shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-700/60 px-4 py-1.5 rounded-full text-xs font-bold text-red-200 uppercase tracking-widest">
              <HeartPulse className="h-4 w-4 text-red-400 animate-pulse" />
              Real-Time Emergency Network
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              Connecting Blood Donors <br />
              <span className="text-red-400">With Urgent Needs</span>
            </h1>

            <p className="text-gray-200 text-base sm:text-lg font-normal leading-relaxed">
              Bridge the gap between life-saving voluntary donors and emergency ICU requirements. Instant contact, zero middlemen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/donors"
                className="bg-white hover:bg-gray-100 text-red-950 font-extrabold px-8 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-base"
              >
                <Search className="h-5 w-5 text-red-600" /> Find Donors Now
              </Link>

              <Link
                to="/requests"
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl border border-red-400/40 transition flex items-center justify-center gap-2 text-base shadow-md"
              >
                <AlertCircle className="h-5 w-5" /> Post Emergency Need
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/donors" 
            className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 group"
          >
            <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center text-red-600 mb-5 group-hover:scale-110 transition">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Find Verified Donors</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Search nearby voluntary blood donors filterable by exact blood group and city location.
            </p>
            <span className="text-red-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Search Directory <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link 
            to="/requests" 
            className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-amber-200 transition-all duration-300 group"
          >
            <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Requests</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Post urgent requirements for surgery or ICU patients with direct contact details.
            </p>
            <span className="text-amber-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View Active Requests <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link 
            to="/inventory" 
            className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 group"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Blood Bank Inventory</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Check real-time unit stock levels available across partner hospitals and blood banks.
            </p>
            <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Check Hospital Stock <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* 🩸 Interactive Compatibility Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Blood Compatibility Matrix</h2>
            <p className="text-gray-500 text-sm mt-1">Select a blood group to see valid recipient and donor groups.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.keys(compatibilityMap).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-5 py-2.5 rounded-xl font-extrabold transition text-sm ${
                  selectedGroup === group
                    ? 'bg-red-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Can Give Blood To</span>
              <div className="flex flex-wrap gap-2 pt-2">
                {compatibilityMap[selectedGroup].give.map((g, idx) => (
                  <span key={idx} className="bg-emerald-100 text-emerald-900 font-bold px-3.5 py-1.5 rounded-lg text-sm border border-emerald-200">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Can Receive Blood From</span>
              <div className="flex flex-wrap gap-2 pt-2">
                {compatibilityMap[selectedGroup].receive.map((g, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-900 font-bold px-3.5 py-1.5 rounded-lg text-sm border border-blue-200">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;