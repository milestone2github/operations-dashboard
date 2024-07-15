import React, { Fragment, useEffect, useState } from 'react'
import { RiMenu3Line } from "react-icons/ri";
import { CiLock } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo.png'
import { color } from '../Statuscolor/color';
import { IoIosArrowForward, IoMdClose } from "react-icons/io";
import { MdClose } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { addFraction, generateLink, getTransactionsBySession, removeFraction, saveFractions } from '../redux/transactions/TransactionsAction';
import {
  systematicAddFraction,
  removeSystematicFraction,
  updateSystematicFractionAmount,
  purchRedAddFraction,
  removePurchRedFraction,
  updatePurchRedFractionAmount,
  switchAddFraction,
  removeSwitchFraction,
  updateSwitchFractionAmount,
  unlockTransaction,
  updateSwitchTransactionDate,
  cancelSwitchFraction
} from '../redux/transactions/TransactionSlice';

import { formatDate, formatDateToYYYYMMDD } from '../utils/formatDate';
import { countPending, extractCommonData } from '../utils/extractCommonData';
import GenerateLinkModal from '../components/GenerateLinkModal';

const initialCommonData = {
  investorName: '',
  familyHead: '',
  panNumber: '',
  registrantName: '',
  createdAt: '',
  pendingTrxCount: '',
  transactionCount: ''
}

const currentDate = formatDateToYYYYMMDD(new Date)

const Details = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  // const { sessionId } = useParams()
  const [errorAlert, setErrorAlert] = useState(false)
  const [rowId, setRowId] = useState(null)
  const [commonData, setCommonData] = useState(initialCommonData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionForLink, setTransactionForLink] = useState({id: '', fractionId: ''})

  const dispatch = useDispatch()
  const { userdata } = useSelector((state) => state.auth)
  const {
    systematicTransactions,
    purchRedempTransactions,
    switchTransactions,
    isLoading,
    error,
    linkGenerated
  } = useSelector((state) => state.sessionalTransactions)

  const [sips, setSips] = useState([])
  const [stps, setStps] = useState([])
  const [swps, setSwps] = useState([])
  const [purchases, setPurchases] = useState([])
  const [redemptions, setRedemptions] = useState([])

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
    let rm = searchParams.get('rm');
    dispatch(getTransactionsBySession({ fh, rm }))
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
      transactionCount: systematicTransactions.length + purchRedempTransactions.length + switchTransactions.length,
      pendingTrxCount: countPending(
        systematicTransactions,
        purchRedempTransactions,
        switchTransactions
      )
    }))

    // return () => {setCommonData(initialCommonData)}
  }, [systematicTransactions, purchRedempTransactions, switchTransactions])

  // amount change handlers 
  // const handleSysAmountChange = (e, index, fracIndex) => {
  //   dispatch(updateSystematicFractionAmount({ index, fracIndex, amount: Number(e.target.value) }))
  // }

  // const handlePurchRedAmountChange = (e, index, fracIndex) => {
  //   dispatch(updatePurchRedFractionAmount({ index, fracIndex, amount: Number(e.target.value) }))
  // }

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
        transactionDate: ''
      }];

      updatedSips[index] = {
        ...updatedSips[index],
        transactionFractions: updatedTransactionFractions
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
        transactionDate: ''
      }];

      updatedStps[index] = {
        ...updatedStps[index],
        transactionFractions: updatedTransactionFractions
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
        transactionDate: ''
      }];

      updatedSwps[index] = {
        ...updatedSwps[index],
        transactionFractions: updatedTransactionFractions
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
        transactionDate: ''
      }];
      updatedPurchases[index] = {
        ...updatedPurchases[index],
        transactionFractions: updatedTransactionFractions
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
        transactionDate: ''
      }];
      updatedRedemptions[index] = {
        ...updatedRedemptions[index],
        transactionFractions: updatedTransactionFractions
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
      updatedFractions[fracIndex] = {...updatedFractions[fracIndex], linkStatus: 'deleted'}
      
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
      updatedFractions[fracIndex] = {...updatedFractions[fracIndex], linkStatus: 'deleted'}
      
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
      updatedFractions[fracIndex] = {...updatedFractions[fracIndex], linkStatus: 'deleted'}
      
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
      updatedFractions[fracIndex] = {...updatedFractions[fracIndex], linkStatus: 'deleted'}
      
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
      updatedFractions[fracIndex] = {...updatedFractions[fracIndex], linkStatus: 'deleted'}
      
      updatedState[index] = {
        ...updatedState[index], 
        transactionFractions: updatedFractions
      }
      return updatedState
    })
  }

  const handleCancelSwitchFraction = (index, fracIndex) => {
    dispatch(cancelSwitchFraction({index, fracIndex}))
  }

  const handleGenerateLink = (id) => {
    setIsModalOpen(true)
    setTransactionForLink({id})
    // dispatch(generateLink({ id }))
    console.log('link generated...') //todo
  }

  const handleGenerateLinkOfFraction = (id, fractionId) => {
    setIsModalOpen(true)
    setTransactionForLink({ id, fractionId })
    // dispatch(generateLink({ id, fractionId }))
    console.log('link generated...') //todo
  }

  const handleProceed = (platform, orderId) => {
    dispatch(generateLink({...transactionForLink, platform, orderId}))
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
    setTransactionForLink({id: '', fractionId: ''})
  }

  useEffect(() => {
    if(linkGenerated === 'completed') {
      handleCancelModal()
      toast.success('Generated')
    }
  }, [linkGenerated])

  // const handleRemoveFraction = (id, fractionId) => {
  //   dispatch(removeFraction({ id, fractionId }))
  // }

  const handleSaveFractions = (item) => {
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

  const showLoading = <tr>
    <td colSpan={7} className='p-[11px]'><Loader /></td>
  </tr>

  return (
    <div className='home-section w-full h-[100vh] relative'>
      <div className="first-section sticky top-0 z-40 bg-white flex justify-between items-center h-[12vh] px-3 ">
        <div className=' flex gap-1'>
          <button className='md:hidden' onClick={() => dispatch({
            type: "togglenavtab",
            payload: "0"
          })}>
            <RiMenu3Line className=' text-2xl font-semibold' />
          </button>
          <h1 className=' md:text-3xl  font-medium'>Transaction Details</h1>
        </div>
        <div className=' flex flex-col items-end gap-2'>
          <img src={logo} alt="" className=' w-32' />
          {userdata && <p>Welcome , {userdata.name}</p>}
        </div>
      </div>
      <div className="table-section  bg-[#F8FAFC] p-3 flex flex-col items-center gap-4 overflow-y-auto h-[88vh]">
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
              <p className=' text-lg'>{commonData.registrantName}</p>
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
        <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>SIP</h2>
          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Investor Name</th>
                  {/* <th>Transaction Type</th> */}
                  <th>Transaction For</th>
                  <th>MF (AMC) Name</th>
                  <th>Scheme Name</th>
                  <th>Scheme Option</th>
                  <th>Folio</th>
                  <th>Tenure of SIP</th>
                  <th>First Transaction Amount</th>
                  <th>SIP Date</th>
                  <th>First Installment Payment Mode</th>
                  <th>SIP Amount</th>
                  <th>Action</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !sips?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No SIP Transactions Found</td></tr> :
                    sips.map((item, index) =>
                      <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td><button onClick={rowId === item._id ? () => setRowId(null) : () => setRowId(item._id)}>
                            <IoIosArrowForward style={rowId === item._id ? { transform: "rotate(90deg)", transition: "0.2s" } : { transform: " rotate(0deg)", transition: "0.2s" }} className=' text-lg' />

                          </button></td>
                          <td className=''>{index + 1}</td>
                          <td><span className=' px-3 py-2 rounded-3xl font-medium text-xs'
                            style={{
                              backgroundColor: color.find((color) => color.type === item.status).bgcolor,
                              color: color.find((color) => color.type === item.status).color
                            }}
                          >{color.find((color) => color.type === item.status).value}</span></td>
                          <td>{item.investorName}</td>
                          {/* <td>{item.transactionType}</td> */}
                          <td>{item.transactionFor}</td>
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.tenure}</td>
                          <td>{item.firstTransactionAmount}</td>
                          <td>{formatDate(item.transactionPreference)}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>{['generated', 'locked'].includes(item.linkStatus) ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={item.linkStatus === 'generated'} className='hover:border hover:border-gray-400 disabled:hover:border-none disabled:text-gray-500 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                              <CiLock />
                            </button>
                            : <button className=' text-2xl border px-2 py-1 rounded-md' onClick={() => { setRowId(item._id); handleAddSipsFraction(index) }}>+</button>}</td>
                          <td>
                            {!item.transactionFractions?.length ? <button
                              disabled={item.linkStatus === 'generated'}
                              className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-green-500 disabled:cursor-not-allowed'
                              onClick={() => handleGenerateLink(item._id)}
                            >{item.linkStatus === 'generated' ? 'Generated' : 'Generate Link'}</button>
                              : <button
                                disabled={item.transactionFractions?.length < 2 || item.linkStatus === 'locked'}
                                className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                        </tr>
                        {rowId === item?._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th className=''>S No.</th>
                                <th>Status</th>
                                <th>Investor Name</th>
                                {/* <th>Transaction Type</th> */}
                                <th>Transaction For</th>
                                <th>MF (AMC) Name</th>
                                <th>Scheme Name</th>
                                <th>Scheme Option</th>
                                <th>Folio</th>
                                <th>Tenure of SIP</th>
                                <th>First Transaction Amount</th>
                                <th>SIP Date</th>
                                <th>First Installment Payment Mode</th>
                                <th>SIP Amount</th>
                                <th>Link</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody className=' bg-[#ECF9FF] text-black '>
                              {
                                item.transactionFractions?.map((fractionItem, fracIndex) =>
                                  <tr key={fracIndex} className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                    <td className=''></td>
                                    <td className=''>{index + 1}.{fracIndex + 1}</td>
                                    <td><span className=' px-3 py-2 rounded-3xl font-medium '
                                      style={{
                                        backgroundColor: color.find((color) => color.type === fractionItem.status).bgcolor,
                                        color: color.find((color) => color.type === fractionItem.status).color
                                      }}
                                    >{color.find((color) => color.type === fractionItem.status).value}</span></td>
                                    <td>{item.investorName}</td>
                                    {/* <td>{item.transactionType}</td> */}
                                    <td>{item.transactionFor}</td>
                                    <td>{item.amcName}</td>
                                    <td>{item.schemeName}</td>
                                    <td>{item.schemeOption}</td>
                                    <td>{item.folioNumber}</td>
                                    <td>{item.tenure}</td>
                                    <td>{item.firstTransactionAmount}</td>
                                    <td>{
                                      <input
                                        type="date"
                                        name="transactionDate"
                                        min={currentDate}
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                        required
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

                                    }</td>
                                    <td>{item.paymentMode}</td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
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
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked'}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id) }}>Generate Link</button>
                                    </td>
                                    <td>
                                      {fractionItem.linkStatus === 'generated' ? <button disabled={item.linkStatus === 'locked'} onClick={() => handleCancelSipsFraction(index, fracIndex)} className=' tracking-wide bg-orange-400 text-white px-4 py-2 rounded-3xl disabled:cursor-not-allowed disabled:bg-orange-300'>Delete</button> :
                                        fractionItem.linkStatus === 'deleted' ?
                                          <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                          <button
                                            title='Remove'
                                            disabled={item.linkStatus === 'locked'}
                                            onClick={() => handleRemoveSipsFraction(index, fracIndex)}
                                            className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                          ><IoMdClose /></button>
                                      }
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </table>
                        </td>}
                      </Fragment>
                    )
                }

              </tbody>
            </table>
          </div>
        </div>

        {/* ******* STP or Capital Appreciation STP TRANSACTIONS TABLE ******* */}
        <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>STP</h2>
          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Investor Name</th>
                  {/* <th>Transaction Type</th> */}
                  <th>Transaction For</th>
                  <th>MF (AMC) Name</th>
                  <th>Scheme Name</th>
                  <th>Scheme Option</th>
                  <th>Folio</th>
                  <th>Tenure of SIP</th>
                  <th>First Transaction Amount</th>
                  <th>SIP Date</th>
                  <th>First Installment Payment Mode</th>
                  <th>SIP Amount</th>
                  <th>Action</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !stps?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No STP Transactions Found</td></tr> :
                    stps.map((item, index) =>
                      <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td><button onClick={rowId === item._id ? () => setRowId(null) : () => setRowId(item._id)}>
                            <IoIosArrowForward style={rowId === item._id ? { transform: "rotate(90deg)", transition: "0.2s" } : { transform: " rotate(0deg)", transition: "0.2s" }} className=' text-lg' />

                          </button></td>
                          <td className=''>{index + 1}</td>
                          <td><span className=' px-3 py-2 rounded-3xl font-medium text-xs'
                            style={{
                              backgroundColor: color.find((color) => color.type === item.status).bgcolor,
                              color: color.find((color) => color.type === item.status).color
                            }}
                          >{color.find((color) => color.type === item.status).value}</span></td>
                          <td>{item.investorName}</td>
                          {/* <td>{item.transactionType}</td> */}
                          <td>{item.transactionFor}</td>
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.tenure}</td>
                          <td>{item.firstTransactionAmount}</td>
                          <td>{formatDate(item.transactionPreference)}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>{['generated', 'locked'].includes(item.linkStatus) ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={item.linkStatus === 'generated'} className='hover:border hover:border-gray-400 disabled:hover:border-none disabled:text-gray-500 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                              <CiLock />
                            </button>
                            : <button className=' text-2xl border px-2 py-1 rounded-md' onClick={() => { setRowId(item._id); handleAddStpsFraction(index) }}>+</button>}</td>
                          <td>
                            {!item.transactionFractions?.length ? <button
                              disabled={item.linkStatus === 'generated'}
                              className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-green-500 disabled:cursor-not-allowed'
                              onClick={() => handleGenerateLink(item._id)}
                            >{item.linkStatus === 'generated' ? 'Generated' : 'Generate Link'}</button>
                              : <button
                                disabled={item.transactionFractions?.length < 2 || item.linkStatus === 'locked'}
                                className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                        </tr>
                        {rowId === item?._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th className=''>S No.</th>
                                <th>Status</th>
                                <th>Investor Name</th>
                                {/* <th>Transaction Type</th> */}
                                <th>Transaction For</th>
                                <th>MF (AMC) Name</th>
                                <th>Scheme Name</th>
                                <th>Scheme Option</th>
                                <th>Folio</th>
                                <th>Tenure of SIP</th>
                                <th>First Transaction Amount</th>
                                <th>SIP Date</th>
                                <th>First Installment Payment Mode</th>
                                <th>SIP Amount</th>
                                <th>Link</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody className=' bg-[#ECF9FF] text-black '>
                              {
                                item.transactionFractions?.map((fractionItem, fracIndex) =>
                                  <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                    <td className=''></td>
                                    <td className=''>{index + 1}.{fracIndex + 1}</td>
                                    <td><span className=' px-3 py-2 rounded-3xl font-medium '
                                      style={{
                                        backgroundColor: color.find((color) => color.type === fractionItem.status).bgcolor,
                                        color: color.find((color) => color.type === fractionItem.status).color
                                      }}
                                    >{color.find((color) => color.type === fractionItem.status).value}</span></td>
                                    <td>{item.investorName}</td>
                                    {/* <td>{item.transactionType}</td> */}
                                    <td>{item.transactionFor}</td>
                                    <td>{item.amcName}</td>
                                    <td>{item.schemeName}</td>
                                    <td>{item.schemeOption}</td>
                                    <td>{item.folioNumber}</td>
                                    <td>{item.tenure}</td>
                                    <td>{item.firstTransactionAmount}</td>
                                    <td>{
                                      <input
                                        type="date"
                                        name="transactionDate"
                                        min={currentDate}
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                        required
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

                                    }</td>
                                    <td>{item.paymentMode}</td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
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
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked'}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id) }}>Generate Link</button>
                                    </td>
                                    <td>
                                      {fractionItem.linkStatus === 'generated' ? <button disabled={item.linkStatus === 'locked'} onClick={() => handleCancelStpsFraction(index, fracIndex)} className=' tracking-wide bg-orange-400 text-white px-4 py-2 rounded-3xl disabled:cursor-not-allowed disabled:bg-orange-300'>Delete</button> :
                                        fractionItem.linkStatus === 'deleted' ?
                                          <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                          <button
                                            title='Remove'
                                            disabled={item.linkStatus === 'locked'}
                                            onClick={() => handleRemoveStpsFraction(index, fracIndex)}
                                            className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                          ><IoMdClose /></button>
                                      }
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </table>
                        </td>}
                      </Fragment>
                    )
                }

              </tbody>
            </table>
          </div>
        </div>

        {/* ******* SWP or Capital Appreciation SWP TRANSACTIONS TABLE ******* */}
        <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>SWP</h2>
          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Investor Name</th>
                  {/* <th>Transaction Type</th> */}
                  <th>Transaction For</th>
                  <th>MF (AMC) Name</th>
                  <th>Scheme Name</th>
                  <th>Scheme Option</th>
                  <th>Folio</th>
                  <th>Tenure of SIP</th>
                  <th>First Transaction Amount</th>
                  <th>SIP Date</th>
                  <th>First Installment Payment Mode</th>
                  <th>SIP Amount</th>
                  <th>Action</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !swps?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No SWP Transactions Found</td></tr> :
                    swps.map((item, index) =>
                      <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td><button onClick={rowId === item._id ? () => setRowId(null) : () => setRowId(item._id)}>
                            <IoIosArrowForward style={rowId === item._id ? { transform: "rotate(90deg)", transition: "0.2s" } : { transform: " rotate(0deg)", transition: "0.2s" }} className=' text-lg' />

                          </button></td>
                          <td className=''>{index + 1}</td>
                          <td><span className=' px-3 py-2 rounded-3xl font-medium text-xs'
                            style={{
                              backgroundColor: color.find((color) => color.type === item.status).bgcolor,
                              color: color.find((color) => color.type === item.status).color
                            }}
                          >{color.find((color) => color.type === item.status).value}</span></td>
                          <td>{item.investorName}</td>
                          {/* <td>{item.transactionType}</td> */}
                          <td>{item.transactionFor}</td>
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.tenure}</td>
                          <td>{item.firstTransactionAmount}</td>
                          <td>{formatDate(item.transactionPreference)}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>{['generated', 'locked'].includes(item.linkStatus) ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={item.linkStatus === 'generated'} className='hover:border hover:border-gray-400 disabled:hover:border-none disabled:text-gray-500 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                              <CiLock />
                            </button>
                            : <button className=' text-2xl border px-2 py-1 rounded-md' onClick={() => { setRowId(item._id); handleAddSwpsFraction(index) }}>+</button>}</td>
                          <td>
                            {!item.transactionFractions?.length ? <button
                              disabled={item.linkStatus === 'generated'}
                              className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-green-500 disabled:cursor-not-allowed'
                              onClick={() => handleGenerateLink(item._id)}
                            >{item.linkStatus === 'generated' ? 'Generated' : 'Generate Link'}</button>
                              : <button
                                disabled={item.transactionFractions?.length < 2 || item.linkStatus === 'locked'}
                                className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                        </tr>
                        {rowId === item?._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th className=''>S No.</th>
                                <th>Status</th>
                                <th>Investor Name</th>
                                {/* <th>Transaction Type</th> */}
                                <th>Transaction For</th>
                                <th>MF (AMC) Name</th>
                                <th>Scheme Name</th>
                                <th>Scheme Option</th>
                                <th>Folio</th>
                                <th>Tenure of SIP</th>
                                <th>First Transaction Amount</th>
                                <th>SIP Date</th>
                                <th>First Installment Payment Mode</th>
                                <th>SIP Amount</th>
                                <th>Link</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody className=' bg-[#ECF9FF] text-black '>
                              {
                                item.transactionFractions?.map((fractionItem, fracIndex) =>
                                  <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                    <td className=''></td>
                                    <td className=''>{index + 1}.{fracIndex + 1}</td>
                                    <td><span className=' px-3 py-2 rounded-3xl font-medium '
                                      style={{
                                        backgroundColor: color.find((color) => color.type === fractionItem.status).bgcolor,
                                        color: color.find((color) => color.type === fractionItem.status).color
                                      }}
                                    >{color.find((color) => color.type === fractionItem.status).value}</span></td>
                                    <td>{item.investorName}</td>
                                    {/* <td>{item.transactionType}</td> */}
                                    <td>{item.transactionFor}</td>
                                    <td>{item.amcName}</td>
                                    <td>{item.schemeName}</td>
                                    <td>{item.schemeOption}</td>
                                    <td>{item.folioNumber}</td>
                                    <td>{item.tenure}</td>
                                    <td>{item.firstTransactionAmount}</td>
                                    <td>{
                                      <input
                                        type="date"
                                        name="transactionDate"
                                        min={currentDate}
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                        required
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

                                    }</td>
                                    <td>{item.paymentMode}</td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
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
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked'}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id) }}>Generate Link</button>
                                    </td>
                                    <td>
                                      {fractionItem.linkStatus === 'generated' ? <button disabled={item.linkStatus === 'locked'} onClick={() => handleCancelSwpsFraction(index, fracIndex)} className=' tracking-wide bg-orange-400 text-white px-4 py-2 rounded-3xl disabled:cursor-not-allowed disabled:bg-orange-300'>Delete</button> :
                                        fractionItem.linkStatus === 'deleted' ?
                                          <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                          <button
                                            title='Remove'
                                            disabled={item.linkStatus === 'locked'}
                                            onClick={() => handleRemoveSwpsFraction(index, fracIndex)}
                                            className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                          ><IoMdClose /></button>
                                      }
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </table>
                        </td>}
                      </Fragment>
                    )
                }

              </tbody>
            </table>
          </div>
        </div>

        {/* ******* PURCHASE TABLE ******** */}
        <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>Purchase</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Investor Name</th>
                  {/* <th>Transaction Type</th> */}
                  <th>MF (AMC) Name</th>
                  <th>Scheme Name</th>
                  <th>Scheme Option</th>
                  <th>Folio</th>
                  <th>Transaction Units/Amount</th>
                  <th>Purchase/Redemption Date</th>
                  <th>Payment Mode</th>
                  <th>Transaction Amount</th>
                  <th>Action</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !purchases?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Purchase Transactions Found</td></tr> :
                    purchases.map((item, index) =>
                      <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td><button onClick={rowId === item._id ? () => setRowId(null) : () => setRowId(item._id)}>
                            <IoIosArrowForward style={rowId === item._id ? { transform: "rotate(90deg)", transition: "0.2s" } : { transform: " rotate(0deg)", transition: "0.2s" }} className=' text-lg' />

                          </button></td>
                          <td className=''>{index + 1}</td>
                          <td><span className=' px-3 py-2 rounded-3xl font-medium'
                            style={{
                              backgroundColor: color.find((color) => color.type === item.status).bgcolor,
                              color: color.find((color) => color.type === item.status).color
                            }}
                          >{color.find((color) => color.type === item.status).value}</span></td>
                          <td>{item.investorName}</td>
                          {/* <td>{item.transactionType}</td> */}
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.transactionUnits}</td>
                          <td>{formatDate(item.transactionPreference)}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>{['generated', 'locked'].includes(item.linkStatus) ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={item.linkStatus === 'generated'} className='hover:border hover:border-gray-400 disabled:hover:border-none disabled:text-gray-500 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                              <CiLock />
                            </button>
                            : <button className=' text-2xl border px-2 py-1 rounded-md' onClick={() => { setRowId(item._id); handleAddPurchasesFraction(index) }}>+</button>}</td>
                          <td>
                            {!item.transactionFractions?.length ? <button
                              disabled={item.linkStatus === 'generated'}
                              className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-green-500 disabled:cursor-not-allowed'
                              onClick={() => handleGenerateLink(item._id)}
                            >{item.linkStatus === 'generated' ? 'Generated' : 'Generate Link'}</button>
                              : <button
                                disabled={item.transactionFractions?.length < 2 || item.linkStatus === 'locked'}
                                className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                        </tr>
                        {rowId === item._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th>S No.</th>
                                <th>Status</th>
                                <th>Investor Name</th>
                                {/* <th>Transaction Type</th> */}
                                <th>MF (AMC) Name</th>
                                <th>Scheme Name</th>
                                <th>Scheme Option</th>
                                <th>Folio</th>
                                <th>Transaction Units/Amount</th>
                                <th>Purchase/Redemption Date</th>
                                <th>Payment Mode</th>
                                <th>Transaction Amount</th>
                                <th>Link</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody className=' bg-[#ECF9FF] text-black '>
                              {
                                item.transactionFractions?.map((fractionItem, fracIndex) =>
                                  <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                    {/* <td><IoIosArrowForward className=' text-lg' /></td> */}
                                    <td className=''></td>
                                    <td className=''>{index + 1}.{fracIndex + 1}</td>
                                    <td><span className=' px-3 py-2 rounded-3xl font-medium'
                                      style={{
                                        backgroundColor: color.find((color) => color.type === fractionItem.status).bgcolor,
                                        color: color.find((color) => color.type === fractionItem.status).color
                                      }}
                                    >{color.find((color) => color.type === fractionItem.status).value}</span></td>
                                    <td>{item.investorName}</td>
                                    {/* <td>{item.transactionType}</td> */}
                                    <td>{item.amcName}</td>
                                    <td>{item.schemeName}</td>
                                    <td>{item.schemeOption}</td>
                                    <td>{item.folioNumber}</td>
                                    <td>{item.transactionUnits}</td>
                                    <td>{
                                      <input
                                        type="date"
                                        name="transactionDate"
                                        min={currentDate}
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                        required
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

                                    }</td>
                                    <td>{item.paymentMode}</td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
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
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked'}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id) }}>Generate Link</button>
                                    </td>
                                    <td>
                                      {fractionItem.linkStatus === 'generated' ? <button disabled={item.linkStatus === 'locked'} onClick={() => handleCancelPurchasesFraction(index, fracIndex)} className=' tracking-wide bg-orange-400 text-white px-4 py-2 rounded-3xl disabled:cursor-not-allowed disabled:bg-orange-300'>Delete</button> :
                                        fractionItem.linkStatus === 'deleted' ?
                                          <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                          <button
                                            title='Remove'
                                            disabled={item.linkStatus === 'locked'}
                                            onClick={() => handleRemovePurchasesFraction(index, fracIndex)}
                                            className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                          ><IoMdClose /></button>
                                      }
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </table>
                        </td>}
                      </Fragment>
                    )
                }

              </tbody>
            </table>
          </div>
        </div>

        {/* ******* REDEMPTION  TABLE ******** */}
        <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>Redemption</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Investor Name</th>
                  {/* <th>Transaction Type</th> */}
                  <th>MF (AMC) Name</th>
                  <th>Scheme Name</th>
                  <th>Scheme Option</th>
                  <th>Folio</th>
                  <th>Transaction Units/Amount</th>
                  <th>Purchase/Redemption Date</th>
                  <th>Payment Mode</th>
                  <th>Transaction Amount</th>
                  <th>Action</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !redemptions?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Redemption Transactions Found</td></tr> :
                    redemptions.map((item, index) =>
                      <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td><button onClick={rowId === item._id ? () => setRowId(null) : () => setRowId(item._id)}>
                            <IoIosArrowForward style={rowId === item._id ? { transform: "rotate(90deg)", transition: "0.2s" } : { transform: " rotate(0deg)", transition: "0.2s" }} className=' text-lg' />

                          </button></td>
                          <td className=''>{index + 1}</td>
                          <td><span className=' px-3 py-2 rounded-3xl font-medium'
                            style={{
                              backgroundColor: color.find((color) => color.type === item.status).bgcolor,
                              color: color.find((color) => color.type === item.status).color
                            }}
                          >{color.find((color) => color.type === item.status).value}</span></td>
                          <td>{item.investorName}</td>
                          {/* <td>{item.transactionType}</td> */}
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.transactionUnits}</td>
                          <td>{formatDate(item.transactionPreference)}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.amount}</td>
                          <td>{['generated', 'locked'].includes(item.linkStatus) ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={item.linkStatus === 'generated'} className='hover:border hover:border-gray-400 disabled:hover:border-none disabled:text-gray-500 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                              <CiLock />
                            </button>
                            : <button className=' text-2xl border px-2 py-1 rounded-md' onClick={() => { setRowId(item._id); handleAddRedemptionsFraction(index) }}>+</button>}</td>
                          <td>
                            {!item.transactionFractions?.length ? <button
                              disabled={item.linkStatus === 'generated'}
                              className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-green-500 disabled:cursor-not-allowed'
                              onClick={() => handleGenerateLink(item._id)}
                            >{item.linkStatus === 'generated' ? 'Generated' : 'Generate Link'}</button>
                              : <button
                                disabled={item.transactionFractions?.length < 2 || item.linkStatus === 'locked'}
                                className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                        </tr>
                        {rowId === item._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th>S No.</th>
                                <th>Status</th>
                                <th>Investor Name</th>
                                {/* <th>Transaction Type</th> */}
                                <th>MF (AMC) Name</th>
                                <th>Scheme Name</th>
                                <th>Scheme Option</th>
                                <th>Folio</th>
                                <th>Transaction Units/Amount</th>
                                <th>Purchase/Redemption Date</th>
                                <th>Payment Mode</th>
                                <th>Transaction Amount</th>
                                <th>Link</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody className=' bg-[#ECF9FF] text-black '>
                              {
                                item.transactionFractions?.map((fractionItem, fracIndex) =>
                                  <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                    {/* <td><IoIosArrowForward className=' text-lg' /></td> */}
                                    <td className=''></td>
                                    <td className=''>{index + 1}.{fracIndex + 1}</td>
                                    <td><span className=' px-3 py-2 rounded-3xl font-medium'
                                      style={{
                                        backgroundColor: color.find((color) => color.type === fractionItem.status).bgcolor,
                                        color: color.find((color) => color.type === fractionItem.status).color
                                      }}
                                    >{color.find((color) => color.type === fractionItem.status).value}</span></td>
                                    <td>{item.investorName}</td>
                                    {/* <td>{item.transactionType}</td> */}
                                    <td>{item.amcName}</td>
                                    <td>{item.schemeName}</td>
                                    <td>{item.schemeOption}</td>
                                    <td>{item.folioNumber}</td>
                                    <td>{item.transactionUnits}</td>
                                    <td>{
                                      <input
                                        type="date"
                                        name="transactionDate"
                                        min={currentDate}
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                        required
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

                                    }</td>
                                    <td>{item.paymentMode}</td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
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
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked'}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id) }}>Generate Link</button>
                                    </td>
                                    <td>
                                      {fractionItem.linkStatus === 'generated' ? <button disabled={item.linkStatus === 'locked'} onClick={() => handleCancelRedemptionsFraction(index, fracIndex)} className=' tracking-wide bg-orange-400 text-white px-4 py-2 rounded-3xl disabled:cursor-not-allowed disabled:bg-orange-300'>Delete</button> :
                                        fractionItem.linkStatus === 'deleted' ?
                                          <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                          <button
                                            title='Remove'
                                            disabled={item.linkStatus === 'locked'}
                                            onClick={() => handleRemoveRedemptionsFraction(index, fracIndex)}
                                            className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                          ><IoMdClose /></button>
                                      }
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </table>
                        </td>}
                      </Fragment>
                    )
                }

              </tbody>
            </table>
          </div>
        </div>

        {/* ******* SWITCH TABLE  ******** */}
        <div className='inner-section my-4 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>Switch</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Investor Name</th>
                  <th>MF (AMC) Name</th>
                  <th>From Scheme</th>
                  <th>From Scheme option</th>
                  <th>To Scheme</th>
                  <th>To Scheme option</th>
                  <th>Folio</th>
                  <th>Transaction Units/Amount</th>
                  <th>Switch Date</th>
                  <th>Transaction Amount</th>
                  <th>Action</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? showLoading :
                  !switchTransactions?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Switch Transactions Found</td></tr> :
                    switchTransactions.map((item, index) =>
                      <Fragment key={item._id}>
                        <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                          <td><button onClick={rowId === item._id ? () => setRowId(null) : () => setRowId(item._id)}>
                            <IoIosArrowForward style={rowId === item._id ? { transform: "rotate(90deg)", transition: "0.2s" } : { transform: " rotate(0deg)", transition: "0.2s" }} className=' text-lg' />

                          </button></td>
                          <td className=''>{index + 1}</td>
                          <td><span className=' px-3 py-2 rounded-3xl font-medium'
                            style={{
                              backgroundColor: color.find((color) => color.type === item.status).bgcolor,
                              color: color.find((color) => color.type === item.status).color
                            }}
                          >{color.find((color) => color.type === item.status).value}</span></td>
                          <td>{item.investorName}</td>
                          <td>{item.amcName}</td>
                          <td>{item.fromSchemeName}</td>
                          <td>{item.fromSchemeOption}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.transactionUnits}</td>
                          <td>{formatDate(item.transactionPreference)}</td>
                          <td>{item.amount}</td>
                          <td>{['generated', 'locked'].includes(item.linkStatus) ?
                            <button title='Click to unlock' onClick={() => dispatch(unlockTransaction(item._id))} disabled={item.linkStatus === 'generated'} className='hover:border hover:border-gray-400 disabled:hover:border-none disabled:text-gray-500 disabled:cursor-not-allowed text-2xl p-1 rounded-md'>
                              <CiLock />
                            </button>
                            : <button className=' text-2xl border px-2 py-1 rounded-md' onClick={() => { setRowId(item._id); handleSwitchAdd(index) }}>+</button>}</td>
                          <td>
                            {!item.transactionFractions?.length ? <button
                              disabled={item.linkStatus === 'generated'}
                              className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-green-500 disabled:cursor-not-allowed'
                              onClick={() => handleGenerateLink(item._id)}
                            >{item.linkStatus === 'generated' ? 'Generated' : 'Generate Link'}</button>
                              : <button
                                disabled={item.transactionFractions?.length < 2 || item.linkStatus === 'locked'}
                                className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
                                onClick={() => handleSaveFractions(item)}>Save Fractions</button>}
                          </td>
                        </tr>
                        {rowId === item._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th>S No.</th>
                                <th>Status</th>
                                <th>Investor Name</th>
                                <th>MF (AMC) Name</th>
                                <th>From Scheme</th>
                                <th>From Scheme option</th>
                                <th>To Scheme</th>
                                <th>To Scheme option</th>
                                <th>Folio</th>
                                <th>Transaction Units/Amount</th>
                                <th>Switch Date</th>
                                <th>Transaction Amount</th>
                                <th>Links</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody className=' bg-[#ECF9FF] text-black '>
                              {
                                item.transactionFractions?.map((fractionItem, fracIndex) =>
                                  <tr className=' whitespace-nowrap  border-b-[2px] border-solid border-[#E3EAF4]'>
                                    {/* <td><IoIosArrowForward className=' text-lg' /></td> */}
                                    <td className=''></td>
                                    <td className=''>{index + 1}.{fracIndex + 1}</td>
                                    <td><span className=' px-3 py-2 rounded-3xl font-medium'
                                      style={{
                                        backgroundColor: color.find((color) => color.type === fractionItem.status).bgcolor,
                                        color: color.find((color) => color.type === fractionItem.status).color
                                      }}
                                    >{color.find((color) => color.type === fractionItem.status).value}</span></td>
                                    <td>{item.investorName}</td>
                                    <td>{item.amcName}</td>
                                    <td>{item.fromSchemeName}</td>
                                    <td>{item.fromSchemeOption}</td>
                                    <td>{item.schemeName}</td>
                                    <td>{item.schemeOption}</td>
                                    <td>{item.folioNumber}</td>
                                    <td>{item.transactionUnits}</td>
                                    <td>
                                      <input
                                        type="date"
                                        name="transactionDate"
                                        min={currentDate}
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={formatDateToYYYYMMDD(fractionItem.transactionDate)}
                                        required
                                        disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                        onChange={(e) => { dispatch(updateSwitchTransactionDate({ index, fracIndex, value: e.target.value })) }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={fractionItem.fractionAmount}
                                        type='text'
                                        disabled={['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus === 'locked'}
                                        onChange={(e) => handleSwitchAmountChange(e, index, fracIndex)} placeholder='Enter amount....' />
                                    </td>
                                    <td>
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.amount || ['generated', 'deleted'].includes(fractionItem.linkStatus) || item.linkStatus !== 'locked'}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        onClick={() => { handleGenerateLinkOfFraction(item._id, fractionItem._id) }}>Generate Link</button>
                                    </td>
                                    <td>
                                      {fractionItem.linkStatus === 'generated' ? 
                                        <button 
                                          disabled={item.linkStatus === 'locked'} 
                                          onClick={() => handleCancelSwitchFraction(index, fracIndex)} 
                                          className=' tracking-wide bg-orange-400 text-white px-4 py-2 rounded-3xl disabled:cursor-not-allowed disabled:bg-orange-300'
                                        >Delete</button> :
                                        fractionItem.linkStatus === 'deleted' ?
                                          <span title='Cancelled' className='text-gray-800 bg-gray-300 rounded-3xl px-4 py-2 line-through'>Cancelled</span> :
                                          <button
                                            title='Remove'
                                            disabled={item.linkStatus === 'locked'}
                                            onClick={() => handleRemoveSwitchFraction(index, fracIndex)}
                                            className=' tracking-wide text-gray-600 text-xl border border-gray-300 px-2 py-2 rounded-lg hover:text-gray-700 hover:border-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed '
                                          ><IoMdClose /></button>
                                      }
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </table>
                        </td>}
                      </Fragment>
                    )
                }

              </tbody>
            </table>
          </div>
        </div>

      </div>

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
      />
      <Toaster />
    </div>
  )
}

export default Details