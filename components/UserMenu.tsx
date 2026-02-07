
import React, { useState, useRef, useEffect } from 'react';
import { User, LogIn, UserPlus } from 'lucide-react';

interface UserMenuProps {
  onSignInClick: () => void;
  themeColor: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ onSignInClick, themeColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => {
    setIsOpen(false);
    onSignInClick();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm transition-all"
      >
        <User size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-[150] animate-in fade-in zoom-in-95 duration-100">
          <button 
            onClick={handleSignIn}
            className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <LogIn size={14} className={`text-${themeColor}`} />
            <span className="text-[11px] font-bold">Sign In</span>
          </button>
          <button className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 transition-colors">
            <UserPlus size={14} className="text-slate-400" />
            <span className="text-[11px] font-bold">Register</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
