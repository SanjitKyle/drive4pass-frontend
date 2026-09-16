import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye } from 'react-icons/ai';
import { useStateContext } from '../../contexts/ContextProvider';

const ViewEnquiryCell = (props) => {
  const { markAsViewed } = useStateContext() || {};
  const navigate = useNavigate();
  
  const targetId = props._id || props.id || props.EnquiryID;
  const isFranchise = props.enquiry_type === 'franchise';
  const path = isFranchise ? `/franchise-enquiries/${targetId}` : `/enquiries/${targetId}?type=${props.enquiry_type || 'lessons'}`;

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (markAsViewed && targetId) {
      try {
        markAsViewed(targetId);
      } catch(err) {
        console.error(err);
      }
    }
    navigate(path, { state: { enquiry: props } });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex justify-center items-center gap-3">
      <button
        type="button"
        onClick={handleLinkClick}
        className="text-xl text-blue-500 hover:text-blue-700 transition-colors p-2 inline-flex items-center justify-center focus:outline-none bg-transparent border-none cursor-pointer"
        title="View Details"
      >
        <AiOutlineEye />
      </button>
    </div>
  );
};

export default ViewEnquiryCell;