import React, { useEffect } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useSelector } from "react-redux";

const ConfirmDialogModal = ({
  isOpen,
  onClose,
  onConfirm,
  confirmBtnText,
  transactionData,
  header = "Confirm Action",
  actionType = "info", // Default action type
}) => {
  const { updateStatus } = useSelector((state) => state.reconciliation);

  useEffect(() => {
    if (['completed', 'failed'].includes(updateStatus)) { onClose() }
  }, [updateStatus])

  if (!isOpen) return null;

  // Define button styles based on actionType
  const actionTypeStyles = {
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-400",
    warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-400",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-400",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-8 shadow-2xl transform transition-all duration-300 scale-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">{header}</h2>
        <p className="text-gray-600 text-sm mb-6">
          Please review the transaction details below before confirming.
        </p>

        <div className="divide-y divide-gray-200 text-sm">
          <div className="py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Investor Name:</span>
              <span className="text-gray-600">{transactionData?.investorName || "N/A"}</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">PAN Number:</span>
              <span className="text-gray-600">{transactionData?.panNumber || "N/A"}</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Family Head:</span>
              <span className="text-gray-600">{transactionData?.familyHead || "N/A"}</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Amount:</span>
              <span className="text-gray-600">{transactionData?.amount || "N/A"}</span>
            </div>
          </div>
          {/* <div className="py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Type:</span>
              <span className="text-gray-600">{transactionData?.type || "N/A"}</span>
            </div>
          </div> */}
          <div className="py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Scheme Name:</span>
              <span className="text-gray-600">{transactionData?.schemeName || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 min-w-28 text-white rounded-lg shadow-sm transition duration-200 focus:outline-none focus:ring-2 ${actionTypeStyles[actionType]}`}
          >
            {updateStatus === 'pending' ?
              <BiLoaderAlt className='text-lg animate-spin mx-auto' /> :
              confirmBtnText || "Confirm"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialogModal;
