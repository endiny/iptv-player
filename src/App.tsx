import { useState } from 'react'
import './App.css'
import Main from './playlist-view/Main'
import { Route, Routes } from 'react-router'
import { HlsPlayer } from './player/HlsPlayer'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/player" element={<HlsPlayer />} />
    </Routes>
  )
}

export default App
