
import React, { useMemo } from 'react';
import { MarketplaceItem } from '../types';
import { MapPin, Box, ShoppingCart, Info, TrendingUp, Search } from 'lucide-react';
import { DUMMY_ITEMS } from '../constants';

interface MarketplaceProps {
  searchQuery?: string;
  themeColor?: string;
}

const Marketplace: React.FC<MarketplaceProps> = ({ searchQuery = '', themeColor = 'emerald-600' }) => {
  const filteredItems = useMemo(() => {
    if (!searchQuery) return DUMMY_ITEMS;
    return DUMMY_ITEMS.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div id="marketplace-section" className="mt-32 scroll-mt-24 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-4">
        <div>
          <h2 className="text-5xl font-black text-black tracking-tighter">Live Inventory</h2>
          <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
            <TrendingUp size={18} className="text-emerald-500" />
            Verified Industrial Streams
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">
            {filteredItems.length} MATERIALS AVAILABLE
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] group hover:shadow-[0_60px_100px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col hover:-translate-y-6">
              <div className="relative h-72 overflow-hidden m-4 rounded-[3rem]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-6 left-6 px-5 py-2 bg-black/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                  {item.category}
                </div>
              </div>
              <div className="p-10 pt-4 flex-1 flex flex-col">
                <h3 className="font-black text-black text-2xl mb-4 line-clamp-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-slate-400 font-bold">
                    <Box size={20} className="text-emerald-500" />
                    <span className="uppercase text-xs tracking-widest">Quantity: {item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold">
                    <MapPin size={20} className="text-slate-300" />
                    <span className="uppercase text-xs tracking-widest">{item.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1">BUY FOR</span>
                    <span className="text-3xl font-black text-black tracking-tighter">{item.price}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-slate-100 transition-colors">
                      <Info size={24} />
                    </button>
                    <button className="p-4 bg-black text-white rounded-3xl hover:bg-emerald-600 transition-all shadow-xl group-hover:scale-110 active:scale-95">
                      <ShoppingCart size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Search className="text-slate-200" size={40} />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Zero Matches Found</h3>
          <p className="text-slate-500 font-bold text-sm tracking-[0.2em] mt-3 uppercase">Try adjusting your industrial filters.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
