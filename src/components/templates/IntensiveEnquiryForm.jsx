import React, { useState, useEffect, useMemo } from "react";

const IntensiveEnquiryForm = ({ enquiryValues = {}, branches = [], packages = [], pricing = [], onChange }) => {
    const isEdit = Boolean(enquiryValues._id || enquiryValues.id || enquiryValues.EnquiryID);
    const [formValues, setFormValues] = useState({
        name: enquiryValues.name || '',
        email: enquiryValues.email || '',
        phone: enquiryValues.phone || '',
        course_interested: enquiryValues.course_interested || 'Not sure',
        previous_lessons: enquiryValues.previous_lessons || '0 previous lessons',
        transmission: enquiryValues.transmission || 'Automatic',
        postcode: enquiryValues.postcode || '',
        status: enquiryValues.status || 'New',
        additional_message: enquiryValues.additional_message || '',
        internal_notes: enquiryValues.internal_notes || enquiryValues.internal_note || '',
        duration: enquiryValues.duration || '',
        price: enquiryValues.price || ''
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
            {/* Name */}
            <div>
                <label className={labelClass}>Name</label>
                <input type="text" name="name" value={formValues.name} onChange={handleChange} className={inputClass} placeholder="Name" required />
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
            {/* Course Interested */}
            <div>
                <label className={labelClass}>Course Interested</label>
                <select name="course_interested" value={formValues.course_interested} onChange={handleChange} className={inputClass}>
                    <option value="Not sure">Not sure</option>
                    <option value="4 Weeks">4 Weeks</option>
                    <option value="3 Weeks">3 Weeks</option>
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="1 Week">1 Week</option>
                </select>
            </div>
            {/* Previous Lessons */}
            <div>
                <label className={labelClass}>Previous Lessons</label>
                <select name="previous_lessons" value={formValues.previous_lessons} onChange={handleChange} className={inputClass}>
                    <option value="0 previous lessons">0 previous lessons</option>
                    <option value="1-5 lessons">1-5 lessons</option>
                    <option value="5-10 lessons">5-10 lessons</option>
                    <option value="10+ lessons">10+ lessons</option>
                    <option value="20+ lessons">20+ lessons</option>
                </select>
            </div>
            {/* Transmission */}
            <div>
                <label className={labelClass}>Transmission</label>
                <select name="transmission" value={formValues.transmission} onChange={handleChange} className={inputClass}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                </select>
            </div>
            {/* Status */}
            <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formValues.status} onChange={handleChange} className={inputClass}>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Booked">Booked</option>
                    <option value="Waiting list">Waiting list</option>
                    <option value="No Response">No Response</option>
                    <option value="Test-Only Enquiry">Test-Only Enquiry</option>
                    <option value="Passed to Office">Passed to Office</option>
                    <option value="Quoted / Price Given">Quoted / Price Given</option>
                    <option value="Call Back Later">Call Back Later</option>
                    <option value="Lost">Lost</option>
                </select>
            </div>
            {/* Price */}
            <div>
                <label className={labelClass}>Price</label>
                <input type="text" name="price" value={formValues.price} onChange={handleChange} className={inputClass} placeholder="Price" />
            </div>
            {/* Duration */}
            <div>
                <label className={labelClass}>Duration</label>
                <input type="text" name="duration" value={formValues.duration} onChange={handleChange} className={inputClass} placeholder="Duration" />
            </div>
            {/* Additional Message */}
            <div className="md:col-span-2">
                <label className={labelClass}>Additional Message</label>
                <textarea name="additional_message" value={formValues.additional_message} onChange={handleChange} className={inputClass} placeholder="Additional Message" rows="3" />
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

export default IntensiveEnquiryForm;
