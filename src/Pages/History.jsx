import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import FiltersBar from '../components/FiltersBar'
import toast, { Toaster } from 'react-hot-toast'
import { BsArrowRight } from 'react-icons/bs'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { FaSadTear } from 'react-icons/fa'
import Loader from '../components/Loader'
import { useDispatch, useSelector } from 'react-redux'
import { getFilteredTransactions } from '../redux/allTransactions/AllTransactionsAction'
import { color } from '../Statuscolor/color'
import { getAllAmc, getRMNames, getSMNames } from '../redux/allFilterOptions/FilterOptionsAction'
const items = 25

const initialFilters = {
  minDate: '',
  maxDate: '',
  amcName: '',
  schemeName: '',
  rmName: '',
  smName: '',
  type: '',
  sort: 'trxdate-desc',
  minAmount: '',
  maxAmount: '',
  transactionFor: '',
  status: ['NOT-PENDING'],
  // reconcileStatus: ['NOT-RECONCILED_WITH_MAJOR_REQUESTED', 'NOT-RECONCILIATION_REJECTED_REQUEST'],
  approvalStatus: '',
  searchBy: 'family head',
  searchKey: ''
}

const filterConfig = {
  amount: true,
  date: true,
  type: true,
  trxFor: true,
  relationshipManager: true,
  serviceManager: true,
  status: true,
  approvalStatus: true,
  saveFilter: false
}

const History = () => {
  const [filters, setFilters] = useState(initialFilters)
  const [abortController, setAbortController] = useState(null)
  const { transactions, page, totalCount, totalAmount, status, error } = useSelector(state => state.allTransactions)
  const { amcList, typeList, schemesList, rmNameList, smNameList, statusList, approvalStatusList, transactionForList, error: listError } = useSelector(state => state.allFilterOptions)
  const dispatch = useDispatch()

  useEffect(() => {
    // dispatch(getSavedFilters())
    dispatch(getAllAmc())
    dispatch(getRMNames())
    dispatch(getSMNames())
  }, [])

  const updateFilters = (value) => {
    setFilters(value)
  }

  const clearAllFilters = () => {
    setFilters(initialFilters)
  }

  useEffect(() => {
    if (abortController) {
      abortController.abort()
    }
    let newController = new AbortController()
    setAbortController(newController)
    dispatch(getFilteredTransactions({ filters, items, signal: newController.signal }))

    return () => {
      if (newController) { newController.abort() }
    }
  }, [filters, items, dispatch])

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
        <Header title='History' />
        <hr className='border-b border-slate-100 w-full' />
        <div className='py-2'>
          <FiltersBar
            filters={filters}
            updateFilters={updateFilters}
            clearAllFilters={clearAllFilters}
            filterConfig={filterConfig}
            results={totalCount}
            aum={totalAmount}
            amcOptions={amcList}
            schemeOptions={schemesList}
            forOptions={transactionForList}
            typeOptions={typeList}
            rmNameOptions={rmNameList}
            smNameOptions={smNameList}
            statusOptions={statusList.filter(status => !['PENDING'].includes(status))}
            approvalStatusOptions={approvalStatusList}
          />
        </div>
      </div>

      <section className='px-2 md:px-6 w-full'>
        <article className='border max-h-[60vh] bg-gray-50 rounded-md overflow-x-scroll w-full md:w-[calc(100vw-152px)] min-h-[75vh] relative custom-scrollbar'>
          <table className='filtered-trx'>
            <thead className='bg-blue-50 sticky top-0 z-[1]'>
              <tr className='font-medium text-nowrap py-3  text-gray-800'>
                <th className='text-sm'>S. No.</th>
                <th className='text-sm'>Status</th>
                <th className='text-sm'>Reconcile Status</th>
                <th className="text-sm">Preferred date</th>
                <th className="text-sm">Ops Exec date</th>
                <th className='text-sm'>Transaction type</th>
                <th className='text-sm'>Pan number</th>
                <th className='text-sm'>Investor name</th>
                <th className='text-sm'>Family head</th>
                <th className='text-sm'>RM name</th>
                <th className='text-sm'>AMC name</th>
                <th className='text-sm'>Scheme name</th>
                <th className='text-sm'>Amount</th>
                <th className='text-sm'>Units</th>
                <th className='text-sm'>From scheme name</th>
                <th className='text-sm'>SM name</th>
                <th className='text-sm'>Folio No.</th>
                <th className='text-sm'>From scheme option</th>
                <th className='text-sm'>Scheme option</th>
                <th className='text-sm'>Registrant</th>
                <th className='text-sm'>Transaction for</th>
                <th className='text-sm'>Payment mode</th>
                <th className='text-sm'>First trx amount</th>
                <th className='text-sm'>SIP/SWP/STP date</th>
                <th className='text-sm'>SIP Pause month</th>
                <th className='text-sm'>Tenure of SIP</th>
                <th className='text-sm'>Approval Status</th>
                <th className='text-sm'>Order ID</th>
                <th className='text-sm'>Order Platform</th>
                <th className='text-sm'>Cheque No.</th>
              </tr>
            </thead>

            <tbody className='divide-y px-3'>{
              status === 'pending' ? showLoading : !transactions.length ? notFound :
                transactions?.map((item, index) => {
                  let status = item.status
                  let reconcileStatus = item.reconciliation?.reconcileStatus
                  let approvalStatus = item.approvalStatus
                  let folioNumber = item.folioNumber
                  let orderId = item.orderId
                  let orderPlatform = item.orderPlatform
                  let amount = item.amount
                  let note = item.note
                  let linkStatus = item.linkStatus
                  let sipSwpStpDate = item.sipSwpStpDate
                  let id = item._id
                  let type = item.category === 'switch' ? 'Switch' : item.transactionType
                  let preferredDate = item.transactionPreference; 
                  let validationLength = item.validations?.length || 0;
                  let opsExecDate = validationLength > 0 ? item.validations[validationLength - 1]?.validatedAt : null;

                  if (item.hasFractions) {
                    const fraction = item.transactionFractions;
                    status = fraction?.status
                    reconcileStatus = fraction?.reconciliation?.reconcileStatus
                    approvalStatus = fraction?.approvalStatus
                    folioNumber = fraction?.folioNumber
                    orderId = fraction?.orderId
                    orderPlatform = fraction?.orderPlatform
                    amount = fraction?.fractionAmount
                    note = fraction?.note
                    linkStatus = fraction?.linkStatus
                    sipSwpStpDate = fraction?.transactionDate
                    id = fraction?._id
                    preferredDate = fraction?.transactionDate ?? preferredDate;

                    let validationLength = fraction?.validations?.length || 0;
                    opsExecDate = validationLength > 0 ? fraction?.validations[validationLength - 1]?.validatedAt : opsExecDate;
                  }
                  let statusColor = color.find(colorItem => colorItem.type === status)
                  let reconcileStatusColor = color.find(colorItem => colorItem.type === reconcileStatus)

                  return (
                    <tr key={id} className='text-sm'>
                      <td>
                        <span className='relative'>
                          {(page - 1) * items + (index + 1)}
                          {item.hasFractions && <strong className='ms-1 absolute -top-1 left-full bg-purple-200 rounded-sm px-1 py- text-purple-800 text-[10px] leading-3'>F</strong>}
                        </span>
                      </td>
                      <td >
                        <span
                          className='px-2 py-1 rounded-full text-nowrap'
                          style={{ backgroundColor: statusColor.bgcolor, color: statusColor.color }}
                        >{statusColor.value}
                        </span>
                      </td>
                      <td >
                        <span
                          className='px-2 py-1 text-xs rounded-full text-nowrap'
                          style={{ backgroundColor: reconcileStatusColor.bgcolor, color: reconcileStatusColor.color }}
                        >{reconcileStatusColor.value}
                        </span>
                      </td>
                      <td>{formatDateDDShortMonthNameYY(preferredDate)}</td>
                      <td>{formatDateDDShortMonthNameYY(opsExecDate)}</td>
                      <td>{type}</td>
                      <td>{item.panNumber}</td>
                      <td><span className='w-44 two-line-ellipsis'>{item.investorName}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.familyHead}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.relationshipManager}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.amcName}</span></td>
                      <td title={item.schemeName}><span className='w-44 two-line-ellipsis'>{item.schemeName}</span></td>
                      <td>{Number(amount).toLocaleString('en-In', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'INR'
                      })}</td>
                      <td>{item.transactionUnits}</td>
                      <td title={item.fromSchemeName}><span className='w-44 two-line-ellipsis'>{item.fromSchemeName}</span></td>
                      <td><span className='w-44 two-line-ellipsis'>{item.serviceManager || 'N/A'}</span></td>
                      <td>{folioNumber}</td>
                      <td>{item.fromSchemeOption}</td>
                      <td>{item.schemeOption}</td>
                      <td><span className='w-44 two-line-ellipsis'>{item.registrantName}</span></td>
                      <td>{item.transactionFor}</td>
                      <td>{item.paymentMode}</td>
                      <td>{item.firstTransactionAmount}</td>
                      <td>{formatDateDDShortMonthNameYY(sipSwpStpDate)}</td>
                      <td>{item.sipPauseMonths}</td>
                      <td>{item.tenure}</td>
                      <td>{approvalStatus}</td>
                      <td>{orderId}</td>
                      <td>{orderPlatform}</td>
                      <td>{item.chequeNumber}</td>
                    </tr>)
                })}
            </tbody>
          </table>

        </article>

        <div className='flex gap-4 w-fit mt-4 mb-5 mx-auto rounded-full items-center justify-center'>
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
            disabled={totalCount <= (page * items)}
            className='px-4 py-1 rounded-md border flex gap-2 items-center text-gray-600 border-gray-200 focus:outline-2 focus:outline-blue-400 enabled:hover:bg-blue-50 enabled:hover:text-blue-700 enabled:hover:border-blue-200 disabled:text-gray-400'
          >Next<BsArrowRight /></button>
        </div>

      </section>
      <Toaster />
    </main>
  )
}

export default History