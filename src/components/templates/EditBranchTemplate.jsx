import React from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import BranchForm from './BranchForm';

const DialogLoading = () => (
  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
  </div>
);

const EditBranchTemplate = ({ branchData }) => {
  const { branchLoading } = useStateContext();

  // console.log('EditBranchTemplate received branchData:', branchData);

  return (
    <div className="relative">
      {branchLoading && <DialogLoading />}
      {/* Pass only the required prop */}
      <BranchForm branch={branchData} />
    </div>
  );
};

export default EditBranchTemplate;
