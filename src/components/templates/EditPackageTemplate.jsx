import React from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import PackageForm from './PackageForm';

const DialogLoading = () => (
  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
  </div>
);

const EditPackageTemplate = ({packageData}) => {
  const { packageLoading, branches } = useStateContext();

  return (
    <div className="relative min-h-[160px]">
      {packageLoading && <DialogLoading />}
      <PackageForm packageValues={packageData} areas={branches} />
    </div>
  );
};

export default EditPackageTemplate;
