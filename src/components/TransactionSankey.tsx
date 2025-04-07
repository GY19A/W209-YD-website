import React from 'react';

export default function TransactionSankey(): JSX.Element {
  return (
    <div className="w-full h-full TransactionSankey data-chart">
      <iframe
        src="/pages/YD_transaction_Sankey_dropdown_colored.html"
        className="w-full h-full border-none"
        title="YD Transaction Sankey"
      />
    </div>
  );
} 