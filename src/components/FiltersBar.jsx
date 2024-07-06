import React, { useEffect, useState } from 'react'
import SearchSelectMenu from './SearchSelectMenu'
import { useDispatch, useSelector } from 'react-redux'
import { getAllAmc, getAllSchemes, getRMNames } from '../redux/allFilterOptions/FilterOptionsAction'
import toast from 'react-hot-toast'
import { CiCalendarDate } from 'react-icons/ci'
import { formatDateDDShortMonthNameYY } from '../utils/formatDate'
import { resetSchemeList } from '../redux/allFilterOptions/FilterOptionsSlice'

function FiltersBar({filters, updateFilters}) {
  const [filteredAmcs, setFilteredAmcs] = useState([''])
  const [filteredSchemes, setFilteredSchemes] = useState([''])
  const { amcList, typeList, schemesList, rmNameList, error } = useSelector(state => state.allFilterOptions)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAllAmc())
    dispatch(getRMNames())
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    updateFilters({ ...filters, [name]: value })
  }

  const handleFilterAmc = (key) => {
    setFilteredAmcs(amcList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  const handleFilterSchemes = (key) => {
    setFilteredSchemes(schemesList.filter(item => item.toLowerCase().includes(key.toLowerCase())))
  }

  return (
    <div className="flex items-center gap-x-2 gap-y-2 my-3 text-sm text-gray-700 flex-wrap">

          <div className="flex bg-white items-center rounded-md border">
            <span className='text-xl ps-px'><CiCalendarDate /></span>

            <label
              htmlFor="min-date"
              className={`relative focus-within:bg-gray-100 text-sm w-[76px] p-1 text-center hover:bg-gray-100 ${!filters.minDate? 'text-gray-500' : 'text-blue-600'}`}
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
              className={`relative focus-within:bg-gray-100 text-sm w-[76px] p-1 text-center rounded-e-md hover:bg-gray-100 ${!filters.maxDate? 'text-gray-500' : 'text-blue-600'}`}
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

        </div>
  )
}

export default FiltersBar