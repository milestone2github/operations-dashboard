import React, { useEffect, useRef, useState } from 'react'
import SearchSelectMenu from './SearchSelectMenu'
import { useDispatch, useSelector } from 'react-redux'
import { getAllAmc, getAllSchemes, getRMNames, getSMNames } from '../redux/allFilterOptions/FilterOptionsAction'
import toast from 'react-hot-toast'
import { CiCalendarDate } from 'react-icons/ci'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { resetSchemeList } from '../redux/allFilterOptions/FilterOptionsSlice'
import SortMenu from './SortMenu'
import { MdCurrencyRupee } from 'react-icons/md'

const sortOptions = ['Latest', 'Oldest', 'Amount: low to high', 'Amount: high to low']
const sortMap = new Map()
sortMap.set('Latest', 'trxdate-desc')
sortMap.set('Oldest', 'trxdate-asc')
sortMap.set('Amount: low to high', 'amount-asc')
sortMap.set('Amount: high to low', 'amount-desc')

function FiltersBar({ filters, updateFilters, results, aum }) {
  const { amcList, typeList, schemesList, rmNameList, smNameList, statusList, approvalStatusList, transactionForList, error } = useSelector(state => state.allFilterOptions)
  const [filteredAmcs, setFilteredAmcs] = useState([''])
  const [filteredSchemes, setFilteredSchemes] = useState([''])
  const [filteredStatus, setFilteredStatus] = useState(statusList)
  const [sortBy, setSortBy] = useState('Latest')
  const dispatch = useDispatch()
  const minAmountRef = useRef(null)
  const maxAmountRef = useRef(null)

  useEffect(() => {
    dispatch(getAllAmc())
    dispatch(getRMNames())
    dispatch(getSMNames())
  }, [])

  useEffect(() => {
    if (filters.amcName)
      dispatch(getAllSchemes(filters.amcName))
    else
      dispatch(resetSchemeList())
  }, [filters.amcName])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    setFilteredAmcs(amcList)
  }, [amcList])

  useEffect(() => {
    setFilteredSchemes(schemesList)
  }, [schemesList])

  useEffect(() => {
    updateFilters({ ...filters, sort: sortMap.get(sortBy) })
  }, [sortBy])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    updateFilters({ ...filters, [name]: value })
  }

  const handleMinAmountChange = (e) => {
    const value = e.target.value
    let prevValue = minAmountRef.current?.prevValue

    if (prevValue !== value) {
      minAmountRef.current.prevValue = value
      handleFilterChange(e)
    }
  }

  const handleMaxAmountChange = (e) => {
    const value = e.target.value
    let prevValue = maxAmountRef.current?.prevValue

    if (prevValue !== value) {
      maxAmountRef.current.prevValue = value
      handleFilterChange(e)
    }
  }

  const handleFilterAmc = (key) => {
    setFilteredAmcs(amcList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleFilterSchemes = (key) => {
    setFilteredSchemes(schemesList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleFilterStatus = (key) => {
    setFilteredStatus(statusList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleClearAll = () => {
    updateFilters({
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
      status: '',
      approvalStatus: ''
    })
    setSortBy('Latest')
    minAmountRef.current.value = ''
    maxAmountRef.current.value = ''
  }

  return (
    <div className="flex flex-col text-sm text-gray-700">
      <div className="flex justify-start gap-2">
        <p className='text-gray-700 font-medium text-lg'>Filters</p>

        <div className='flex items-center bg-blue-100 p-1 px-2 gap-2 rounded-md'>
          <span className='text-[10px] leading-tight text-gray-500 '>Results</span>
          <span className='font-medium text-blue-800'>{results}</span>
        </div>
        <div className='flex items-center bg-green-100 p-1 px-2 gap-2 rounded-md me-auto'>
          <span className='text-[10px] leading-tight text-gray-500 '>Amount</span>
          <span className='font-medium text-green-800'>₹ {Number(aum).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })}</span>
        </div>

        <div title='Amount' className="flex bg-white items-center rounded-md border">
          <span className='text-base text-gray-500 px-1'><MdCurrencyRupee /></span>
          <input
            ref={minAmountRef}
            type="number"
            name="minAmount"
            id="filter-min-amount"
            placeholder='Min'
            title='Min amount'
            className={`bg-transparent focus:bg-gray-100 focus:outline-none text-sm w-[76px] p-1 text-center hover:bg-gray-100 placeholder:text-gray-500 ${!filters.minAmount ? 'text-gray-500' : 'text-blue-600'}`}
            onBlur={handleMinAmountChange}
          />
          <div className='h-7 border-s'></div>
          <input
            ref={maxAmountRef}
            type="number"
            name="maxAmount"
            id="filter-max-amount"
            placeholder='Max'
            title='Max amount'
            className={`bg-transparent focus:bg-gray-100 focus:outline-none text-sm w-[76px] p-1 text-center rounded-e-md hover:bg-gray-100 placeholder:text-gray-500 ${!filters.maxAmount ? 'text-gray-500' : 'text-blue-600'}`}
            onBlur={handleMaxAmountChange}
          />
        </div>
        <SortMenu
          list={sortOptions}
          selectedValue={sortBy}
          updateSelected={(value) => setSortBy(value)}
          width='200px'
        />
        <button title='Clear all filters' onClick={handleClearAll} className='rounded-md border border-red-100 px-2 hover:border-red-500 hover:text-red-500'>Clear all</button>
      </div>
      <div className="flex items-center gap-x-2 gap-y-2 my-3 text-sm text-gray-700 flex-wrap">
        <div className="flex bg-white items-center rounded-md border">
          <span className='text-xl ps-px'><CiCalendarDate /></span>

          <label
            htmlFor="min-date"
            className={`relative focus-within:bg-gray-100 text-sm w-[80px] p-1 text-center hover:bg-gray-100 ${!filters.minDate ? 'text-gray-500' : 'text-blue-600'}`}
          >{filters.minDate ? formatDateDDShortMonthNameYY(filters.minDate) : 'Min'}
            <input
              type="date"
              name="minDate"
              id="min-date"
              className='text-xs absolute left-0 -z-10'
              value={filters.minDate}
              onChange={handleFilterChange}
              onFocus={(e) => e.target.showPicker()}
            />
          </label>
          <div className='h-7 border-s'></div>
          <label
            htmlFor="max-date"
            className={`relative focus-within:bg-gray-100 text-sm w-[80px] p-1 text-center rounded-e-md hover:bg-gray-100 ${!filters.maxDate ? 'text-gray-500' : 'text-blue-600'}`}
          >{filters.maxDate ? formatDateDDShortMonthNameYY(filters.maxDate) : 'Max'}
            <input
              type="date"
              name="maxDate"
              id="max-date"
              className='text-xs absolute right-px -z-10'
              value={filters.maxDate}
              onChange={handleFilterChange}
              onFocus={(e) => e.target.showPicker()}
            />
          </label>
        </div>

        <select
          name="type"
          id="type"
          value={filters.type}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.type ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {typeList?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`} selected={item === filters.type}>{item || "Type"}</option>
          ))}
        </select>

        <SearchSelectMenu
          selectedValue={filters.amcName}
          updateSelected={(item) => { handleFilterChange({ target: { name: 'amcName', value: item } }) }}
          list={filteredAmcs}
          handleSearchAction={handleFilterAmc}
          defaultEmptyName='AMC Name'
        />

        <SearchSelectMenu
          selectedValue={filters.schemeName}
          updateSelected={(item) => { handleFilterChange({ target: { name: 'schemeName', value: item } }) }}
          list={filteredSchemes}
          handleSearchAction={handleFilterSchemes}
          defaultEmptyName='Scheme Name'
        />

        <select
          name="rmName"
          id="rm-name"
          value={filters.rmName}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.rmName ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {rmNameList?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`} selected={item === filters.rmName}>{item || "RM Name"}</option>
          ))}
        </select>

        <select
          name="smName"
          id="sm-name"
          value={filters.smName}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.smName ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {smNameList?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`} selected={item === filters.smName}>{item || "SM Name"}</option>
          ))}
        </select>

        <SearchSelectMenu
          selectedValue={filters.status}
          updateSelected={(item) => { handleFilterChange({ target: { name: 'status', value: item } }) }}
          list={filteredStatus}
          handleSearchAction={handleFilterStatus}
          defaultEmptyName='Status'
        />

        <select
          name="transactionFor"
          id="transactionFor"
          value={filters.transactionFor}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.transactionFor ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {transactionForList?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`} selected={item === filters.transactionFor}>{item || "Transaction For"}</option>
          ))}
        </select>

        <select
          name="approvalStatus"
          id="approvalStatus"
          value={filters.approvalStatus}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.approvalStatus ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {approvalStatusList?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`} selected={item === filters.approvalStatus}>{item || "Approval List"}</option>
          ))}
        </select>

      </div>
    </div>
  )
}

export default FiltersBar