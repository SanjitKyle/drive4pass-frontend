import React, { useState, useEffect } from 'react';

const PricingForm = ({ pricingValues = {}, branches = [], packages = [] }) => {

  const [formData, setFormData] = useState({
    branch_id: '',
    package_id: '',
    price: ''
  });

  useEffect(() => {
    setFormData({
      branch_id: pricingValues.branch_id?._id || pricingValues.branch_id || '',
      package_id: pricingValues.package_id?._id || pricingValues.package_id || '',
      price: pricingValues.price || ''
    });
  }, [pricingValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'branch_id' && prev.branch_id !== value) {
        updated.package_id = '';
      }
      return updated;
    });
  };

  const isEdit = !!pricingValues._id;
  const inputClass = "w-full px-4 py-2.5 mt-1 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#0f172a]";
  const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 block";

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800 dark:text-white">

      {/* Branch */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Area</label>
        <select
          name="branch_id"
          value={formData.branch_id}
          onChange={handleChange}
          className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white cursor-pointer ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
          required
          disabled={isEdit}
        >
          <option value="" className="text-slate-500 bg-white dark:bg-slate-900">Select Area</option>
          {branches
            .filter(b => b.status !== 0 && b.status !== '0' && b.status !== 'Inactive' && b.active !== 0 && b.active !== '0')
            .map((b) => (
            <option key={b._id} value={b._id} className="text-slate-800 dark:text-white bg-white dark:bg-slate-900">
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Package */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Package</label>
        <select
          name="package_id"
          value={formData.package_id}
          onChange={handleChange}
          className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white cursor-pointer ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
          required
          disabled={isEdit}
        >
          <option value="" className="text-slate-500 bg-white dark:bg-slate-900">Select Package</option>
          {packages
            .filter(p => {
              if (!formData.branch_id) return false;
              const pAreaId = typeof p.area === 'object' ? p.area?._id : p.area;
              return pAreaId === formData.branch_id;
            })
            .map((p) => (
            <option key={p._id} value={p._id} className="text-slate-800 dark:text-white bg-white dark:bg-slate-900">
              {p.package_name}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Price (GBP)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="e.g. 50"
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
          required
        />
      </div>

    </div>
  );
};

export default PricingForm;
