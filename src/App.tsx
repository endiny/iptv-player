import { lazy, Suspense } from 'react';
import './App.css';
import { Route, Routes } from 'react-router';

const Main = lazy(() => import('./playlist-view/Main'));
const HlsPlayer = lazy(() =>
  import('./player/HlsPlayer').then((module) => ({ default: module.HlsPlayer }))
);

function App() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/player" element={<HlsPlayer />} />
      </Routes>
    </Suspense>
  );
}

export default App;
