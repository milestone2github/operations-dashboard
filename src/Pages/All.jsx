import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import FiltersBar from '../components/FiltersBar'
import { useDispatch, useSelector } from 'react-redux'
import { getFilteredTransactions } from '../redux/allTransactions/AllTransactionsAction'
import { BsArrowRight } from "react-icons/bs";
import toast from 'react-hot-toast'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { color } from '../Statuscolor/color'
import Loader from '../components/Loader'
const items = 12

const initialFilters = {
  minDate: '',
  maxDate: '',
  amcName: '',
  schemeName: '',
  rmName: '',
  type: '',
  sort: 'trxdate-desc'
}

const All = () => {
  const [filters, setFilters] = useState(initialFilters)
  // const [currentPage, setCurrentPage] = useState(0)
  const { transactions, page, status, error } = useSelector(state => state.allTransactions)
  const dispatch = useDispatch()

  const updateFilters = (value) => {
    setFilters(value)
  }

  useEffect(() => {
    dispatch(getFilteredTransactions({ filters, items }))
  }, [filters])

  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(error)
    }
  }, [status, error])

  const handlePrev = () => {
    if (page > 1) {
      dispatch(getFilteredTransactions({ filters, items, page: page - 1 }))
    }
  }

  const handleNext = () => {
    if (transactions.length >= items) {
      dispatch(getFilteredTransactions({ filters, items, page: page + 1 }))
    }
  }

  const showLoading = <tr>
    <td  
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
      ><Loader />
    </td>
  </tr>

  const notFound = <tr>
    <td 
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-lg text-left'
      >
      No Transactions Found!
    </td>
  </tr>

  return (
    <main className='w-full'>
      <div className='sticky top-0 bg-white w-full px-2 md:px-6 z-10'>
        <Header title='Transactions' />
        <hr className='border-b border-slate-100 w-full' />
        <div className='py-2'>
          <FiltersBar filters={filters} updateFilters={updateFilters} />
        </div>
      </div>

      <section className='px-2 md:px-6 w-full'>
        <article className='border rounded-md overflow-x-scroll w-full md:w-[calc(100vw-152px)] min-h-[75vh] relative custom-scrollbar'>
          <table className='filtered-trx'>
            <thead className='bg-blue-50'>
              <tr className='font-medium text-nowrap py-3  text-gray-800'>
                <th className='text-sm'>S. No.</th>
                <th className='text-sm'>Transaction date</th>
                <th className='text-sm'>Transaction type</th>
                <th className='text-sm'>Pan number</th>
                <th className='text-sm'>Investor name</th>
                <th className='text-sm'>Family head</th>
                <th className='text-sm'>Registrant</th>
                <th className='text-sm'>AMC name</th>
                <th className='text-sm'>Scheme name</th>
                <th className='text-sm'>Amount</th>
                <th className='text-sm'>Units</th>
                <th className='text-sm'>Status</th>
                <th className='text-sm'>Folio No.</th>
                <th className='text-sm'>Scheme Option</th>
                <th className='text-sm'>From scheme</th>
                <th className='text-sm'>From scheme option</th>
                <th className='text-sm'>Transaction for</th>
                <th className='text-sm'>Payment mode</th>
                <th className='text-sm'>First trx amount</th>
                <th className='text-sm'>SIP/SWP/STP date</th>
                <th className='text-sm'>SIP Pause month</th>
                <th className='text-sm'>Tenure of SIP</th>
                <th className='text-sm'>Order ID</th>
                <th className='text-sm'>Cheque No.</th>
              </tr>
            </thead>

            <tbody className='divide-y bg-gray-50 px-3'>{
              status === 'pending' ? showLoading : !transactions.length ? notFound : 
              transactions?.map((item, index) => {
              let statusColor = color.find(colorItem => colorItem.type === item.status)
              
              return (
              <tr key={item._id} className='text-sm'>
                <td>{(page - 1) * items + (index + 1)}</td>
                <td>{formatDateDDShortMonthNameYY(item.transactionPreference)}</td>
                <td>{item.transactionType}</td>
                <td>{item.panNumber}</td>
                <td><span className='w-44 two-line-ellipsis'>{item.investorName}</span></td>
                <td><span className='w-44 two-line-ellipsis'>{item.familyHead}</span></td>
                <td><span className='w-44 two-line-ellipsis'>{item.registrantName}</span></td>
                <td><span className='w-44 two-line-ellipsis'>{item.amcName}</span></td>
                <td><span className='w-44 two-line-ellipsis'>{item.schemeName}</span></td>
                <td>{item.amount}</td>
                <td>{item.transactionUnits}</td>
                <td >
                  <span 
                    className='px-3 py-2 rounded-full'
                    style={{backgroundColor: statusColor.bgcolor, color: statusColor.color}}
                    >{statusColor.value}
                  </span>
                </td>
                <td>{item.folioNumber}</td>
                <td>{item.schemeOption}</td>
                <td><span className='w-44 two-line-ellipsis'>{item.fromSchemeName}</span></td>
                <td>{item.fromSchemeOption}</td>
                <td>{item.transactionFor}</td>
                <td>{item.paymentMode}</td>
                <td>{item.firstTransactionAmount}</td>
                <td>{formatDateDDShortMonthNameYY(item.sipSwpStpDate)}</td>
                <td>{item.sipPauseMonths}</td>
                <td>{item.tenure}</td>
                <td>{item.orderId}</td>
                <td>{item.chequeNumber}</td>
              </tr>)})}
            </tbody>
          </table>

        </article>

        <div className='flex gap-0 bg-blue-50 w-fit  mt-4 mb-4 mx-auto rounded-full justify-center'>
          <button
            title='Previous'
            onClick={handlePrev}
            disabled={page <= 1}
            className='px-5 py-3 rounded-e-full border border-blue-200 focus:outline-2 focus:outline-blue-400 hover:text-blue-700 hover:border-blue-200 disabled:text-gray-400 rotate-180'
          ><BsArrowRight /></button>
          <span
            title='Current page'
            className='w-20 border-y border-blue-200 text-gray-700 flex items-center justify-center'
          >{page}</span>
          <button
            title='Next'
            onClick={handleNext}
            disabled={transactions.length < items}
            className='px-5 py-3 rounded-e-full border border-blue-200 focus:outline-2 focus:outline-blue-400 hover:text-blue-700 hover:border-blue-400 disabled:text-gray-400 disabled:border-0'
          ><BsArrowRight /></button>
        </div>
      </section>
    </main>
  )
}

export default All