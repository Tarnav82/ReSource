
import React from 'react';
import Marketplace from './Marketplace';
import { WasteAnalysisResponse } from '../types';
import { 
  ArrowRight, 
  Zap, 
  Target, 
  ShieldCheck, 
  TrendingDown, 
  Fingerprint, 
  Truck, 
  BadgeCheck,
  Activity
} from 'lucide-react';

interface BuyerViewProps {
  result: WasteAnalysisResponse | null;
  loading: boolean;
  themeColor: string;
  searchQuery?: string;
}

const BuyerView: React.FC<BuyerViewProps> = ({ result, loading, themeColor, searchQuery }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Personalized Intelligence Section */}
      <section className="relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className={`text-${themeColor}`} size={20} fill="currentColor" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Procurement Intelligence
              </h2>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">AI-Optimized Facility Resource Matching</p>
          </div>
          <button className={`text-xs font-black text-${themeColor} hover:underline flex items-center gap-2 bg-${themeColor}/5 px-4 py-2 rounded-full transition-all`}>
            VIEW FULL PIPELINE <ArrowRight size={14} />
          </button>
        </div>

        {result ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Primary Opportunity Card */}
            <div className="xl:col-span-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
              <div className="relative bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] h-full flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Target size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest">98.2% Compatibility Score</span>
                  </div>
                  
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
                      New Source Found: <br />
                      <span className="text-emerald-600">{result.category}</span>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                      We've identified a verified industrial stream from a <span className="text-slate-900 font-bold">{result.buyer}</span> that fits your current manufacturing specs.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PROJECTED SAVINGS</p>
                      <p className="text-3xl font-black text-slate-900">${result.savings.toLocaleString()}<span className="text-lg text-emerald-500 ml-1">↓</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DIVERSION IMPACT</p>
                      <p className="text-3xl font-black text-slate-900">{result.landfill}%</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                      SECURE ALLOTMENT
                    </button>
                    <button className="px-8 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all">
                      REQUEST SPECS
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-1/3 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm">
                        <ShieldCheck className="text-emerald-500" size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified Seller</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[94%]" />
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supply Reliability Index</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                     <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <TrendingDown size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Market Dip</span>
                     </div>
                     <p className="text-xs font-bold text-slate-600 leading-snug">
                       Current pricing for {result.category} is 12% below the quarterly average.
                     </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Procurement DNA Widget - Replacing the ROI Impact Chart */}
            <div className="xl:col-span-1">
              <div className="h-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative p-8 flex flex-col">
                <div className="mb-8">
                   <div className="flex items-center gap-2 mb-1">
                     <Fingerprint className="text-emerald-400" size={18} />
                     <h4 className="text-white text-sm font-black uppercase tracking-[0.2em]">Material DNA</h4>
                   </div>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Logistics & Quality Breakdown</p>
                </div>

                <div className="flex-1 space-y-6">
                   {/* Quality Gauge */}
                   <div className="bg-white/5 border border-white/10 p-5 rounded-3xl group hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-end mb-3">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Purity Grade</p>
                            <p className="text-2xl font-black text-white">Grade A+</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-emerald-400">99.4%</p>
                         </div>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-400 w-[99.4%]" />
                      </div>
                   </div>

                   {/* Logistics Proximity */}
                   <div className="flex gap-4">
                      <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-3xl">
                         <Truck className="text-blue-400 mb-2" size={20} />
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Proximity</p>
                         <p className="text-lg font-black text-white">12.4 mi</p>
                      </div>
                      <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-3xl">
                         <Activity className="text-purple-400 mb-2" size={20} />
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Lead Time</p>
                         <p className="text-lg font-black text-white">24-48h</p>
                      </div>
                   </div>

                   {/* Verification Badges */}
                   <div className="pt-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Certifications & Compliance</p>
                      <div className="flex flex-wrap gap-2">
                         <div className="flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-400/20 text-[9px] font-black uppercase">
                            <BadgeCheck size={12} /> ISO 14001
                         </div>
                         <div className="flex items-center gap-1.5 bg-blue-400/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-400/20 text-[9px] font-black uppercase">
                            <BadgeCheck size={12} /> OSHA SAFE
                         </div>
                         <div className="flex items-center gap-1.5 bg-slate-400/10 text-slate-400 px-3 py-1.5 rounded-full border border-slate-400/20 text-[9px] font-black uppercase">
                            <BadgeCheck size={12} /> RE-CERT
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                   <div className="flex items-center justify-between text-white/40">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Platform Verified Stream</span>
                      <ShieldCheck size={16} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-24 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
               <Zap className="text-slate-300 animate-pulse" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Synchronizing Infrastructure Matches...</h3>
            <p className="text-slate-400 font-bold text-xs tracking-widest mt-3 uppercase">Analyzing global streams for your facility profile</p>
          </div>
        )}
      </section>

      {/* Primary Marketplace */}
      <Marketplace searchQuery={searchQuery} themeColor={themeColor} />
    </div>
  );
};

export default BuyerView;
