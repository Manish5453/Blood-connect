import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AlertCircle, CalendarDays, Droplets, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dashboardPath = '/dashboard';

  const closeMenu = () => setIsOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  const desktopLinkClass = ({ isActive }) =>
    `relative whitespace-nowrap px-1 py-2 text-sm font-semibold transition ${isActive ? 'text-rose-600 after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-rose-600' : 'text-slate-600 hover:text-rose-600'}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[74px] items-center justify-between gap-4 sm:h-20">
          <Link to="/" onClick={closeMenu} className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 shadow-sm shadow-rose-100">
              <Droplets className="h-6 w-6 text-rose-600" />
            </span>
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
              <span className="text-rose-600">Blood</span><span className="text-slate-900">Connect</span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            <NavLink to="/" className={desktopLinkClass}>Home</NavLink>
            <NavLink to="/inventory" className={desktopLinkClass}>Hospitals</NavLink>
            <NavLink to="/donors" className={desktopLinkClass}>Donation</NavLink>
            <NavLink to="/camps" className={desktopLinkClass}>Blood Camps</NavLink>
            <NavLink to={dashboardPath} className={desktopLinkClass}>Dashboard</NavLink>
          </div>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <Link to="/emergency-sos" className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100">
              <AlertCircle className="h-4 w-4" /> Emergency
            </Link>
            {user ? (
              <>
                <span className="max-w-40 truncate border-l border-slate-200 pl-4 text-sm font-medium text-slate-600">{user.name}</span>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:text-rose-600">Login</Link>
                <Link to="/register" className="whitespace-nowrap rounded-xl bg-linear-to-r from-rose-600 to-red-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:-translate-y-0.5 hover:from-rose-700 hover:to-red-800">Join as Donor</Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-rose-200 hover:text-rose-600 xl:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-1 border-t border-slate-100 py-3 xl:hidden">
            {[
              ['Home', '/'],
              ['Hospitals', '/inventory'],
              ['Donation', '/donors'],
              ['Blood Camps', '/camps'],
              ['Dashboard', dashboardPath],
              ['Emergency Requests', '/requests'],
              ...(user?.role === 'hospital' ? [['Donor Tracking', '/donor-tracking'], ['Issuance Log', '/issuance-log'], ['Analytics', '/analytics']] : user?.role === 'donor' ? [['My Responses', '/donor-tracking']] : []),
              ['Emergency SOS', '/emergency-sos'],
            ].map(([label, path]) => (
              <Link key={`${label}-${path}`} to={path} onClick={closeMenu} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600">
                {label === 'Blood Camps' ? <CalendarDays className="h-4 w-4" /> : null}{label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-600"><LogOut className="h-4 w-4" /> Logout</button>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link to="/login" onClick={closeMenu} className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-bold text-slate-700">Login</Link>
                <Link to="/register" onClick={closeMenu} className="rounded-lg bg-rose-600 px-3 py-2.5 text-center text-sm font-bold text-white">Join as Donor</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
