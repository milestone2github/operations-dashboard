import React, { useEffect, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { IoIosArrowDown } from 'react-icons/io'
import '../CustomScrollbar.css'

function SearchSelectMenu({ list, selectedValue, updateSelected, width='260px', defaultEmptyName = 'select', handleSearchAction = (key) => { } }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isActive, setIsActive] = useState(false)
  const container = useRef(null)
  const debounceTimeout = useRef(null)

  const toggleDropdown = () => setIsActive(!isActive)

  const handleSearch = (e) => {
    let { value } = e.target;
    setSearchTerm(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleSearchAction(value);
    }, 300);
  };

  const handleClick = (item) => {
    updateSelected(item)
    setIsActive(false)
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
    let selectedIndex = list.findIndex(option => option === selectedValue);
    let newSelectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newSelectedIndex = selectedIndex < list.length - 1 ? selectedIndex + 1 : selectedIndex;
        updateSelected(list[newSelectedIndex]); //select this option
        break;
      case 'ArrowUp':
        event.preventDefault();
        newSelectedIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
        updateSelected(list[newSelectedIndex]); //select this option
        break;
      case 'Enter':
        toggleDropdown();
        break;
      case 'Escape':
        setIsActive(false);
        break;
      case 'Tab':
        // setIsActive(false);
        break;
      default:
        break;
    }
  };


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
        <p title={selectedValue} className={`w-full rounded-md px-2 py-1 cursor-default ${!selectedValue ? 'text-gray-500': 'text-blue-600'} overflow-hidden text-ellipsis whitespace-nowrap`}>{selectedValue || defaultEmptyName}</p>
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

        <ul className='custom-scrollbar max-h-80 overflow-y-auto w-full snap-mandatory'>{list?.map((item, index) =>
          <li
            key={index}
            role='option'
            aria-selected={selectedValue === item}
            className={`p-2 w-full rounded-md snap-start ${selectedValue === item ? 'bg-blue-400 text-white' : 'hover:bg-gray-100'} cursor-pointer`}
            onClick={() => handleClick(item)}
          >{item || 'Select'}</li>
        )}</ul>
      </div>}
    </div>
  )
}

export default SearchSelectMenu