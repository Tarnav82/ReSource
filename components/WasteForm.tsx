
import React, { useState } from 'react';
import { WasteAnalysisRequest } from '../types';
import { Leaf, MapPin, AlertTriangle, Weight, Sparkles } from 'lucide-react';

interface WasteFormProps {
  onSubmit: (data: WasteAnalysisRequest) => void;
  isLoading: boolean;
}

const WasteForm: React.FC<WasteFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<WasteAnalysisRequest>({
    description: '',
    quantity: 0,
    hazard: 'None',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAutofill = () => {
    setFormData({
      description: 'Used polyethylene plastic scraps from manufacturing line B.',
      quantity: 1250,
      hazard: 'Low',
      location: 'Industrial Zone 4, Sector 7',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Leaf className="text-emerald-600" size={24} />
          Waste Analysis Input
        </h2>
        <button
          type="button"
          onClick={handleAutofill}
          className="text-xs font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <Sparkles size={14} />
          Use Sample Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Waste Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Describe the material characteristics..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Weight size={16} /> Quantity (kg)
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <AlertTriangle size={16} /> Hazard Level
            </label>
            <select
              name="hazard"
              value={formData.hazard}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              <option value="None">None</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <MapPin size={16} /> Pickup Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            placeholder="Address or Facility Name"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-[0.98] ${
            isLoading 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-emerald-200'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            'Analyze Potential'
          )}
        </button>
      </form>
    </div>
  );
};

export default WasteForm;
