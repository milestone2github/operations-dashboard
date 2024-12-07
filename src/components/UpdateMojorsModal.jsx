import React, { useEffect, useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import SearchSelectMenu from "./SearchSelectMenu";
import { getAllSchemes } from "../redux/allFilterOptions/FilterOptionsAction";
import { resetSchemeList } from "../redux/allFilterOptions/FilterOptionsSlice";

const initialFields = {
  amount: "",
  panNumber: "",
  schemeName: "",
}

const UpdateMajorsModal = ({ isOpen, onClose, onSubmit, originalData }) => {
  const [fields, setFields] = useState(initialFields);
  const [updatedFields, setUpdatedFields] = useState({});
  const { updateStatus } = useSelector((state) => state.reconciliation);
  const { schemesList } = useSelector(state => state.allFilterOptions)
  const dispatch = useDispatch()

  useEffect(() => {
    if (originalData.amcName)
      dispatch(getAllSchemes(originalData.amcName))
    else
      dispatch(resetSchemeList())
  }, [originalData.amcName])

  useEffect(() => {
    if (['completed', 'failed'].includes(updateStatus)) { handleClose() }
  }, [updateStatus])

  // Handle field change and track updates
  const handleFieldChange = (fieldName, value) => {
    setFields((prev) => ({ ...prev, [fieldName]: value }));
    setUpdatedFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    let updatedData = { status: 'major_issues', ...updatedFields };
    onSubmit(updatedData); // Only pass updated fields
  };

  const handleClose = () => {
    setFields(initialFields);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-8 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Fix Major Issues
        </h2>
        <p className="mb-8 text-sm text-gray-600">
          Update only the fields that need correction. Leave others empty.
        </p>

        <div className="flex flex-wrap gap-6">
          {/* Amount */}
          <div className="basis-40 grow shrink">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Amount
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.amount || "N/A"}
            </div>
            <input
              type="number"
              value={fields.amount}
              onChange={(e) =>
                handleFieldChange("amount", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter Amount"
            />
          </div>

          {/* PAN Number */}
          <div className="basis-44 grow">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              PAN Number
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Previous:</span> {originalData?.panNumber || "N/A"}
            </div>
            <input
              type="text"
              value={fields.panNumber}
              onChange={(e) => handleFieldChange("panNumber", e.target.value?.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-4 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter PAN Number"
            />
          </div>

          {/* Scheme  Name*/}
          <div className="basis-56 grow">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Scheme Name
            </label>
            <div className="text-gray-500 text-xs mb-2">
              <span className="font-medium text-nowrap">Previous:</span> {originalData?.schemeName || "N/A"}
            </div>
            <SearchSelectMenu
              selectedValue={fields.schemeName}
              updateSelected={(item) => handleFieldChange('schemeName', item)}
              list={schemesList}
              width="280px"
              defaultEmptyName='Scheme Name'
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

export default UpdateMajorsModal;
