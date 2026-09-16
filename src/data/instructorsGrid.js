import React from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { Link } from 'react-router-dom';

export const instructorsGrid = [
  { type: 'checkbox', width: '50' },

  {
    field: '_id',
    headerText: 'Instructor ID',
    width: '120',
    isPrimaryKey: true,
    template: (rowData) => (
      <span title={rowData._id} className="font-mono text-slate-500 dark:text-slate-400 text-xs">
        {rowData._id?.length > 4 ? `${rowData._id.substring(0, 4)}...` : rowData._id}
      </span>
    ),
  },

  // {
  //   headerText: 'Instructor',
  //   width: '150',
  //   template: gridInstructorProfile,
  //   textAlign: 'Center',
  // },

  {
    field: 'name',
    headerText: 'Full Name',
    width: '150',
    textAlign: 'Left',
    template: (rowData) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#03C9D7] flex items-center justify-center text-white font-bold text-xs shadow-md">
          {rowData.name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {rowData.name}
        </span>
      </div>
    ),
  },

  {
    field: 'email',
    headerText: 'Email',
    width: '90',
    textAlign: 'Left',
    template: (rowData) => (
      <span className="text-slate-500 dark:text-slate-400 font-medium" title={rowData.email}>
        {rowData.email?.length > 6 ? `${rowData.email.substring(0, 6)}...` : rowData.email}
      </span>
    ),
  },

  {
    field: 'mobile',
    headerText: 'Phone',
    width: '90',
    textAlign: 'Center',
    template: (rowData) => (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-md bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-100 dark:border-slate-700" title={rowData.mobile}>
          {rowData.mobile?.length > 4 ? `${rowData.mobile.substring(0, 4)}...` : rowData.mobile}
        </span>
      </div>
    ),
  },

  {
    field: 'type',
    headerText: 'Type',
    width: '80',
    textAlign: 'Center',
  },
  {
    field: 'work_type',
    headerText: 'Work Type',
    width: '100',
    textAlign: 'Center',
  },
  {
    field: 'transmission_type',
    headerText: 'Entry Type',
    width: '100',
    textAlign: 'Center',
  },

  // { field: 'Zone', headerText: 'Zone (1–4)', width: '120', textAlign: 'Center' },

  // { field: 'Postcode', headerText: 'Postcode', width: '120', textAlign: 'Center' },

  // {
  //   headerText: 'Country',
  //   width: '120',
  //   textAlign: 'Center',
  //   template: gridInstructorCountry,
  // },

  // { field: 'JoinDate', headerText: 'Join Date', width: '135', format: 'yMd', textAlign: 'Center' },

  // { field: 'Availability', headerText: 'Working Hours', width: '150', textAlign: 'Center' },

  // { field: 'DaysOff', headerText: 'Days Off', width: '120', textAlign: 'Center' },

  // { field: 'OnLeave', headerText: 'Holiday/Sick Leave', width: '150', textAlign: 'Center' },

  // { field: 'PupilCount', headerText: 'Learners', width: '100', textAlign: 'Center' },

  // { field: 'PassRate', headerText: 'Pass Rate (%)', width: '120', textAlign: 'Center' },

  // { field: 'LessonsCompleted', headerText: 'Lessons (This Month)', width: '170', textAlign: 'Center' },

  // { field: 'ConversionRate', headerText: 'Enquiry Conversion (%)', width: '170', textAlign: 'Center' },

  // { field: 'IncomeMonth', headerText: 'Income (This Month)', width: '150', textAlign: 'Center' },

  // { field: 'ExpensesMonth', headerText: 'Expenses (This Month)', width: '150', textAlign: 'Center' },

  // { field: 'FranchiseFee', headerText: 'Franchise Fee', width: '150', textAlign: 'Center' },

  // { field: 'ADIExpiry', headerText: 'ADI Badge Expiry', width: '150', textAlign: 'Center' },

  // { field: 'PDIExpiry', headerText: 'PDI License Expiry', width: '150', textAlign: 'Center' },

  // { field: 'InsuranceExpiry', headerText: 'Insurance Expiry', width: '150', textAlign: 'Center' },

  // { field: 'MOTExpiry', headerText: 'MOT Expiry', width: '150', textAlign: 'Center' },
  {
    headerText: 'Status',
    width: '100',
    textAlign: 'Center',
    template: (rowData) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          rowData.status === 1
            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}
      >
        {rowData.status === 1 ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    headerText: 'View',
    width: '60',
    textAlign: 'Center',
    template: (rowData) => (
      <Link to={`/instructors/${rowData._id}`}>
        <AiOutlineEye className="text-xl text-red-600 hover:text-blue-800 cursor-pointer" />
      </Link>
    ),
  },
  
];