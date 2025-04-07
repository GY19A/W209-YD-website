import React from 'react';

export default function BitcoinDominanceChart(): JSX.Element {
  return (
    <div className="w-full h-full BitcoinDominanceChart data-chart">
      <iframe
        src="/pages/bitcoinDominanceChart.html"
        className="w-full h-full border-none"
        title="Bitcoin Dominance Chart"
      />
    </div>
  );
} 