
import React from 'react';
import { X, Mail, Lock, Shield } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl shadow-2xl relative flex flex-col justify-center p-8 sm:p-10 animate-in zoom-in-95 duration-500">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-8">
          <div className="bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-emerald-400" size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Dashboard</h2>
          <p className="text-slate-500 text-[11px] font-medium mt-1 uppercase tracking-widest">Enterprise Authentication</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Facility Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
              <input 
                type="email" 
                placeholder="auth@factory.io"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </div>
          <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all mt-2">
            Continue to Platform
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50 flex flex-col items-center gap-6">
          <button className="text-[9px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 transition-colors">
            <Shield size={10} /> Sign in as Administrator
          </button>
          <div className="text-[11px] text-slate-400 font-medium">
            New facility? <span className="text-blue-600 font-black cursor-pointer hover:underline">Register Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
