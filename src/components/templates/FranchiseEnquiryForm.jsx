import React, { useState } from "react";

const FranchiseEnquiryForm = ({ enquiryValues = {}, onChange }) => {
    const isEdit = Boolean(enquiryValues._id || enquiryValues.id || enquiryValues.EnquiryID);
    const [formValues, setFormValues] = useState({
        first_name: enquiryValues.first_name || '',
        email: enquiryValues.email || '',
        phone: enquiryValues.phone || '',
        instructor_type: enquiryValues.instructor_type || 'ADI',
        franchise_status: enquiryValues.franchise_status || 'YES',
        postcode: enquiryValues.postcode || '',
        status: enquiryValues.status || 'New',
        message: enquiryValues.message || '',
        internal_notes: enquiryValues.internal_notes || enquiryValues.internal_note || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => {
            const newValues = { ...prev, [name]: value };
            if (onChange) onChange(newValues);
            return newValues;
        });
    };

    const inputClass = "w-full px-4 py-2.5 mt-1 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#0f172a]";
    const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 block";

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 max-h-[70vh] overflow-y-auto">
            {/* First Name */}
            <div>
                <label className={labelClass}>First Name</label>
                <input type="text" name="first_name" value={formValues.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" required />
            </div>
            {/* Email */}
            <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={formValues.email} onChange={handleChange} className={inputClass} placeholder="Email" />
            </div>
            {/* Phone */}
            <div>
                <label className={labelClass}>Phone</label>
                <input type="text" name="phone" value={formValues.phone} onChange={handleChange} className={inputClass} placeholder="Phone" />
            </div>
            {/* Postcode */}
            <div>
                <label className={labelClass}>Postcode</label>
                <input type="text" name="postcode" value={formValues.postcode} onChange={handleChange} className={inputClass} placeholder="Postcode" />
            </div>
            {/* Instructor Type */}
            <div>
                <label className={labelClass}>Instructor Type</label>
                <select name="instructor_type" value={formValues.instructor_type} onChange={handleChange} className={inputClass}>
                    <option value="ADI">ADI</option>
                    <option value="PDI">PDI</option>
                </select>
            </div>
            {/* Franchise Status */}
            <div>
                <label className={labelClass}>Franchise Status</label>
                <select name="franchise_status" value={formValues.franchise_status} onChange={handleChange} className={inputClass}>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                </select>
            </div>
            {/* Status */}
            <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formValues.status} onChange={handleChange} className={inputClass}>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Under review">Under review</option>
                    <option value="Waiting list">Waiting list</option>
                    <option value="No response">No response</option>
                </select>
            </div>
            {/* Message */}
            <div className="md:col-span-2">
                <label className={labelClass}>Message</label>
                <textarea name="message" value={formValues.message} onChange={handleChange} className={inputClass} placeholder="Message" rows="3" />
            </div>
            {/* Internal Notes */}
            {!isEdit && (
                <div className="md:col-span-2">
                    <label className={labelClass}>Internal Notes (Visible only to admins)</label>
                    <textarea name="internal_notes" value={formValues.internal_notes} onChange={handleChange} className={inputClass} placeholder="Add private notes..." rows="3" />
                </div>
            )}
        </div>
    );
};

export default FranchiseEnquiryForm;
