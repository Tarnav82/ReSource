
import React from 'react';
import { WasteAnalysisResponse } from '../types';
import { Tag, User, TrendingUp, Wallet } from 'lucide-react';

interface ResultCardsProps {
  data: WasteAnalysisResponse;
}

const ResultCards: React.FC<ResultCardsProps> = ({ data }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const stats = [
    {
      label: 'Waste Category',
      value: data.category,
      icon: <Tag className="text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      label: 'Recommended Buyer',
      value: data.buyer,
      icon: <User className="text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Estimated Revenue',
      value: formatCurrency(data.revenue),
      icon: <TrendingUp className="text-teal-600" />,
      color: 'bg-teal-50',
    },
    {
      label: 'Cost Savings',
      value: formatCurrency(data.savings),
      icon: <Wallet className="text-indigo-600" />,
      color: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`${stat.color} p-2 rounded-lg`}>
              {stat.icon}
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 break-words">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultCards;
