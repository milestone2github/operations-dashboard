import React from 'react'
import { RiMenu3Line } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import logo from '../assets/logo.png'
import { IoArrowBackOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

function Header({ title }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <header className='w-full h-fit flex gap-x-2 py-1'>
      <button className='md:hidden' onClick={() => dispatch({
        type: "togglenavtab",
        payload: "0"
      })}>
        <RiMenu3Line className=' text-2xl font-semibold' />
      </button>
      <div className='w-full flex gap-2 items-center justify-start'>
        <button onClick={() => navigate(-1)} className='p-[10px] rounded-full hover:bg-gray-100 hidden md:block'><IoArrowBackOutline /></button>
        <h3 className='text-xl md:text-3xl font-medium '>{title}</h3>
        <div className='ms-auto flex flex-col items-end gap-2'>
          <img src={logo} alt="" className=' w-32' />
          {userData && <p>Welcome, {userData?.name}</p>}
        </div>
      </div>
    </header>
  )
}

export default Header