import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WpmHistoryChart = ({ testHistory }) => {
  const data = {
    labels: testHistory.map((_, index) => `Test ${index + 1}`),
    datasets: [
      {
        label: 'WPM',
        data: testHistory.map(test => test.wpm),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Accuracy',
        data: testHistory.map(test => test.accuracy),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { 
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value) => `${value} wpm`
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { display: false },
        ticks: { 
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value) => `${value}%`
        }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    }
  };

  return (
    <div className="bg-surface-2 p-4 rounded-lg">
      <div className="text-sm text-text-secondary mb-4">Performance History</div>
      <div className="h-[200px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default WpmHistoryChart;