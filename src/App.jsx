import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Details from './Pages/Details'
import Menu from './components/Menu'
import Login from './Pages/Login'
import { useSelector } from 'react-redux'
import Pending from './Pages/Pending'
import All from './Pages/All'
import Reco from './Pages/Reco'
import History from './Pages/History'
import Piechart from './Pages/Piechart'
import Protected from './components/Protected'

function App() {

  return (
    <>
      <Router>
        <div className='flex'>
          <Menu />
          <Routes>
            
              <Route path="/" element={<Protected><Dashboard /> </Protected>} />
              <Route path="/pending-transaction/details/" element={<Protected><Details /></Protected>} />
              <Route path="/pending-transaction" element={<Protected><Pending /></Protected>} />
              <Route path="/all-transaction" element={<Protected><All /></Protected>} />
              <Route path="/transactions-reco" element={<Protected><Reco /></Protected>} />
              <Route path="/transaction-history" element={<Protected><History /></Protected>} />
            
            <Route path='/login' element={<Login />} />
            <Route path='/piechart' element={<Piechart />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
