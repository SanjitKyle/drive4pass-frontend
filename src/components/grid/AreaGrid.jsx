import React, { useEffect } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';

const AreaGrid = () => {
  const { branches, branchLoading, fetchBranches } = useStateContext();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  if (branchLoading) {
    return <div className="p-4">Loading branches...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Branches</h2>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-secondary-dark-bg">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">School</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {branches.map((b) => (
              <tr
                key={b._id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3">{b.code}</td>
                <td className="px-4 py-3">{b.school_id?.school_name}</td>
                <td className="px-4 py-3">{b.school_id?.city}</td>
                <td className="px-4 py-3">{b.contact_email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === 'Active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AreaGrid;
