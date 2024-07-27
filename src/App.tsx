import ReactPlayground from './pages/ReactPlayground'
import { PlaygroundProvider } from './pages/ReactPlayground/PlaygroundContext'
import './App.scss'

function App() {
  return (
    <PlaygroundProvider>
      <ReactPlayground />
    </PlaygroundProvider>
  )
}

export default App
