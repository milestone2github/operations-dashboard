import React, { useEffect, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { IoIosArrowDown } from 'react-icons/io'
import '../CustomScrollbar.css'
import { AiOutlineSortAscending } from 'react-icons/ai'

function SortMenu({ list, selectedValue, updateSelected, width='260px', defaultEmptyName = 'select'}) {
  const [isActive, setIsActive] = useState(false)
  const container = useRef(null)

  const toggleDropdown = () => setIsActive(!isActive)

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
      className={`relative border min-w-36 rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
    >
      <div className="flex items-center relative pe-6 w-full" onClick={toggleDropdown}>
        <span className='px-1'><AiOutlineSortAscending /></span>
        <span className='text-nowrap text-gray-600'>Sort by</span>
        <p title={selectedValue} className={`w-full rounded-md px-2 py-1 cursor-default ${!selectedValue ? 'text-gray-500': 'text-gray-800'} overflow-hidden text-ellipsis whitespace-nowrap`}>{selectedValue || defaultEmptyName}</p>
        <span className='absolute right-1 top-1/2 -translate-y-1/2'><IoIosArrowDown /></span>
      </div>

      {isActive && <div className="absolute bg-white p-2 top-[calc(100%+4px)] left-0 w-full flex flex-col items-center rounded-md shadow-md z-30">

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

export default SortMenu