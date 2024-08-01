import React from 'react'
import Header from '../components/Header'

function Dashboard() {
  return (
    <main className='w-full'>
      <div className='sticky top-0 bg-white w-full px-2 md:px-6 z-10'>
        <Header title='Overview' />
        <hr className='border-b border-slate-100 w-full' />
      </div>
      <div className='px-4 text-xl'>Dashboard</div>
    </main>
  )
}

export default Dashboard