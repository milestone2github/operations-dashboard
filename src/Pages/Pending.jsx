import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { getGroupedTransactions, setServiceManager } from '../redux/groupedTransaction/GroupedTrxAction';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatDate';
import Header from '../components/Header';
import AssignSmModal from '../components/AssignSmModal';
import { getSMNames } from '../redux/allFilterOptions/FilterOptionsAction';
import toast, { Toaster } from 'react-hot-toast';
import { LuListTodo, LuUserCheck2 } from 'react-icons/lu';
import { MdOutlineCheckBoxOutlineBlank } from 'react-icons/md';
import { RiExpandUpDownFill } from 'react-icons/ri';
import { resetAssignStatus, resetError } from '../redux/groupedTransaction/GroupedTrxSlice';
import { FaSearch } from 'react-icons/fa';

const Pending = () => {
    const [itemToUpdate, setItemToUpdate] = useState({ _id: null, familyHead: null, relationshipManager: null })
    const [isSmModalOpen, setIsSmModalOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab')
    const dispatch = useDispatch()
    const { isLoading, error, assignStatus, data } = useSelector((state) => state.groupedTransactions)
    const [searchBy, setSearchBy] = useState('family head');
    const [searchKeyword, setSearchKeyword] = useState('');
    // const [filters, setFilters] = useState(initialFilters);
    // const [openDropdown, setOpenDropdown] = useState({});
    const {
        smNameList,
        error: fetchSmListError,
        status: fetchSmListStatus
    } = useSelector((state) => state.allFilterOptions)
    const navigate = useNavigate()

    const { role } = useSelector(state => state.user.userData?.role)
    // Permissions 
    const canModifySm = ['operations senior', 'management', 'Administrator'].includes(role.toLowerCase())
    const canAssignSm = ['operations senior', 'operations', 'management', 'Administrator'].includes(role.toLowerCase())

    useEffect(() => {
        dispatch(getSMNames())
        if (!searchParams.has('tab')) {
            setSearchParams({ 'tab': 'my' })
        }
    }, [])

    useEffect(() => {
        dispatch(getGroupedTransactions({
            smFilter: activeTab, 
            searchBy, 
            searchKey: searchKeyword
        }))
    }, [activeTab])

    useEffect(() => {
        if(searchKeyword){
            dispatch(getGroupedTransactions({
                smFilter: activeTab, 
                searchBy, 
                searchKey: searchKeyword
            }))
        }
    }, [searchBy])

    useEffect(() => {
        if (error) {
            toast.error(error)
            setTimeout(() => {
                dispatch(resetError())
            }, 3000);
        }
        if (assignStatus === 'completed') {
            toast.success('Service manager assigned')
            handleCloseModal()
            setTimeout(() => {
                dispatch(resetAssignStatus())
            }, 3000);
        }
    }, [error, assignStatus])

    function trimTo16letters(name) {
        if (!name) return ''
        if (name.length > 16) {
            return name.slice(0, 16) + '...';
        }
        return name;
    }

    const handleAssignSm = (_id, serialNumber, familyHead, relationshipManager, existingSm) => {
        setItemToUpdate({ _id, serialNumber, familyHead, relationshipManager, existingSm })
        setIsSmModalOpen(true)
    }

    const handleConfirmModal = (itemToUpdate, serviceManager) => {
        dispatch(setServiceManager({ ...itemToUpdate, serviceManager }))
    }

    const handleCloseModal = () => {
        setItemToUpdate({ _id: null, familyHead: null, relationshipManager: null })
        setIsSmModalOpen(false)
    }

    const handleTabChange = (tabName) => {
        setSearchParams({ tab: tabName })
    }

    const handleSearch = () => {
        dispatch(getGroupedTransactions({
            smFilter: activeTab, 
            searchBy, 
            searchKey: searchKeyword
        }))
    };

    const customstyles = {
        headRow: {
            style: {
                backgroundColor: "#F9FAFC",
                borderRadius: "0.25rem",
                border: "0",
                postion: "sticky",
                top: "0"
            }
        },
        headCells: {
            style: {
                color: "#1B2B44",
                fontWeight: "700",
                fontSize: "1.02rem"
            }
        },
        cells: {
            style: {
                fontSize: "0.9rem",
                paddingBlock: "0.5rem"
            }
        }
    }
    const columns = [
        {
            name: "S No.",
            selector: (row, index) => <div>{index + 1}</div>,
            center: "true",
            maxWidth: "60px",
        },
        {
            name: <div className='text-start'>Family Head</div>,
            selector: row => <span title={row.familyHead}>{trimTo16letters(row.familyHead)}</span>,
            center: "false",

        },
        {
            name: <div className='text-start'>RM Name</div>,
            selector: row => <span title={row.relationshipManager}>{trimTo16letters(row.relationshipManager)}</span>,
            center: "false",

        },
        {
            name: <div>Count</div>,
            selector: row => row.count,
            center: "true",
            minWidth: "100px",

        },
        {
            name: <div className=' text-center'>Pending Transactions</div>,
            selector: row => <div className=' flex flex-col items-center gap-2'>
                <div className='  flex gap-1 justify-center overflow-auto'>
                    <p className=' bg-[#f0f8f0] text-green-700 rounded-md p-2 font-semibold text-xs'>{row.totalPending}&nbsp;TC</p>
                    <p className=' bg-[#EFF3FE] text-[#3C32E1] rounded-md p-2 font-semibold text-xs'>{row.sysPending}&nbsp;S</p>
                    <p className=' bg-[#FEFBE8] text-[#F29800] rounded-md p-2 font-semibold text-xs'>{row.purchRedempPending}&nbsp;PR</p>
                    <p className=' bg-[#FDF1F1] text-[#F53D59] rounded-md p-2 font-semibold text-xs'>{row.switchPending}&nbsp;SW</p>
                </div>
            </div>,
            center: "true",
            minWidth: "208px",
        },
        {
            name: <div>SM Name</div>,
            selector: (row, index) => <div>{
                row.serviceManager ?
                    canModifySm ? <div role='button' className='rounded-md border flex items-center py-[2px] hover:border-blue-300 hover:text-blue-600' onClick={() => handleAssignSm(row._id, index + 1, row.familyHead, row.relationshipManager, row.serviceManager)}>
                        <span className='px-1'>{trimTo16letters(row.serviceManager)}</span>
                        <RiExpandUpDownFill className='text-xl px-1' />
                    </div> :
                        <div title={row.serviceManager}>{trimTo16letters(row.serviceManager)}</div>
                    : <button
                        disabled={!canAssignSm}
                        className='rounded-md px-3 py-1 text-sm border enabled:hover:border-blue-700 enabled:hover:bg-blue-600 disabled:bg-blue-300 bg-blue-500 text-gray-50'
                        onClick={() => handleAssignSm(row._id, index + 1, row.familyHead, row.relationshipManager)}
                    >Assign SM
                    </button>
            }</div>,
            center: true,
            minWidth: '200px'
        },
        {
            name: <div className='text-center'>Execution date</div>,
            selector: row => formatDate(row.createdAt),
            center: false,
            minWidth: "180px",
            sortable: true
        }
    ]

    const handlclick = (row) => {
        let params = new URLSearchParams()
        params.append('smFilter', activeTab)
        if (row.familyHead) { params.append('fh', row.familyHead) }
        navigate(`details?${params.toString()}`)
    }

    return (
        <div className='home-section w-full h-[100vh]'>
            <div className="first-section sticky top-0 z-30 flex justify-between items-center h-[12vh] px-2 md:px-6 ">
                <Header title='Pending Transactions' />
            </div>
            <div className="table-section h-[88vh] bg-[#F8FAFC] flex justify-center p-3">
                <div className='relative inner-section bg-white rounded-md  h-full w-full md:w-[87vw] lg:w-[90vw]  '>
                    <div className='flex justify-start p-2 px-3'>
                        <h3 className='h-10 p-2 bg-white'>Transaction Details</h3>
                        <div className="ms-auto hidden md:flex items-center text-sm border h-11 me-4">
                                <select
                                    value={searchBy}
                                    onChange={(e) => setSearchBy(e.target.value)}
                                    className={'bg-gray-50 h-full text-sm focus:outline-none p-1'}
                                >
                                    <option value="family head">Family Head</option>
                                    <option value="investor name">Investor Name</option>
                                    <option value="PAN">PAN</option>
                                </select>
                            <div className='h-full border-l'></div>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}  // Trigger search on Enter key
                                placeholder="Search Keywords"
                                className="ms-2 mx-1 text-sm focus:outline-none"
                            />

                            <button onClick={handleSearch} className="cursor-pointer h-full p-2 hover:bg-gray-50">
                                <FaSearch/>
                            </button>
                        </div>

                        <ul className="ms-auto md:ms-0 flex h-[42px] shadow shadow-blue-100">

                            <li className="relative">
                                <input
                                    type="radio"
                                    value="all"
                                    checked={activeTab === "all"}
                                    onChange={(e) => handleTabChange(e.target.value)}
                                    name="filter-by-sm"
                                    id="all"
                                    className="absolute -z-10 top-0 left-0 peer"
                                />
                                <label
                                    htmlFor="all"
                                    title="All"
                                    className="cursor-pointer text-lg inline-block p-3 bg-gray-50 text-gray-800 transition-colors duration-300 ease-in-out peer-checked:bg-black peer-checked:text-gray-50 peer-checked:transition-none"
                                >
                                    <LuListTodo />
                                </label>
                            </li>
                            <li className="relative">
                                <input
                                    type="radio"
                                    value="my"
                                    checked={activeTab === "my"}
                                    onChange={(e) => handleTabChange(e.target.value)}
                                    name="filter-by-sm"
                                    id="my"
                                    className="absolute -z-10 top-0 left-0 peer"
                                />
                                <label
                                    htmlFor="my"
                                    title="My"
                                    className="cursor-pointer text-lg inline-block p-3 bg-gray-50 text-gray-800 transition-colors duration-300 ease-in-out peer-checked:bg-black peer-checked:text-gray-50 peer-checked:transition-none"
                                >
                                    <LuUserCheck2 />
                                </label>
                            </li>
                            <li className="relative">
                                <input
                                    type="radio"
                                    value="ua"
                                    checked={activeTab === "ua"}
                                    onChange={(e) => handleTabChange(e.target.value)}
                                    name="filter-by-sm"
                                    id="ua"
                                    className="absolute -z-10 top-0 left-0 peer"
                                />
                                <label
                                    htmlFor="ua"
                                    title="Unassigned"
                                    className="cursor-pointer text-lg inline-block p-3 bg-gray-50 text-gray-800 transition-colors duration-300 ease-in-out peer-checked:bg-black peer-checked:text-gray-50 peer-checked:transition-none"
                                >
                                    <MdOutlineCheckBoxOutlineBlank />
                                </label>
                            </li>
                        </ul>
                    </div>

                    <div className="mx-3 mb-2 md:hidden flex items-center text-sm border h-11">
                                <select
                                    value={searchBy}
                                    onChange={(e) => setSearchBy(e.target.value)}
                                    className={'bg-gray-50 h-full text-sm focus:outline-none p-1'}
                                >
                                    <option value="family head">Family Head</option>
                                    <option value="investor name">Investor Name</option>
                                    <option value="PAN">PAN</option>
                                </select>
                            <div className='h-full border-l'></div>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}  // Trigger search on Enter key
                                placeholder="Search Keywords"
                                className="ms-2 mx-1 w-full text-sm focus:outline-none"
                            />

                            <button onClick={handleSearch} className="cursor-pointer h-full p-2 hover:bg-gray-50">
                                <FaSearch/>
                            </button>
                        </div>

                    <div className='p-1'>
                        {isLoading ? <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><Loader /></div>
                            : <DataTable
                                columns={columns}
                                data={data}
                                fixedHeader
                                highlightOnHover
                                pointerOnHover
                                onRowClicked={handlclick}
                                customStyles={customstyles}
                                fixedHeaderScrollHeight='72vh'
                            >
                            </DataTable>}
                    </div>

                </div>
            </div>

            <AssignSmModal
                isOpen={isSmModalOpen}
                title='Assign Service Manager'
                smNameList={smNameList}
                itemToUpdate={itemToUpdate}
                handleProceed={handleConfirmModal}
                handleCancel={handleCloseModal}
                status={assignStatus}
            />
            <Toaster />
        </div>
    )
}

export default Pending