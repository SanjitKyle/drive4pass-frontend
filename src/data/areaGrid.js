import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEye } from 'react-icons/ai';
import { FiMap } from 'react-icons/fi';

export const areaGrid = [
  { type: 'checkbox', width: '50' },

  {
    field: '_id',
    headerText: 'Area ID',
    width: '180',
    textAlign: 'start',
    isPrimaryKey: true,
    visible: false,
  },

  {
    field: 'name',
    headerText: 'Area Name',
    width: '180',
    textAlign: 'Left',
    template: (rowData) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#03C9D7] flex items-center justify-center text-white font-bold text-xs shadow-md">
          {rowData.name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-200">
          {rowData.name}
        </span>
      </div>
    ),
  },

  {
    field: 'areacode',
    headerText: 'Area Code',
    width: '140',
    textAlign: 'Center',
    allowEditing: true,
    template: (rowData) => (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono text-xs font-bold tracking-widest border border-slate-200 dark:border-slate-700">
          {rowData.areacode}
        </span>
      </div>
    ),
  },



  // {
  //   headerText: 'School',
  //   width: '220',
  //   template: (rowData) => (
  //     <span className="font-medium">
  //       {rowData.school_id?.school_name || '-'}
  //     </span>
  //   ),
  // },

  // {
  //   headerText: 'City',
  //   width: '140',
  //   template: (rowData) => (
  //     <span>{rowData.school_id?.city || '-'}</span>
  //   ),
  // },

  // {
  //   field: 'contact_email',
  //   headerText: 'Email',
  //   width: '220',
  // },

  // {
  //   field: 'phone',
  //   headerText: 'Phone',
  //   width: '150',
  // },

  // {
  //   headerText: 'Currency',
  //   width: '120',
  //   textAlign: 'Center',
  //   template: (rowData) => (
  //     <span>
  //       {rowData.currency_symbol} {rowData.branch_currency}
  //     </span>
  //   ),
  //   visible: false,
  // },

  // {
  //   headerText: 'Timezone',
  //   width: '180',
  //   textAlign: 'Center',
  //   field: 'branch_timezones',
  //   visible: false,
  // },

  {
    headerText: 'Status',
    width: '120',
    textAlign: 'Center',
    template: (rowData) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          rowData.status === 'Active'
            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}
      >
        {rowData.status}
      </span>
    ),
  },

  {
    headerText: 'View',
    width: '80',
    template: (rowData) => (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.location.href = `/areas/${rowData._id}`;
        }}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
      >
        <AiOutlineEye className="text-lg text-blue-600 dark:text-blue-400" />
      </div>
    ),
  },
];
