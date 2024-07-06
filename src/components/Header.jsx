import React from 'react'
import { RiMenu3Line } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import logo from '../assets/logo.png'

function Header({title}) {
  const { userdata } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  return (
    <header className='w-full h-fit flex gap-x-2 py-1'>
      <button className='md:hidden' onClick={() => dispatch({
        type: "togglenavtab",
        payload: "0"
      })}>
        <RiMenu3Line className=' text-2xl font-semibold' />
      </button>
      <div className='w-full flex items-center justify-between'>
      <h3 className='text-xl md:text-3xl font-medium '>{title}</h3>
      <div className=' flex flex-col items-end gap-2'>
        <img src={logo} alt="" className=' w-32' />
        {userdata && <p>Welcome , {userdata?.name}</p>}
      </div>
      </div>
    </header>
  )
}

export default Header