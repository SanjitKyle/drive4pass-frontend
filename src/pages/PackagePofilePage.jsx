import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/axios';

const PackageProfilePage = () => {
  const { id } = useParams();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔹 Fetch single package */
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`/ds/package-masters/${id}`);
        setPkg(res.data);
      } catch (error) {
        setPkg(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  /* 🔒 Redirect if not found */
  // if (!loading && !pkg) {
  //   return <Navigate to="/packages" replace />;
  // }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* BACK */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to Packages
      </button>

      {/* HEADER */}
      <div className="bg-white dark:bg-secondary-dark-bg rounded-xl p-6 shadow flex flex-col md:flex-row justify-between gap-6">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl font-bold">{pkg.package_name}</h1>
          <p className="text-sm text-gray-500">Package ID: {pkg._id}</p>
          <p className="text-sm text-gray-500">Slug: {pkg.package_slug}</p>
        </div>

        {/* RIGHT */}
        <div className="text-sm text-gray-500 text-right">
          <p>Created: {new Date(pkg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
          <p>Updated: {new Date(pkg.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
        </div>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Package Details">
            <Info label="Package Name" value={pkg.package_name} />
            <Info label="Duration" value={`${pkg.duration} Days`} />
            <Info label="Slug" value={pkg.package_slug} />
            <Info label="School ID" value={pkg.school_id} />
          </Card>
        </div>

        {/* META */}
        <div className="space-y-4">
          <Card title="Meta Information">
            <Info label="Package ID" value={pkg._id} />
            <Info label="Created At" value={new Date(pkg.createdAt).toLocaleString()} />
            <Info label="Updated At" value={new Date(pkg.updatedAt).toLocaleString()} />
          </Card>
        </div>

      </div>
    </div>
  );
};

export default PackageProfilePage;

/* ---------- SMALL COMPONENTS ---------- */

const Card = ({ title, children }) => (
  <div className="bg-white dark:bg-secondary-dark-bg rounded-xl p-6 shadow space-y-4">
    <h3 className="font-semibold">{title}</h3>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
