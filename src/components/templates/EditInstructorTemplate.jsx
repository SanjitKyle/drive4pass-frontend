import React from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import InstructorForm from "./InstructorForm";

const DialogLoading = () => (
    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
    </div>
);
const EditInstructorTemplate = ({ instructorData }) => {
    const { instructorLoading } = useStateContext();
    return (
        <div className="relative min-h-[300px]">
            {instructorLoading && <DialogLoading />}
            <InstructorForm instructorValues={instructorData} />
        </div>
    );
};

export default EditInstructorTemplate;