
import React, { useState } from 'react';
import { Upload, MapPin, DollarSign, PlusCircle, CheckCircle2 } from 'lucide-react';

interface SellerViewProps {
  themeColor: string;
}

const SellerView: React.FC<SellerViewProps> = ({ themeColor }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-900">List Your Industrial Assets</h2>
        <p className="text-slate-500 text-[11px]">Convert waste into revenue by reaching global verified buyers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Asset Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bulk Polyethylene Scraps"
                  className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-${themeColor} outline-none text-[12px] transition-all`}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Category</label>
                <select className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-${themeColor} outline-none appearance-none bg-white text-[12px]`}>
                  <option>Metals</option>
                  <option>Polymers</option>
                  <option>Chemicals</option>
                  <option>Organics</option>
                  <option>Textiles</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Quantity</label>
                <input 
                  type="text" 
                  placeholder="5000 kg"
                  className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-${themeColor} outline-none text-[12px]`}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Facility Location</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Factory Address"
                    className={`w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-${themeColor} outline-none text-[12px]`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Asking Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Price per kg"
                    className={`w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-${themeColor} outline-none text-[12px]`}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Material Reference Photo</label>
              <div className={`border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-${themeColor} hover:bg-${themeColor}/5 transition-all cursor-pointer relative`}>
                <input 
                  type="file" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                />
                {preview ? (
                  <img src={preview} className="mx-auto h-20 w-32 object-cover rounded-md shadow-sm" alt="Preview" />
                ) : (
                  <>
                    <Upload className="mx-auto text-slate-300 mb-1" size={20} />
                    <p className="text-[10px] text-slate-500 font-medium">Click to upload material photo</p>
                  </>
                )}
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full py-2.5 rounded-xl font-black text-white shadow-md transition-all flex items-center justify-center gap-2 text-[11px] ${
                isSubmitted ? 'bg-emerald-500' : `bg-slate-900 hover:bg-slate-800 shadow-slate-200`
              }`}
            >
              {isSubmitted ? (
                <><CheckCircle2 size={14} /> Published Successfully!</>
              ) : (
                <><PlusCircle size={14} /> Create Listing</>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className={`bg-${themeColor} rounded-2xl p-5 text-white shadow-lg shadow-${themeColor}/10 transition-colors duration-500`}>
            <h4 className="font-bold text-sm mb-2">Listing Tips</h4>
            <ul className="text-[10px] text-white/80 space-y-2">
              <li className="flex gap-2">
                <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center shrink-0">1</div>
                High-quality photos reduce inquiry time by 60%.
              </li>
              <li className="flex gap-2">
                <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center shrink-0">2</div>
                Precise purity levels attract verified buyers.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3 text-[11px] uppercase tracking-wider">Your Dashboard</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Active Listings</span>
                <span className="font-black">12</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Total Revenue</span>
                <span className={`font-black text-${themeColor}`}>$14.2k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerView;
