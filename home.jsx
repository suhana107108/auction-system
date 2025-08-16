import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import AuctionCard from '../components/auctioncard.jsx';

export default function Home({ nav }) {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => { load(); }, []);
  async function load(){
    const data = await api('/auctions');
    setAuctions(data);
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="h1">Mini Auction</div>
        <div className="row" style={{gap:8}}>
          <button className="btn secondary" onClick={()=>load()}>Refresh</button>
          <button className="btn" onClick={()=>nav('/create')}>Create Auction</button>
        </div>
      </div>
      <div className="grid">
        {auctions.map(a => <AuctionCard key={a.id} a={a} onOpen={(id)=>nav('/auction/'+id)} />)}
      </div>
    </div>
  );
}
