import React, { useState } from 'react';

export default function BidPanel({ highest, bidIncrement, onBid }) {
  const [value, setValue] = useState((highest || 0) + bidIncrement);
  return (
    <div className="card">
      <div className="h2">Place a Bid</div>
      <div className="label">Your Bid (₹)</div>
      <input className="input" type="number" value={value} onChange={e=>setValue(parseInt(e.target.value||0))}/>
      <div style={{marginTop:10}} className="row">
        <button className="btn" onClick={()=>onBid(value)}>Bid</button>
      </div>
    </div>
  );
}
