import React, { useState } from 'react';
import { api } from '../api.js';

export default function CreateAuction({ nav, onAuthed }) {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({
    itemName:'', description:'', startingPrice:100, bidIncrement:10,
    goLiveAt:'', durationMinutes:10
  });

  async function ensureUser() {
    if (me) return me;
    const name = prompt('Your name?'); const email = prompt('Your email?');
    const u = await api('/auctions/demo/login', { method:'POST', body: JSON.stringify({ name, email }) });
    setMe(u); onAuthed?.(u); return u;
  }

  async function submit(){
    const u = await ensureUser();
    const payload = { ...form, sellerId: u.id };
    const a = await api('/auctions', { method:'POST', body: JSON.stringify(payload) });
    nav('/auction/'+a.id);
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="h1">Create Auction</div>
        <button className="btn secondary" onClick={()=>nav('/')}>Back</button>
      </div>

      <div className="card" style={{maxWidth:700, margin:'0 auto'}}>
        <div className="label">Item Name</div>
        <input className="input" value={form.itemName} onChange={e=>setForm({...form,itemName:e.target.value})}/>

        <div className="label">Description</div>
        <textarea className="textarea" rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>

        <div className="row" style={{gap:12}}>
          <div style={{flex:1}}>
            <div className="label">Starting Price (₹)</div>
            <input className="input" type="number" value={form.startingPrice} onChange={e=>setForm({...form,startingPrice:parseInt(e.target.value||0)})}/>
          </div>
          <div style={{flex:1}}>
            <div className="label">Bid Increment (₹)</div>
            <input className="input" type="number" value={form.bidIncrement} onChange={e=>setForm({...form,bidIncrement:parseInt(e.target.value||0)})}/>
          </div>
        </div>

        <div className="row" style={{gap:12}}>
          <div style={{flex:1}}>
            <div className="label">Go Live At (local)</div>
            <input className="input" type="datetime-local" value={form.goLiveAt} onChange={e=>setForm({...form,goLiveAt:e.target.value})}/>
          </div>
          <div style={{flex:1}}>
            <div className="label">Duration (minutes)</div>
            <input className="input" type="number" value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:parseInt(e.target.value||0)})}/>
          </div>
        </div>

        <div style={{marginTop:14}}><button className="btn" onClick={submit}>Create</button></div>
      </div>
    </div>
  );
}
