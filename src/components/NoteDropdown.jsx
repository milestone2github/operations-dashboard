import React, { useState, useRef, useEffect } from "react";
import PortalDropdown from "./PortalDropdown";
import { CiStickyNote } from "react-icons/ci";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
import { BiSolidPencil } from "react-icons/bi";

const NoteDropdown = ({ handleProceed, existingNote, status }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null); // Reference to the button
  const [note, setNote] = useState(existingNote)

  useEffect(() => {
    setNote(existingNote)
  }, [existingNote])

  useEffect(() => {
    if (status === 'completed') {
      handleCloseDropdown()
    }
  }, [status])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleProceed(note)
  }

  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleCloseDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={toggleRef} // Assign reference to the button
        onClick={handleToggleDropdown}
        className={`relative px-2 py-2 bg-amber-400 text-white rounded-md focus:outline-none`}
      >
        <CiStickyNote className="text-xl"/>
        {note? <BiSolidPencil className="absolute top-[6px] right-[8px] bg-amber-400 rounded-full p-0 text-white text-xs"/>: 
        <IoIosAddCircle className="absolute top-[4px] right-[7px] bg-white rounded-full p-0 text-green-500 text-xs"/>}
      </button>
      <PortalDropdown
        isOpen={isOpen}
        onClose={handleCloseDropdown}
        toggleRef={toggleRef} // Pass the reference to Dropdown
      >
        <form onSubmit={handleSubmit} className={` bg-white rounded-xl shadow-md p-2 w-60 md:w-80 flex flex-col gap-y-2`}>
          <textarea
            name="note"
            cols="30"
            rows="5"
            required
            autoComplete='off'
            className='rounded-md p-2 w-full outline-none'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          >

          </textarea>
          <div className='flex gap-x-3 justify-end'>
            <button onClick={handleCloseDropdown} type='button' className='border text-xs rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
            <button type='submit' disabled={status === 'pending'} className='border text-xs rounded-lg py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white'>{status === 'pending' ? 'Updating...' : 'Update'}</button>
          </div>
        </form>
      </PortalDropdown>
    </div>
  );
};

export default NoteDropdown;
