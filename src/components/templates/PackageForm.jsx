import React from 'react';

const PackageForm = ({packageValues, areas = []}) => {
  const inputClass = "e-field e-input w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white";

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800 dark:text-white">
      {packageValues._id && <input type="hidden" name="_id" value={packageValues._id} />}
      
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Area</label>
        <select
          name="area"
          className={inputClass}
          defaultValue={packageValues.area?._id || packageValues.area || ''}
          onChange={(e) => { packageValues.area = e.target.value; }}
          required
        >
          <option value="" disabled>Select Area</option>
          {areas.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Package Name</label>
        <input
          name="package_name"
          className={inputClass}
          placeholder="e.g. 10-Hours Package"
          defaultValue={packageValues.package_name || ''}
          onChange={(e) => { packageValues.package_name = e.target.value; }}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Slug ID</label>
        <input
          name="package_slug"
          className={inputClass}
          placeholder="e.g. 10hourpackage"
          defaultValue={packageValues.package_slug || ''}
          onChange={(e) => { packageValues.package_slug = e.target.value; }}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hours Duration</label>
        <input
          type="number"
          name="duration"
          className={inputClass}
          placeholder="e.g. 10"
          defaultValue={packageValues.duration || ''}
          onChange={(e) => { packageValues.duration = e.target.value; }}
          required
        />
      </div>

    </div>
  );
};

export default PackageForm;
