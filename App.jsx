import React, { useEffect, useState } from 'react';
import Home from './pages/home.jsx';
import CreateAuction from './pages/CreateAuction.jsx';
import AuctionRoom from './pages/auctionroom.jsx';

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function nav(to){ window.history.pushState({}, '', to); setRoute(to); }
  function onAuthed(u){ setUser(u); }

  if (route.startsWith('/auction/')) {
    const id = route.split('/auction/')[1];
    return <AuctionRoom id={id} nav={nav} user={user} onAuthed={onAuthed} />;
  }
  if (route === '/create') return <CreateAuction nav={nav} user={user} onAuthed={onAuthed} />;
  return <Home nav={nav} user={user} onAuthed={onAuthed} />;
}
