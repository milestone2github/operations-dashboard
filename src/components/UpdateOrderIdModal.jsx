import React, { useEffect, useState } from 'react'

const platformOptions = ["", "BSESTARMF", "NSENMF", "CAMS EDGE", "KARVY", "OFFLINE"]

function UpdateOrderIdModal({ isOpen, handleCancel, handleProceed, existingData, status }) {
  const [orderId, setOrderId] = useState('')
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setOrderId('')
    }
  }, [isOpen])

  useEffect(() => {
      setOrderId(existingData.orderId)
      setPlatform(existingData.platform)
  }, [existingData])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleProceed(platform, orderId?.trim())
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[9999] w-screen h-screen bg-black/70 flex items-center justify-center'>
      <form onSubmit={handleSubmit} className={`w-fit h-fit bg-white rounded-md shadow-md p-6 py-7 md:w-[460px] flex flex-col gap-y-4`}>
        <p className="text-yellow-600 text-lg font-medium mb-1">Update Order ID</p>
        
        <div className="flex flex-col gap-y-px">
          <label htmlFor="platform" className='text-sm text-gray-600'>Processed platform</label>
          <select 
            name="platform"  
            id="platform" 
            required
            className='rounded-md p-2 border border-gray-500 focus:outline-2 focus:outline-blue-500'
            value={platform} 
            onChange={(e) => setPlatform(e.target.value)}
          >{
            platformOptions.map(option => 
              <option value={option} selected={option === platform}>{option || 'select'}</option>
            )
            }</select>
        </div>
        <div className="flex flex-col gap-y-px">
          <label htmlFor="orderid" className='text-sm text-gray-600'>Order Id</label>
          <input
            type="text"
            name="orderid"
            id="orderid"
            required
            autoComplete='off'
            className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-yellow-500'
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>
        <div className='flex gap-x-3 mt-7 justify-end'>
          <button onClick={handleCancel} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
          <button type='submit' disabled={status === 'pending'} className='border rounded-lg py-2 px-6 bg-yellow-600 hover:bg-yellow-700 text-white'>{status === 'pending'? 'Updating...' : 'Update'}</button>
        </div>
      </form>
    </div>
  )
}

export default UpdateOrderIdModal