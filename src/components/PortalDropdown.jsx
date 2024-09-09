import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

const Dropdown = ({ children, isOpen, onClose, toggleRef }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visibility, setVisibility] = useState('hidden')

  // Function to update the dropdown position
  const updatePosition = () => {
    if (toggleRef.current && dropdownRef.current) {
      const toggleRect = toggleRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight || 0;

      // Set the dropdown's position based on the button's position
      setPosition({
        // top: toggleRect.top + (toggleRect.height / 2) - (dropdownHeight / 2),
        top: toggleRect.top + (toggleRect.height / 2) - (dropdownHeight),
        left: toggleRect.left - dropdownRef.current.offsetWidth - 136, // 8px gap from the button
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition(); // Set initial position when dropdown is opened
      setVisibility('visible')

      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !toggleRef.current.contains(event.target)
        ) {
          onClose();
        }
      };

      // Listen to scroll and resize events
      window.addEventListener("scroll", updatePosition, true); // Using capture phase to catch scroll events early
      window.addEventListener("resize", updatePosition);
      document.addEventListener("mousedown", handleClickOutside);

      // Clean up event listeners
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, toggleRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="absolute w-48 bg-white rounded-lg shadow-lg"
      style={{ top: `${position.top}px`, left: `${position.left}px`, visibility: visibility}}
    >
      {children}
    </div>,
    document.body
  );
};

export default Dropdown;
