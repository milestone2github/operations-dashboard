import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetSchemeList } from '../redux/allFilterOptions/FilterOptionsSlice'
import SearchSelectMenu from './SearchSelectMenu'
import SortMenu from './SortMenu'
import { MdCurrencyRupee, MdFilterList } from 'react-icons/md'
import { FiSave } from 'react-icons/fi'
import { FaSearch } from 'react-icons/fa'
import { CiCalendarDate } from 'react-icons/ci'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { addSavedFilters, updateActiveSavedFilters } from '../redux/savedFilters/SavedFiltersAction'
import { resetAddStatus, setActiveAll } from '../redux/savedFilters/SavedFiltersSlice'
import MultiSelectMenu from './MultiSelectMenu'
import { getAllSchemes } from '../redux/allFilterOptions/FilterOptionsAction'
import { filterKeyMap } from '../utils/map'
import toast from 'react-hot-toast'

const sortOptions = ['Latest', 'Oldest', 'Amount: low to high', 'Amount: high to low']
const sortMap = new Map()
sortMap.set('Latest', 'trxdate-desc')
sortMap.set('Oldest', 'trxdate-asc')
sortMap.set('Amount: low to high', 'amount-asc')
sortMap.set('Amount: high to low', 'amount-desc')

const reverseSortMap = new Map([...sortMap].map(([key, value]) => [value, key]));

function FiltersBar({ filters, updateFilters, clearAllFilters, results, aum, filterConfig, amcOptions, schemeOptions, rmNameOptions, smNameOptions, statusOptions, approvalStatusOptions, typeOptions, forOptions }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('family head');
  const [isFilterListVisible, setIsFilterListVisible] = useState(false)
  const [sortBy, setSortBy] = useState('Latest')
  const dispatch = useDispatch()
  const minAmountRef = useRef(null)
  const maxAmountRef = useRef(null)
  const listRef = useRef(null)
  const viewListBtn = useRef(null)

  const { all, addStatus } = useSelector(state => state.savedFilters)

  useEffect(() => {
    if (filters.amcName)
      dispatch(getAllSchemes(filters.amcName))
    else
      dispatch(resetSchemeList())
  }, [filters.amcName])

  useEffect(() => {
    updateFilters({ ...filters, sort: sortMap.get(sortBy) })
  }, [sortBy])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    updateFilters({ ...filters, [name]: value })
  }

  const handleSearch = () => {
    // Trigger search based on `searchKeyword` and `selectedMenuOption`
    updateFilters({
      ...filters,
      searchBy: selectedMenuOption,
      searchKey: searchKeyword
    });
  };

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

  const handleSaveCurrentFilter = () => {
    if (all.filters?.length >= (import.meta.env.VITE_SAVED_FILTER_LIMIT || 3)) {
      let response = confirm("The filter limit has been reached. The oldest filter will be removed to save the new one. Do you want to proceed?")

      if (!response) { return }
    }
    let filterSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if(['searchBy', 'searchKey'].includes(key)) 
        continue
      if (Array.isArray(value)? value.length : value) {
        filterSearchParams.append(key, value)
      }
    }
    let filterString = filterSearchParams.toString()
    dispatch(addSavedFilters({ at: filterString }))
  }

  useEffect(() => {
    if (addStatus === 'completed') {
      toast.success('Saved')
      setTimeout(dispatch(resetAddStatus()), 3000);
    }
    else if (addStatus === 'failed') {
      toast.error('Unable to save')
      setTimeout(dispatch(resetAddStatus()), 3000);
    }
  }, [addStatus])

  const handleClearAll = () => {
    clearAllFilters()
    setSortBy('Latest')
    minAmountRef.current.value = ''
    maxAmountRef.current.value = ''
    setSearchKeyword('')
    setSelectedMenuOption('family head')
  }

  const toggleListVisiblilty = () => { setIsFilterListVisible(prev => !prev) }

  const handleClickOutside = (e) => {
    if (!listRef?.current?.contains(e.target) && viewListBtn.current !== e.target) {
      setIsFilterListVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchKeyword)
      updateFilters({ ...filters, searchBy: selectedMenuOption })
  }, [selectedMenuOption])

  return (
    <div className="flex flex-col text-sm text-gray-700">
      <div className="flex justify-start items-center flex-wrap gap-2">
        <p className='text-gray-700 font-medium text-lg'>Filters</p>
        {filterConfig.saveFilter && <div className='relative border rounded border-blue-300 flex h-6'>
          <button ref={viewListBtn} title='saved filters' onClick={toggleListVisiblilty} className={`px-1 ${isFilterListVisible ? 'bg-blue-200' : ''} hover:bg-blue-200`}><MdFilterList className='text-blue-800 text-base' /></button>
          <div className='h-6 border-s border-s-blue-300'></div>
          <button
            title='save filter'
            onClick={handleSaveCurrentFilter}
            className='px-1 hover:bg-blue-200'
          ><FiSave className='text-blue-700 text-base font-light' />
          </button>

          {isFilterListVisible && <ul ref={listRef} className='absolute p-3 z-10 shadow-md rounded-lg -left-16 md:-left-2 top-[calc(100%+4px)] bg-white border flex flex-col gap-3 max-w-[calc(97vw)] md:max-w-[calc(100vw-280px)] xl:max-w-[992px] overflow-x-auto'>{
            all.filters?.map((encodedString, index) => {
              let searchParams = new URLSearchParams(encodedString)
              let keys = searchParams.keys().toArray()
              return (
                <li
                  key={index}
                  role='button'
                  onClick={() => { dispatch(setActiveAll(index)); dispatch(updateActiveSavedFilters({ atIdx: index })) }}
                  className={`${all.active === index ? 'bg-blue-50 border-blue-300' : ' border-gray-200'}  flex gap-1 items-center p-2 rounded-md border w-max md:w-max xl:w-full`}
                >{
                    keys.map(key => {
                      return (<span key={key} className='relative'>
                        <span className={`text-gray-600 text-[.65rem] p-px px-[2px] leading-3 rounded  absolute -top-[50%] translate-y-1/2 left-2 text-nowrap ${all.active === index ? 'bg-blue-50' : 'bg-white'}`}>{filterKeyMap[key] || key}</span>
                        <span className='border text-gray-800 min-w-28 text-sm text-center inline-block text-nowrap rounded border-indigo-200 px-2 py-1'>{key === 'sort' ? reverseSortMap.get(searchParams.get(key)) : searchParams.get(key)}</span>
                      </span>)
                    })
                  }
                </li>
              )
            })
          }</ul>}
        </div>}

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


        <div className="mx-3 flex items-center text-sm border rounded-md focus-within:ring-2 focus-within:ring-blue-500">
          <select
            value={selectedMenuOption}
            onChange={(e) => setSelectedMenuOption(e.target.value)}
            className={'bg-gray-50 h-full text-sm focus:outline-none p-1 rounded-s-md border-e hover:bg-gray-100'}
          >
            <option value="family head">Family Head</option>
            <option value="investor name">Investor Name</option>
            <option value="PAN">PAN</option>
          </select>

          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search Keywords"
            className="ms-2 mx-1 w-full text-sm focus:outline-none"
          />

          <button onClick={handleSearch} className="rounded-e-md h-full p-2 hover:bg-gray-50">
            <FaSearch />
          </button>
        </div>

        <SortMenu
          list={sortOptions}
          selectedValue={sortBy}
          updateSelected={(value) => setSortBy(value)}
          width='200px'
        />
        <button title='Clear all filters' onClick={handleClearAll} className='rounded-md border border-red-100 py-1 px-2 hover:border-red-500 hover:text-red-500'>Clear all</button>
      </div>
      <div className="flex items-center gap-x-2 gap-y-2 my-3 text-sm text-gray-700 flex-wrap">
        {filterConfig.amount && <div title='Amount' className="flex bg-white items-center rounded-md border">
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
        </div>}
        {filterConfig.date && <div className="flex bg-white items-center rounded-md border">
          <span className='text-xl ps-px'><CiCalendarDate /></span>

          <label
            htmlFor="min-date"
            className={`relative focus-within:bg-gray-100 text-sm w-[84px] p-1 text-center hover:bg-gray-100 ${!filters.minDate ? 'text-gray-500' : 'text-blue-600'}`}
          >{filters.minDate ? formatDateDDShortMonthNameYY(filters.minDate) : 'From'}
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
            className={`relative focus-within:bg-gray-100 text-sm w-[84px] p-1 text-center rounded-e-md hover:bg-gray-100 ${!filters.maxDate ? 'text-gray-500' : 'text-blue-600'}`}
          >{filters.maxDate ? formatDateDDShortMonthNameYY(filters.maxDate) : 'To'}
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
        </div>}

        {filterConfig.type && <select
          name="type"
          id="type"
          value={filters.type}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.type ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {typeOptions?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`}>{item || "Type"}</option>
          ))}
        </select>}

        <SearchSelectMenu
          selectedValue={filters.amcName}
          updateSelected={(item) => { handleFilterChange({ target: { name: 'amcName', value: item } }) }}
          list={amcOptions}
          defaultEmptyName='AMC Name'
        />

        <SearchSelectMenu
          selectedValue={filters.schemeName}
          updateSelected={(item) => { handleFilterChange({ target: { name: 'schemeName', value: item } }) }}
          list={schemeOptions}
          defaultEmptyName='Scheme Name'
        />

        {filterConfig.relationshipManager && <select
          name="rmName"
          id="rm-name"
          value={filters.rmName}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.rmName ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {rmNameOptions?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`}>{item || "RM Name"}</option>
          ))}
        </select>}

        {filterConfig.serviceManager && <select
          name="smName"
          id="sm-name"
          value={filters.smName}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.smName ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {smNameOptions?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`}>{item || "SM Name"}</option>
          ))}
        </select>}

        {filterConfig.status && <MultiSelectMenu
          selectedValues={filters.status}
          updateSelectedValues={(item) => { handleFilterChange({ target: { name: 'status', value: item } }) }}
          list={statusOptions}
          defaultEmptyName='Status'
        />}

        {filterConfig.trxFor && <select
          name="transactionFor"
          id="transactionFor"
          value={filters.transactionFor}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.transactionFor ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {forOptions?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`}>{item || "Transaction For"}</option>
          ))}
        </select>}

        {filterConfig.approvalStatus && <select
          name="approvalStatus"
          id="approvalStatus"
          value={filters.approvalStatus}
          onChange={handleFilterChange}
          className={`px-2 py-1 text-sm rounded-md border focus:outline-blue-500 ${!filters.approvalStatus ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {approvalStatusOptions?.map(item => (
            <option key={item} value={item} className={`${!item ? 'text-gray-500' : 'text-gray-700'}`}>{item || "Approval List"}</option>
          ))}
        </select>}

      </div>
    </div>
  )
}

export default FiltersBar;
