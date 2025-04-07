import React from 'react';

export default function XEngagementGraph(): JSX.Element {
  return (
    <div className="w-full h-full XEngagementGraph data-chart">
      <iframe
        src="/pages/xEngagementGraph.html"
        className="w-full h-full border-none"
        title="X Engagement Graph"
      />
    </div>
  );
} 