import React from 'react';

export default function TreemapDropdown(): JSX.Element {
  return (
    <div className="w-full h-full TreemapDropdown data-chart">
      <iframe
        src="/pages/YD_treemap_dropdown.html"
        className="w-full h-full border-none"
        title="YD Treemap"
      />
    </div>
  );
} 