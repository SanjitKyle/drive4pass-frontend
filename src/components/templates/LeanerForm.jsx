import React, { useState, useEffect } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';

const LearnerForm = ({
  learnerValues = {},
  branches = [],
  instructors = [],
  packages = [],
}) => {
  const { getPupilSell } = useStateContext();
  const [formValues, setFormValues] = useState({
    full_name: '',
    phone: '',
    email: '',
    instructor_id: '',
    area_id: '',
    package_id: '',
    active: 1, // ✅ default active
  });

  useEffect(() => {
    if (!learnerValues?._id) return;

    setFormValues({
      full_name: learnerValues.full_name || '',
      phone: learnerValues.phone || '',
      email: learnerValues.email || '',
      instructor_id: learnerValues.instructor_id?._id || learnerValues.instructor_id || '',
      area_id: learnerValues.area_id?._id || learnerValues.area_id || '',
      package_id: learnerValues.package_id?._id || learnerValues.package_id || '',
      active: learnerValues.active ?? 1,
    });

    const fetchLatestPackage = async () => {
      try {
        const res = await getPupilSell(learnerValues._id);
        if (res && res.length > 0) {
          // Sort by createdAt descending to get the latest
          const latestSell = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          if (latestSell && latestSell.package_id) {
            const latestPkgId = typeof latestSell.package_id === 'object' ? latestSell.package_id._id : latestSell.package_id;
            setFormValues(prev => ({ ...prev, package_id: latestPkgId }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch latest package", error);
      }
    };

    fetchLatestPackage();
  }, [learnerValues, getPupilSell]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "active") {
      setFormValues((prev) => ({
        ...prev,
        active: parseInt(value, 10),
      }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };
    const inputClass = "w-full px-4 py-2.5 mt-1 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#0f172a]";
    const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 block";


  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">

      <div>
        <label className={labelClass}>Full Name</label>
        <input
          type="text"
          name="full_name"
          value={formValues.full_name}
          onChange={handleChange}
          className={inputClass}
          placeholder="Full Name"
        />
      </div>

      <div>
        <label className={labelClass}>Phone</label>
        <input
          type="text"
          name="phone"
          value={formValues.phone}
          onChange={handleChange}
          className={inputClass}
          placeholder="Phone"
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          className={inputClass}
          placeholder="Email"
        />
      </div>

      {/* Area */}
      <div>
        <label className={labelClass}>Area</label>
        <select
          name="area_id"
          value={formValues.area_id}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select Area</option>
          {branches
            .filter(b => b.status !== 0 && b.status !== '0' && b.status !== 'Inactive' && b.active !== 0 && b.active !== '0')
            .map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Instructor */}
      <div>
        <label className={labelClass}>Instructor</label>
        <select
          name="instructor_id"
          value={formValues.instructor_id}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select Instructor</option>
          {instructors.map((i) => (
            <option key={i._id} value={i._id}>
              {i.name || i.email}
            </option>
          ))}
        </select>
      </div>

      {/* Package (Only when Creating) */}
      {!learnerValues?._id && (
        <div>
          <label className={labelClass}>Package</label>
          <select
            name="package_id"
            value={formValues.package_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Package</option>
            {packages
              .filter((p) => !formValues.area_id || p.area?._id === formValues.area_id || p.area === formValues.area_id)
              .map((p) => (
              <option key={p._id} value={p._id}>
                {p.package_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active / Inactive */}
      <div>
        <label className={labelClass}>Status</label>
        <select
          name="active"
          value={formValues.active}
          onChange={handleChange}
          className={inputClass}
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

    </div>
  );
};

export default LearnerForm;
