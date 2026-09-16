import React from 'react';

const InstructorStatus = ({ Active }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        Active
          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
      }`}
    >
      {Active ? 'Active' : 'Inactive'}
    </span>
  );

export default InstructorStatus;
