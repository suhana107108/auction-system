import React from 'react';
import Countdown from './countdown.jsx';

export default function AuctionCard({ a, onOpen }) {
  return (
    <div className="card">
      <div className="h2">{a.itemName}</div>
      <div style={{color:'#9aa8c1', minHeight:40}}>{a.description.slice(0,90)}{a.description.length>90?'…':''}</div>
      <div className="row" style={{justifyContent:'space-between',marginTop:10}}>
        <span className="badge">Start ₹{a.startingPrice} • +₹{a.bidIncrement}</span>
        <Countdown goLiveAt={a.goLiveAt} durationMinutes={a.durationMinutes} status={a.status}/>
      </div>
      <hr/>
      <div className="row" style={{justifyContent:'space-between'}}>
        <span className="badge">Highest ₹{a.highestBidAmount || 0}</span>
        <button className="btn" onClick={()=>onOpen(a.id)}>Open</button>
      </div>
    </div>
  );
}
