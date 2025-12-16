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
    <header className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Heart className="w-7 h-7" style={{ color: '#0EA5A4', fill: '#0EA5A4', strokeWidth: '2.5' }} />
            <span className="text-xl font-bold" style={{ color: '#0F172A' }}>WedVow</span>
            
            {/* Wedding Selector - Only for couples with weddings */}
            {role === 'couple' && weddings.length > 0 && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowWeddingDropdown(!showWeddingDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
                  style={{ 
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <Calendar className="w-4 h-4" style={{ color: '#0EA5A4' }} />
                  <span className="max-w-[150px] truncate">
                    {selectedWedding ? `${selectedWedding.brideName} & ${selectedWedding.groomName}` : 'Select Wedding'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showWeddingDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showWeddingDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowWeddingDropdown(false)}
                    />
                    <div 
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border z-20"
                      style={{ borderColor: '#E2E8F0' }}
                    >
                      <div className="p-2 max-h-80 overflow-y-auto">
                        {weddings.map((wedding) => (
                          <button
                            key={wedding._id}
                            onClick={() => {
                              selectWedding(wedding);
                              setShowWeddingDropdown(false);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors hover:bg-slate-50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: '#0F172A' }}>
                                {wedding.brideName} & {wedding.groomName}
                              </p>
                              <p className="text-xs" style={{ color: '#64748B' }}>
                                {new Date(wedding.weddingDate).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedWedding?._id === wedding._id && (
                              <Check className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: '#0EA5A4' }} />
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="border-t p-2" style={{ borderColor: '#E2E8F0' }}>
                        <button
                          onClick={() => {
                            setShowWeddingDropdown(false);
                            navigate('/couple/wedding?new=true');
                          }}
                          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg font-medium text-sm transition-colors"
                          style={{ 
                            color: '#0EA5A4',
                            backgroundColor: 'rgba(14, 165, 164, 0.1)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(14, 165, 164, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(14, 165, 164, 0.1)'}
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

          {user && (
            <>
              <nav className="hidden md:flex items-center gap-6">
                {items.map(({ name, path, icon: Icon }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{
                      color: location.pathname === path ? '#0EA5A4' : '#475569'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === path ? '#0EA5A4' : '#475569'}
                  >
                    <Icon className="w-4 h-4" style={{ strokeWidth: '2.5' }} />
                    {name}
                  </button>
                ))}
              </nav>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{user.name}</p>
                  <p className="text-xs" style={{ color: '#475569' }}>{role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 transition-colors rounded-lg"
                  style={{ color: '#475569' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FF7A59';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 122, 89, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" style={{ strokeWidth: '2.5' }} />
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