import React from 'react';

export default function YellowDuckieWeb3Map(): JSX.Element {
  return (
    <div className="w-full h-full YellowDuckieWeb3Map data-chart">
      <iframe
        src="/pages/yellowduckie_web3_map.html"
        className="w-full h-full border-none"
        title="Yellow Duckie Web3 Map"
      />
    </div>
  );
} 