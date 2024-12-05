import React, { useState, useEffect } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useSelector } from "react-redux";
const initialFields = {
  folioNumber: "",
  firstTransactionAmount: "",
  transactionPreference: "",
  sipSwpStpDate: "",
  orderId: "",
}

const UpdateMinorsModal = ({ isOpen, onClose, onSubmit, originalData }) => {
  const [fields, setFields] = useState(initialFields);
  const [updatedFields, setUpdatedFields] = useState({});
  const { updateStatus } = useSelector((state) => state.reconciliation);

  useEffect(() => {
    if (['completed', 'failed'].includes(updateStatus)) { handleClose() }
  }, [updateStatus])

  // Handle field change and track updates
  const handleFieldChange = (fieldName, value) => {
    setFields((prev) => ({ ...prev, [fieldName]: value }));
    setUpdatedFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    let updatedData = { status: 'minor_issues', ...updatedFields };
    onSubmit(updatedData); // Only pass updated fields
  };

  const handleClose = () => {
    onClose();
    setFields(initialFields);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-8 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Fix Minor Issues
        </h2>
        <p className="mb-8 text-sm text-gray-600">
          Update only the fields that need correction. Leave others empty.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Folio Number */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Folio Number
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.folioNumber || "N/A"}
            </div>
            <input
              type="text"
              value={fields.folioNumber}
              onChange={(e) => handleFieldChange("folioNumber", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter Folio Number"
            />
          </div>

          {/* First Transaction Amount */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              First Transaction Amount
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.firstTransactionAmount || "N/A"}
            </div>
            <input
              type="number"
              value={fields.firstTransactionAmount}
              onChange={(e) =>
                handleFieldChange("firstTransactionAmount", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter Amount"
            />
          </div>

          {/* Transaction Preference (Date) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Transaction Preference (Date)
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.transactionPreference || "N/A"}
            </div>
            <input
              type="date"
              value={fields.transactionPreference}
              onChange={(e) =>
                handleFieldChange("transactionPreference", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* SIP/SWP/STP Date */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              SIP/SWP/STP Date
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.sipSwpStpDate || "N/A"}
            </div>
            <input
              type="date"
              value={fields.sipSwpStpDate}
              onChange={(e) => handleFieldChange("sipSwpStpDate", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Order ID */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Order ID
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.orderId || "N/A"}
            </div>
            <input
              type="text"
              value={fields.orderId}
              onChange={(e) => handleFieldChange("orderId", e.target.value?.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter Order ID"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={handleClose}
            disabled={updateStatus === 'pending'}
            className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg disabled:text-gray-400 enabled:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateStatus === 'pending'}
            className="px-5 py-2 w-28  bg-blue-500 text-white rounded-lg disabled:bg-blue-400 enabled:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {updateStatus === 'pending' ?
              <BiLoaderAlt className='text-lg animate-spin mx-auto' /> :
              'Update'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateMinorsModal;
