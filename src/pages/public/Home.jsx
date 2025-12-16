import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWedding } from '../../context/WeddingContext';
import { LogOut, Heart, Calendar, Users, DollarSign, ChevronDown, Plus, Check } from 'lucide-react';

const Header = () => {
  const { user, logout, role } = useAuth();
  const { weddings, selectedWedding, selectWedding } = useWedding();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWeddingDropdown, setShowWeddingDropdown] = useState(false);

  const navItems = {
    couple: [
      { name: 'Dashboard', path: '/couple/dashboard', icon: Heart },
      { name: 'Wedding', path: '/couple/wedding', icon: Calendar },
      { name: 'Guests', path: '/couple/guests', icon: Users },
      { name: 'Budget', path: '/couple/budgets', icon: DollarSign },
    ],
    vendor: [
      { name: 'Dashboard', path: '/vendor/dashboard', icon: Heart },
      { name: 'Profile', path: '/vendor/profile', icon: Users },
      { name: 'Bookings', path: '/vendor/bookings', icon: Calendar },
    ]
  };

  const items = navItems[role] || [];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {/* ROSE COLOR ICON */}
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" strokeWidth={2.5} />
            <span className="text-xl font-bold text-slate-800 tracking-tight font-serif">WedVow</span>
            
            {/* Wedding Selector */}
            {role === 'couple' && weddings.length > 0 && (
              <div className="relative ml-6">
                <button
                  onClick={() => setShowWeddingDropdown(!showWeddingDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border 
                    ${showWeddingDropdown 
                      ? 'bg-rose-50 border-rose-300 text-rose-600' 
                      : 'bg-white border-rose-200 text-slate-600 hover:border-rose-300 hover:text-rose-500'
                    }`}
                >
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span className="max-w-[150px] truncate">
                    {selectedWedding ? `${selectedWedding.brideName} & ${selectedWedding.groomName}` : 'Select Wedding'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform text-slate-400 ${showWeddingDropdown ? 'rotate-180 text-rose-500' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showWeddingDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowWeddingDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-rose-100 z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 max-h-80 overflow-y-auto">
                        {weddings.map((wedding) => (
                          <button
                            key={wedding._id}
                            onClick={() => {
                              selectWedding(wedding);
                              setShowWeddingDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors 
                              ${selectedWedding?._id === wedding._id ? 'bg-rose-50 text-rose-700' : 'hover:bg-slate-50 text-slate-700'}
                            `}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate font-serif">
                                {wedding.brideName} & {wedding.groomName}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(wedding.weddingDate).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedWedding?._id === wedding._id && (
                              <Check className="w-4 h-4 flex-shrink-0 ml-2 text-rose-500" />
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="border-t border-rose-100 p-2">
                        <button
                          onClick={() => {
                            setShowWeddingDropdown(false);
                            navigate('/couple/wedding?new=true');
                          }}
                          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg font-bold text-sm transition-colors text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700"
                        >
                          <Plus className="w-4 h-4" />
                          Create New Wedding
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation & Profile */}
          {user && (
            <>
              <nav className="hidden md:flex items-center gap-8">
                {items.map(({ name, path, icon: Icon }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors 
                        ${isActive 
                          ? 'text-rose-500' 
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                      {name}
                    </button>
                  );
                })}
              </nav>
              
              <div className="flex items-center gap-4 pl-6 border-l border-rose-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">{role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 transition-colors rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 stroke-2" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;