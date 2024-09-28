import React, { useEffect, useRef, useState } from 'react'
import SearchSelectMenu from './SearchSelectMenu'
import { useDispatch, useSelector } from 'react-redux'
import { getAllAmc, getAllSchemes, getRMNames, getSMNames } from '../redux/allFilterOptions/FilterOptionsAction'
import toast from 'react-hot-toast'
import { CiCalendarDate } from 'react-icons/ci'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { resetSchemeList } from '../redux/allFilterOptions/FilterOptionsSlice'
import SortMenu from './SortMenu'
import { MdCurrencyRupee, MdFilterList } from 'react-icons/md'
import { FiSave } from 'react-icons/fi'
import { FaSearch } from 'react-icons/fa'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { resetAddStatus, setActiveAll } from '../redux/savedFilters/SavedFiltersSlice'
import { addSavedFilters, updateActiveSavedFilters } from '../redux/savedFilters/SavedFiltersAction'
import { filterKeyMap } from '../utils/map'

const sortOptions = ['Latest', 'Oldest', 'Amount: low to high', 'Amount: high to low']
const sortMap = new Map()
sortMap.set('Latest', 'trxdate-desc')
sortMap.set('Oldest', 'trxdate-asc')
sortMap.set('Amount: low to high', 'amount-asc')
sortMap.set('Amount: high to low', 'amount-desc')

const reverseSortMap = new Map([...sortMap].map(([key, value]) => [value, key]));

function FiltersBar({ filters, updateFilters, results, aum }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('family head');
  const { amcList, typeList, schemesList, rmNameList, smNameList, statusList, approvalStatusList, transactionForList, error } = useSelector(state => state.allFilterOptions)
  const [filteredAmcs, setFilteredAmcs] = useState([''])
  const [filteredSchemes, setFilteredSchemes] = useState([''])
  const [filteredStatus, setFilteredStatus] = useState(statusList)
  const [isFilterListVisible, setIsFilterListVisible] = useState(false)
  const [sortBy, setSortBy] = useState('Latest')
  const dispatch = useDispatch()
  const minAmountRef = useRef(null)
  const maxAmountRef = useRef(null)
  const listRef = useRef(null)
  const viewListBtn = useRef(null)

  const {all, addStatus} = useSelector(state => state.savedFilters)

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

  const handleSearch = () => {
    // Trigger search based on `searchKeyword` and `selectedMenuOption`
    updateFilters({
      ...filters,
      searchBy: selectedMenuOption,
      search: searchKeyword
    });

    // console.log('Searching for:', searchKeyword, 'in', selectedMenuOption);
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

  const handleFilterAmc = (key) => {
    setFilteredAmcs(amcList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleFilterSchemes = (key) => {
    setFilteredSchemes(schemesList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleFilterStatus = (key) => {
    setFilteredStatus(statusList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleSaveCurrentFilter = () => {
    if(all.filters?.length >= import.meta.env.VITE_SAVED_FILTER_LIMIT || 3) {
      let response = confirm("The filter limit has been reached. The oldest filter will be removed to save the new one. Do you want to proceed?")
      console.log('response: ', response)//test
      if(!response) {return}
    }
    let filterSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if(value) {
        filterSearchParams.append(key, value)
      }
    }
    let filterString = filterSearchParams.toString()
    dispatch(addSavedFilters({at: filterString}))
  }

  useEffect(() => {
    if(addStatus === 'completed') {
      toast.success('Saved')
      setTimeout(dispatch(resetAddStatus()), 3000);
    }
    else if(addStatus === 'failed') {
      toast.error('Unable to save')
      setTimeout(dispatch(resetAddStatus()), 3000);
    }
  }, [addStatus])

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

  const toggleListVisiblilty = () => {setIsFilterListVisible(prev => !prev)}
  
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

  return (
    <div className="flex flex-col text-sm text-gray-700">
      <div className="flex justify-start items-center flex-wrap gap-2">
        <p className='text-gray-700 font-medium text-lg'>Filters</p>
        <div className='relative border rounded border-blue-300 flex h-6'>
          <button ref={viewListBtn} title='saved filters' onClick={toggleListVisiblilty} className={`px-1 ${isFilterListVisible? 'bg-blue-200':''} hover:bg-blue-200`}><MdFilterList className='text-blue-800 text-base' /></button>
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
                  onClick={() => {dispatch(setActiveAll(index)); dispatch(updateActiveSavedFilters({atIdx: index}))}}
                  className={`${all.active === index? 'bg-blue-50 border-blue-300' : ' border-gray-200'}  flex gap-1 items-center p-2 rounded-md border w-max md:w-max xl:w-full`}
                  >{
                  keys.map(key => {
                    return(<span key={key} className='relative'>
                      <span className={`text-gray-600 text-[.65rem] p-px px-[2px] leading-3 rounded  absolute -top-[50%] translate-y-1/2 left-2 text-nowrap ${all.active === index? 'bg-blue-50' : 'bg-white'}`}>{filterKeyMap[key] || key}</span>
                      <span className='border text-gray-800 min-w-28 text-sm text-center inline-block text-nowrap rounded border-indigo-200 px-2 py-1'>{key === 'sort' ? reverseSortMap.get(searchParams.get(key)) : searchParams.get(key)}</span>
                    </span>)})
                }
                {/* <div className='relative ms-auto'>
                  <input className='absolute invisible' type="radio" name="selectedSavedFilter" id={`filter${index+1}`} />
                  <label className='ms-2 rounded-full ring-1 ring-inset ring-green-500 flex items-center justify-center' htmlFor={`filter${index+1}`}>
                    <IoCheckmarkCircle className='text-2xl text-green-500'/>
                  </label>
                </div> */}
                </li>
              )
            })
          }</ul>}
        </div>

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
        

        <div className={'rounded-md  focus-within:ring-2 focus-within:ring-blue-500'}>
           
          <div className="flex items-center px-2 py-1 text-sm rounded-md border text-gray-500">
            <div className="relative">
              <select
                value={selectedMenuOption}
                onChange={(e) => setSelectedMenuOption(e.target.value)}   
                className={`bg-gray-100 text-sm rounded-md focus:outline-none`}
              >
                <option value="family head">Family Head</option>
                <option value="client name">Client Name</option>
                <option value="PAN">PAN</option>
              </select>
            </div>

            {/* Search Input */}
            <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}  // Trigger search on Enter key
            placeholder="Search Keywords"
            className="mx-1 text-sm rounded-md focus:outline-none"
          />

          {/* Search Icon */}
          <FaSearch
            className="cursor-pointer" // Makes the icon clickable
            onClick={handleSearch} // Triggers search when the icon is clicked
          />
        </div>
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