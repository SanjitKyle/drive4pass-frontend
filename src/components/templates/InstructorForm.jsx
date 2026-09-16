import React, { useState } from "react";

const InstructorForm = ({ instructorValues = {} }) => {
    const getServiceAreas = () => {
        const area = instructorValues.service_provided_area;
        if (Array.isArray(area)) {
            return area.join(', ');
        }
        if (typeof area === 'string' && area.startsWith('[')) {
            try {
                return JSON.parse(area).join(', ');
            } catch {
                return area;
            }
        }
        return area || instructorValues.service_areas || '';
    };

    const [formValues, setFormValues] = useState({
        name: instructorValues.name || '',
        email: instructorValues.email || '',
        mobile: instructorValues.mobile || '',
        password: '',
        instructor_bio: instructorValues.instructor_bio || '',
        full_address: instructorValues.full_address || '',
        driving_details: instructorValues.driving_details || '',
        driving_licence_number: instructorValues.driving_lichence_number || instructorValues.driving_licence_number || '',
        licence_expiry_date: instructorValues.licence_expiry_date ? instructorValues.licence_expiry_date.slice(0, 10) : '',
        badge_number: instructorValues.pdi_badge_number || instructorValues.badge_number || '',
        badge_expiry_date: instructorValues.badge_expiry_date ? instructorValues.badge_expiry_date.slice(0, 10) : '',
        driving_experience: instructorValues.experience || instructorValues.driving_experience || '',
        transmission_type: instructorValues.transmission_type || '',
        entry_type: instructorValues.entry_type || '',
        work_type: instructorValues.work_type || '',
        type: instructorValues.type || '',
        start_date: instructorValues.start_date ? instructorValues.start_date.slice(0, 10) : '',
        franchise_start_date: instructorValues.franchise_start_date ? instructorValues.franchise_start_date.slice(0, 10) : '',
        car_make: instructorValues.car_make || '',
        car_model: instructorValues.car_model || '',
        car_reg: instructorValues.car_reg || '',
        service_areas: getServiceAreas(),
        status: instructorValues.status || '1',
        contract_signed: instructorValues.contract_signed || 'No',
        internal_notes: instructorValues.internal_notes || instructorValues.internal_note || '',
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormValues((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    React.useEffect(() => {
        window.__instructorFormValues = formValues;
    }, [formValues]);
    const inputClass = "w-full px-4 py-2.5 mt-1 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#0f172a]";
    const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 block";


    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 max-h-[70vh] overflow-y-auto">
            {/* Name */}
            <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" name="name" value={formValues.name} onChange={handleChange} className={inputClass} placeholder="Instructor Name" />
            </div>
            {/* Email */}
            <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={formValues.email} onChange={handleChange} className={inputClass} placeholder="Email" />
            </div>
            {/* Mobile */}
            <div>
                <label className={labelClass}>Mobile</label>
                <input type="text" name="mobile" value={formValues.mobile} onChange={handleChange} className={inputClass} placeholder="Mobile" />
            </div>
            {/* Password */}
            <div>
                <label className={labelClass}>Password</label>
                <input type="password" name="password" value={formValues.password} onChange={handleChange} className={inputClass} placeholder="Password" />
            </div>
            {/* Bio */}
            <div className="md:col-span-2">
                <label className={labelClass}>Instructor Bio</label>
                <textarea name="instructor_bio" value={formValues.instructor_bio} onChange={handleChange} className={inputClass} placeholder="Instructor Bio" rows="3" />
            </div>
            {/* Full Address */}
            <div className="md:col-span-2">
                <label className={labelClass}>Full Address</label>
                <textarea name="full_address" value={formValues.full_address} onChange={handleChange} className={inputClass} placeholder="Full Address" rows="2" />
            </div>
            {/* Driving Details */}
            <div className="md:col-span-2">
                <label className={labelClass}>Driving Details</label>
                <textarea name="driving_details" value={formValues.driving_details} onChange={handleChange} className={inputClass} placeholder="Driving Details" rows="2" />
            </div>

            {/* Type */}
            <div>
                <label className={labelClass}>Type</label>
                <select name="type" value={formValues.type} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="ADI">ADI</option>
                    <option value="PDI">PDI</option>
                </select>
            </div>
            {/* Badge Number */}
            <div>
                <label className={labelClass}>ADI / PDI number (6 digits)</label>
                <input type="text" name="badge_number" value={formValues.badge_number} onChange={handleChange} className={inputClass} placeholder="879460" />
            </div>
            {/* Badge Expiry */}
            <div>
                <label className={labelClass}>Badge Expiry Date</label>
                <input type="date" name="badge_expiry_date" value={formValues.badge_expiry_date} onChange={handleChange} className={inputClass} />
            </div>
            {/* Experience */}
            <div>
                <label className={labelClass}>Driving Experience (Years)</label>
                <input type="number" name="driving_experience" value={formValues.driving_experience} onChange={handleChange} className={inputClass} placeholder="Years of Experience" />
            </div>
            {/* Transmission */}
            <div>
                <label className={labelClass}>Transmission Type</label>
                <select name="transmission_type" value={formValues.transmission_type} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Both">Both</option>
                </select>
            </div>

            {/* Work Type */}
            <div>
                <label className={labelClass}>Work Type</label>
                <select name="work_type" value={formValues.work_type} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                </select>
            </div>

            {/* Start Date */}
            <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" name="start_date" value={formValues.start_date} onChange={handleChange} className={inputClass} />
            </div>
            {/* Franchise Start Date */}
            <div>
                <label className={labelClass}>Franchise Start Date</label>
                <input type="date" name="franchise_start_date" value={formValues.franchise_start_date} onChange={handleChange} className={inputClass} />
            </div>
            {/* Car Make */}
            <div>
                <label className={labelClass}>Car Make</label>
                <input type="text" name="car_make" value={formValues.car_make} onChange={handleChange} className={inputClass} placeholder="Toyota" />
            </div>
            {/* Car Model */}
            <div>
                <label className={labelClass}>Car Model</label>
                <input type="text" name="car_model" value={formValues.car_model} onChange={handleChange} className={inputClass} placeholder="Auris" />
            </div>
            {/* Car Reg */}
            <div>
                <label className={labelClass}>Car Reg</label>
                <input type="text" name="car_reg" value={formValues.car_reg} onChange={handleChange} className={inputClass} placeholder="EX65NLD" />
            </div>
            {/* Service Areas */}
            <div className="md:col-span-2">
                <label className={labelClass}>Service Provided Areas</label>
                <input type="text" name="service_areas" value={formValues.service_areas} onChange={handleChange} className={inputClass} placeholder="Example: Bolton, Manchester, Bury" />
            </div>
            {/* Licence Number */}
            <div>
                <label className={labelClass}>Driving Licence Number</label>
                <input type="text" name="driving_licence_number" value={formValues.driving_licence_number} onChange={handleChange} className={inputClass} placeholder="Driving Licence Number" />
            </div>
            {/* Licence Copy */}
            <div className="md:col-span-2">
                <label className={labelClass}>Upload Licence Copy</label>
                <input type="file" name="licence_copy" onChange={handleChange} className={inputClass} />
            </div>
            {/* Licence Expiry */}
            <div>
                <label className={labelClass}>Licence Expiry Date</label>
                <input type="date" name="licence_expiry_date" value={formValues.licence_expiry_date} onChange={handleChange} className={inputClass} />
            </div>
            {/* Status */}
            <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formValues.status} onChange={handleChange} className={inputClass}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>
            </div>
            {/* Contract Signed */}
            <div>
                <label className={labelClass}>Contract Signed</label>
                <select name="contract_signed" value={formValues.contract_signed} onChange={handleChange} className={inputClass}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
            {/* Internal Notes */}
            <div className="md:col-span-2">
                <label className={labelClass}>Internal Notes (Visible only to admins)</label>
                <textarea name="internal_notes" value={formValues.internal_notes} onChange={handleChange} className={inputClass} placeholder="Add private notes..." rows="3" />
            </div>
        </div>
    );
};

export default InstructorForm;