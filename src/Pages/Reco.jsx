import React from 'react'
import Header from '../components/Header'
import ComingSoon from '../components/ComingSoon'

const Reco = () => {
  return (
    <main className='w-full'>
      <div className='sticky top-0 bg-white w-full px-2 md:px-6 z-10'>
        <Header title='Reconcilation' />
        <hr className='border-b border-slate-100 w-full' />
      </div>
      <ComingSoon/>
    </main>
  )
}

export default Reco