
import React, { useState, useEffect, useMemo } from 'react';
import ImpactOverview from './components/ImpactOverview';
import BuyerView from './components/BuyerView';
import SellerView from './components/SellerView';
import UserMenu from './components/UserMenu';
import SignInModal from './components/SignInModal';
import { analyzeWaste, logoutUser } from './api';
import { WasteAnalysisResponse } from './types';
import { Globe, Plus, Search, Play, ArrowUp, Zap, ShieldCheck, TrendingUp, DollarSign, Box, Target } from 'lucide-react';
import { DUMMY_ITEMS } from './constants';

const MOCK_INITIAL_RESULT: WasteAnalysisResponse = {
  category: "Post-industrial Plastics",
  buyer: "Plastic Granulation and Pelletizing Facility",
  revenue: 1375,
  savings: 250,
  co2: 4.5,
  landfill: 100
};

interface User {
  id: string;
  email: string;
  company_name?: string;
  wallet_address?: string;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WasteAnalysisResponse | null>(null);
  const [currentView, setCurrentView] = useState<'buyer' | 'seller'>('buyer');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app mount
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const email = localStorage.getItem('user_email');
        const company = localStorage.getItem('user_company');
        
        if (token && userId && email) {
          setUser({
            id: userId,
            email,
            company_name: company || undefined
          });
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const fetchInitialMatch = async () => {
      setLoading(true);
      try {
        const res = await analyzeWaste({
          description: "High density polyethylene scrap material",
          quantity: 2500,
          hazard: "None",
          location: "Industrial District 9"
        });
        setResult(res);
      } catch (err) {
        console.warn("AI analysis failed or API Key missing. Using high-fidelity mock data for UI preview.");
        // We set a mock result so the user sees the beautiful dashboard even without a key
        setResult(MOCK_INITIAL_RESULT);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialMatch();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('buyer');
  };

  const isBuyer = currentView === 'buyer';
  const theme = isBuyer 
    ? { primary: 'emerald-600', hover: 'emerald-700', shadow: 'emerald-100', accent: 'indigo-500', bg: 'bg-emerald-600' }
    : { primary: 'rose-600', hover: 'rose-700', shadow: 'rose-100', accent: 'pink-500', bg: 'bg-rose-600' };

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    return DUMMY_ITEMS.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [searchQuery]);

  const handleSearchTrigger = () => {
    setCurrentView('buyer');
    const marketplaceEl = document.getElementById('marketplace-section');
    if (marketplaceEl) {
      marketplaceEl.scrollIntoView({ behavior: 'smooth' });
    }
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-white transition-all duration-500 overflow-x-hidden relative">
      <SignInModal 
        isOpen={isSignInOpen} 
        onClose={() => setIsSignInOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4 sm:gap-8">
          
          <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0" 
            onClick={() => setCurrentView('buyer')}
          >
            <div className="bg-black p-2.5 rounded-2xl group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-slate-200">
              <Globe className="text-emerald-400" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-black leading-tight tracking-tighter">ReUsed</h1>
              <p className="text-[9px] uppercase font-black text-emerald-600 tracking-[0.2em] -mt-1">Exchange</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative flex items-center">
            <div className="w-full flex items-center bg-white border-2 border-slate-900 rounded-full overflow-hidden shadow-sm focus-within:shadow-md transition-all duration-300">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
                placeholder="Search materials, machinery, or facilities..."
                className="flex-1 py-2.5 px-6 text-sm font-bold text-black placeholder:text-slate-400 outline-none bg-white"
              />
              <button 
                onClick={handleSearchTrigger}
                className="bg-black text-white p-3 px-6 hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                <Search size={20} />
              </button>
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[110]">
                {suggestions.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.title);
                      setShowSuggestions(false);
                      handleSearchTrigger();
                    }}
                    className="w-full px-6 py-3.5 text-left text-sm font-bold text-black hover:bg-slate-50 border-b border-slate-50 last:border-none flex items-center justify-between"
                  >
                    <span>{item.title}</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase font-black">{item.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-6 ml-auto">
            <div className="flex items-center gap-1 sm:gap-4 bg-slate-50 p-1 rounded-full border border-slate-100">
              <button 
                onClick={() => setCurrentView('buyer')}
                className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all duration-300 shadow-sm ${isBuyer ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                BUY
              </button>
              <button 
                onClick={() => setCurrentView('seller')}
                className={`flex items-center gap-1 px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all duration-300 shadow-sm ${!isBuyer ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-200 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Plus size={14} strokeWidth={3} /> SELL
              </button>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-100 mx-2" />
            <UserMenu 
              onSignInClick={() => setIsSignInOpen(true)} 
              themeColor={isBuyer ? "emerald-600" : "rose-600"}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Hero Section - Shown for Seller View */}
      {!isBuyer && (
        <section className="relative pt-12 pb-24 border-b border-slate-50 bg-slate-50/30 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              <div className="space-y-10 animate-in slide-in-from-left duration-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="w-12 h-1 bg-rose-600" />
                     <p className="text-rose-600 font-black tracking-[0.4em] text-[10px] uppercase">Vendor Ecosystem</p>
                  </div>
                  <h2 className="text-[5rem] sm:text-[6rem] font-black text-black leading-[0.9] tracking-tighter">
                    ANYONE <br />
                    CAN START <br />
                    <span className="relative">
                      THEIR OWN
                      <div className="absolute -bottom-2 left-0 w-full h-3 bg-rose-400/30 -z-10" />
                    </span> <br />
                    BUSINESS.
                  </h2>
                  <p className="text-slate-600 text-xl font-medium max-w-md mt-10 leading-relaxed">
                    Convert surplus industrial assets into immediate revenue. List materials in seconds and reach verified global buyers.
                  </p>
                </div>

                <div className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-black group-hover:border-black transition-all">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Learn how to sell</span>
                </div>
              </div>

              {/* Enhanced Seller Illustration / Mockup */}
              <div className="relative animate-in zoom-in duration-1000 h-[700px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-50 rounded-[4rem] -rotate-3 scale-95 opacity-50" />
                
                {/* Main Mockup Card */}
                <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 p-8 z-10 animate-float">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <Box size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Listing</p>
                        <h4 className="text-sm font-black text-black uppercase">Aluminum Scraps</h4>
                      </div>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                      <ShieldCheck size={12} strokeWidth={3} /> Verified
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="h-48 bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1558484661-007d3b5b1580?auto=format&fit=crop&q=80&w=600" 
                        className="w-full h-full object-cover" 
                        alt="Scrap Preview"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Value</p>
                        <p className="text-lg font-black text-black">$4,250.00</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Demand</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="text-emerald-500" size={14} />
                          <p className="text-lg font-black text-black">High</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Publish Asset</button>
                      <button className="px-5 py-4 bg-slate-100 text-slate-400 rounded-2xl"><Plus size={18} strokeWidth={3}/></button>
                    </div>
                  </div>
                </div>

                {/* Floating Notification Badge */}
                <div className="absolute top-20 right-0 bg-emerald-500 text-white p-6 rounded-[2.5rem] shadow-2xl z-20 animate-float-delayed flex items-center gap-4 border-4 border-white">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Buyer Match Found</p>
                    <p className="text-sm font-black">Industrial Smelter A+</p>
                  </div>
                </div>

                {/* Floating Analytics Badge */}
                <div className="absolute bottom-10 left-0 bg-white p-6 rounded-[2.0rem] shadow-2xl z-20 animate-float border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full border-4 border-emerald-500 border-r-slate-100 flex items-center justify-center">
                       <DollarSign className="text-emerald-500" size={18} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue Potential</p>
                      <p className="text-xl font-black text-black">+$12.4k/mo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isBuyer ? 'mt-12' : 'mt-32'}`}>
        {isBuyer && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-8">
               <div className="w-8 h-1 bg-emerald-600 rounded-full" />
               <p className="text-emerald-600 font-black tracking-[0.3em] text-[10px] uppercase">Personalized Dashboard</p>
            </div>
            <BuyerView result={result} loading={loading} themeColor={theme.primary} searchQuery={searchQuery} />
          </div>
        )}

        {!isBuyer && (
          <>
            <ImpactOverview themeColor={theme.primary} />
            <SellerView themeColor={theme.primary} userId={user?.id} />
          </>
        )}
      </main>
      
      <footer className="mt-40 border-t border-slate-100 py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2.5 rounded-2xl">
                <Globe size={28} className="text-emerald-400" />
              </div>
              <span className="font-black tracking-tighter text-3xl text-black">ReUsed</span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              Standardizing industrial waste management for a cleaner, more efficient global economy.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
             <div className="space-y-4">
                <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Platform</p>
                <ul className="space-y-3 text-sm font-bold text-slate-800">
                   <li><a href="#" className="hover:text-emerald-600">Catalogue</a></li>
                   <li><a href="#" className="hover:text-emerald-600">Impact Stats</a></li>
                </ul>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-10 border-t border-slate-200 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2025 REUSED GLOBAL EXCHANGE INFRASTRUCTURE</p>
        </div>
      </footer>

      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-4 rounded-full bg-slate-100/40 text-slate-400 border border-slate-200/50 backdrop-blur-sm transition-all duration-500 z-[100] hover:bg-slate-200/60 hover:text-slate-600 hover:scale-110 shadow-sm ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} strokeWidth={3} />
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-float { animation: float 6s infinite ease-in-out; }
        .animate-float-delayed { animation: float-delayed 6s infinite ease-in-out 1.5s; }
      `}</style>
    </div>
  );
};

export default App;
