
import React from 'react';
import { Leaf, Recycle, Wind, Factory } from 'lucide-react';

interface ImpactOverviewProps {
  themeColor: string;
}

const ImpactOverview: React.FC<ImpactOverviewProps> = ({ themeColor }) => {
  const stats = [
    { label: 'CO2 OFFSET', value: '14.2k T', icon: <Wind size={24} />, desc: 'Net zero trajectory', color: 'blue' },
    { label: 'SAVED RESOURCES', value: '82.4k', icon: <Recycle size={24} />, desc: 'Circular raw recovery', color: 'emerald' },
    { label: 'DIVERSION RATE', value: '94.2%', icon: <Leaf size={24} />, desc: 'Waste to value ratio', color: 'blue' },
    { label: 'GLOBAL FACILITIES', value: '1,104', icon: <Factory size={24} />, desc: 'Scale of infrastructure', color: 'emerald' },
  ];

  return (
    <div className="mb-32 relative py-10">
      {/* Background Animated Blobs - Blue and Red (Rose) */}
      <div className="absolute inset-0 z-0 flex items-center justify-around opacity-30 pointer-events-none blur-[100px]">
         <div className="w-[500px] h-[500px] bg-blue-600 rounded-full animate-pulse" />
         <div className="w-[400px] h-[400px] bg-rose-500 rounded-full animate-pulse delay-700" />
      </div>

      <div className="text-center mb-20 relative z-10">
        <h2 className="text-5xl font-black text-black tracking-tighter mb-4">Network-Wide Impact</h2>
        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
          Tracking every kilogram of material diverted from landfills to high-value industrial reuse.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="group relative h-60 [perspective:2000px] cursor-pointer"
          >
            {/* Pop-up Glass Card */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:translateZ(60px)_rotateX(10deg)_rotateY(-5deg)] group-hover:bg-white/60 group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
              <div className="p-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className={`p-4 ${stat.color === 'blue' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'} rounded-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                    <h3 className="text-4xl font-black text-black leading-none tracking-tighter">{stat.value}</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'} w-2/3 group-hover:w-full transition-all duration-1000`} />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactOverview;
