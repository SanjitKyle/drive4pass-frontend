import React from "react";
import EnquiryForm from "./EnquiryForm";
import AdiTrainingEnquiryForm from "./AdiTrainingEnquiryForm";
import IntensiveEnquiryForm from "./IntensiveEnquiryForm";
import FranchiseEnquiryForm from "./FranchiseEnquiryForm";
import { useStateContext } from '../../contexts/ContextProvider';

const EditEnquiryTemplate = ({ enquiryData, filterType }) => {
    const context = useStateContext() || {};
    const branches = context.branches || [];
    const packages = context.packages || [];
    const pricing = context.pricing || [];
    const isAdd = enquiryData.isAdd;
    const values = isAdd ? {} : enquiryData;
    
    // Fallback to localStorage to avoid stale closures in Syncfusion Grid templates
    const activeFilter = localStorage.getItem('enquiryFilterType') || filterType || 'lessons';

    let formComponent;
    if (activeFilter === 'adi') {
        formComponent = <AdiTrainingEnquiryForm enquiryValues={values} onChange={() => {}} />;
    } else if (activeFilter === 'intensives') {
        formComponent = <IntensiveEnquiryForm enquiryValues={values} branches={branches || []} packages={packages || []} pricing={pricing || []} onChange={() => {}} />;
    } else if (activeFilter === 'franchise') {
        formComponent = <FranchiseEnquiryForm enquiryValues={values} onChange={() => {}} />;
    } else {
        formComponent = <EnquiryForm enquiryValues={values} branches={branches || []} packages={packages || []} pricing={pricing || []} onChange={() => {}} />;
    }

    return (
        <div className="bg-white dark:bg-secondary-dark-bg p-4 rounded-xl">
            {formComponent}
        </div>
    );
};

export default EditEnquiryTemplate;
