import React, { useEffect, useRef, useState } from 'react'

function Dropdown(props) {
  const [visible, setVisible] = useState(false);
  const container = useRef(null);

  const toggleDropdown = (e) => {
    setVisible(prevState => !prevState)
  }

  // method to handle click outside of the Dropdown 
  const handleClickOutside = (e) => {
    if (container.current && !container.current.contains(e.target)) {
      setVisible(false);
    }
  };

  // Effect to listen click outside of the Dropdown 
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])
  

  return (
    <div ref={container} className='relative flex h-min'>
      <button type="button" className="inline-flex m-0 items-center justify-center text-xl border-none" onClick={toggleDropdown}>
        {props.toggleButton}
      </button>
      {visible && <div className={`dropdown-menu ${visible ? 'show' : 'hide'} absolute right-0 top-full z-50 mt-3 w-max origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
        {props.children}
      </div>}
    </div>
  )
}

export default Dropdown