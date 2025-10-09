import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {HlsPlayer} from './player/HlsPlayer'

function App() {
  const [count, setCount] = useState(0)

  return (
      <HlsPlayer />
  )
}

export default App
