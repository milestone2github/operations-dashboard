import React, { Fragment, useEffect, useState } from 'react'
import { RiMenu3Line } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo.png'
import { color } from '../Statuscolor/color';
import { IoIosArrowForward } from "react-icons/io";
import { MdClose } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { getPurchRedemp, getSystematic, getSwitch } from '../redux/transactions/TransactionsAction';
import {
  addFraction as systematicAddFraction,
  removeFraction as removeSystematicFraction,
  updateFractionAmount as updateSystematicFractionAmount,
} from '../redux/transactions/SystematicSlice';
import {
  addFraction as purchRedAddFraction,
  removeFraction as RemovePurchRedFraction,
  updateFractionAmount as updatePurchRedFractionAmount
} from '../redux/transactions/PurchRedempSlice'
import {
  addFraction as switchAddFraction,
  removeFraction as RemoveSwitchFraction,
  updateFractionAmount as updateSwitchFractionAmount
} from '../redux/transactions/SwitchSlice'
import { formatDate } from '../utils/formatDate';
import { countPending, extractCommonData } from '../utils/extractCommonData';

const initialCommonData = {
  investorName: '',
  familyHead: '',
  panNumber: '',
  registrantName: '',
  createdAt: '',
  pendingTrxCount: '',
  transactionCount: ''
}

const Details = () => {
  const { sessionId } = useParams()
  const [errorAlert, setErrorAlert] = useState(false)
  const [rowId, setRowId] = useState(null)
  const [commonData, setCommonData] = useState(initialCommonData)

  const dispatch = useDispatch()
  const { userdata } = useSelector((state) => state.auth)
  const {
    transactions: systematicTransactions,
    isLoading: sysLoading,
    error: sysError
  } = useSelector((state) => state.systematic)

  const {
    transactions: purchRedempTransactions,
    isLoading: purchRedempLoading,
    error: purchRedempError
  } = useSelector((state) => state.purchRedemp)

  const {
    transactions: switchTransactions,
    isLoading: switchLoading,
    error: switchError
  } = useSelector((state) => state.switch)

  // side effect to make api calls to get data 
  useEffect(() => {
    dispatch(getSystematic(sessionId))
    dispatch(getPurchRedemp(sessionId))
    dispatch(getSwitch(sessionId))
  }, [sessionId])

  // side effects to handle fetch errors 
  useEffect(() => {
    if (sysError) { toast.error(sysError) }
  }, [sysError])

  useEffect(() => {
    if (purchRedempError) { toast.error(purchRedempError) }
  }, [purchRedempError])

  useEffect(() => {
    if (switchError) { toast.error(switchError) }
  }, [switchError])
  

  // extract common data 
  useEffect(() => {
    // if (!commonData.panNumber) {
    console.log('extracting...') //test
      if (purchRedempTransactions.length) {
        setCommonData(extractCommonData(purchRedempTransactions[0]))
      }
      else if (systematicTransactions.length) {
        setCommonData(extractCommonData(systematicTransactions[0]))
      }
      else if (switchTransactions.length) {
        setCommonData(extractCommonData(switchTransactions[0]))
      }
    // }

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
  const handleSysAmountChange = (e, index, fracIndex) => {
    dispatch(updateSystematicFractionAmount({ index, fracIndex, amount: Number(e.target.value) }))
  }

  const handlePurchRedAmountChange = (e, index, fracIndex) => {
    dispatch(updatePurchRedFractionAmount({ index, fracIndex, amount: Number(e.target.value) }))
  }

  const handleSwitchAmountChange = (e, index, fracIndex) => {
    dispatch(updateSwitchFractionAmount({ index, fracIndex, amount: Number(e.target.value) }))
  }


  // HANDLERS TO ADD FRACTIONS 
  // function to add fraction in systematic transactions  
  const handleSystematicAdd = (index) => {
    let transaction = systematicTransactions[index]
    // let originalAmount = transaction.sip_swp_stpAmount

    // if (!transaction.transactionFractions.length) {
    //   dispatch(systematicAddFraction({ index, amount: originalAmount / 2, status: 'PENDING' }))
    //   dispatch(systematicAddFraction({ index, amount: originalAmount / 2, status: 'PENDING' }))
    // }
    // else {
    //   let fractionsSum = transaction.transactionFractions.reduce((accumulator, item) => (
    //     accumulator + item.fractionAmount
    //   ), 0)

    //   dispatch(systematicAddFraction({
    //     index,
    //     amount: originalAmount - fractionsSum > 0 ? originalAmount - fractionsSum : 0,
    //     status: 'PENDING'
    //   }))
    // }

    if (!transaction.transactionFractions.length) {
      dispatch(systematicAddFraction({ index, amount: 0, status: 'PENDING' }))
      dispatch(systematicAddFraction({ index, amount: 0, status: 'PENDING' }))
    }
    else {
      dispatch(systematicAddFraction({ index, amount: 0, status: 'PENDING' }))
    }
  }

  // function to add fraction in purchase/redemption transactions 
  const handlePurchRedempAdd = (index) => {
    let transaction = purchRedempTransactions[index]
    if (!transaction.transactionFractions.length) {
      dispatch(purchRedAddFraction({ index, amount: 0, status: 'PENDING' }))
      dispatch(purchRedAddFraction({ index, amount: 0, status: 'PENDING' }))
    }
    else {
      dispatch(purchRedAddFraction({ index, amount: 0, status: 'PENDING' }))
    }
  }

  // function to add fraction in switch transactions 
  const handleSwitchAdd = (index) => {
    let transaction = switchTransactions[index]
    if (!transaction.transactionFractions.length) {
      dispatch(switchAddFraction({ index, amount: 0, status: 'PENDING' }))
      dispatch(switchAddFraction({ index, amount: 0, status: 'PENDING' }))
    }
    else {
      dispatch(switchAddFraction({ index, amount: 0, status: 'PENDING' }))
    }
  }

  // HANDLERS TO REMOVE FRACTIONS 
  // function to remove fraction from systematic transactions 
  const handleDeleteSystematic = (index, fracIndex) => {
    let fractions = systematicTransactions[index].transactionFractions

    if (fractions.length > 2)
      dispatch(removeSystematicFraction({ index, fracIndex }))
    else {
      dispatch(removeSystematicFraction({ index, fracIndex: 0 }))
      dispatch(removeSystematicFraction({ index, fracIndex: 0 }))
    }
  }

  // function to remove fraction from purchase/redemption transactions
  const handleDeletePurchRedemp = (index, fracIndex) => {
    let fractions = purchRedempTransactions[index].transactionFractions

    if (fractions.length > 2)
      dispatch(RemovePurchRedFraction({ index, fracIndex }))
    else {
      dispatch(RemovePurchRedFraction({ index, fracIndex: 0 }))
      dispatch(RemovePurchRedFraction({ index, fracIndex: 0 }))
    }
  }

  // function to remove fraction from purchase/redemption transactions
  const handleDeleteSwitch = (index, fracIndex) => {
    let fractions = switchTransactions[index].transactionFractions

    if (fractions.length > 2)
      dispatch(RemoveSwitchFraction({ index, fracIndex }))
    else {
      dispatch(RemoveSwitchFraction({ index, fracIndex: 0 }))
      dispatch(RemoveSwitchFraction({ index, fracIndex: 0 }))
    }
  }

  const handleGenerateLink = (transaction) => {
    console.log('link generated...') //todo
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
            <div>
              <h2 className=' text-xs font-semibold'>Client Name</h2>
              <p className=' text-lg'>{commonData.investorName}</p>
            </div>

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

        {/* ******* SYSTEMATIC TRANSACTIONS TABLE ******* */}
        <div className='inner-section bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>Systematic</h2>
          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Transaction Type</th>
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
                {sysLoading ? showLoading :
                  !systematicTransactions?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Systematic Transactions Found</td></tr> :
                    systematicTransactions.map((item, index) =>
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
                          <td>{item.systematicTraxType}</td>
                          <td>{item.systematicTraxFor}</td>
                          <td>{item.systematicMfAmcName}</td>
                          <td>{item.systematicSchemeName}</td>
                          <td>{item.systematicSchemeOption}</td>
                          <td>{item.systematicFolio}</td>
                          <td>{item.tenureOfSip_swp_stp}</td>
                          <td>{item.firstTransactionAmount}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>{item.firstInstallmentPaymentMode}</td>
                          <td>{item.sip_swp_stpAmount}</td>
                          <td><button className=' text-2xl' onClick={() => {setRowId(item._id); handleSystematicAdd(index)}}>+</button></td>
                          <td>
                            <button disabled={!item.transactionFractions?.length ? false : true} style={
                              !item.transactionFractions?.length ? { cursor: "pointer" } : { cursor: "not-allowed" }
                            } className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white' onClick={handleGenerateLink}>Generate Link</button>
                          </td>
                        </tr>
                        {rowId === item?._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th className=''>S No.</th>
                                <th>Status</th>
                                <th>Transaction Type</th>
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
                                    <td>{item.systematicTraxType}</td>
                                    <td>{item.systematicTraxFor}</td>
                                    <td>{item.systematicMfAmcName}</td>
                                    <td>{item.systematicSchemeName}</td>
                                    <td>{item.systematicSchemeOption}</td>
                                    <td>{item.systematicFolio}</td>
                                    <td>{item.tenureOfSip_swp_stp}</td>
                                    <td>{item.firstTransactionAmount}</td>
                                    <td>{formatDate(item.createdAt)}</td>
                                    <td>{item.firstInstallmentPaymentMode}</td>
                                    <td>
                                      <input
                                        className='text-black border-[2px] border-solid border-white py-2 pl-2 outline-blue-400 rounded'
                                        value={fractionItem.fractionAmount}
                                        type='text'
                                        onChange={(e) => handleSysAmountChange(e, index, fracIndex)} placeholder='Enter amount....' />
                                    </td>
                                    <td>
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.sip_swp_stpAmount ? true : false}
                                        style={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.sip_swp_stpAmount ? { cursor: "not-allowed" } : { cursor: "pointer" }}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white' onClick={() => { console.log('generateLink clicked') }}>Generate Link</button>
                                    </td>
                                    <td>
                                      <button onClick={() => handleDeleteSystematic(index, fracIndex)} className=' tracking-wide bg-red-500 text-white px-4 py-2 rounded-3xl'>Delete</button>
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

        {/* ******* PURCHASE/REDEMPTION TABLE ******** */}
        <div className='inner-section bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>Purchase/Redemption</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
                  <th>Transaction Type</th>
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
                {purchRedempLoading ? showLoading :
                  !purchRedempTransactions?.length ?
                    <tr><td></td><td colSpan={18} className='p-6  text-orange-500 text-lg text-left'>No Purchase/Redemption Transactions Found</td></tr> :
                    purchRedempTransactions.map((item, index) =>
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
                          <td>{item.purch_RedempTraxType}</td>
                          <td>{item.purch_redempMfAmcName}</td>
                          <td>{item.purch_redempSchemeName}</td>
                          <td>{item.purch_redempSchemeOption}</td>
                          <td>{item.purch_redempFolio}</td>
                          <td>{item.purch_redempTransactionUnits_Amount}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.purch_redempTransactionAmount}</td>
                          <td><button className=' text-2xl' onClick={() => {setRowId(item._id); handlePurchRedempAdd(index)}}>+</button></td>
                          <td>
                            <button disabled={!item.transactionFractions?.length ? false : true} style={
                              !item.transactionFractions?.length ? { cursor: "pointer" } : { cursor: "not-allowed" }
                            } className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white' onClick={handleGenerateLink}>Generate Link</button>
                          </td>
                        </tr>
                        {rowId === item._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th>S No.</th>
                                <th>Status</th>
                                <th>Transaction Type</th>
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
                                    <td>{item.purch_RedempTraxType}</td>
                                    <td>{item.purch_redempMfAmcName}</td>
                                    <td>{item.purch_redempSchemeName}</td>
                                    <td>{item.purch_redempSchemeOption}</td>
                                    <td>{item.purch_redempFolio}</td>
                                    <td>{item.purch_redempTransactionUnits_Amount}</td>
                                    <td>{formatDate(item.createdAt)}</td>
                                    <td>{item.paymentMode}</td>
                                    <td>
                                      <input
                                        className=' border-[2px] border-solid border-blue-400  text-black  py-3 pl-2 outline-none rounded-md'
                                        value={fractionItem.fractionAmount}
                                        type='text'
                                        onChange={(e) => handlePurchRedAmountChange(e, index, fracIndex)} placeholder='Enter amount....' />
                                    </td>
                                    <td>
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.firsttransactionamount ? true : false}
                                        style={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.purch_redempTransactionAmount ? { cursor: "not-allowed" } : { cursor: "pointer" }}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white' onClick={() => handleGenerateLink()}>Generate Link</button>
                                    </td>
                                    <td>
                                      <button onClick={() => handleDeletePurchRedemp(index, fracIndex)} className=' tracking-wide bg-red-500 text-white px-4 py-2 rounded-3xl'>Delete</button>
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

        {/* ******* SWTICH TABLE  ******** */}
        <div className='inner-section my-5 bg-white rounded-md w-[90vw] md:w-[87vw]  lg:w-[90vw]  flex flex-col items-end '>
          <h2 className=' text-left sm:text-3xl top-0 p-4 bg-white w-full'>Switch</h2>

          <div className=' w-full overflow-auto p-2'>
            <table className=''>
              <thead className=' rounded-full'>
                <tr className=' whitespace-nowrap '>
                  <th></th>
                  <th>S No.</th>
                  <th>Status</th>
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
                {switchLoading ? showLoading :
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
                          <td>{item.switchMfAmcName}</td>
                          <td>{item.switchFromScheme}</td>
                          <td>{item.switchFromSchemeOption}</td>
                          <td>{item.switchToScheme}</td>
                          <td>{item.switchToSchemeOption}</td>
                          <td>{item.switchFolio}</td>
                          <td>{item.switchTransactionUnits_Amount}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>{item.switchTransactionAmount}</td>
                          <td><button className=' text-2xl' onClick={() => {setRowId(item._id); handleSwitchAdd(index)}}>+</button></td>
                          <td>
                            <button disabled={!item.transactionFractions?.length ? false : true} style={
                              !item.transactionFractions?.length ? { cursor: "pointer" } : { cursor: "not-allowed" }
                            } className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white' onClick={handleGenerateLink}>Generate Link</button>
                          </td>
                        </tr>
                        {rowId === item._id && item.transactionFractions?.length !== 0 && <td colSpan="20" className=' '>
                          <table className='relative '>
                            <thead className=' rounded-full   '>
                              <tr className=' whitespace-nowrap  '>
                                <th></th>
                                <th>S No.</th>
                                <th>Status</th>
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
                                    <td>{item.switchMfAmcName}</td>
                                    <td>{item.switchFromScheme}</td>
                                    <td>{item.switchFromSchemeOption}</td>
                                    <td>{item.switchToScheme}</td>
                                    <td>{item.switchToSchemeOption}</td>
                                    <td>{item.switchFolio}</td>
                                    <td>{item.switchTransactionUnits_Amount}</td>
                                    <td>{formatDate(item.createdAt)}</td>
                                    <td>
                                      <input
                                        className=' border-[2px] border-solid border-blue-400  text-black  py-3 pl-2 outline-none rounded-md'
                                        value={fractionItem.fractionAmount}
                                        type='text'
                                        onChange={(e) => handleSwitchAmountChange(e, index, fracIndex)} placeholder='Enter amount....' />
                                    </td>
                                    <td>
                                      <button disabled={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.firsttransactionamount ? true : false}
                                        style={!fractionItem.fractionAmount || fractionItem.fractionAmount > item.purch_redempTransactionAmount ? { cursor: "not-allowed" } : { cursor: "pointer" }}
                                        className=' bg-blue-600 rounded-3xl px-4 py-2 text-base text-white' onClick={() => handleGenerateLink()}>Generate Link</button>
                                    </td>
                                    <td>
                                      <button onClick={() => handleDeleteSwitch(index, fracIndex)} className=' tracking-wide bg-red-500 text-white px-4 py-2 rounded-3xl'>Delete</button>
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
      <Toaster />
    </div>
  )
}

export default Details