import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Countdown({ goLiveAt, durationMinutes, status }) {
  const [now, setNow] = useState(dayjs());
  useEffect(() => { const t = setInterval(()=>setNow(dayjs()),1000); return ()=>clearInterval(t); }, []);
  const start = dayjs(goLiveAt);
  const end = start.add(durationMinutes, 'minute');

  let label = 'Starts in';
  let target = start;
  if (status === 'live') { label = 'Ends in'; target = end; }
  if (status === 'ended' || status === 'closed') { label = 'Ended'; target = end; }

  const diff = target.diff(now);
  const s = Math.max(0, Math.floor(diff/1000));
  const h = String(Math.floor(s/3600)).padStart(2,'0');
  const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const sec = String(s%60).padStart(2,'0');

  return <span className="badge">{label}: <span className="count">{h}:{m}:{sec}</span></span>;
}
cd