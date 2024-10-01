import { useEffect, useLayoutEffect, useState } from "react"
import { BiLoaderAlt } from "react-icons/bi"

function AssignSmModal({ isOpen, title, handleCancel, handleProceed, smNameList, itemToUpdate, status, error }) {
  const [serviceManager, setServiceManager] = useState('')

  useLayoutEffect(() => {
    if (itemToUpdate?.existingSm) { setServiceManager(itemToUpdate.existingSm) }
  }, [itemToUpdate?.existingSm])

  useEffect(() => {
    if (!isOpen) {
      setServiceManager('')
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleProceed(itemToUpdate, serviceManager)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[9999] w-screen h-screen bg-black/70 flex items-center justify-center'>
      <form onSubmit={handleSubmit} className={`w-fit h-fit bg-white rounded-md shadow-md p-6 py-7 md:w-[460px] flex flex-col gap-y-4`}>
        <p className="text-green-800 text-lg font-medium mb-1">{title}</p>
        
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-300 text-left text-xs text-gray-600">S. No.</th>
              <th className="p-2 border border-gray-300 text-left text-xs text-gray-600">Family Head</th>
              <th className="p-2 border border-gray-300 text-left text-xs text-gray-600">RM Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-300 text-sm">{itemToUpdate.serialNumber}</td>
              <td className="p-2 border border-gray-300 text-sm">{itemToUpdate.familyHead}</td>
              <td className="p-2 border border-gray-300 text-sm">{itemToUpdate.relationshipManager}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-col gap-y-px">
          <label htmlFor="serviceManager" className='text-sm text-gray-600'>Service Manager</label>
          <select
            name="serviceManager"
            id="serviceManager"
            required
            className='rounded-md p-2 border border-gray-500 focus:outline-2 focus:outline-blue-500'
            value={serviceManager}
            onChange={(e) => setServiceManager(e.target.value)}
          >{
              smNameList.map(option =>
                <option value={option} selected={option === serviceManager}>{option || 'select'}</option>
              )
            }</select>
        </div>
        <div className='flex gap-x-3 mt-7 justify-end'>
          <button onClick={handleCancel} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
          <button type='submit' disabled={status === 'pending'} className='border flex items-center justify-center w-32 rounded-lg py-2 px-6 bg-green-800 hover:bg-green-900 text-white'>{
            status === 'pending' ?
              <BiLoaderAlt className='text-lg animate-spin' /> :
              'Assign'
          }</button>
        </div>
      </form>
    </div>
  )
}

export default AssignSmModal