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

function App() {
  const {userdata} = useSelector((state)=>state.auth)
  return (
    <>
      <Router>
        <div className='flex'>
          <Menu />
          <Routes>
          { userdata && <>
           <Route path="/" element={<Dashboard />} />
            <Route path="/pending-transaction/details/" element={<Details />} />
             <Route path="/pending-transaction" element={<Pending/>}/>
             <Route path="all-transaction" element={<All/>}/>
             <Route path="/transactions-reco" element={<Reco/>}/>
             <Route path="/transaction-history" element={<History/>}/>
            </> }
            <Route path='/login' element={<Login/>}/>
            <Route path='/piechart' element={<Piechart/>}/>
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
