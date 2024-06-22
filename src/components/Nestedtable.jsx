// NestedTable.js
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { color } from '../Statuscolor/color';

const Nestedtable = ({ rowdata }) => {
  console.log(rowdata);
  const columns = [
    {
      name: "S No.",
      selector: row => <div>{data.indexOf(row) + 1}</div>,
      center: "true",
    },
    {
      name: "Status",
      selector: row => <div className="px-3 py-1 rounded-3xl text-sm font-semibold"
        style={{
          backgroundColor: color.find((item) => item.type === row.status).bgcolor,
          color: color.find((item) => item.type === row.status).color
        }
        }
      >{row.status}</div>,
      center: "true",
      minWidth: "14rem"
    },
    {
      name: "Transaction Type",
      selector: row => row.transactiontype,
      center: "true",
    },
    {
      name: "Transaction For",
      selector: row => row.transactionfor,
      center: "true"
    },
    {
      name: "MF (AMC) Name",
      selector: row => row.amcname,
      center: "true",
      minWidth: "16rem"
    },
    {
      name: "Scheme Name",
      selector: row => row.schemename,
      center: "true",
      minWidth: "20rem"
    },
    {
      name: <div className=' w-[40rem] text-center'>sdsds</div>,
      selector: row => row.schemeoption,
      center: "true"

    },
    {
      name: "Folio",
      selector: row => row.folio,
      center: "true"
    },
    {
      name: "SIP Amount",
      selector: row => row.sipamount,
      center: "true"
    },
    {
      name: "Tenure of SIP",
      selector: row => row.tenureofsip,
      center: "true"
    },
    {
      name: "SIP Date",
      selector: row => row.sipdate,
      center: "true"
    },
    {
      name: "First Transaction Amount",
      selector: row => row.firsttransactionamount,
      center: "true"
    },
    {
      name: "First Installment Payment Amout",
      selector: row => row.firstinstallmentpaymentmode,
      center: "true"
    },
    {
      name: "Action",
      selector: row => <button className=' text-lg' onClick={() => setRowData(row.status)}>+</button>,
      center: "true"
    }
  ]
  const[data, setData]=useState([])
  useEffect(()=>{
   rowdata && setData([...data , rowdata])
  },[rowdata])

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
        borderBottom: "1px solid #E3EAF4",
        fontSize: "0.9rem",
        paddingBlock: "1.4rem",
        dispay: "flex",
        alignItems: "center"
      }
    }
  }
  return <DataTable columns={columns} data={data} customStyles={customstyles} />;
};

export default Nestedtable;
