import React, { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import { api } from '../api.js';
import Countdown from '../components/countdown.jsx';
import BidPanel from '../components/bidpanel.jsx';

const socket = io(); // same origin

export default function AuctionRoom({ id, nav, user, onAuthed }) {
  const [a, setA] = useState(null);
  const [me, setMe] = useState(user);
  const [highest, setHighest] = useState(0);
  const [log, setLog] = useState([]);
  const logRef = useRef();

  useEffect(()=>{ load(); },[id]);
  useEffect(()=>{ logRef.current?.scrollTo(0, 1e9); },[log]);

  async function authEnsure(){
    if (me) return me;
    const name = prompt('Your name?'); const email = prompt('Your email?');
    const u = await api('/auctions/demo/login', { method:'POST', body: JSON.stringify({ name, email }) });
    setMe(u); onAuthed?.(u); return u;
  }

  async function load(){
    const data = await api(`/auctions/${id}`);
    setA(data);
    setHighest(data.highestBidAmount || 0);
    socket.emit('join_auction', { auctionId:id, userId: me?.id });
  }

  useEffect(() => {
    socket.emit('join_auction', { auctionId:id, userId: me?.id });

    socket.on('bid_update', ({ amount, name }) => {
      setHighest(amount);
      setLog(l => [...l, `New bid ₹${amount} by ${name}`]);
    });
    socket.on('notification', ({ type, message }) => setLog(l=>[...l, `[${type}] ${message}`]));
    socket.on('auction_live', () => setLog(l=>[...l, 'Auction is LIVE']));
    socket.on('auction_ended', ({ highest }) => {
      setLog(l=>[...l, highest ? `Auction ended. Highest ₹${highest.amount}` : 'Auction ended. No bids.']);
      setA(a => ({ ...a, status: 'ended' }));
    });
    socket.on('error_msg', (m) => setLog(l=>[...l, `Error: ${m}`]));
    return () => {
      socket.off('bid_update'); socket.off('notification'); socket.off('auction_live'); socket.off('auction_ended'); socket.off('error_msg');
    };
  }, [id, me]);

  async function placeBid(amount){
    const u = await authEnsure();
    socket.emit('place_bid', { auctionId:id, userId:u.id, amount, name:u.name });
  }

  async function sellerAccept() {
    const top = highest;
    // In real app, fetch top bidder; here we ask server to resolve via cached/bids, but we need buyerId.
    // Simple approach: re-fetch auction and find top bid owner:
    const fresh = await api(`/auctions/${id}`);
    const topBid = fresh.Bids?.sort((a,b)=>b.amount-a.amount)[0];
    if (!topBid) return alert('No bids to accept.');
    await api(`/decisions/${id}/accept`, { method:'POST', body: JSON.stringify({ buyerId: topBid.bidderId, amount: topBid.amount }) });
    alert('Accepted and invoiced!');
  }

  async function sellerReject() {
    await api(`/decisions/${id}/reject`, { method:'POST', body: JSON.stringify({}) });
    alert('Rejected.');
  }

  async function sellerCounter() {
    const amt = parseInt(prompt('Counter-offer amount (₹)')||'0');
    if (!amt) return;
    await api(`/decisions/${id}/counter`, { method:'POST', body: JSON.stringify({ amount: amt }) });
    alert('Counter sent.');
  }

  if (!a) return <div className="container"><div className="h1">Loading…</div></div>;

  const sellerView = me?.id === a.sellerId;

  return (
    <div className="container">
      <div className="nav">
        <div className="h1">{a.itemName}</div>
        <button className="btn secondary" onClick={()=>nav('/')}>Back</button>
      </div>

      <div className="grid">
        <div className="card">
          <div className="h2">Details</div>
          <div style={{color:'#9aa8c1',whiteSpace:'pre-wrap'}}>{a.description}</div>
          <hr/>
          <div className="row" style={{justifyContent:'space-between'}}>
            <span className="badge">Start ₹{a.startingPrice} • +₹{a.bidIncrement}</span>
            <Countdown goLiveAt={a.goLiveAt} durationMinutes={a.durationMinutes} status={a.status}/>
          </div>
          <div style={{marginTop:10}} className="badge">Status: {a.status}</div>
        </div>

        <div className="card">
          <div className="h2">Highest Bid</div>
          <div className="count" style={{fontSize:32,fontWeight:800}}>₹{highest}</div>
          {!sellerView && a.status==='live' && <div style={{marginTop:10}}><BidPanel highest={highest} bidIncrement={a.bidIncrement} onBid={placeBid}/></div>}
        </div>

        <div className="card" style={{gridColumn:'1/-1'}}>
          <div className="h2">Activity</div>
          <div ref={logRef} style={{maxHeight:180,overflow:'auto',padding:8,background:'#0b1020',borderRadius:10,border:'1px solid #273249'}}>
            {log.map((x,i)=><div key={i} style={{color:'#9aa8c1'}}>{x}</div>)}
          </div>
        </div>

        {sellerView && a.status==='ended' && (
          <div className="card" style={{gridColumn:'1/-1'}}>
            <div className="h2">Seller Decision</div>
            <div className="row" style={{gap:10}}>
              <button className="btn ok" onClick={sellerAccept}>Accept</button>
              <button className="btn danger" onClick={sellerReject}>Reject</button>
              <button className="btn" onClick={sellerCounter}>Counter-Offer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
