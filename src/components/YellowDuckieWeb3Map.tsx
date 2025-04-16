import React from 'react';

export default function YellowDuckieWeb3Map(): JSX.Element {
  return (
    <div className="w-full h-full YellowDuckieWeb3Map data-chart relative">
      <iframe
        src="/pages/yellowduckie_web3_map.html"
        className="absolute top-0 left-0 w-full h-full border-none"
        title="Yellow Duckie Web3 Map"
        style={{ transform: 'scale(1)' }}
      />
    </div>
  );
} 