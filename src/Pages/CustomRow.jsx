import React from 'react';
 // Import your custom CSS

const CustomRow = ({ data }) => {
  return (
    <div className="custom-row">
      {/* Render your row content here */}
      {Object.values(data).map((value, index) => (
        <div key={index} className="custom-cell">
          {value}
        </div>
      ))}
    </div>
  );
};

export default CustomRow;
