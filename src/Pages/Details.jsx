import React, { Fragment, useEffect, useState } from 'react'
import { CiLock } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { color } from '../Statuscolor/color';
import { IoIosArrowForward, IoIosArrowUp, IoMdClose } from "react-icons/io";
import { MdClose, MdUpdate } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { addFraction, generateLink, getTransactionsFilterByFh, removeFraction, saveFractions, updateNote, updateOrderId } from '../redux/transactions/TransactionsAction';
import {
  switchAddFraction,
  removeSwitchFraction,
  updateSwitchFractionAmount,
  unlockTransaction,
  updateSwitchTransactionDate,
  cancelSwitchFraction,
  updateSwitchFractionFolio,
  updateSwitchApprovalStatus,
  updateSwitchFractionApprovalStatus,
  updateSwitchExecutionDate,
  resetOrderIdStatus,
  resetNoteUpdateStatus,
  resetLinkGenerateStatus,
  resetError
} from '../redux/transactions/TransactionSlice';

import { formatDate, formatDateToYYYYMMDD } from '../utils/formatDate';
import { countAll, countPending, extractCommonData } from '../utils/extractCommonData';
import GenerateLinkModal from '../components/GenerateLinkModal';
import Header from '../components/Header';
import UpdateOrderIdModal from '../components/UpdateOrderIdModal';
import Dropdown from '../components/Dropdown';
import { IoCheckmarkCircleOutline, IoEllipsisVerticalSharp } from 'react-icons/io5';
import { transactionTypeColorMap, transactionTypeTextMap } from '../utils/map';
import NoteDropdown from '../components/NoteDropdown';

const initialCommonData = {
  investorName: '',
  familyHead: '',
  panNumber: '',
  relationshipManager: '',
  createdAt: '',
  pendingTrxCount: '',
  transactionCount: ''
}

const approvalStatusOptions = [
  "",
  "Link still Pending",
  "KYC not Compliant",
  "Client Declined",
  "RM Declined",
  "Submitted to RTA",
  "System Update Awaiting",
  "RM Hold the Execution",
  "Folio Creation Awaiting",
  "Onboarding Pending"
]

const currentDate = formatDateToYYYYMMDD(new Date('1 jan 1990')) //Temporary

const Details = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [errorAlert, setErrorAlert] = useState(false)
  const [commonData, setCommonData] = useState(initialCommonData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOrderIdModalOpen, setIsOrderIdModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(true)
  const [transactionForLink, setTransactionForLink] = useState({ id: '', fractionId: '', type: '' })
  const [transactionForOrderId, setTransactionForOrderId] = useState({ id: '', fractionId: '', orderId: '', platform: '' })
  const [openRows, setOpenRows] = useState({})

  const dispatch = useDispatch()
  const {
    systematicTransactions,
    purchRedempTransactions,
    switchTransactions,
    isLoading,
    error,
    linkGenerateStatus,
    orderIdStatus,
    noteUpdateStatus
  } = useSelector((state) => state.sessionalTransactions)

  const [sips, setSips] = useState([])
  const [stps, setStps] = useState([])
  const [swps, setSwps] = useState([])
  const [purchases, setPurchases] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const { role } = useSelector(state => state.user.userData?.role)

  // Permissions
  const canModifyExecutionDate = ['mutual funds senior', 'mutual funds'].includes(role.toLowerCase())
  const canModifyTransactions = ['operations senior', 'operations', 'management', 'Administrator'].includes(role.toLowerCase())

  useEffect(() => {
    setSips(systematicTransactions.filter(item => item.transactionType === 'SIP'))
    setStps(systematicTransactions.filter(item => ['STP', 'Capital Appreciation STP'].includes(item.transactionType)))
    setSwps(systematicTransactions.filter(item => ['SWP', 'Capital Appreciation SWP'].includes(item.transactionType)))

  }, [systematicTransactions])

  useEffect(() => {
    setPurchases(purchRedempTransactions.filter(item => item.transactionType === 'Purchase'))
    setRedemptions(purchRedempTransactions.filter(item => item.transactionType === 'Redemption'))

  }, [purchRedempTransactions])

  // side effect to make api calls to get data 
  useEffect(() => {
    let fh = searchParams.get('fh');
    // let rm = searchParams.get('rm');
    let smFilter = searchParams.get('smFilter');
    dispatch(getTransactionsFilterByFh({ fh, smFilter }))
  }, [])

  // side effects to handle fetch errors 
  useEffect(() => {
    if (error) { toast.error(error) }
  }, [error])

  // extract common data 
  useEffect(() => {
    if (purchRedempTransactions.length) {
      setCommonData(extractCommonData(purchRedempTransactions[0]))
    }
    else if (systematicTransactions.length) {
      setCommonData(extractCommonData(systematicTransactions[0]))
    }
    else if (switchTransactions.length) {
      setCommonData(extractCommonData(switchTransactions[0]))
    }

    setCommonData(prevState => ({
      ...prevState,
      transactionCount: countAll(
        systematicTransactions,
        purchRedempTransactions,
        switchTransactions
      ),
      pendingTrxCount: countPending(
        systematicTransactions,
        purchRedempTransactions,
        switchTransactions
      )
    }))

    return () => { setCommonData(initialCommonData) }
  }, [systematicTransactions, purchRedempTransactions, switchTransactions])

  const toggelRows = (id) => {
    setOpenRows(prevRows => ({ ...prevRows, [id]: !prevRows[id] }))
  }

  const openRowAccordion = (id) => {
    setOpenRows(prevRows => ({ ...prevRows, [id]: false }))
  }

  const handleSwitchAmountChange = (e, index, fracIndex) => {
    dispatch(updateSwitchFractionAmount({ index, fracIndex, amount: Number(e.target.value) }))
  }


  // HANDLERS TO ADD FRACTIONS 
  // function to add fraction in sips transactions  
  const handleAddSipsFraction = (index) => {
    setSips(prevSips => {
      const updatedSips = [...prevSips];

      const updatedTransactionFractions = [...updatedSips[index].transactionFractions, {
        fractionAmount: 0,
        status: 'PENDING',
        transactionDate: '',
        folioNumber: prevSips[index].folioNumber
      }];

      updatedSips[index] = {
        ...updatedSips[index],
        transactionFractions: updatedTransactionFractions,
        hasFractions: true
      };

      return updatedSips;
    });
  };

  // function to add fraction in stps transactions  
  const handleAddStpsFraction = (index) => {
    setStps(prevStps => {
      const updatedStps = [...prevStps];

      const updatedTransactionFractions = [...updatedStps[index].transactionFractions, {
        fractionAmount: 0,
        status: 'PENDING',
        transactionDate: '',
        folioNumber: prevStps[index].folioNumber
      }];

      updatedStps[index] = {
        ...updatedStps[index],
        transactionFractions: updatedTransactionFractions,
        hasFractions: true
      };

      return updatedStps;
    });
  };

  // function to add fraction in swps transactions
  const handleAddSwpsFraction = (index) => {
    setSwps(prevSwps => {
      const updatedSwps = [...prevSwps];

      const updatedTransactionFractions = [...updatedSwps[index].transactionFractions, {
        fractionAmount: 0,
        status: 'PENDING',
        transactionDate: '',
        folioNumber: prevSwps[index].folioNumber
      }];

      updatedSwps[index] = {
        ...updatedSwps[index],
        transactionFractions: updatedTransactionFractions,
        hasFractions: true
      };

      return updatedSwps;
    });
  };

  // function to add fraction in purchases transactions
  const handleAddPurchasesFraction = (index) => {
    setPurchases(prevPurchases => {
      const updatedPurchases = [...prevPurchases];
      const updatedTransactionFractions = [...updatedPurchases[index].transactionFractions, {
        fractionAmount: 0,
        status: 'PENDING',
        transactionDate: '',
        folioNumber: prevPurchases[index].folioNumber
      }];
      updatedPurchases[index] = {
        ...updatedPurchases[index],
        transactionFractions: updatedTransactionFractions,
        hasFractions: true
      };
      return updatedPurchases;
    });
  };

  // function to add fraction in redemptions transactions
  const handleAddRedemptionsFraction = (index) => {
    setRedemptions(prevRedemptions => {
      const updatedRedemptions = [...prevRedemptions];
      const updatedTransactionFractions = [...updatedRedemptions[index].transactionFractions, {
        fractionAmount: 0,
        status: 'PENDING',
        transactionDate: '',
        folioNumber: prevRedemptions[index].folioNumber
      }];
      updatedRedemptions[index] = {
        ...updatedRedemptions[index],
        transactionFractions: updatedTransactionFractions,
        hasFractions: true
      };
      return updatedRedemptions;
    });
  };

  // function to add fraction in switch transactions 
  const handleSwitchAdd = (index) => {
    dispatch(switchAddFraction({ index, amount: 0, status: 'PENDING' }))
  }

  // HANDLERS TO REMOVE FRACTIONS 
  // function to remove fraction from sips transactions 
  const handleRemoveSipsFraction = (index, fracIndex) => {
    setSips(prevSips => {
      const updatedSips = [...prevSips];

      const updatedTransactionFractions = updatedSips[index].transactionFractions.filter((_, i) => i !== fracIndex);

      updatedSips[index] = {
        ...updatedSips[index],
        transactionFractions: updatedTransactionFractions
      };

      return updatedSips;
    });
  };

  // function to remove fraction from stps transactions 
  const handleRemoveStpsFraction = (index, fracIndex) => {
    setStps(prevStps => {
      const updatedStps = [...prevStps];
      const updatedTransactionFractions = updatedStps[index].transactionFractions.filter((_, i) => i !== fracIndex);
      updatedStps[index] = {
        ...updatedStps[index],
        transactionFractions: updatedTransactionFractions
      };
      return updatedStps;
    });
  };

  // function to remove fraction from swps transactions 
  const handleRemoveSwpsFraction = (index, fracIndex) => {
    setSwps(prevSwps => {
      const updatedSwps = [...prevSwps];
      const updatedTransactionFractions = updatedSwps[index].transactionFractions.filter((_, i) => i !== fracIndex);
      updatedSwps[index] = {
        ...updatedSwps[index],
        transactionFractions: updatedTransactionFractions
      };
      return updatedSwps;
    });
  };

  // function to remove fraction from purchases transactions
  const handleRemovePurchasesFraction = (index, fracIndex) => {
    setPurchases(prevPurchases => {
      const updatedPurchases = [...prevPurchases];
      const updatedTransactionFractions = updatedPurchases[index].transactionFractions.filter((_, i) => i !== fracIndex);
      updatedPurchases[index] = {
        ...updatedPurchases[index],
        transactionFractions: updatedTransactionFractions
      };
      return updatedPurchases;
    });
  };

  // function to remove fraction from purchases transactions
  const handleRemoveRedemptionsFraction = (index, fracIndex) => {
    setRedemptions(prevRedemptions => {
      const updatedRedemptions = [...prevRedemptions];
      const updatedTransactionFractions = updatedRedemptions[index].transactionFractions.filter((_, i) => i !== fracIndex);
      updatedRedemptions[index] = {
        ...updatedRedemptions[index],
        transactionFractions: updatedTransactionFractions
      };
      return updatedRedemptions;
    });
  };

  // function to remove fraction from purchase/redemption transactions
  const handleRemoveSwitchFraction = (index, fracIndex) => {
    dispatch(removeSwitchFraction({ index, fracIndex }))
  }

  // HANDLERS TO CANCEL A FRACTION 
  // function to cancel a fraction from sips 
  const handleCancelSipsFraction = (index, fracIndex) => {
    setSips(prevState => {
      let updatedState = [...prevState]
      let updatedFractions = [...updatedState[index].transactionFractions]
      updatedFractions[fracIndex] = { ...updatedFractions[fracIndex], linkStatus: 'deleted' }

      updatedState[index] = {
        ...updatedState[index],
        transactionFractions: updatedFractions
      }
      return updatedState
    })
  }

  // function to cancel a fraction from stps 
  const handleCancelStpsFraction = (index, fracIndex) => {
    setStps(prevState => {
      let updatedState = [...prevState]
      let updatedFractions = [...updatedState[index].transactionFractions]
      updatedFractions[fracIndex] = { ...updatedFractions[fracIndex], linkStatus: 'deleted' }

      updatedState[index] = {
        ...updatedState[index],
        transactionFractions: updatedFractions
      }
      return updatedState
    })
  }

  // function to cancel a fraction from swps 
  const handleCancelSwpsFraction = (index, fracIndex) => {
    setSwps(prevState => {
      let updatedState = [...prevState]
      let updatedFractions = [...updatedState[index].transactionFractions]
      updatedFractions[fracIndex] = { ...updatedFractions[fracIndex], linkStatus: 'deleted' }

      updatedState[index] = {
        ...updatedState[index],
        transactionFractions: updatedFractions
      }
      return updatedState
    })
  }

  // function to cancel a fraction from purhchases 
  const handleCancelPurchasesFraction = (index, fracIndex) => {
    setPurchases(prevState => {
      let updatedState = [...prevState]
      let updatedFractions = [...updatedState[index].transactionFractions]
      updatedFractions[fracIndex] = { ...updatedFractions[fracIndex], linkStatus: 'deleted' }

      updatedState[index] = {
        ...updatedState[index],
        transactionFractions: updatedFractions
      }
      return updatedState
    })
  }

  // function to cancel a fraction from redemptions 
  const handleCancelRedemptionsFraction = (index, fracIndex) => {
    setRedemptions(prevState => {
      let updatedState = [...prevState]
      let updatedFractions = [...updatedState[index].transactionFractions]
      updatedFractions[fracIndex] = { ...updatedFractions[fracIndex], linkStatus: 'deleted' }

      updatedState[index] = {
        ...updatedState[index],
        transactionFractions: updatedFractions
      }
      return updatedState
    })
  }

  const handleCancelSwitchFraction = (index, fracIndex) => {
    dispatch(cancelSwitchFraction({ index, fracIndex }))
  }

  const handleGenerateLink = (id, approvalStatus, type, paymentMode) => {
    setIsModalOpen(true)
    setTransactionForLink({ id, approvalStatus, type, paymentMode })
  }

  const handleGenerateLinkOfFraction = (id, fractionId, approvalStatus, type, paymentMode) => {
    setIsModalOpen(true)
    setTransactionForLink({ id, fractionId, approvalStatus, type, paymentMode })
  }

  const handleProceed = (platform, orderId, paymentMode) => {
    dispatch(generateLink({ ...transactionForLink, platform, orderId, paymentMode }))
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
    setTransactionForLink({ id: '', fractionId: '' })
  }

  const handleUpdateOrderId = (platform, orderId) => {
    dispatch(updateOrderId({ ...transactionForOrderId, platform, orderId }))
  }

  const handleCancelOrderIdModal = () => {
    setIsOrderIdModalOpen(false)
    setTransactionForOrderId({ id: '', fractionId: '', orderId: '', platform: '' })
  }

  useEffect(() => {
    if (linkGenerateStatus === 'completed') {
      handleCancelModal()
      toast.success('Generated')
    }
  }, [linkGenerateStatus])

  useEffect(() => {
    if (orderIdStatus === 'completed') {
      handleCancelOrderIdModal()
      toast.success('Updated')
    }
    if (noteUpdateStatus === 'completed') {
      toast.success('Note updated')
    }
  }, [orderIdStatus, noteUpdateStatus])

  // const handleRemoveFraction = (id, fractionId) => {
  //   dispatch(removeFraction({ id, fractionId }))
  // }

  const handleSaveFractions = (item) => {
    if (!item.transactionFractions?.length) {
      dispatch(saveFractions({ id: item._id, fractions: [] }))
      return
    }

    let amount = item.amount
    let sum = item.transactionFractions.reduce((acc, fraction) => {
      if (fraction.linkStatus !== 'deleted') {
        return (acc + Number(fraction.fractionAmount))
      }
      return acc
    }, 0)

    if (sum !== amount) {
      toast.error(`Sum of fraction amounts must be equal to the original amount`)
      return
    }

    for (let index = 0; index < item.transactionFractions.length; index++) {
      const fraction = item.transactionFractions[index];
      if (!fraction.transactionDate) {
        toast.error('Transaction Dates of each fraction are required')
        return
      }
    }

    dispatch(saveFractions({ id: item._id, fractions: item.transactionFractions }))
  }

  const updateApprovalStatus = async (id, approvalStatus, fractionId) => {
    const data = { approvalStatus }
    if (fractionId) { data.fractionId = fractionId }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/update-status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })
      const jsonData = await response.json()
      if (!response.ok) {
        throw new Error(jsonData.error || response.statusText)
      }
    } catch (error) {
      console.error('Error updating approval status: ', error.message)
      toast.error('Unable to update approval status')
    }
  }

  const updateTransaction = async (id, update) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/update-transction/${id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(update)
      })
      const jsonData = await response.json()
      if (!response.ok) {
        throw new Error(jsonData.error || response.statusText)
      }
    } catch (error) {
      console.error('Error updating transction date: ', error.message)
      toast.error('Unable to update transaction')
    }
  }

  const handleNoteUpdate = (id, note, fractionId) => {
    dispatch(updateNote({ id, note, fractionId }))
  }

  const unitsMap = {
    'amount in next question': 'Amount',
    'amount given in next question': 'Amount',
    'long term units': 'Long Term Units',
    'unlocked units': 'Unlocked Units',
    'redeem all units': 'Redeem All Units',
    'units in next question': 'Units',
    'switch all units': 'Switch All Units',
  }

  const updateStatusAfter4s = (resetFunction) => {
    setTimeout(() => {
      dispatch(resetFunction())
    }, 4000);
  }

  // side effect to reset all status and error 
  useEffect(() => {
    let statusArray = ['failed', 'completed']
    if (statusArray.includes(orderIdStatus)) {
      updateStatusAfter4s(resetOrderIdStatus)
    }
    if (statusArray.includes(noteUpdateStatus)) {
      updateStatusAfter4s(resetNoteUpdateStatus)
    }
    if (statusArray.includes(linkGenerateStatus)) {
      updateStatusAfter4s(resetLinkGenerateStatus)
    }

    if (error) { updateStatusAfter4s(resetError) }
  }, [orderIdStatus, noteUpdateStatus, linkGenerateStatus, error])

  const showLoading = (<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
    <Loader />
  </div>)

  return (
    <div className='home-section w-full h-[100vh] relative'>
      <div className="first-section sticky top-0 z-40 bg-white flex justify-between items-center h-[12vh] py-1 px-2 md:px-6 ">

        <Header title='Transaction Details' />
      </div>
      {isLoading ? showLoading : <div className="table-section  bg-[#F8FAFC] p-3 flex flex-col items-center gap-4 overflow-y-auto h-[88vh]">
        <div className='card text-[#000000] client-data w-[90vw] md:w-[87vw]  lg:w-[90vw] grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-6'>
          <div className=' bg-blue-50 w-full rounded-md border-2 border-solid border-[#EDEDED] flex  flex-col gap-4 p-4 tracking-wide'>
            {/* <div>
              <h2 className=' text-xs font-semibold'>Client Name</h2>
              <p className=' text-lg'>{commonData.investorName}</p>
            </div> */}

            <div>
              <h2 className=' text-xs font-semibold'>Family Head</h2>
              <p className=' text-lg'>{commonData.familyHead}</p>
            </div>
            <div>
              <h2 className=' text-xs font-semibold'>PAN Number</h2>
              <p className=' text-lg'>{commonData.panNumber}</p>
            </div>
          </div>
          <div className=' bg-[#FEFBE8] w-full rounded-md border-2 border-solid border-[#EDEDED] flex flex-col gap-4 p-4 tracking-wide'>
            <div>
              <h2 className=' text-xs font-semibold'>RM Name</h2>
              <p className=' text-lg'>{commonData.relationshipManager}</p>
            </div>

            <div>
              <h2 className=' text-xs font-semibold'>Date of execution</h2>
              <p className=' text-lg'>{commonData.createdAt}</p>
            </div>
          </div>
          <div className=' bg-[#FDF1F1] w-full rounded-md border-2 border-solid border-[#EDEDED] flex flex-col gap-4 p-4 tracking-wide'>
            <div>
              <h2 className=' text-xs font-semibold'>Pending TRX Count</h2>
              <p className=' text-lg'>{commonData.pendingTrxCount}</p>
            </div>

            <div>
              <h2 className=' text-xs font-semibold'>Transaction Count</h2>
              <p className=' text-lg'>{commonData.transactionCount}</p>
            </div>
          </div>
        </div>

        {/* ******* SIP TRANSACTIONS TABLE ******* */}
        {!!sips?.length && <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-2xl top-0 p-4 bg-white w-full'>SIP</h2>
          <div className=' w-full overflow-x-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=''>
                  <th></th>
                  <th>S No.</th>
                  <th>Investor Name</th>
                  <th>Transaction For</th>
                  <th>Scheme Name / Option</th>
                  <th>Execution Date</th>
                  <th>Folio</th>
                  <th>Tenure of SIP</th>
                  <th>First Traxn Amount</th>
                  <th>SIP Date</th>
                  <th>First Installment Payment Mode</th>
                  <th>SIP Amount</th>
                  <th>Approval Status</th>
                  {canModifyTransactions && <th>Action</th>}
                  <th>Links</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !sips?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No SIP Transactions Found</td></tr> :
                    sips.map((item, index) => {
                      let hasChild = item.transactionFractions?.length !== 0
                      let childLength = item.transactionFractions?.length
                      let transTypeBgColor = transactionTypeColorMap[item.transactionFor]
                      let transTypeText = transactionTypeTextMap[item.transactionFor]

                      return <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td>
                            <button onClick={() => toggelRows(item._id)} className='text-lg enabled:cursor-pointer p-2 enabled:border group disabled:text-gray-400' disabled={!hasChild}>
                              <IoIosArrowUp className={`transform transition-transform ${openRows[item._id] ? 'rotate-180' : 'group-enabled:rotate-0 group-disabled:rotate-180'}`} />
                            </button>
                          </td>
                          <td>
                            <span
                              style={{
                                backgroundColor: color.find((color) => color.type === item.status)?.bgcolor || 'rgb(240, 240, 240)',
                                color: color.find((color) => color.type === item.status)?.color || 'rgb(120 120 120)'
                              }}
                              className='p-1 w-9 h-9 flex items-center justify-center rounded-full font-medium text-xs'
                            >{index + 1}</span>
                          </td>
                          <td>{item.investorName}</td>
                          <td><span className={`block w-14 py-px rounded-full ${transTypeBgColor}`}>{transTypeText}</span></td>
                          <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`execution-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.transactionPreference)}
                            </label>
                            <input
                              type="date"
                              id={`execution-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.transactionPreference)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setSips(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        transactionPreference: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { transactionPreference: value })
                              }}
                            />
                          </td>
                          <td>{item.folioNumber}</td>
                          <td>{item.tenure}</td>
                          <td className='min-w-32'>{item.firstTransactionAmount}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`sip-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.sipSwpStpDate)}
                            </label>
                            <input
                              type="date"
                              id={`sip-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.sipSwpStpDate)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setSips(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        sipSwpStpDate: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { sipSwpStpDate: value })
                              }}
                            />
                          </td>
                          <td className='min-w-36'>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>
                            {item.approvalStatus === 'Approved' ?
                              <span>Approved</span> :
                              <select name="approval-status" disabled={!(canModifyTransactions || canModifyExecutionDate) || hasChild} className='py-2' value={item.approvalStatus} onChange={(e) => {
                                const value = e.target.value
                                // if (!value) return

                                let updatedSips = [...sips].map(sip => ({
                                  ...sip,
                                  transactionFractions: [...sip.transactionFractions]
                                }));
                                updatedSips[index].approvalStatus = value;
                                setSips(updatedSips);
                                updateApprovalStatus(item._id, value)
                              }}>
                                {approvalStatusOptions.map(statusOption => (
                                  <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                ))}
                              </select>}
                          </td>

                          {canModifyTransactions && <td>{item.linkStatus === 'locked' ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={!canModifyTransactions || item.linkStatus === 'generated'} className='border hover:border-yellow-300 enabled:hover:text-yellow-600 enabled:hover:bg-yellow-100  disabled:text-gray-500 disabled:cursor-not-allowed text-2xl w-9 h-9 rounded-md'>
                              <CiLock className='m-auto' />
                            </button> : item.linkStatus === 'generated' ?
                              <button
                                title='update order ID'
                                onClick={() => { setTransactionForOrderId({ id: item._id, orderId: item.orderId, platform: item.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                className='border border-transparent enabled:hover:border-orange-400 text-orange-400 disabled:text-gray-400 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                                <MdUpdate />
                              </button> :
                              <button className='text-2xl border h-9 w-9 rounded-md hover:border-green-300 hover:text-green-800 hover:bg-green-100' onClick={() => { openRowAccordion(item._id); handleAddSipsFraction(index) }}>+</button>}
                          </td>}

                          <td>
                            {!item.hasFractions ? item.linkStatus === 'generated' ?
                              <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                              <button
                                disabled={!canModifyTransactions || ['RM Declined', 'Client Declined'].includes(item.approvalStatus)}
                                className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                onClick={() => handleGenerateLink(item._id, item.approvalStatus, item.transactionType, item.paymentMode)}
                              >Approve</button>
                              : <button
                                disabled={childLength === 1 || item.linkStatus === 'locked'}
                                className='border border-indigo-300 bg-indigo-100 rounded-3xl px-2 py-2 text-sm text-indigo-800 disabled:bg-indigo-50 disabled:text-indigo-300'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                          <td>
                            <NoteDropdown existingNote={item.note} handleProceed={(note) => handleNoteUpdate(item._id, note)} status={noteUpdateStatus} />
                          </td>
                        </tr>
                        {hasChild && <tr>
                          <td colSpan="20" style={{ paddingBlock: openRows[item._id] ? '0' : '1rem' }} className='transition-all duration-300'>
                            <div className={`transition-all duration-300 ${openRows[item._id] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                              <table className='relative w-full'>
                                <thead className=' rounded-full   '>
                                  <tr className=''>
                                    <th></th>
                                    <th>S No.</th>
                                    <th>Investor Name</th>
                                    <th>Transaction For</th>
                                    <th>Scheme Name / Option</th>
                                    <th>Folio</th>
                                    <th>Tenure of SIP</th>
                                    <th>First Traxn Amount</th>
                                    <th>SIP Date</th>
                                    <th>First Installment Payment Mode</th>
                                    <th>SIP Amount</th>
                                    <th>Approval Status</th>
                                    <th>Link</th>
                                    {canModifyTransactions && <th>Actions</th>}
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody className=' bg-[#ECF9FF] text-black '>
                                  {
                                    item.transactionFractions?.map((fractionItem, fracIndex) =>
                                      <tr key={fracIndex} className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                        <td className=''></td>
                                        <td className='min-w-16'>
                                          <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                                            style={{
                                              backgroundColor: color.find((color) => color.type === fractionItem.status)?.bgcolor || 'rgb(240, 240, 240)',
                                              color: color.find((color) => color.type === fractionItem.status)?.color || 'rgb(120 120 120)'
                                            }}
                                          >{index + 1}.{fracIndex + 1}</span>
                                        </td>
                                        <td>{item.investorName}</td>
                                        <td><span className={`block w-14 py-px rounded-full ${transTypeBgColor}`}>{transTypeText}</span></td>
                                        <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.folioNumber}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setSips(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, folioNumber: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>
                                        <td>{item.tenure}</td>
                                        <td className='min-w-32'>{item.firstTransactionAmount}</td>

                                        <td className='relative'>
                                          <label
                                            htmlFor={`transactionDate-${item._id}-${fracIndex}`}
                                            className={`focus-within:bg-blue-100 p-1 px-2 border rounded-md text-center ${['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked' ? '' : 'hover:bg-blue-100'}`}>
                                            {formatDate(fractionItem.transactionDate)}
                                          </label>
                                          <input
                                            type="date"
                                            id={`transactionDate-${item._id}-${fracIndex}`}
                                            min={currentDate}
                                            className='text-xs absolute left-0 -z-10'
                                            value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                            required
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onFocus={(e) => e.target.showPicker()}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setSips(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, transactionDate: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}
                                          />
                                        </td>

                                        <td className='min-w-36'>{item.paymentMode}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.fractionAmount}
                                            type='number'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setSips(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, fractionAmount: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>
                                        <td>
                                          {fractionItem.approvalStatus === 'Approved' ?
                                            <span>Approved</span> :
                                            <select
                                              name="approval-status"
                                              className='disabled:bg-blue-50 py-2'
                                              disabled={!canModifyTransactions || item.linkStatus === 'locked' || ['deleted'].includes(fractionItem.linkStatus)}
                                              value={fractionItem.approvalStatus}
                                              onChange={(e) => {
                                                const value = e.target.value
                                                // if (!value) return

                                                setSips(prevState => {
                                                  return prevState.map((transaction, i) => {
                                                    if (i === index) {
                                                      return {
                                                        ...transaction,
                                                        transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                          if (j === fracIndex) {
                                                            return { ...fraction, approvalStatus: value };
                                                          }
                                                          return fraction;
                                                        })
                                                      };
                                                    }
                                                    return transaction;
                                                  });
                                                });
                                              }}>
                                              {approvalStatusOptions.map(statusOption => (
                                                <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                              ))}
                                            </select>}
                                        </td>

                                        <td>{fractionItem.linkStatus === 'generated' ?
                                          <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                                          <button disabled={!canModifyTransactions || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked' || ['RM Declined', 'Client Declined'].includes(fractionItem.approvalStatus)}
                                            className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                            onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id, fractionItem.approvalStatus, item.transactionType, item.paymentMode) }}>Approve</button>
                                        }</td>

                                        {canModifyTransactions && <td>
                                          {fractionItem.linkStatus === 'generated' ?
                                            <Dropdown
                                              toggleButton={<span className='p-2 rounded-full ms-2 hover:ring-2 focus:ring-2'><IoEllipsisVerticalSharp /></span>}>
                                              <div className='flex flex-col py-2'>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => handleCancelSipsFraction(index, fracIndex)}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Delete
                                                </button>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => { setTransactionForOrderId({ id: item._id, fractionId: fractionItem._id, orderId: fractionItem.orderId, platform: fractionItem.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Update Order ID
                                                </button>

                                              </div>
                                            </Dropdown> :
                                            fractionItem.linkStatus === 'deleted' ?
                                              <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                              <button
                                                title='Remove'
                                                disabled={item.linkStatus === 'locked'}
                                                onClick={() => handleRemoveSipsFraction(index, fracIndex)}
                                                className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                              ><IoMdClose /></button>
                                          }
                                        </td>}
                                        <td>
                                          <NoteDropdown existingNote={fractionItem.note} handleProceed={(note) => handleNoteUpdate(item._id, note, fractionItem._id)} status={noteUpdateStatus} />
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>}
                      </Fragment>
                    })
                }

              </tbody>
            </table>
          </div>
        </div>}

        {/* ******* STP or Capital Appreciation STP TRANSACTIONS TABLE ******* */}
        {!!stps?.length && <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-2xl top-0 p-4 bg-white w-full'>STP</h2>
          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=''>
                  <th></th>
                  <th className='min-w-16'>S No.</th>
                  <th>Investor Name</th>
                  <th>Transaction For</th>
                  <th>Source Scheme</th>
                  <th>Target Scheme Name / Option</th>
                  <th>Execution Date</th>
                  <th>Folio</th>
                  <th>Tenure of STP</th>
                  <th className='min-w-32'>First Traxn Amount</th>
                  <th>STP Date</th>
                  <th className='min-w-36'>First Installment Payment Mode</th>
                  <th>STP Amount</th>
                  <th>Approval Status</th>
                  {canModifyTransactions && <th>Action</th>}
                  <th>Links</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !stps?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No STP Transactions Found</td></tr> :
                    stps.map((item, index) => {
                      let hasChild = item.transactionFractions?.length !== 0
                      let childLength = item.transactionFractions?.length
                      let transTypeBgColor = transactionTypeColorMap[item.transactionFor]
                      let transTypeText = transactionTypeTextMap[item.transactionFor]

                      return <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td>
                            <button onClick={() => toggelRows(item._id)} className='text-lg enabled:cursor-pointer p-2 enabled:border group disabled:text-gray-400' disabled={!hasChild}>
                              <IoIosArrowUp className={`transform transition-transform ${openRows[item._id] ? 'rotate-180' : 'group-enabled:rotate-0 group-disabled:rotate-180'}`} />
                            </button>
                          </td>
                          <td className='min-w-16'>
                            <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                              style={{
                                backgroundColor: color.find((color) => color.type === item.status)?.bgcolor || 'rgb(240, 240, 240)',
                                color: color.find((color) => color.type === item.status)?.color || 'rgb(120 120 120)'
                              }}
                            >{index + 1}</span>
                          </td>
                          <td>{item.investorName}</td>
                          <td><span className={`block w-14 py-px rounded-full ${transTypeBgColor}`}>{transTypeText}</span></td>
                          <td>{item.fromSchemeName}</td>
                          <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`execution-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.transactionPreference)}
                            </label>
                            <input
                              type="date"
                              id={`execution-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.transactionPreference)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setStps(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        transactionPreference: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { transactionPreference: value })
                              }}
                            />
                          </td>
                          <td>{item.folioNumber}</td>
                          <td>{item.tenure}</td>
                          <td className='min-w-32'>{item.firstTransactionAmount}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`stp-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.sipSwpStpDate)}
                            </label>
                            <input
                              type="date"
                              id={`stp-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.sipSwpStpDate)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setStps(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        sipSwpStpDate: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { sipSwpStpDate: value })
                              }}
                            />
                          </td>
                          <td className='min-w-36'>{item.paymentMode}</td>
                          <td>{item.amount}</td>

                          <td>
                            {item.approvalStatus === 'Approved' ?
                              <span>Approved</span> :
                              <select name="approval-status" disabled={!(canModifyTransactions || canModifyExecutionDate) || hasChild} className='py-2' value={item.approvalStatus} onChange={(e) => {
                                const value = e.target.value
                                // if (!value) return

                                let updatedStps = [...stps].map(stp => ({
                                  ...stp,
                                  transactionFractions: [...stp.transactionFractions]
                                }));
                                updatedStps[index].approvalStatus = value;
                                setStps(updatedStps);
                                updateApprovalStatus(item._id, value)
                              }}>
                                {approvalStatusOptions.map(statusOption => (
                                  <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                ))}
                              </select>}
                          </td>

                          {canModifyTransactions && <td>{item.linkStatus === 'locked' ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={!canModifyTransactions || item.linkStatus === 'generated'} className='border hover:border-yellow-300 enabled:hover:text-yellow-600 enabled:hover:bg-yellow-100  disabled:text-gray-500 disabled:cursor-not-allowed text-2xl w-9 h-9 rounded-md'>
                              <CiLock className='m-auto' />
                            </button> : item.linkStatus === 'generated' ?
                              <button
                                title='update order ID'
                                onClick={() => { setTransactionForOrderId({ id: item._id, orderId: item.orderId, platform: item.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                className='border border-transparent enabled:hover:border-orange-400 text-orange-400 disabled:text-gray-400 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                                <MdUpdate />
                              </button>
                              : <button className='text-2xl border h-9 w-9 rounded-md hover:border-green-300 hover:text-green-800 hover:bg-green-100' onClick={() => { openRowAccordion(item._id); handleAddStpsFraction(index) }}>+</button>}
                          </td>}

                          <td>
                            {!item?.hasFractions ? item.linkStatus === 'generated' ?
                              <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                              <button
                                disabled={!canModifyTransactions || ['RM Declined', 'Client Declined'].includes(item.approvalStatus)}
                                className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                onClick={() => handleGenerateLink(item._id, item.approvalStatus)}
                              >Approve</button>
                              : <button
                                disabled={childLength === 1 || item.linkStatus === 'locked'}
                                className='border border-indigo-300 bg-indigo-100 rounded-3xl px-2 py-2 text-sm text-indigo-800 disabled:bg-indigo-50 disabled:text-indigo-300'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                          <td>
                            <NoteDropdown existingNote={item.note} handleProceed={(note) => handleNoteUpdate(item._id, note)} status={noteUpdateStatus} />
                          </td>
                        </tr>
                        {hasChild && <tr>
                          <td colSpan="20" style={{ paddingBlock: openRows[item._id] ? '0' : '1rem' }} className='transition-all duration-300'>
                            <div className={`transition-all duration-300 ${openRows[item._id] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                              <table className='relative '>
                                <thead className=' rounded-full   '>
                                  <tr className=' whitespace-nowrap  '>
                                    <th></th>
                                    <th className='min-w-16'>S No.</th>
                                    <th>Investor Name</th>
                                    <th>Transaction For</th>
                                    <th>Source Scheme</th>
                                    <th>Target Scheme Name / Option</th>
                                    <th>Folio</th>
                                    <th>Tenure of STP</th>
                                    <th className='min-w-32'>First Traxn Amount</th>
                                    <th>STP Date</th>
                                    <th className='min-w-36'>First Installment Payment Mode</th>
                                    <th>STP Amount</th>
                                    <th>Approval Status</th>
                                    <th>Link</th>
                                    {canModifyTransactions && <th>Actions</th>}
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody className=' bg-[#ECF9FF] text-black '>
                                  {
                                    item.transactionFractions?.map((fractionItem, fracIndex) =>
                                      <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                        <td className=''></td>
                                        <td className='min-w-16'>
                                          <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                                            style={{
                                              backgroundColor: color.find((color) => color.type === fractionItem.status)?.bgcolor || 'rgb(240, 240, 240)',
                                              color: color.find((color) => color.type === fractionItem.status)?.color || 'rgb(120 120 120)'
                                            }}
                                          >{index + 1}.{fracIndex + 1}</span></td>
                                        <td>{item.investorName}</td>
                                        <td><span className={`block w-14 py-px rounded-full ${transTypeBgColor}`}>{transTypeText}</span></td>
                                        <td>{item.fromSchemeName}</td>
                                        <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.folioNumber}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setStps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, folioNumber: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>
                                        <td>{item.tenure}</td>
                                        <td className='min-w-32'>{item.firstTransactionAmount}</td>
                                        <td className='relative'>
                                          <label
                                            htmlFor={`transactionDate-${item._id}-${fracIndex}`}
                                            className={`focus-within:bg-blue-100 p-1 px-2 border rounded-md text-center ${['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked' ? '' : 'hover:bg-blue-100'}`}>
                                            {formatDate(fractionItem.transactionDate)}
                                          </label>
                                          <input
                                            type="date"
                                            id={`transactionDate-${item._id}-${fracIndex}`}
                                            min={currentDate}
                                            className='text-xs absolute left-0 -z-10'
                                            value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                            required
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onFocus={(e) => e.target.showPicker()}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setStps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, transactionDate: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}
                                          />
                                        </td>

                                        <td className='min-w-36'>{item.paymentMode}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.fractionAmount}
                                            type='number'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setStps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, fractionAmount: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>

                                        <td>
                                          {fractionItem.approvalStatus === 'Approved' ?
                                            <span>Approved</span> :
                                            <select
                                            name="approval-status"
                                            className='disabled:bg-blue-50 py-2'
                                            disabled={!canModifyTransactions || item.linkStatus === 'locked' || ['deleted'].includes(fractionItem.linkStatus)}
                                            value={fractionItem.approvalStatus}
                                            onChange={(e) => {
                                              const value = e.target.value
                                              // if (!value) return

                                              setStps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, approvalStatus: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}>
                                            {approvalStatusOptions.map(statusOption => (
                                              <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                            ))}
                                          </select>}
                                        </td>

                                        <td>{fractionItem.linkStatus === 'generated' ?
                                          <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                                          <button disabled={!canModifyTransactions || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked' || ['RM Declined', 'Client Declined'].includes(fractionItem.approvalStatus)}
                                            className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                            onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id, fractionItem.approvalStatus) }}>Approve</button>
                                        }</td>

                                        {canModifyTransactions && <td>
                                          {fractionItem.linkStatus === 'generated' ?
                                            <Dropdown
                                              toggleButton={<span className='p-2 rounded-full ms-2 hover:ring-2 focus:ring-2'><IoEllipsisVerticalSharp /></span>}>
                                              <div className='flex flex-col py-2'>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => handleCancelStpsFraction(index, fracIndex)}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Delete
                                                </button>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => { setTransactionForOrderId({ id: item._id, fractionId: fractionItem._id, orderId: fractionItem.orderId, platform: fractionItem.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Update Order ID
                                                </button>

                                              </div>
                                            </Dropdown> :
                                            fractionItem.linkStatus === 'deleted' ?
                                              <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                              <button
                                                title='Remove'
                                                disabled={item.linkStatus === 'locked'}
                                                onClick={() => handleRemoveStpsFraction(index, fracIndex)}
                                                className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                              ><IoMdClose /></button>
                                          }
                                        </td>}
                                        <td>
                                          <NoteDropdown existingNote={fractionItem.note} handleProceed={(note) => handleNoteUpdate(item._id, note, fractionItem._id)} status={noteUpdateStatus} />
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>}
                      </Fragment>
                    })
                }

              </tbody>
            </table>
          </div>
        </div>}

        {/* ******* SWP or Capital Appreciation SWP TRANSACTIONS TABLE ******* */}
        {!!swps?.length && <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-2xl top-0 p-4 bg-white w-full'>SWP</h2>
          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=''>
                  <th></th>
                  <th>S No.</th>
                  <th>Investor Name</th>
                  <th>Transaction For</th>
                  <th>Source Scheme / Scheme Option</th>
                  <th>Execution Date</th>
                  <th>Folio</th>
                  <th>Tenure of SWP</th>
                  <th>First Traxn Amount</th>
                  <th>SWP Date</th>
                  <th>First Installment Payment Mode</th>
                  <th>SWP Amount</th>
                  <th>Approval Status</th>
                  {canModifyTransactions && <th>Action</th>}
                  <th>Links</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !swps?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No SWP Transactions Found</td></tr> :
                    swps.map((item, index) => {
                      let hasChild = item.transactionFractions?.length !== 0
                      let childLength = item.transactionFractions?.length
                      let transTypeBgColor = transactionTypeColorMap[item.transactionFor]
                      let transTypeText = transactionTypeTextMap[item.transactionFor]

                      return <Fragment key={item._id}>
                        <tr className='whitespace-nowrap border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td>
                            <button onClick={() => toggelRows(item._id)} className='text-lg enabled:cursor-pointer p-2 enabled:border group disabled:text-gray-400' disabled={!hasChild}>
                              <IoIosArrowUp className={`transform transition-transform ${openRows[item._id] ? 'rotate-180' : 'group-enabled:rotate-0 group-disabled:rotate-180'}`} />
                            </button>
                          </td>
                          <td className='min-w-16'>
                            <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                              style={{
                                backgroundColor: color.find((color) => color.type === item.status)?.bgcolor || 'rgb(240, 240, 240)',
                                color: color.find((color) => color.type === item.status)?.color || 'rgb(120 120 120)'
                              }}
                            >{index + 1}</span>
                          </td>
                          <td>{item.investorName}</td>
                          <td><span className={`block w-14 py-px rounded-full ${transTypeBgColor}`}>{transTypeText}</span></td>
                          <td>{item.fromSchemeName + " / " + item.schemeOption}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`execution-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.transactionPreference)}
                            </label>
                            <input
                              type="date"
                              id={`execution-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.transactionPreference)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setSwps(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        transactionPreference: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { transactionPreference: value })
                              }}
                            />
                          </td>
                          <td>{item.folioNumber}</td>
                          <td>{item.tenure}</td>
                          <td className='min-w-32'>{item.firstTransactionAmount}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`swp-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.sipSwpStpDate)}
                            </label>
                            <input
                              type="date"
                              id={`swp-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.sipSwpStpDate)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setSwps(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        sipSwpStpDate: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { sipSwpStpDate: value })
                              }}
                            />
                          </td>
                          <td className='min-w-36'>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>
                            {item.approvalStatus === 'Approved' ?
                              <span>Approved</span> :
                              <select name="approval-status" disabled={!(canModifyTransactions || canModifyExecutionDate) || hasChild} className='py-2' value={item.approvalStatus} onChange={(e) => {
                                const value = e.target.value
                                // if (!value) return

                                setSwps(prevState => prevState.map((transaction, i) => {
                                  if (i === index) {
                                    return { ...transaction, approvalStatus: value }
                                  }
                                  return transaction
                                }))
                                updateApprovalStatus(item._id, value)
                              }}>
                                {approvalStatusOptions.map((statusOption) => (
                                  <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                ))}
                              </select>}
                          </td>

                          {canModifyTransactions && <td>{item.linkStatus === 'locked' ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={!canModifyTransactions || item.linkStatus === 'generated'} className='border hover:border-yellow-300 enabled:hover:text-yellow-600 enabled:hover:bg-yellow-100  disabled:text-gray-500 disabled:cursor-not-allowed text-2xl w-9 h-9 rounded-md'>
                              <CiLock className='m-auto' />
                            </button> : item.linkStatus === 'generated' ?
                              <button
                                title='update order ID'
                                onClick={() => { setTransactionForOrderId({ id: item._id, orderId: item.orderId, platform: item.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                className='border border-transparent enabled:hover:border-orange-400 text-orange-400 disabled:text-gray-400 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                                <MdUpdate />
                              </button>
                              : <button className='text-2xl border h-9 w-9 rounded-md hover:border-green-300 hover:text-green-800 hover:bg-green-100' onClick={() => { openRowAccordion(item._id); handleAddSwpsFraction(index) }}>+</button>}
                          </td>}

                          <td>
                            {!item?.hasFractions ? item.linkStatus === 'generated' ?
                              <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                              <button
                                disabled={!canModifyTransactions || ['RM Declined', 'Client Declined'].includes(item.approvalStatus)}
                                className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                onClick={() => handleGenerateLink(item._id, item.approvalStatus)}
                              >Approve</button>
                              : <button
                                disabled={childLength === 1 || item.linkStatus === 'locked'}
                                className='border border-indigo-300 bg-indigo-100 rounded-3xl px-2 py-2 text-sm text-indigo-800 disabled:bg-indigo-50 disabled:text-indigo-300'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                          <td>
                            <NoteDropdown existingNote={item.note} handleProceed={(note) => handleNoteUpdate(item._id, note)} status={noteUpdateStatus} />
                          </td>
                        </tr>
                        {hasChild && <tr>
                          <td colSpan="20" style={{ paddingBlock: openRows[item._id] ? '0' : '1rem' }} className='transition-all duration-300'>
                            <div className={`transition-all duration-300 ${openRows[item._id] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                              <table className='relative w-full'>
                                <thead className=' rounded-full   '>
                                  <tr className=''>
                                    <th></th>
                                    <th className='min-w-16'>S No.</th>
                                    <th>Investor Name</th>
                                    <th>Transaction For</th>
                                    <th>Source Scheme / Scheme Option</th>
                                    <th>Folio</th>
                                    <th>Tenure of SWP</th>
                                    <th className='min-w-32'>First Traxn Amount</th>
                                    <th>SWP Date</th>
                                    <th className='min-w-36'>First Installment Payment Mode</th>
                                    <th>SWP Amount</th>
                                    <th>Approval Status</th>
                                    <th>Link</th>
                                    {canModifyTransactions && <th>Actions</th>}
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody className=' bg-[#ECF9FF] text-black '>
                                  {
                                    item.transactionFractions?.map((fractionItem, fracIndex) =>
                                      <tr key={fracIndex} className='whitespace-nowrap border-b-[2px] border-solid border-[#E3EAF4]'>
                                        <td></td>
                                        <td className='min-w-16'>
                                          <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                                            style={{
                                              backgroundColor: color.find((color) => color.type === fractionItem.status)?.bgcolor || 'rgb(240, 240, 240)',
                                              color: color.find((color) => color.type === fractionItem.status)?.color || 'rgb(120 120 120)'
                                            }}
                                          >{index + 1}.{fracIndex + 1}</span>
                                        </td>
                                        <td>{item.investorName}</td>
                                        <td><span className={`block w-14 py-px rounded-full ${transTypeBgColor}`}>{transTypeText}</span></td>
                                        <td>{item.fromSchemeName + ' / ' + item.schemeOption}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.folioNumber}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setSwps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, folioNumber: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>
                                        <td>{item.tenure}</td>
                                        <td className='min-w-32'>{item.firstTransactionAmount}</td>
                                        <td className='relative'>
                                          <label
                                            htmlFor={`transactionDate-${item._id}-${fracIndex}`}
                                            className={`focus-within:bg-blue-100 p-1 px-2 border rounded-md text-center ${['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked' ? '' : 'hover:bg-blue-100'}`}>
                                            {formatDate(fractionItem.transactionDate)}
                                          </label>
                                          <input
                                            type="date"
                                            id={`transactionDate-${item._id}-${fracIndex}`}
                                            min={currentDate}
                                            className='text-xs absolute left-0 -z-10'
                                            value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                            required
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onFocus={(e) => e.target.showPicker()}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setSwps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, transactionDate: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}
                                          />
                                        </td>

                                        <td className='min-w-36'>{item.paymentMode}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.fractionAmount}
                                            type='number'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setSwps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, fractionAmount: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>

                                        <td>
                                          {fractionItem.approvalStatus === 'Approved' ?
                                            <span>Approved</span> :
                                            <select
                                            name="approval-status"
                                            className='disabled:bg-blue-50 py-2'
                                            disabled={!canModifyTransactions || item.linkStatus === 'locked' || ['deleted'].includes(fractionItem.linkStatus)}
                                            value={fractionItem.approvalStatus}
                                            onChange={(e) => {
                                              const value = e.target.value
                                              // if (!value) return

                                              setSwps(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, approvalStatus: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}>
                                            {approvalStatusOptions.map(statusOption => (
                                              <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                            ))}
                                          </select>}
                                        </td>

                                        <td>{fractionItem.linkStatus === 'generated' ?
                                          <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                                          <button disabled={!canModifyTransactions || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked' || ['RM Declined', 'Client Declined'].includes(fractionItem.approvalStatus)}
                                            className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                            onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id, fractionItem.approvalStatus) }}>Approve</button>
                                        }</td>

                                        {canModifyTransactions && <td>
                                          {fractionItem.linkStatus === 'generated' ?
                                            <Dropdown
                                              toggleButton={<span className='p-2 rounded-full ms-2 hover:ring-2 focus:ring-2'><IoEllipsisVerticalSharp /></span>}>
                                              <div className='flex flex-col py-2'>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => handleCancelSwpsFraction(index, fracIndex)}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Delete
                                                </button>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => { setTransactionForOrderId({ id: item._id, fractionId: fractionItem._id, orderId: fractionItem.orderId, platform: fractionItem.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Update Order ID
                                                </button>

                                              </div>
                                            </Dropdown> :
                                            fractionItem.linkStatus === 'deleted' ?
                                              <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                              <button
                                                title='Remove'
                                                disabled={item.linkStatus === 'locked'}
                                                onClick={() => handleRemoveSwpsFraction(index, fracIndex)}
                                                className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                              ><IoMdClose /></button>
                                          }
                                        </td>}
                                        <td>
                                          <NoteDropdown existingNote={fractionItem.note} handleProceed={(note) => handleNoteUpdate(item._id, note, fractionItem._id)} status={noteUpdateStatus} />
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>}
                      </Fragment>
                    })
                }

              </tbody>
            </table>
          </div>
        </div>}

        {/* ******* PURCHASE TABLE ******** */}
        {!!purchases?.length && <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-2xl top-0 p-4 bg-white w-full'>Purchase</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className='whitespace-nowrap'>
                  <th></th>
                  <th>S No.</th>
                  <th>Investor Name</th>
                  <th>Scheme Name / Option</th>
                  <th>Execution Date</th>
                  <th>Folio</th>
                  {/* <th>Purchase Date</th> */}
                  <th>Payment Mode</th>
                  <th>Transaction Amount</th>
                  <th>Approval Status</th>
                  {canModifyTransactions && <th>Action</th>}
                  <th>Links</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !purchases?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Purchase Transactions Found</td></tr> :
                    purchases.map((item, index) => {
                      let hasChild = item.transactionFractions?.length !== 0
                      let childLength = item.transactionFractions?.length

                      return <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td>
                            <button onClick={() => toggelRows(item._id)} className='text-lg enabled:cursor-pointer p-2 enabled:border group disabled:text-gray-400' disabled={!hasChild}>
                              <IoIosArrowUp className={`transform transition-transform ${openRows[item._id] ? 'rotate-180' : 'group-enabled:rotate-0 group-disabled:rotate-180'}`} />
                            </button>
                          </td>
                          <td className=''>
                            <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                              style={{
                                backgroundColor: color.find((color) => color.type === item.status)?.bgcolor || 'rgb(240, 240, 240)',
                                color: color.find((color) => color.type === item.status)?.color || 'rgb(120 120 120)'
                              }}
                            >{index + 1}</span>
                          </td>
                          <td>{item.investorName}</td>
                          <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`execution-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.transactionPreference)}
                            </label>
                            <input
                              type="date"
                              id={`execution-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.transactionPreference)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setPurchases(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        transactionPreference: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { transactionPreference: value })
                              }}
                            />
                          </td>
                          <td>{item.folioNumber}</td>
                          {/* <td>{item.transactionUnits}</td> */}
                          {/* <td>{formatDate(item.createdAt)}</td> */}
                          <td>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>
                            {item.approvalStatus === 'Approved' ?
                              <span>Approved</span> :
                              <select name="approval-status" disabled={!(canModifyTransactions || canModifyExecutionDate) || hasChild} className='py-2' value={item.approvalStatus} onChange={(e) => {
                                const value = e.target.value
                                // if (!value) return

                                setPurchases(prevState => prevState.map((transaction, i) => {
                                  if (i === index) {
                                    return { ...transaction, approvalStatus: value }
                                  }
                                  return transaction
                                }))
                                updateApprovalStatus(item._id, value)
                              }}>
                                {approvalStatusOptions.map((statusOption) => (
                                  <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                ))}
                              </select>}
                          </td>

                          {canModifyTransactions && <td>{item.linkStatus === 'locked' ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={!canModifyTransactions || item.linkStatus === 'generated'} className='border hover:border-yellow-300 enabled:hover:text-yellow-600 enabled:hover:bg-yellow-100  disabled:text-gray-500 disabled:cursor-not-allowed text-2xl w-9 h-9 rounded-md'>
                              <CiLock className='m-auto' />
                            </button> : item.linkStatus === 'generated' ?
                              <button
                                title='update order ID'
                                onClick={() => { setTransactionForOrderId({ id: item._id, orderId: item.orderId, platform: item.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                className='border border-transparent enabled:hover:border-orange-400 text-orange-400 disabled:text-gray-400 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                                <MdUpdate />
                              </button> :
                              <button className='text-2xl border h-9 w-9 rounded-md hover:border-green-300 hover:text-green-800 hover:bg-green-100' onClick={() => { openRowAccordion(item._id); handleAddPurchasesFraction(index) }}>+</button>}
                          </td>}

                          <td>
                            {!item?.hasFractions ? item.linkStatus === 'generated' ?
                              <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                              <button
                                disabled={!canModifyTransactions || ['RM Declined', 'Client Declined'].includes(item.approvalStatus)}
                                className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                onClick={() => handleGenerateLink(item._id, item.approvalStatus, item.transactionType, item.paymentMode)}
                              >Approve</button>
                              : <button
                                disabled={childLength === 1 || item.linkStatus === 'locked'}
                                className='border border-indigo-300 bg-indigo-100 rounded-3xl px-2 py-2 text-sm text-indigo-800 disabled:bg-indigo-50 disabled:text-indigo-300'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                          <td>
                            <NoteDropdown existingNote={item.note} handleProceed={(note) => handleNoteUpdate(item._id, note)} status={noteUpdateStatus} />
                          </td>
                        </tr>
                        {hasChild && <tr>
                          <td colSpan="20" style={{ paddingBlock: openRows[item._id] ? '0' : '1rem' }} className='transition-all duration-300'>
                            <div className={`transition-all duration-300 ${openRows[item._id] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                              <table className='relative w-full'>
                                <thead className=' rounded-full   '>
                                  <tr className=' whitespace-nowrap  '>
                                    <th></th>
                                    <th>S No.</th>
                                    <th>Investor Name</th>
                                    <th>Scheme Name / Option</th>
                                    <th>Folio</th>
                                    <th>Execution Date</th>
                                    <th>Payment Mode</th>
                                    <th>Transaction Amount</th>
                                    <th>Approval Status</th>
                                    <th>Link</th>
                                    {canModifyTransactions && <th>Actions</th>}
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody className=' bg-[#ECF9FF] text-black '>
                                  {
                                    item.transactionFractions?.map((fractionItem, fracIndex) =>
                                      <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                        <td className=''></td>
                                        <td className=''>
                                          <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                                            style={{
                                              backgroundColor: color.find((color) => color.type === fractionItem.status)?.bgcolor || 'rgb(240, 240, 240)',
                                              color: color.find((color) => color.type === fractionItem.status)?.color || 'rgb(120 120 120)'
                                            }}
                                          >{index + 1}.{fracIndex + 1}</span>
                                        </td>
                                        <td>{item.investorName}</td>
                                        <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.folioNumber}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setPurchases(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, folioNumber: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>

                                        {/* <td>{item.transactionUnits}</td> */}

                                        <td className='relative'>
                                          <label
                                            htmlFor={`transactionDate-${item._id}-${fracIndex}`}
                                            className={`focus-within:bg-blue-100 p-1 px-2 border rounded-md text-center ${['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked' ? '' : 'hover:bg-blue-100'}`}>
                                            {formatDate(fractionItem.transactionDate)}
                                          </label>
                                          <input
                                            type="date"
                                            id={`transactionDate-${item._id}-${fracIndex}`}
                                            min={currentDate}
                                            className='text-xs absolute left-0 -z-10'
                                            value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                            required
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onFocus={(e) => e.target.showPicker()}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setPurchases(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, transactionDate: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}
                                          />
                                        </td>

                                        <td>{item.paymentMode}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.fractionAmount}
                                            type='number'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setPurchases(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, fractionAmount: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>
                                        <td>
                                          {fractionItem.approvalStatus === 'Approved' ?
                                            <span>Approved</span> :
                                            <select
                                            name="approval-status"
                                            className='disabled:bg-blue-50 py-2'
                                            disabled={!canModifyTransactions || item.linkStatus === 'locked' || ['deleted'].includes(fractionItem.linkStatus)}
                                            value={fractionItem.approvalStatus}
                                            onChange={(e) => {
                                              const value = e.target.value
                                              // if (!value) return

                                              setPurchases(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, approvalStatus: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}>
                                            {approvalStatusOptions.map(statusOption => (
                                              <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                            ))}
                                          </select>}
                                        </td>

                                        <td>{fractionItem.linkStatus === 'generated' ?
                                          <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                                          <button disabled={!canModifyTransactions || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked' || ['RM Declined', 'Client Declined'].includes(fractionItem.approvalStatus)}
                                            className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                            onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id, fractionItem.approvalStatus, item.transactionType, item.paymentMode) }}>Approve</button>
                                        }</td>

                                        {canModifyTransactions && <td>
                                          {fractionItem.linkStatus === 'generated' ?
                                            <Dropdown
                                              toggleButton={<span className='p-2 rounded-full ms-2 hover:ring-2 focus:ring-2'><IoEllipsisVerticalSharp /></span>}>
                                              <div className='flex flex-col py-2'>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => handleCancelPurchasesFraction(index, fracIndex)}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Delete
                                                </button>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => { setTransactionForOrderId({ id: item._id, fractionId: fractionItem._id, orderId: fractionItem.orderId, platform: fractionItem.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Update Order ID
                                                </button>

                                              </div>
                                            </Dropdown> :
                                            fractionItem.linkStatus === 'deleted' ?
                                              <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                              <button
                                                title='Remove'
                                                disabled={item.linkStatus === 'locked'}
                                                onClick={() => handleRemovePurchasesFraction(index, fracIndex)}
                                                className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                              ><IoMdClose /></button>
                                          }
                                        </td>}
                                        <td>
                                          <NoteDropdown existingNote={fractionItem.note} handleProceed={(note) => handleNoteUpdate(item._id, note, fractionItem._id)} status={noteUpdateStatus} />
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>}
                      </Fragment>
                    })
                }

              </tbody>
            </table>
          </div>
        </div>}

        {/* ******* REDEMPTION  TABLE ******** */}
        {!!redemptions?.length && <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-2xl top-0 p-4 bg-white w-full'>Redemption</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Investor Name</th>
                  <th>Scheme Name / Option</th>
                  <th>Execution Date</th>
                  <th>Folio</th>
                  {/* <th>Traxn </th> */}
                  {/* <th>Redemption Date</th> */}
                  <th>Payment Mode</th>
                  <th>Transaction Units/Amount</th>
                  <th>Approval Status</th>
                  {canModifyTransactions && <th>Action</th>}
                  <th>Links</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !redemptions?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Redemption Transactions Found</td></tr> :
                    redemptions.map((item, index) => {
                      let hasChild = item.transactionFractions?.length !== 0
                      let childLength = item.transactionFractions?.length

                      return <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td>
                            <button onClick={() => toggelRows(item._id)} className='text-lg enabled:cursor-pointer p-2 enabled:border group disabled:text-gray-400' disabled={!hasChild}>
                              <IoIosArrowUp className={`transform transition-transform ${openRows[item._id] ? 'rotate-180' : 'group-enabled:rotate-0 group-disabled:rotate-180'}`} />
                            </button>
                          </td>
                          <td className=''>
                            <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                              style={{
                                backgroundColor: color.find((color) => color.type === item.status)?.bgcolor || 'rgb(240, 240, 240)',
                                color: color.find((color) => color.type === item.status)?.color || 'rgb(120 120 120)'
                              }}
                            >{index + 1}</span>
                          </td>
                          <td>{item.investorName}</td>
                          <td>{item.schemeName + ' / ' + item.schemeOption}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`execution-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.transactionPreference)}
                            </label>
                            <input
                              type="date"
                              id={`execution-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.transactionPreference)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const { value } = e.target;
                                setRedemptions(prevState => {
                                  return prevState.map((transaction, i) => {
                                    if (i === index) {
                                      return {
                                        ...transaction,
                                        transactionPreference: value
                                      };
                                    }
                                    return transaction;
                                  });
                                });
                                updateTransaction(item._id, { transactionPreference: value })
                              }}
                            />
                          </td>
                          <td>{item.folioNumber}</td>
                          {/* <td>{formatDate(item.transactionPreference)}</td> */}
                          <td>{item.paymentMode}</td>
                          <td>
                            <span className='bg-gray-100 text-gray-700 rounded px-1'>{unitsMap[item.transactionUnits?.toLowerCase()]}</span>
                            {['Amount', 'Units'].includes(unitsMap[item.transactionUnits?.toLowerCase()]) && <span className='ms-2 font-semibold text-green-700'>{item.amount}</span>}
                          </td>
                          <td>
                            {item.approvalStatus === 'Approved' ?
                              <span>Approved</span> :
                              <select name="approval-status" disabled={!(canModifyTransactions || canModifyExecutionDate) || hasChild} className='py-2' value={item.approvalStatus} onChange={(e) => {
                                const value = e.target.value
                                // if (!value) return

                                setRedemptions(prevState => prevState.map((transaction, i) => {
                                  if (i === index) {
                                    return { ...transaction, approvalStatus: value }
                                  }
                                  return transaction
                                }))
                                updateApprovalStatus(item._id, value)
                              }}>
                                {approvalStatusOptions.map((statusOption) => (
                                  <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                ))}
                              </select>}
                          </td>

                          {canModifyTransactions && <td>{item.linkStatus === 'locked' ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={!canModifyTransactions || item.linkStatus === 'generated'} className='border hover:border-yellow-300 enabled:hover:text-yellow-600 enabled:hover:bg-yellow-100  disabled:text-gray-500 disabled:cursor-not-allowed text-2xl w-9 h-9 rounded-md'>
                              <CiLock className='m-auto' />
                            </button> : item.linkStatus === 'generated' ?
                              <button
                                title='update order ID'
                                onClick={() => { setTransactionForOrderId({ id: item._id, orderId: item.orderId, platform: item.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                className='border border-transparent enabled:hover:border-orange-400 text-orange-400 disabled:text-gray-400 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                                <MdUpdate />
                              </button>
                              : <button className='text-2xl border h-9 w-9 rounded-md hover:border-green-300 hover:text-green-800 hover:bg-green-100' onClick={() => { openRowAccordion(item._id); handleAddRedemptionsFraction(index) }}>+</button>}
                          </td>}

                          <td>
                            {!item?.hasFractions ? item.linkStatus === 'generated' ?
                              <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                              <button
                                disabled={!canModifyTransactions || ['RM Declined', 'Client Declined'].includes(item.approvalStatus)}
                                className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                onClick={() => handleGenerateLink(item._id, item.approvalStatus)}
                              >Approve</button>
                              : <button
                                disabled={childLength === 1 || item.linkStatus === 'locked'}
                                className='border border-indigo-300 bg-indigo-100 rounded-3xl px-2 py-2 text-sm text-indigo-800 disabled:bg-indigo-50 disabled:text-indigo-300'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                          <td>
                            <NoteDropdown existingNote={item.note} handleProceed={(note) => handleNoteUpdate(item._id, note)} status={noteUpdateStatus} />
                          </td>
                        </tr>
                        {hasChild && <tr>
                          <td colSpan="20" style={{ paddingBlock: openRows[item._id] ? '0' : '1rem' }} className='transition-all duration-300'>
                            <div className={`transition-all duration-300 ${openRows[item._id] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                              <table className='relative w-full'>
                                <thead className=' rounded-full   '>
                                  <tr className=' whitespace-nowrap  '>
                                    <th></th>
                                    <th>S No.</th>
                                    <th>Investor Name</th>
                                    <th>Scheme Name / Option</th>
                                    <th>Folio</th>
                                    <th>Execution Date</th>
                                    <th>Payment Mode</th>
                                    <th>Transaction Units/Amount</th>
                                    <th>Approval Status</th>
                                    <th>Link</th>
                                    {canModifyTransactions && <th>Actions</th>}
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody className=' bg-[#ECF9FF] text-black '>
                                  {
                                    item.transactionFractions?.map((fractionItem, fracIndex) =>
                                      <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                        <td className=''></td>
                                        <td className=''>
                                          <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                                            style={{
                                              backgroundColor: color.find((color) => color.type === fractionItem.status)?.bgcolor || 'rgb(240, 240, 240)',
                                              color: color.find((color) => color.type === fractionItem.status)?.color || 'rgb(120 120 120)'
                                            }}
                                          >{index + 1}.{fracIndex + 1}</span>
                                        </td>
                                        <td>{item.investorName}</td>
                                        <td>{item.schemeName + " / " + item.schemeOption}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.folioNumber}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setRedemptions(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, folioNumber: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>


                                        <td className='relative'>
                                          <label
                                            htmlFor={`transactionDate-${item._id}-${fracIndex}`}
                                            className={`focus-within:bg-blue-100 p-1 px-2 border rounded-md text-center ${['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked' ? '' : 'hover:bg-blue-100'}`}>
                                            {formatDate(fractionItem.transactionDate)}
                                          </label>
                                          <input
                                            type="date"
                                            id={`transactionDate-${item._id}-${fracIndex}`}
                                            min={currentDate}
                                            className='text-xs absolute left-0 -z-10'
                                            value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                            required
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onFocus={(e) => e.target.showPicker()}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setRedemptions(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, transactionDate: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}
                                          />
                                        </td>

                                        <td>{item.paymentMode}</td>
                                        <td>
                                          <span className='text-xs text-gray-600 px-1 bg-blue-100 rounded'>
                                            {unitsMap[item.transactionUnits?.toLowerCase()]}
                                          </span>
                                          <input
                                            className='ms-2 w-28 text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.fractionAmount}
                                            type='number'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              setRedemptions(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, fractionAmount: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }} />
                                        </td>
                                        <td>
                                          {fractionItem.approvalStatus === 'Approved' ?
                                            <span>Approved</span> :
                                            <select
                                            name="approval-status"
                                            className='disabled:bg-blue-50 py-2'
                                            disabled={!canModifyTransactions || item.linkStatus === 'locked' || ['deleted'].includes(fractionItem.linkStatus)}
                                            value={fractionItem.approvalStatus}
                                            onChange={(e) => {
                                              const value = e.target.value
                                              // if (!value) return

                                              setRedemptions(prevState => {
                                                return prevState.map((transaction, i) => {
                                                  if (i === index) {
                                                    return {
                                                      ...transaction,
                                                      transactionFractions: transaction.transactionFractions.map((fraction, j) => {
                                                        if (j === fracIndex) {
                                                          return { ...fraction, approvalStatus: value };
                                                        }
                                                        return fraction;
                                                      })
                                                    };
                                                  }
                                                  return transaction;
                                                });
                                              });
                                            }}>
                                            {approvalStatusOptions.map(statusOption => (
                                              <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                            ))}
                                          </select>}
                                        </td>

                                        <td>{fractionItem.linkStatus === 'generated' ?
                                          <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                                          <button disabled={!canModifyTransactions || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked' || ['RM Declined', 'Client Declined'].includes(fractionItem.approvalStatus)}
                                            className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                            onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id, fractionItem.approvalStatus) }}>Approve</button>
                                        }</td>

                                        {canModifyTransactions && <td>
                                          {fractionItem.linkStatus === 'generated' ?
                                            <Dropdown
                                              toggleButton={<span className='p-2 rounded-full ms-2 hover:ring-2 focus:ring-2'><IoEllipsisVerticalSharp /></span>}>
                                              <div className='flex flex-col py-2'>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => handleCancelRedemptionsFraction(index, fracIndex)}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Delete
                                                </button>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => { setTransactionForOrderId({ id: item._id, fractionId: fractionItem._id, orderId: fractionItem.orderId, platform: fractionItem.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Update Order ID
                                                </button>

                                              </div>
                                            </Dropdown> :
                                            fractionItem.linkStatus === 'deleted' ?
                                              <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                              <button
                                                title='Remove'
                                                disabled={item.linkStatus === 'locked'}
                                                onClick={() => handleRemoveRedemptionsFraction(index, fracIndex)}
                                                className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                              ><IoMdClose /></button>
                                          }
                                        </td>}
                                        <td>
                                          <NoteDropdown existingNote={fractionItem.note} handleProceed={(note) => handleNoteUpdate(item._id, note, fractionItem._id)} status={noteUpdateStatus} />
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>}
                      </Fragment>
                    })
                }

              </tbody>
            </table>
          </div>
        </div>}

        {/* ******* SWITCH TABLE  ******** */}
        {!!switchTransactions?.length && <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-2xl top-0 p-4 bg-white w-full'>Switch</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Investor Name</th>
                  <th>From Scheme Name / Option</th>
                  <th>To Scheme Name / Option</th>
                  <th>Execution Date</th>
                  <th>Folio</th>
                  <th>Transaction Units/Amount</th>
                  <th>Approval Status</th>
                  {canModifyTransactions && <th>Action</th>}
                  <th>Links</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !switchTransactions?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Switch Transactions Found</td></tr> :
                    switchTransactions.map((item, index) => {
                      let hasChild = item.transactionFractions?.length !== 0
                      let childLength = item.transactionFractions?.length

                      return <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td>
                            <button onClick={() => toggelRows(item._id)} className='text-lg enabled:cursor-pointer p-2 enabled:border group disabled:text-gray-400' disabled={!hasChild}>
                              <IoIosArrowUp className={`transform transition-transform ${openRows[item._id] ? 'rotate-180' : 'group-enabled:rotate-0 group-disabled:rotate-180'}`} />
                            </button>
                          </td>
                          <td className=''>
                            <span className='p-1 h-9 w-9 flex items-center justify-center rounded-full font-medium text-xs'
                              style={{
                                backgroundColor: color.find((color) => color.type === item.status)?.bgcolor || 'rgb(240, 240, 240)',
                                color: color.find((color) => color.type === item.status)?.color || 'rgb(120 120 120)'
                              }}
                            >{index + 1}</span>
                          </td>
                          <td>{item.investorName}</td>
                          <td>{item.fromSchemeName} / {item.fromSchemeOption}</td>
                          <td>{item.schemeName} / {item.schemeOption}</td>
                          <td className='relative'>
                            <label
                              htmlFor={`execution-date-${item._id}`}
                              className={`focus-within:bg-gray-100 p-1 px-2 border rounded-md text-center ${canModifyExecutionDate || canModifyTransactions ? 'hover:bg-gray-100' : ''}`}>
                              {formatDate(item.transactionPreference)}
                            </label>
                            <input
                              type="date"
                              id={`execution-date-${item._id}`}
                              min={currentDate}
                              className='text-xs absolute left-0 -z-10'
                              value={formatDateToYYYYMMDD(item.transactionPreference)}
                              required
                              disabled={!(canModifyExecutionDate || canModifyTransactions)}
                              onFocus={(e) => e.target.showPicker()}
                              onChange={(e) => {
                                const value = e.target.value
                                dispatch(updateSwitchExecutionDate({
                                  index,
                                  transactionPreference: value
                                }))
                                updateTransaction(item._id, { transactionPreference: value })
                              }}
                            />
                          </td>
                          <td>{item.folioNumber}</td>
                          {/* <td>{formatDate(item.transactionPreference)}</td> */}
                          <td>
                            <span className='bg-gray-100 text-gray-700 rounded px-1'>{unitsMap[item.transactionUnits?.toLowerCase()]}</span>
                            {['Amount', 'Units'].includes(unitsMap[item.transactionUnits?.toLowerCase()]) && <span className='ms-2 font-semibold text-green-700'>{item.amount}</span>}
                          </td>

                          <td>
                            {item.approvalStatus === 'Approved' ?
                              <span>Approved</span> :
                              <select name="approval-status" disabled={!(canModifyTransactions || canModifyExecutionDate) || hasChild} className='py-2' value={item.approvalStatus} onChange={(e) => {
                                const value = e.target.value
                                // if (!value) return

                                dispatch(updateSwitchApprovalStatus({ index, approvalStatus: value }))
                                updateApprovalStatus(item._id, value)
                              }}>
                                {approvalStatusOptions.map((statusOption) => (
                                  <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                ))}
                              </select>}
                          </td>

                          {canModifyTransactions && <td>{item.linkStatus === 'locked' ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={!canModifyTransactions || item.linkStatus === 'generated'} className='border hover:border-yellow-300 enabled:hover:text-yellow-600 enabled:hover:bg-yellow-100  disabled:text-gray-500 disabled:cursor-not-allowed text-2xl w-9 h-9 rounded-md'>
                              <CiLock className='m-auto' />
                            </button> : item.linkStatus === 'generated' ?
                              <button
                                title='update order ID'
                                onClick={() => { setTransactionForOrderId({ id: item._id, orderId: item.orderId, platform: item.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                className='border border-transparent enabled:hover:border-orange-400 text-orange-400 disabled:text-gray-400 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                                <MdUpdate />
                              </button> :
                              <button className='text-2xl border h-9 w-9 rounded-md hover:border-green-300 hover:text-green-800 hover:bg-green-100' onClick={() => { openRowAccordion(item._id); handleSwitchAdd(index) }}>+</button>}
                          </td>}

                          <td>
                            {!item.hasFractions ? item.linkStatus === 'generated' ?
                              <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                              <button
                                disabled={!canModifyTransactions || ['RM Declined', 'Client Declined'].includes(item.approvalStatus)}
                                className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                onClick={() => handleGenerateLink(item._id, item.approvalStatus)}
                              >Approve</button>
                              : <button
                                disabled={childLength === 1 || item.linkStatus === 'locked'}
                                className='border border-indigo-300 bg-indigo-100 rounded-3xl px-2 py-2 text-sm text-indigo-800 disabled:bg-indigo-50 disabled:text-indigo-300'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                          <td>
                            <NoteDropdown existingNote={item.note} handleProceed={(note) => handleNoteUpdate(item._id, note)} status={noteUpdateStatus} />
                          </td>
                        </tr>
                        {hasChild && <tr>
                          <td colSpan="20" style={{ paddingBlock: openRows[item._id] ? '0' : '1rem' }} className='transition-all duration-300'>
                            <div className={`transition-all duration-300 ${openRows[item._id] ? "max-h-0 overflow-hidden" : "max-h-screen"}`}>
                              <table className='relative w-full'>
                                <thead className=' rounded-full   '>
                                  <tr className=' whitespace-nowrap  '>
                                    <th></th>
                                    <th>S No.</th>
                                    <th>Investor Name</th>
                                    <th>From Scheme Name / Option</th>
                                    <th>To Scheme Name / Option</th>
                                    <th>Folio</th>
                                    <th>Execution Date</th>
                                    <th>Transaction Units/Amount</th>
                                    <th>Approval Status</th>
                                    <th>Links</th>
                                    {canModifyTransactions && <th>Actions</th>}
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody className=' bg-[#ECF9FF] text-black '>
                                  {
                                    item.transactionFractions?.map((fractionItem, fracIndex) =>
                                      <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                        {/* <td><IoIosArrowForward className=' text-lg' /></td> */}
                                        <td className=''></td>
                                        <td className=''>
                                          <span className=' px-3 py-2 rounded-3xl font-medium'
                                            style={{
                                              backgroundColor: color.find((color) => color.type === fractionItem.status)?.bgcolor || 'rgb(240, 240, 240)',
                                              color: color.find((color) => color.type === fractionItem.status)?.color || 'rgb(120 120 120)'
                                            }}
                                          >{index + 1}.{fracIndex + 1}</span>
                                        </td>
                                        <td>{item.investorName}</td>
                                        <td>{item.fromSchemeName} / {item.fromSchemeOption}</td>
                                        <td>{item.schemeName} / {item.schemeOption}</td>
                                        <td>
                                          <input
                                            className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.folioNumber}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => dispatch(updateSwitchFractionFolio({ index, fracIndex, folioNumber: e.target.value }))} />
                                        </td>

                                        <td className='relative'>
                                          <label
                                            htmlFor={`transactionDate-${item._id}-${fracIndex}`}
                                            className={`focus-within:bg-blue-100 p-1 px-2 border rounded-md text-center ${['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked' ? '' : 'hover:bg-blue-100'}`}>
                                            {formatDate(fractionItem.transactionDate)}
                                          </label>
                                          <input
                                            type="date"
                                            id={`transactionDate-${item._id}-${fracIndex}`}
                                            min={currentDate}
                                            className='text-xs absolute left-0 -z-10'
                                            value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                            required
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onFocus={(e) => e.target.showPicker()}
                                            onChange={(e) => { dispatch(updateSwitchTransactionDate({ index, fracIndex, value: e.target.value })) }}
                                          />
                                        </td>

                                        <td>
                                          <span className='text-xs text-gray-600 px-1 bg-blue-100 rounded'>
                                            {unitsMap[item.transactionUnits?.toLowerCase()]}
                                          </span>
                                          <input
                                            className='ms-2 w-28 text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded disabled:bg-transparent disabled:border-none'
                                            value={fractionItem.fractionAmount}
                                            type='text'
                                            disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                            onChange={(e) => handleSwitchAmountChange(e, index, fracIndex)} placeholder='Enter amount....' />
                                        </td>
                                        <td>
                                          {fractionItem.approvalStatus === 'Approved' ?
                                            <span>Approved</span> :
                                            <select
                                            name="approval-status"
                                            className='disabled:bg-blue-50 py-2'
                                            disabled={!canModifyTransactions || item.linkStatus === 'locked' || ['deleted'].includes(fractionItem.linkStatus)}
                                            value={fractionItem.approvalStatus}
                                            onChange={(e) => {
                                              const value = e.target.value
                                              // if (!value) return
                                              dispatch(updateSwitchFractionApprovalStatus({ index, fracIndex, approvalStatus: value }))
                                            }}>
                                            {approvalStatusOptions.map(statusOption => (
                                              <option key={statusOption} value={statusOption}>{statusOption || 'Select'}</option>
                                            ))}
                                          </select>}
                                        </td>

                                        <td>{fractionItem.linkStatus === 'generated' ?
                                          <div className='bg-green-200 text-sm text-green-700 rounded-full px-2 w-fit py-[2px] flex items-center gap-1'><IoCheckmarkCircleOutline /> Approved</div> :
                                          <button disabled={!canModifyTransactions || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked' || ['RM Declined', 'Client Declined'].includes(fractionItem.approvalStatus)}
                                            className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'
                                            onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id, fractionItem.approvalStatus) }}>Approve</button>
                                        }</td>

                                        {canModifyTransactions && <td>
                                          {fractionItem.linkStatus === 'generated' ?
                                            <Dropdown
                                              toggleButton={<span className='p-2 rounded-full ms-2 hover:ring-2 focus:ring-2'><IoEllipsisVerticalSharp /></span>}>
                                              <div className='flex flex-col py-2'>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => handleCancelSwitchFraction(index, fracIndex)}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Delete
                                                </button>
                                                <button
                                                  disabled={item.linkStatus === 'locked'}
                                                  onClick={() => { setTransactionForOrderId({ id: item._id, fractionId: fractionItem._id, orderId: fractionItem.orderId, platform: fractionItem.orderPlatform }); setIsOrderIdModalOpen(true) }}
                                                  className='hover:bg-gray-100 p-2 disabled:cursor-not-allowed'>Update Order ID
                                                </button>

                                              </div>
                                            </Dropdown> :
                                            fractionItem.linkStatus === 'deleted' ?
                                              <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                              <button
                                                title='Remove'
                                                disabled={item.linkStatus === 'locked'}
                                                onClick={() => handleRemoveSwitchFraction(index, fracIndex)}
                                                className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                              ><IoMdClose /></button>
                                          }
                                        </td>}
                                        <td>
                                          <NoteDropdown existingNote={fractionItem.note} handleProceed={(note) => handleNoteUpdate(item._id, note, fractionItem._id)} status={noteUpdateStatus} />
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>}
                      </Fragment>
                    })
                }

              </tbody>
            </table>
          </div>
        </div>}

      </div>}

      <div style={errorAlert ? { top: "0", transition: "0.6s" } : { top: "-100vw", transition: "0.6s" }} className=' w-full  absolute top-0 z-50 flex justify-center py-5 '  >
        <span className=' flex items-center gap-5 text-[#E33225] rounded-md py-3 px-4 bg-[#FCEDEB] border-2 border-solid border-[#E33225] '>
          <p>Please type a valid amount</p>
          <button onClick={() => setErrorAlert(false)}><MdClose /></button>
        </span>
      </div>
      <GenerateLinkModal
        isOpen={isModalOpen}
        title={"Generate Transaction Link"}
        handleProceed={handleProceed}
        handleCancel={handleCancelModal}
        status={linkGenerateStatus}
        transaction={transactionForLink}
      />
      <UpdateOrderIdModal
        isOpen={isOrderIdModalOpen}
        handleProceed={handleUpdateOrderId}
        handleCancel={handleCancelOrderIdModal}
        existingData={transactionForOrderId}
        status={orderIdStatus}
      />
      <Toaster />
    </div>
  )
}

export default Details