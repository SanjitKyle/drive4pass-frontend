import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEye } from 'react-icons/ai';
import { FiMapPin } from 'react-icons/fi';

export const packagesGrid = [
  { type: 'checkbox', width: '50' },

  {
    field: '_id',
    headerText: 'Package ID',
    width: '180',
    textAlign: 'Center',
    isPrimaryKey: true,
    visible: false, // hidden in grid, available for edit
  },

  {
    field: 'package_name',
    headerText: 'Package Name',
    width: '220',
    textAlign: 'Left',
    template: (rowData) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#03C9D7] flex items-center justify-center text-white font-bold text-xs shadow-md">
          {rowData.package_name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-200">
          {rowData.package_name}
        </span>
      </div>
    ),
  },

  {
    field: 'package_slug',
    headerText: 'Slug',
    width: '220',
    textAlign: 'Left',
    visible: false, // hidden but editable in dialog
  },

  {
    field: 'area',
    headerText: 'Area',
    width: '180',
    textAlign: 'Center',
    allowEditing: true,
    template: (rowData) => (
      <div className="flex justify-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-xs border border-indigo-100 dark:border-indigo-500/20 shadow-sm hover:shadow-md transition-all cursor-default">
          <FiMapPin className="text-sm opacity-80" />
          <span className="truncate max-w-[120px]">
            {rowData.area?.name || rowData.area || '-'}
          </span>
        </div>
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
    field: 'duration',
    headerText: 'Hours Duration',
    width: '150',
    textAlign: 'Center',
    template: (rowData) => (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-xs border border-emerald-100 dark:border-emerald-500/20">
          {rowData.duration} Hours
        </span>
      </div>
    ),
  },

  {
    headerText: 'School Name/ID',
    width: '220',
    textAlign: 'Center',
    allowEditing: false,
    template: (rowData) => (
      <span className="font-medium">
        {rowData.school_id?.school_name || rowData.school_id}
      </span>
    ),
    visible: false,
  },

  {
    headerText: 'Created',
    width: '150',
    textAlign: 'Center',
    allowEditing: false,
    template: (rowData) =>
      new Date(rowData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    visible: false,
  },

  {
    headerText: 'Updated',
    width: '150',
    textAlign: 'Center',
    allowEditing: false,
    template: (rowData) =>
      new Date(rowData.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    visible: false,
  },

  {
    headerText: 'View',
    width: '80',
    // textAlign: 'Center',
    allowEditing: false,
    template: (rowData) => (
      <Link 
        to={`/packages/${rowData._id}`}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors"
      >
        <AiOutlineEye className="text-lg text-blue-600 dark:text-blue-400" />
      </Link>
    ),
    visible: false,
  },
];
