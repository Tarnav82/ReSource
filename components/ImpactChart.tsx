
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { WasteAnalysisResponse } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ImpactChartProps {
  data: WasteAnalysisResponse;
}

const ImpactChart: React.FC<ImpactChartProps> = ({ data }) => {
  const chartData = {
    labels: ['CO2 Offset (tons)', 'Landfill Diversion (%)'],
    datasets: [
      {
        label: 'Sustainability Impact',
        data: [data.co2, data.landfill],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // emerald-500
          'rgba(59, 130, 246, 0.7)', // blue-500
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded-full" />
        Environmental Impact Analytics
      </h3>
      <div className="flex-1 min-h-[300px]">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Metric Tons Carbon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">Total Diversion</span>
        </div>
      </div>
    </div>
  );
};

export default ImpactChart;
