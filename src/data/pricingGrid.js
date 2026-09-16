import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEye } from 'react-icons/ai';

export const pricingGrid = [
  { type: 'checkbox', width: '50' },

  {
    field: '_id',
    headerText: 'Pricing ID',
    width: '180',
    isPrimaryKey: true,
    visible: false,
  },

  {
    field: 'branch_id.name',
    headerText: 'Area',
    width: '180',
    textAlign: 'Left',
    template: (rowData) => (
      <span className="font-bold text-slate-700 dark:text-slate-200">
        {rowData.branch_id?.name || '—'}
      </span>
    ),
  },

  {
    field: 'package_id.package_name',
    headerText: 'Package Name',
    width: '220',
    textAlign: 'Left',
    template: (rowData) => (
      <span className="font-semibold text-slate-600 dark:text-slate-300">
        {rowData.package_id?.package_name || '—'}
      </span>
    ),
  },

  {
    field: 'package_id.duration',
    headerText: 'Package Duration',
    width: '180',
    textAlign: 'Center',
    template: (rowData) => (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-xs border border-emerald-100 dark:border-emerald-500/20">
          {rowData.package_id?.duration || 0} Hours
        </span>
      </div>
    ),
  },

  {
    field: 'price',
    headerText: 'Price',
    width: '150',
    textAlign: 'Center',
    template: (rowData) => (
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-black text-sm border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
          {rowData.currency_symbol || '£'}{rowData.price}
        </span>
      </div>
    ),
  },

  {
    field: 'search_area_name',
    headerText: 'Search Area',
    visible: false,
    allowEditing: false,
  },

  {
    field: 'search_package_name',
    headerText: 'Search Package',
    visible: false,
    allowEditing: false,
  },

  {
    field: 'search_price',
    headerText: 'Search Price',
    visible: false,
    allowEditing: false,
  },

  {
    headerText: 'View',
    width: '80',
    allowEditing: false,
    visible: false,
    template: (rowData) => (
      <Link to={`/packages/${rowData._id}`}>
        <AiOutlineEye className="text-xl text-red-600 hover:text-red-800 cursor-pointer" />
      </Link>
    ),
  },
];
