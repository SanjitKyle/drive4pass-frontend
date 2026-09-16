import React, { useState, useEffect, useMemo } from "react";

const formatDateForInput = (dateStr) => {
    if (!dateStr || dateStr === '—') return '';
    try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const EnquiryForm = ({ enquiryValues = {}, branches = [], packages = [], pricing = [], onChange }) => {
    const isEdit = Boolean(enquiryValues._id || enquiryValues.id || enquiryValues.EnquiryID);
    const [formValues, setFormValues] = useState({
        name: enquiryValues.name || enquiryValues.FullName || enquiryValues.full_name || '',
        email: enquiryValues.email || enquiryValues.Email || '',
        phone: enquiryValues.phone || enquiryValues.Phone || enquiryValues.mobile || '',
        postcode: enquiryValues.postcode || enquiryValues.Postcode || enquiryValues.area || enquiryValues.Area || '',
        driving_experience: enquiryValues.driving_experience || enquiryValues.DrivingExperience || '',
        type_of_training: enquiryValues.type_of_training || enquiryValues.LessonType || enquiryValues.lesson_type || enquiryValues.lessonType || '',
        licence: enquiryValues.licence || enquiryValues.HasLicence || '',
        lesson_preference_time: enquiryValues.lesson_preference_time || enquiryValues.PreferredTime || enquiryValues.preferred_time || enquiryValues.preferredTime || '',
        preferred_start_date: formatDateForInput(enquiryValues.preferred_start_date || enquiryValues.start_timeline || enquiryValues.StartTimeline || ''),
        preferred_contact_method: enquiryValues.preferred_contact_method || enquiryValues.PreferredContactMethod || '',
        source: enquiryValues.source || enquiryValues.Source || '',
        status: enquiryValues.status || enquiryValues.EnquiryStatus || 'New',
        additional_message: enquiryValues.additional_message || enquiryValues.Notes || enquiryValues.notes || '',
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
            {/* Driving Experience */}
            <div>
                <label className={labelClass}>Driving Experience</label>
                <select name="driving_experience" value={formValues.driving_experience} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Some Experience">Some Experience</option>
                    <option value="Experienced">Experienced</option>
                </select>
            </div>
            {/* Type of Training */}
            <div>
                <label className={labelClass}>Type of Training</label>
                <select name="type_of_training" value={formValues.type_of_training} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Automatic Car Lessons">Automatic Car Lessons</option>
                    <option value="Manual Car Lessons">Manual Car Lessons</option>
                </select>
            </div>
            {/* Licence */}
            <div>
                <label className={labelClass}>Licence (Yes/No)</label>
                <select name="licence" value={formValues.licence} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            {/* Lesson Preference Time */}
            <div>
                <label className={labelClass}>Lesson Preference Time</label>
                <select name="lesson_preference_time" value={formValues.lesson_preference_time} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                </select>
            </div>
            {/* Preferred Start Date */}
            <div>
                <label className={labelClass}>Preferred Start Date</label>
                <input type="date" name="preferred_start_date" value={formValues.preferred_start_date} onChange={handleChange} className={inputClass} />
            </div>
            {/* Preferred Contact Method */}
            <div>
                <label className={labelClass}>Preferred Contact Method</label>
                <select name="preferred_contact_method" value={formValues.preferred_contact_method} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Phone call">Phone call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                </select>
            </div>
            {/* Source */}
            <div>
                <label className={labelClass}>Source</label>
                <select name="source" value={formValues.source} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Google">Google</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            {/* Status */}
            <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formValues.status} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
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
            {/* Duration */}
            <div>
                <label className={labelClass}>Duration</label>
                <input type="text" name="duration" value={formValues.duration} onChange={handleChange} className={inputClass} placeholder="Duration" />
            </div>
            {/* Price */}
            <div>
                <label className={labelClass}>Price</label>
                <input type="text" name="price" value={formValues.price} onChange={handleChange} className={inputClass} placeholder="Price" />
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

export default EnquiryForm;
