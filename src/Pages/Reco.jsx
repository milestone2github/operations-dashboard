import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import FiltersBar from "../components/FiltersBarForReco";
import { formatDateDDShortMonthNameYY } from "../utils/formatDate";
import { IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { FaSadTear } from "react-icons/fa";
import Loader from "../components/Loader";
import { useSelector, useDispatch } from "react-redux";
import { getRecoTransactions } from "../redux/reconciliation/ReconciliationAction";
import { BsArrowRight } from "react-icons/bs";

const itemsPerPage = 25; // Number of items to display per page

const initialFilters = {
  minAmount: "",
  maxAmount: "",
  schemeName: "",
  amcName: "",
  rmName: "",
  type: "",
  sort: "trxdate-desc", // Default sort order
};

const Reco = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [openDropdown, setOpenDropdown] = useState({});

  const { transactions, status, error, totalCount, totalAmount, page } = useSelector(
    (state) => state.reconciliation
  );

  const dispatch = useDispatch();

  const totalPages = Math.ceil(totalCount / itemsPerPage); // Calculate total pages

  const updateFilters = (value) => {
    setFilters(value);
  };

  useEffect(() => {
    dispatch(getRecoTransactions({ filters, items: itemsPerPage }));
  }, [filters, dispatch]);

  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(error)
    }
  }, [status, error])

  const toggleDropdown = (id) => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handlePrev = () => {
    if (page > 1) {
      dispatch(getRecoTransactions({filters, page: page - 1, items: itemsPerPage}))
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      dispatch(getRecoTransactions({filters, page: page + 1, items: itemsPerPage}))
    }
  };

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
            results={totalCount}
            aum={totalAmount}
          />
        </div>
      </div>

      <section className="px-2 md:px-6 w-full">
        <article className="border max-h-[60vh] bg-gray-50 rounded-md overflow-x-scroll w-full md:w-[calc(100vw-152px)] min-h-[75vh] relative custom-scrollbar">
        <table className="filtered-trx">
            <thead  className="bg-blue-50 sticky top-0">
              <tr className="font-medium text-nowrap py-3 text-gray-800">
                <th className="text-sm"></th> {/* Placeholder for dropdown button */}
                <th className="text-sm">S. No.</th>
                <th className="text-sm">Transaction date</th>
                <th className="text-sm">Transaction type</th>
                <th className="text-sm">Pan number</th>
                <th className="text-sm">Investor name</th>
                <th className="text-sm">Family head</th>
                <th className="text-sm">RM Name</th>
                <th className="text-sm">AMC name</th>
                <th className="text-sm">Scheme name</th>
                <th className="text-sm">Amount</th>
                <th className="text-sm">Units</th>
                <th className="text-sm">Registrant</th>
                <th className="text-sm">Folio No.</th>
                <th className="text-sm">Scheme Option</th>
                <th className="text-sm">From scheme</th>
                <th className="text-sm">From scheme option</th>
                <th className="text-sm">Payment mode</th>
                <th className="text-sm">First trx amount</th>
                <th className="text-sm">SIP/SWP/STP date</th>
                <th className="text-sm">SIP Pause month</th>
                <th className="text-sm">Tenure of SIP</th>
                <th className="text-sm">Order ID</th>
                <th className="text-sm">Cheque No.</th>
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
                          <td>{item.transactionType}</td>
                          <td>{item.panNumber}</td>
                          <td>{item.investorName}</td>
                          <td>{item.familyHead}</td>
                          <td>{item.relationshipManager}</td>
                          <td>{item.amcName}</td>
                          <td>{item.schemeName}</td>
                          <td>{item.amount}</td>
                          <td>{item.transactionUnits}</td>
                          <td>{item.registrantName}</td>
                          <td>{item.folioNumber}</td>
                          <td>{item.schemeOption}</td>
                          <td>{item.fromSchemeName}</td>
                          <td>{item.fromSchemeOption}</td>
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
                        </tr>

                        {openDropdown[item._id] && hasFractions && (
                          <tr>
                            <td colSpan="24">
                              <div className="p-4 bg-blue-50">
                                <table className="w-full table-fixed">
                                  <thead>
                                    <tr className="text-left bg-blue-200">
                                      <th className="text-sm w-8">S. No.</th>
                                      <th className="text-sm w-24">
                                        Transaction date
                                      </th>
                                      <th className="text-sm w-24">
                                        Transaction type
                                      </th>
                                      <th className="text-sm w-24">
                                        Pan number
                                      </th>
                                      <th className="text-sm w-24">
                                        Investor name
                                      </th>
                                      <th className="text-sm w-24">
                                        Family head
                                      </th>
                                      <th className="text-sm w-24">RM Name</th>
                                      <th className="text-sm w-24">AMC name</th>
                                      <th className="text-sm w-24">
                                        Scheme name
                                      </th>
                                      <th className="text-sm w-16">Amount</th>
                                      <th className="text-sm w-16">Units</th>
                                      <th className="text-sm w-24">
                                        Registrant
                                      </th>
                                      <th className="text-sm w-24">
                                        Folio No.
                                      </th>
                                      <th className="text-sm w-24">
                                        Scheme Option
                                      </th>
                                      <th className="text-sm w-24">
                                        From scheme
                                      </th>
                                      <th className="text-sm w-24">
                                        From scheme option
                                      </th>
                                      <th className="text-sm w-24">
                                        Payment mode
                                      </th>
                                      <th className="text-sm w-24">
                                        First trx amount
                                      </th>
                                      <th className="text-sm w-24">
                                        SIP/SWP/STP date
                                      </th>
                                      <th className="text-sm w-24">
                                        SIP Pause month
                                      </th>
                                      <th className="text-sm w-24">
                                        Tenure of SIP
                                      </th>
                                      <th className="text-sm w-24">Order ID</th>
                                      <th className="text-sm w-24">
                                        Cheque No.
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.transactionFractions.map(
                                      (fraction, fractionIndex) => (
                                        <tr
                                          key={fraction._id}
                                          className="bg-blue-100"
                                        >
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
                                          <td className="text-sm">
                                            {item.transactionType}
                                          </td>
                                          <td className="text-sm">
                                            {item.panNumber}
                                          </td>
                                          <td className="text-sm">
                                            {item.investorName}
                                          </td>
                                          <td className="text-sm">
                                            {item.familyHead}
                                          </td>
                                          <td className="text-sm">
                                            {item.relationshipManager}
                                          </td>
                                          <td className="text-sm">
                                            {item.amcName}
                                          </td>
                                          <td className="text-sm">
                                            {item.schemeName}
                                          </td>
                                          <td className="text-sm">
                                            {fraction.fractionAmount}
                                          </td>
                                          <td className="text-sm">
                                            {item.transactionUnits}
                                          </td>
                                          <td className="text-sm">
                                            {item.registrantName}
                                          </td>
                                          <td className="text-sm">
                                            {fraction.folioNumber ||
                                              item.folioNumber}
                                          </td>
                                          <td className="text-sm">
                                            {item.schemeOption}
                                          </td>
                                          <td className="text-sm">
                                            {item.fromSchemeName}
                                          </td>
                                          <td className="text-sm">
                                            {item.fromSchemeOption}
                                          </td>
                                          <td className="text-sm">
                                            {item.paymentMode}
                                          </td>
                                          <td className="text-sm">
                                            {item.firstTransactionAmount}
                                          </td>
                                          <td className="text-sm">
                                            {item.sipSwpStpDate
                                              ? formatDateDDShortMonthNameYY(
                                                  item.sipSwpStpDate
                                                )
                                              : "N/A"}
                                          </td>
                                          <td className="text-sm">
                                            {item.sipPauseMonths}
                                          </td>
                                          <td className="text-sm">
                                            {item.tenure}
                                          </td>
                                          <td className="text-sm">
                                            {fraction.orderId || item.orderId}
                                          </td>
                                          <td className="text-sm">
                                            {item.chequeNumber}
                                          </td>
                                        </tr>
                                      )
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
    </main>
  );
};

export default Reco;
