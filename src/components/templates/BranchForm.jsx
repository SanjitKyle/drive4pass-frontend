import React from 'react';

const BranchForm = ({branch}) => {
  const inputClass = "e-field e-input w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500";

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800 dark:text-white">

      {branch._id && <input type="hidden" name="_id" value={branch._id} />}

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="name">Area Name</label>
        <input
          id="name"
          name="name"
          className={inputClass}
          defaultValue={branch.name || ''}
          placeholder='e.g. Central City'
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="areacode">Area Code</label>
        <input
          id="areacode"
          name="areacode"
          className={inputClass}
          placeholder='e.g. CC-01'
          defaultValue={branch.areacode || ''}
          required
        />
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <label className={labelClass} htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          className={inputClass}
          defaultValue={branch.status || 'Active'}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Hidden Fields required by Syncfusion/Backend */}
      <input
        id="address"
        name="address"
        className="e-field e-input w-full hidden"
        defaultValue={branch.address || ''}
      />
      <input
        id="contactEmail"
        name="contact_email"
        className="e-field e-input w-full hidden"
        defaultValue={branch.contact_email || ''}
      />
      <input
        id="phone"
        name="phone"
        className="e-field e-input w-full hidden"
        defaultValue={branch.phone || ''}
      />
      <input
        id="branchCurrency"
        name="branch_currency"
        className="e-field e-input w-full hidden"
        defaultValue={branch.branch_currency || 'USD'}
      />
      <input
        id="currencySymbol"
        name="currency_symbol"
        className="e-field e-input w-full hidden"
        defaultValue={branch.currency_symbol || '$'}
      />
      <input
        id="branchTimezones"
        name="branch_timezones"
        className="e-field e-input w-full hidden"
        defaultValue={branch.branch_timezones || ''}
      />
    </div>
  );
};

export default BranchForm;
