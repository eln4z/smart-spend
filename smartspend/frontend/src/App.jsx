import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/breakdown" element={<Breakdown />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </Layout>
    </>
  );
      </p>
    </>
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/breakdown" element={<Breakdown />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </Layout>
  );
}
}

export default App
