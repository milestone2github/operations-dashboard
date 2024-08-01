import React from 'react'
import Header from '../components/Header'
import ComingSoon from '../components/ComingSoon'

const History = () => {
  return (
    <main className='w-full'>
      <div className='sticky top-0 bg-white w-full px-2 md:px-6 z-10'>
        <Header title='History' />
        <hr className='border-b border-slate-100 w-full' />
      </div>
      <ComingSoon/>
    </main>
  )
}

export default History