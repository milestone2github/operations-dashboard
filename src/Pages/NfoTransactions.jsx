import React, { useEffect } from 'react'
import Header from '../components/Header'
import { useDispatch, useSelector } from 'react-redux'
import { getNfoTransactions } from '../redux/nfoTransaction/NfoAction'
import Loader from '../components/Loader'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { color } from '../Statuscolor/color'
import { BsArrowRight } from 'react-icons/bs'
import { FaSadTear } from 'react-icons/fa'
const items = 12

function NfoTransactions() {
  const { transactions, status, error, page } = useSelector(state => state.nfoTransactions)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getNfoTransactions({ items }))
  }, [])

  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(error)
    }
  }, [status, error])

  const handlePrev = () => {
    if (page > 1) {
      dispatch(getNfoTransactions({ items, page: page - 1 }))
    }
  }

  const handleNext = () => {
    if (transactions.length >= items) {
      dispatch(getNfoTransactions({ items, page: page + 1 }))
    }
  }

  const showLoading = <tr>
    <td
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    ><Loader />
    </td>
  </tr>

  const notFound = (
    <tr>
      <td
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 text-lg text-center flex flex-col items-center'
      >
        <FaSadTear className='text-5xl mb-3' />
        <span className='text-gray-700 text-xl font-bold text-center'>No Transactions Found!</span>
      </td>
    </tr>
  )

  return (
    <main className='w-full'>
      <div className='sticky top-0 bg-white w-full px-2 md:px-6 z-10'>
        <Header title='NFO Transactions' />
        <hr className='border-b border-slate-100 w-full' />
      </div>

      <section className='px-2 md:px-6 w-full mt-4'>
        <article className='border bg-gray-50 rounded-md overflow-x-scroll overflow-y-auto w-full md:w-[calc(100vw-136px)] h-[73vh] relative custom-scrollbar'>
          <table className='nfo-table'>
            <thead className='bg-blue-50 sticky top-0 z-20'>
              <tr className='font-medium text-nowrap py-3  text-gray-800'>
                <th className='text-sm'>S. No.</th>
                <th className='text-sm min-w-28'>Date</th>
                <th className='text-sm'>Pan number</th>
                <th className='text-sm'>Investor name</th>
                <th className='text-sm'>Family head</th>
                <th className='text-sm'>Registrant</th>
                <th className='text-sm'>AMC name</th>
                <th className='text-sm'>Scheme name</th>
                <th className='text-sm'>Amount</th>
                <th className='text-sm'>Status</th>
                <th className='text-sm'>Folio No.</th>
                <th className='text-sm'>Scheme Option</th>
                <th className='text-sm'>Tracking ID</th>
              </tr>
            </thead>

            <tbody className='divide-y px-3'>{
              status === 'pending' ? showLoading : !transactions.length ? notFound :
                transactions?.map((item, index) => {
                  let statusColor = color.find(colorItem => colorItem.type === item.status)

                  return (
                    <tr key={item._id} className='text-sm'>
                      <td>{(page - 1) * items + (index + 1)}</td>
                      <td className='min-w-28'>{formatDateDDShortMonthNameYY(item.createdAt)}</td>
                      <td>{item.panNumber}</td>
                      <td><span className='w-44 two-line-ellipsis'>{item.investorName}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.familyHead}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.registrantName}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.amcName}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.schemeName}</span></td>
                      <td>{item.amount}</td>
                      <td >
                        <span
                          className='px-3 py-2 rounded-full'
                          style={{ backgroundColor: statusColor.bgcolor, color: statusColor.color }}
                        >{statusColor.value}
                        </span>
                      </td>
                      <td>{item.folioNumber}</td>
                      <td>{item.schemeOption}</td>
                      <td>{item.bseOrderNumber}</td>
                    </tr>)
                })}
            </tbody>
          </table>

        </article>

        <div className='flex gap-4 w-fit mt-4 mb-3 mx-auto rounded-full items-center justify-center'>
          <button
            title='Previous'
            onClick={handlePrev}
            disabled={page <= 1}
            className='px-4 py-1 rounded-md border flex gap-2 items-center text-gray-600 border-gray-200 focus:outline-2 focus:outline-blue-400 enabled:hover:bg-blue-50 enabled:hover:text-blue-700 enabled:hover:border-blue-200 disabled:text-gray-400'
          ><BsArrowRight className='rotate-180' />Prev</button>
          <span
            title='Current page'
            className='w-9 h-9 rounded-full bg-blue-500 text-gray-100 flex items-center justify-center'
          >{page}</span>
          <button
            title='Next'
            onClick={handleNext}
            disabled={transactions.length < items}
            className='px-4 py-1 rounded-md border flex gap-2 items-center text-gray-600 border-gray-200 focus:outline-2 focus:outline-blue-400 enabled:hover:bg-blue-50 enabled:hover:text-blue-700 enabled:hover:border-blue-200 disabled:text-gray-400'
          >Next<BsArrowRight /></button>
        </div>

      </section>
    </main>
  )
}

export default NfoTransactions