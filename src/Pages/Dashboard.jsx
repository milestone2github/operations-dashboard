import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { RiMenu3Line } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo.png'
import { getGroupedTransactions } from '../redux/groupedTransaction/GroupedTrxAction';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatDate';

const Dashboard = () => {
    const dispatch = useDispatch()
    const { userdata } = useSelector((state) => state.auth)
    const { isLoading, error, data } = useSelector((state) => state.groupedTransactions)
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(getGroupedTransactions())
    }, [])

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
            selector: row => <div>{data.indexOf(row) + 1}</div>,
            center: "true",
            maxWidth: "60px",
        },
        {
            name: <div>Session ID</div>,
            selector: row => <span className='text-xs'>{row._id}</span>,
            center: "true",
            minWidth: "200px",
        },
        {
            name: <div className='text-start'>Client Name / Family Head</div>,
            selector: row => <span>{row.investorName} / {row.familyHead}</span>,
            center: "true", 
            minWidth: "260px",

        },
        {
            name: <div className=' text-center'>Transaction Count</div>,
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
            name: <div className=' text-center'>Date of Execution</div>,
            selector: row => formatDate(row.createdAt),
            center: "true",
            minWidth: "200px",
            sortable:true

        }
    ]

    // const data = [
    //     {
    //         TRXCode: 1,
    //         clientname: "dasd",
    //         tc: 6,
    //         ptc: 8,
    //         ps: 2,
    //         ppr:3,
    //         psw:1,
    //         date: new Date().toDateString(),
    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()
    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toString().slice(0, 25)

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "dasd",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()
    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()
    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toString().slice(0, 25)

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toString().slice(0, 25)

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    //     {
    //         TRXCode: 1,
    //         clientname: "Jack",
    //         tc: 6,
    //         ptc: 8,
    //         date: new Date().toDateString()

    //     },
    // ]
    const handlclick = (row) => {
        console.log('clicked: ', row._id) //test
        navigate(`/details/${row._id}`)
    }

    return (
        <div className='home-section w-full h-[100vh]'>
            <div className="first-section sticky top-0 z-30 flex justify-between items-center h-[12vh] px-3 ">
                <div className="first-section sticky top-0 z-40 bg-white flex justify-between items-center h-[12vh] px-3 ">
                    <div className=' flex gap-1'>
                        <button className='md:hidden' onClick={() => dispatch({
                            type: "togglenavtab",
                            payload: "0"
                        })}>
                            <RiMenu3Line className=' text-2xl font-semibold' />
                        </button>
                        <h1 className=' md:text-3xl  font-medium'>Overview</h1>
                    </div>
                </div>
                {/* <img src={logo} alt="" className=' w-44'/> */}
                <div className=' flex flex-col items-end gap-2'>
                    <img src={logo} alt="" className=' w-32' />
                    {userdata && <p>Welcome , {userdata.name}</p>}
                </div>
            </div>
            <div className="table-section h-[88vh] bg-[#F8FAFC] flex justify-center p-3">
                <div className='relative inner-section bg-white rounded-md  h-full w-full md:w-[87vw] lg:w-[90vw]  '>
                    <h2 className='sticky z-30 top-0 p-2 bg-white'>Transaction Details</h2>
                    <div className='p-2'>
                       {isLoading ? <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><Loader/></div> 
                        : <DataTable
                            columns={columns}
                            data={data}
                            fixedHeader
                            highlightOnHover
                            pointerOnHover
                            onRowClicked={handlclick}
                            customStyles={customstyles}
                            fixedHeaderScrollHeight='75vh'
                        >
                        </DataTable>}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Dashboard