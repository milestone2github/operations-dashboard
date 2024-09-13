import React, { useEffect, useState } from 'react'

function UpdateOrderIdModal({ isOpen, handleCancel, handleProceed, existingOrderId, status }) {
  const [orderId, setOrderId] = useState(existingOrderId)

  useEffect(() => {
    if (!isOpen) {
      setOrderId('')
    }
  }, [isOpen])

  useEffect(() => {
      setOrderId(existingOrderId)
  }, [existingOrderId])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleProceed(orderId)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[9999] w-screen h-screen bg-black/70 flex items-center justify-center'>
      <form onSubmit={handleSubmit} className={`w-fit h-fit bg-white rounded-md shadow-md p-6 py-7 md:w-[460px] flex flex-col gap-y-4`}>
        <p className="text-yellow-600 text-lg font-medium mb-1">Update Order ID</p>
        
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