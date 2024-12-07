import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import FiltersBar from "../components/FiltersBar";
import { formatDateDDShortMonthNameYY } from "../utils/formatDate";
import { IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { FaSadTear } from "react-icons/fa";
import Loader from "../components/Loader";
import { useSelector, useDispatch } from "react-redux";
import { approveReconciliation, getRecoTransactions, reconcileTransaction } from "../redux/reconciliation/ReconciliationAction";
import { BsArrowRight } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { getAllAmc, getRMNames } from "../redux/allFilterOptions/FilterOptionsAction";
import UpdateMinorsModal from "../components/UpdateMinorsModal";
import { color } from "../Statuscolor/color";
import { resetErrors } from "../redux/reconciliation/ReconciliationSlice";
import { hasPermission } from "../utils/permission";
import UpdateMajorsModal from "../components/UpdateMojorsModal";

const itemsPerPage = 25; // Number of items to display per page

const initialFilters = {
  minAmount: "",
  maxAmount: "",
  schemeName: "",
  amcName: "",
  rmName: "",
  type: "",
  sort: "trxdate-desc", // Default sort order
  searchBy: 'family head',
  searchKey: ''
};

const filterConfig = {
  amount: true,
  date: true,
  type: true,
  trxFor: false,
  relationshipManager: true,
  serviceManager: false,
  status: false,
  approvalStatus: false,
  saveFilter: false
}

const Reco = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [openDropdown, setOpenDropdown] = useState({});

  const { role } = useSelector(state => state.user.userData?.role)
  const { transactions, status, error, totalCount, totalAmount, page, updateStatus, updateError } = useSelector((state) => state.reconciliation);
  const { amcList, typeList, schemesList, rmNameList, error: listError } = useSelector(state => state.allFilterOptions)
  const dispatch = useDispatch();
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const [isOpenMinorEdit, setIsOpenMinorEdit] = useState(false);
  const [selectedMinor, setSelectedMinor] = useState({});

  const [isOpenMajorEdit, setIsOpenMajorEdit] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState({});

  useEffect(() => {
    dispatch(getAllAmc())
    dispatch(getRMNames())
  }, [])

  const updateFilters = (value) => {
    setFilters(value);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters)
  }

  useEffect(() => {
    dispatch(getRecoTransactions({ filters, items: itemsPerPage }));
  }, [filters, dispatch]);

  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(error)
      setTimeout(() => {
        resetErrors()
      }, 4000);
    }
  }, [status, error])

  useEffect(() => {
    if (updateStatus === 'failed' && updateError) {
      toast.error(updateError)
      setTimeout(() => {
        resetErrors()
      }, 4000);
    }
  }, [updateStatus, updateError])

  const toggleDropdown = (id) => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handlePrev = () => {
    if (page > 1) {
      dispatch(getRecoTransactions({ filters, page: page - 1, items: itemsPerPage }))
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      dispatch(getRecoTransactions({ filters, page: page + 1, items: itemsPerPage }))
    }
  };

  const performReconciliation = (trxId, updates, fractionId) => {
    fractionId ?
      dispatch(reconcileTransaction({ trxId, updates, fractionId })) :
      dispatch(reconcileTransaction({ trxId, updates }));
  }

  // MINOR edit handlers 
  const closeMinorEditModal = () => {
    setSelectedMinor({});
    setIsOpenMinorEdit(false);
  }

  const submitMinorEdit = (updates) => {
    performReconciliation(selectedMinor.trxId, updates, selectedMinor.fractionId);
  }

  // MAJOR edit handlers 
  const closeMajorEditModal = () => {
    setSelectedMajor({});
    setIsOpenMajorEdit(false);
  }

  const submitMajorEdit = (updates) => {
    performReconciliation(selectedMajor.trxId, updates, selectedMajor.fractionId);
  }

  const handleApproveReconciliation = (trxId, status, fractionId) => {
    console.log('approve reco: ', {trxId, status, fractionId}); //debug
    dispatch(approveReconciliation({ trxId, fractionId, approve: 1, status }))
  }

  const showLoading = (
    <tr>
      <td className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader />
      </td>
    </tr>
  );

  const notFound = (
    <tr>
      <td className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 text-lg text-center flex flex-col items-center">
        <FaSadTear className="text-5xl mb-3" />
        <span className="text-gray-700 text-xl font-bold text-center">
          No Transactions Found!
        </span>
      </td>
    </tr>
  );

  return (
    <main className="w-full">
      <div className="sticky top-0 bg-white w-full px-2 md:px-6 z-10">
        <Header title="Reconciliation" />
        <hr className="border-b border-slate-100 w-full" />
        <div className="py-2">
          <FiltersBar
            filters={filters}
            updateFilters={updateFilters}
            clearAllFilters={clearAllFilters}
            filterConfig={filterConfig}
            results={totalCount}
            aum={totalAmount}
            rmNameOptions={rmNameList}
            typeOptions={typeList}
            amcOptions={amcList}
            schemeOptions={schemesList}
          />
        </div>
      </div>

      <section className="px-2 md:px-6 w-full">
        <article className="border max-h-[60vh] bg-gray-50 rounded-md overflow-x-scroll w-full md:w-[calc(100vw-152px)] min-h-[75vh] relative custom-scrollbar">
          <table className="filtered-trx">
            <thead className="bg-blue-50 sticky top-0">
              <tr className="font-medium text-nowrap py-3 text-gray-800">
                <th className="text-sm"></th> {/* Placeholder for dropdown button */}
                <th className="text-sm">S. No.</th>
                <th className="text-sm">Transaction date</th>
                <th className="text-sm">Transaction type</th>
                <th className="text-sm">Pan number</th>
                <th className="text-sm">Investor name</th>
                <th className="text-sm">Family head</th>
                <th className="text-sm">RM name</th>
                <th className="text-sm">AMC name</th>
                <th className="text-sm">Scheme name</th>
                <th className="text-sm">Amount</th>
                <th className="text-sm">Units</th>
                <th className="text-sm">From scheme name</th>
                <th className="text-sm">SM name</th>
                <th className="text-sm">Folio No.</th>
                <th className="text-sm">From scheme option</th>
                <th className="text-sm">Scheme option</th>
                <th className="text-sm">Registrant</th>
                <th className="text-sm">Transaction for</th>
                <th className="text-sm">Payment mode</th>
                <th className="text-sm">First trx amount</th>
                <th className="text-sm">SIP/SWP/STP date</th>
                <th className="text-sm">SIP Pause month</th>
                <th className="text-sm">Tenure of SIP</th>
                <th className="text-sm">Order ID</th>
                <th className="text-sm">Cheque No.</th>
                <th style={{ textAlign: 'center' }} className="text-sm">Actions/Status</th>
                <ApproveColumn role={role} />
              </tr>
            </thead>

            <tbody className="divide-y px-3">
              {status === "pending"
                ? showLoading
                : !transactions.length
                  ? notFound
                  : transactions?.map((item, index) => {
                    const hasFractions =
                      item.transactionFractions &&
                      item.transactionFractions.length > 0;
                    let type = item.category === 'switch' ? 'Switch' : item.transactionType;
                    let status = color.find((colorItem) => colorItem.type === item.status);
                    let reconcileStatus = color.find((colorItem) => colorItem.type === item.reconciliation?.reconcileStatus);

                    return (
                      <React.Fragment key={item._id}>
                        <tr className="text-sm">
                          <td>
                            {hasFractions && (
                              <button className="p-2" onClick={() => toggleDropdown(item._id)}>
                                {openDropdown[item._id] ? (
                                  <IoIosArrowUp />
                                ) : (
                                  <IoIosArrowForward />
                                )}
                              </button>
                            )}
                          </td>
                          <td>{(page - 1) * itemsPerPage + (index + 1)}</td>
                          <td>
                            {formatDateDDShortMonthNameYY(
                              item.transactionPreference
                            )}
                          </td>
                          <td>{type}</td>
                          <td>{item.panNumber}</td>
                          <td>{item.investorName}</td>
                          <td>{item.familyHead}</td>
                          <td>{item.relationshipManager}</td>
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{Number(item.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR'
                          })}</td>
                          <td>{item.transactionUnits}</td>
                          <td>{item.fromSchemeName}</td>
                          <td>{item.serviceManager}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.fromSchemeOption}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.registrantName}</td>
                          <td>{item.transactionFor}</td>
                          <td>{item.paymentMode}</td>
                          <td>{item.firstTransactionAmount}</td>
                          <td>
                            {item.sipSwpStpDate
                              ? formatDateDDShortMonthNameYY(item.sipSwpStpDate)
                              : "N/A"}
                          </td>
                          <td>{item.sipPauseMonths}</td>
                          <td>{item.tenure}</td>
                          <td>{item.orderId}</td>
                          <td>{item.chequeNumber}</td>
                          {!hasFractions && <ReconcileButtonGroup
                            item={item}
                            role={role}
                            reconcileStatus={reconcileStatus}
                            setIsOpenMinorEdit={setIsOpenMinorEdit}
                            setSelectedMinor={setSelectedMinor}
                            setIsOpenMajorEdit={setIsOpenMajorEdit}
                            setSelectedMajor={setSelectedMajor}
                            performReconciliation={performReconciliation}
                          />}
                          {!hasFractions && <ApproveButton
                            role={role}
                            trxId={item._id}
                            reconcileStatus={item.reconciliation?.reconcileStatus}
                            handleApproveReconciliation={handleApproveReconciliation}
                          />}
                        </tr>

                        {openDropdown[item._id] && hasFractions && (
                          <tr>
                            <td colSpan="28">
                              <div className="bg-blue-50">
                                <table className="w-full">
                                  <thead>
                                    <tr className="font-medium text-nowrap py-3 bg-blue-100">
                                      <th className="text-sm w-16"></th>
                                      <th className="text-sm w-8">S. No.</th>
                                      <th className="text-sm w-24">Transaction date</th>
                                      <th className="text-sm w-24">Transaction type</th>
                                      <th className="text-sm w-24">Pan number</th>
                                      <th className="text-sm w-24">Investor name</th>
                                      <th className="text-sm w-24">Family head</th>
                                      <th className="text-sm w-24">RM Name</th>
                                      <th className="text-sm w-24">AMC name</th>
                                      <th className="text-sm w-24">Scheme name</th>
                                      <th className="text-sm w-16">Amount</th>
                                      <th className="text-sm w-16">Units</th>
                                      <th className="text-sm w-24">From scheme name</th>
                                      <th className="text-sm w-24">SM name</th>
                                      <th className="text-sm w-24">Folio No.</th>
                                      <th className="text-sm w-24">From scheme option</th>
                                      <th className="text-sm w-24">Scheme option</th>
                                      <th className="text-sm w-24">Registrant</th>
                                      <th className="text-sm w-24">Transaction for</th>
                                      <th className="text-sm w-24">Payment mode</th>
                                      <th className="text-sm w-24">First trx amount</th>
                                      <th className="text-sm w-24">SIP/SWP/STP date</th>
                                      <th className="text-sm w-24">SIP Pause month</th>
                                      <th className="text-sm w-24">Tenure of SIP</th>
                                      <th className="text-sm w-24">Order ID</th>
                                      <th className="text-sm w-24">Cheque No.</th>
                                      <th style={{ textAlign: 'center' }} className="text-sm">Actions/Status</th>
                                      <ApproveColumn role={role} />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.transactionFractions.map(
                                      (fraction, fractionIndex) => {
                                        let fractionStatus = color.find(colorItem => colorItem.type === fraction.status)
                                        let fractionReconcileStatus = color.find(colorItem => colorItem.type === fraction.reconciliation?.reconcileStatus)

                                        return (
                                          <tr
                                            key={fraction._id}
                                            className="bg-blue-50"
                                          >
                                            <td className="w-16"></td>
                                            <td className="text-sm">
                                              {index + 1}.{fractionIndex + 1}
                                            </td>
                                            <td className="text-sm">
                                              {fraction.transactionDate
                                                ? formatDateDDShortMonthNameYY(
                                                  fraction.transactionDate
                                                )
                                                : formatDateDDShortMonthNameYY(
                                                  item.transactionPreference
                                                )}
                                            </td>
                                            <td className="text-sm">{type}</td>
                                            <td className="text-sm">{item.panNumber}</td>
                                            <td className="text-sm">{item.investorName}</td>
                                            <td className="text-sm">{item.familyHead}</td>
                                            <td className="text-sm">{item.relationshipManager}</td>
                                            <td className="text-sm">{item.amcName}</td>
                                            <td className="text-sm">{item.schemeName}</td>
                                            <td className="text-sm">{Number(fraction.fractionAmount).toLocaleString('en-IN', {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 2,
                                              style: 'currency',
                                              currency: 'INR'
                                            })}</td>
                                            <td className="text-sm">{item.transactionUnits}</td>
                                            <td className="text-sm">{item.fromSchemeName}</td>
                                            <td className="text-sm">{item.serviceManager}</td>
                                            <td className="text-sm">{fraction.folioNumber || item.folioNumber}</td>
                                            <td className="text-sm">{item.fromSchemeOption}</td>
                                            <td className="text-sm">{item.schemeOption}</td>
                                            <td className="text-sm">{item.registrantName}</td>
                                            <td className="text-sm">{item.transactionFor}</td>
                                            <td className="text-sm">{item.paymentMode}</td>
                                            <td className="text-sm">{item.firstTransactionAmount}</td>
                                            <td className="text-sm">
                                              {item.sipSwpStpDate
                                                ? formatDateDDShortMonthNameYY(
                                                  item.sipSwpStpDate
                                                )
                                                : "N/A"}
                                            </td>
                                            <td className="text-sm">{item.sipPauseMonths}</td>
                                            <td className="text-sm">{item.tenure}</td>
                                            <td className="text-sm">{fraction.orderId || item.orderId}</td>
                                            <td className="text-sm">{item.chequeNumber}</td>
                                            <ReconcileButtonGroup
                                              item={item}
                                              fraction={fraction}
                                              role={role}
                                              reconcileStatus={fractionReconcileStatus}
                                              setIsOpenMinorEdit={setIsOpenMinorEdit}
                                              setSelectedMinor={setSelectedMinor}
                                              setIsOpenMajorEdit={setIsOpenMajorEdit}
                                              setSelectedMajor={setSelectedMajor}
                                              performReconciliation={performReconciliation}
                                            />
                                            <ApproveButton
                                              role={role}
                                              trxId={item._id}
                                              fractionId={fraction._id}
                                              handleApproveReconciliation={handleApproveReconciliation}
                                              reconcileStatus={fraction.reconciliation?.reconcileStatus}
                                            />
                                          </tr>
                                        )
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
            </tbody>
          </table>
        </article>

        {/* Pagination Controls */}
        <div className="flex gap-4 w-fit mt-4 mb-5 mx-auto rounded-full items-center justify-center">
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
            disabled={page >= totalPages}
            className='px-4 py-1 rounded-md border flex gap-2 items-center text-gray-600 border-gray-200 focus:outline-2 focus:outline-blue-400 enabled:hover:bg-blue-50 enabled:hover:text-blue-700 enabled:hover:border-blue-200 disabled:text-gray-400'
          >Next<BsArrowRight /></button>
        </div>
      </section>

      {/* update MINOR issues modal  */}
      <UpdateMinorsModal
        isOpen={isOpenMinorEdit}
        originalData={selectedMinor}
        onClose={closeMinorEditModal}
        onSubmit={submitMinorEdit}
      />

      {/* update MAJOR issues modal  */}
      <UpdateMajorsModal
        isOpen={isOpenMajorEdit}
        originalData={selectedMajor}
        onClose={closeMajorEditModal}
        onSubmit={submitMajorEdit}
      />

      <Toaster />
    </main>
  );
};

export default Reco;


// reconcile actions button group component
const ReconcileButtonGroup = ({ item, fraction, role, reconcileStatus, setIsOpenMinorEdit, setSelectedMinor, setIsOpenMajorEdit, setSelectedMajor, performReconciliation }) => {
  return (
    <td style={{ textAlign: 'center' }}>
      {!(fraction?.reconciliation?.reconcileStatus || item.reconciliation?.reconcileStatus) ? <div className="flex gap-2">
        {/* matched button  */}
        <button onClick={() => { performReconciliation(item._id, { status: 'matched' }, fraction?._id || null) }} disabled={!hasPermission(role, 'reconcile', 'matched')} className='w-28 border border-blue-300 bg-blue-100 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300'>Matched</button>

        {/* minor edit button */}
        <button
          onClick={() => {
            setIsOpenMinorEdit(true);
            setSelectedMinor({
              trxId: item._id,
              fractionId: fraction?._id || null,
              folioNumber: fraction?.folioNumber || item.folioNumber,
              orderId: fraction?.orderId || item.orderId,
              firstTransactionAmount: item.firstTransactionAmount,
              transactionPreference: fraction?.transactionDate || item.transactionPreference,
              sipSwpStpDate: fraction?.sipSwpStpDate || item.sipSwpStpDate
            })
          }}
          disabled={!hasPermission(role, 'reconcile', 'minor_issues')}
          className='text-nowrap border border-blue-300 rounded-3xl px-4 py-2 text-sm text-blue-800 enabled:hover:bg-blue-200 disabled:text-blue-300'
        >Minor Issues
        </button>

        {/* major edit button */}
        <button
          onClick={() => {
            setIsOpenMajorEdit(true);
            setSelectedMajor({
              trxId: item._id,
              fractionId: fraction?._id || null,
              amount: fraction?.fractionAmount || item.amount,
              panNumber: item.panNumber,
              schemeName: item.schemeName,
              amcName: item.amcName
            })
          }}
          disabled={!hasPermission(role, 'reconcile', 'major_issues')}
          className="text-nowrap rounded-3xl px-4 py-2 text-sm text-blue-800 disabled:text-blue-300 enabled:hover:underline"
        >Major Issues
        </button>

        {/* reject button  */}
        <button onClick={() => { performReconciliation(item._id, { status: 'rejected' }, fraction?._id || null) }} disabled={!hasPermission(role, 'reconcile', 'reject')} className="rounded-3xl px-4 py-2 text-sm text-red-600 disabled:text-red-300 enabled:hover:underline">Reject</button>
      </div> :
        <span style={{ backgroundColor: reconcileStatus?.bgcolor, color: reconcileStatus?.color }} className="p-1 px-2 text-xs text-nowrap rounded-full">{reconcileStatus?.value}</span>
      }
    </td>
  )
}

// approve column component for Admins 
const ApproveColumn = ({ role }) => {

  if (!hasPermission(role, 'approval', 'approve')) return null;

  return (<th className="text-sm">Approval</th>)
}

// approve button component for admins 
const ApproveButton = ({ trxId, fractionId, reconcileStatus, role, handleApproveReconciliation }) => {

  if (!hasPermission(role, 'approval', 'approve')) return null;

  if(['RECONCILED_WITH_MAJOR', 'RECONCILIATION_REJECTED'].includes(reconcileStatus)) {
    return (<td>
      <span className="p-1 px-2 text-xs text-nowrap bg-green-100 text-green-700 rounded-full">Approved</span>
    </td>)
  }

  return (
    <td >
      <button
        onClick={() => handleApproveReconciliation(trxId, reconcileStatus, fractionId)}
        disabled={!['RECONCILED_WITH_MAJOR_REQUESTED', 'RECONCILIATION_REJECTED_REQUEST'].includes(reconcileStatus)}
        className="text-sm text-green-800 w-28 border border-green-400 bg-green-200 rounded-3xl px-4 py-2 enabled:hover:bg-green-300 disabled:bg-green-50 disabled:text-green-300"
      >Approve
      </button>
    </td>
  )
}

