import React, { useEffect, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { IoIosArrowDown } from 'react-icons/io'

function MultiSelectMenu({ list, selectedValues, updateSelectedValues, width='260px', defaultEmptyName = 'select'}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [filteredList, setFilteredList] = useState(list)
  const container = useRef(null)
  const debounceTimeout = useRef(null)

  const toggleDropdown = () => setIsActive(!isActive)

  useEffect(() => {
    setFilteredList(list)
  }, [list])

  const handleSearch = (e) => {
    let { value } = e.target;
    setSearchTerm(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setFilteredList(list.filter(item => item.toLowerCase().includes(value.toLowerCase())))
    }, 300);
  };

  const handleSelect = (item) => {
    let updatedSelectedValues = [...selectedValues];

    if (updatedSelectedValues.includes(item)) {
      updatedSelectedValues = updatedSelectedValues.filter(val => val !== item);
    } else {
      updatedSelectedValues.push(item);
    }

    updateSelectedValues(updatedSelectedValues);
  }

  // Effect to listen click outside of the Dropdown 
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])

  // method to handle click outside of the SelectMeu 
  const handleClickOutside = (e) => {
    if (!container?.current.contains(e.target)) {
      setIsActive(false);
    }
  };

  const handleKeyDown = (event) => {
    let selectedIndex = list.findIndex(option => selectedValues.includes(option));
    let newSelectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newSelectedIndex = selectedIndex < list.length - 1 ? selectedIndex + 1 : selectedIndex;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newSelectedIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
        break;
      case 'Enter':
        toggleDropdown();
        break;
      case 'Escape':
        setIsActive(false);
        break;
      case 'Tab':
        break;
      default:
        break;
    }
  };

  const selectedCount = selectedValues.reduce((count, item) => {
    return list.includes(item) ? count + 1 : count
  }, 0)

  return (
    <div ref={container} 
      style={{ width }} 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isActive}
      className={`relative border min-w-60 rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
    >
      <div className="flex items-center relative pe-6 w-full" onClick={toggleDropdown}>
        <p title={defaultEmptyName} className={`w-full rounded-md px-2 py-1 cursor-default text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap`}>
          {defaultEmptyName}
        </p>
        <span className='text-xs flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-blue-600'>{selectedCount}</span>
        <span className='absolute right-1 top-1/2 -translate-y-1/2'><IoIosArrowDown /></span>
      </div>

      {isActive && <div className="absolute z-10 bg-white p-2 top-[calc(100%+4px)] left-0 w-full flex flex-col items-center rounded-md shadow-md">

        <div className='flex items-center w-full rounded-md px-1 border focus-within:outline focus-within:outline-blue-400'>
          <span className='text-xl'><CiSearch /></span>
          <input
            type="search"
            name="search-select"
            placeholder='search...'
            value={searchTerm}
            onChange={handleSearch}
            className='w-full  py-2 px-2 focus:outline-none'
          />
        </div>
        <hr className='h-px w-full bg-slate-100 my-1' />

        <ul className='custom-scrollbar max-h-80 overflow-y-auto w-full snap-mandatory'>
          {filteredList?.map((item, index) =>
            <li
              key={index}
              role='option'
              aria-selected={selectedValues.includes(item)}
              title={item}
              className={`w-full rounded-md snap-start ${selectedValues.includes(item) ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer`}
              // onClick={() => handleSelect(item)}
            >
              <label htmlFor={item + "-" + index} className="flex w-full p-2 rounded-md items-center space-x-2">
                <input 
                  id={item + "-" + index}
                  type="checkbox"
                  checked={selectedValues.includes(item)}
                  onChange={() => handleSelect(item)}
                />
                <span>{item.length > 23 ? item.slice(0, 21) + '...' : item}</span>

              </label>
            </li>
          )}
        </ul>
      </div>}
    </div>
  )
}

export default MultiSelectMenu
