import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { FiMapPin, FiPackage, FiClock, FiCalendar, FiBox, FiPlus, FiList, FiTrash2 } from 'react-icons/fi';
import axios from '../services/axios';
import { BranchService } from '../services/branch.service';
import toast from 'react-hot-toast';
import { useStateContext } from '../contexts/ContextProvider';

const AreaView = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { pricing, fetchPricing, updatePackage, updatePricing, addPricing } = useStateContext();

  useEffect(() => {
    if (!pricing || pricing.length === 0) {
        fetchPricing();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Subareas state
  const [subareas, setSubareas] = useState([]);
  const [loadingSubareas, setLoadingSubareas] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showSubareaModal, setShowSubareaModal] = useState(false);
  const [editingSubareaId, setEditingSubareaId] = useState(null);
  const [subareaForm, setSubareaForm] = useState({
    name: '',
    postcode: '',
    status: 'true'
  });
  const [savingSubarea, setSavingSubarea] = useState(false);

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [matchedPricingId, setMatchedPricingId] = useState(null);
  const [packageForm, setPackageForm] = useState({
    package_name: '',
    package_slug: '',
    duration: '',
    price: ''
  });
  const [savingPackage, setSavingPackage] = useState(false);

  const fetchPackagesData = async () => {
    try {
      const res = await axios.get(`/ds/package-masters/getbyarea/${id}`);
      
      let packagesArray = [];
      if (Array.isArray(res)) {
        packagesArray = res;
      } else if (res && typeof res === 'object') {
        if (Array.isArray(res.packages)) packagesArray = res.packages;
        else if (Array.isArray(res.data)) packagesArray = res.data;
        else if (Array.isArray(res.data?.packages)) packagesArray = res.data.packages;
        else if (Array.isArray(res.data?.data)) packagesArray = res.data.data;
        else {
          const arrayVals = Object.values(res).filter(Array.isArray);
          if (arrayVals.length > 0) packagesArray = arrayVals[0];
        }
      }
      
      setPackages(packagesArray);
    } catch (error) {
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchPackagesData();
  }, [id]);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await BranchService.getOne(id);
        const data = res.data?.branch || res.branch || res.data || res;
        setBranch(data);
      } catch (error) {
        setBranch(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id]);

  useEffect(() => {
    const fetchSubareas = async () => {
      try {
        const res = await axios.get(`/ds/subareas/area/${id}`);
        // Assuming the array could be in res.data, res.data.data, res.subareas, etc.
        let subareasArray = [];
        if (Array.isArray(res)) subareasArray = res;
        else if (res && typeof res === 'object') {
          if (Array.isArray(res.subareas)) subareasArray = res.subareas;
          else if (Array.isArray(res.data)) subareasArray = res.data;
          else if (Array.isArray(res.data?.subareas)) subareasArray = res.data.subareas;
          else if (Array.isArray(res.data?.data)) subareasArray = res.data.data;
          else {
            const arrayVals = Object.values(res).filter(Array.isArray);
            if (arrayVals.length > 0) subareasArray = arrayVals[0];
          }
        }
        setSubareas(subareasArray);
      } catch (error) {
        console.error("Failed to fetch subareas", error);
        setSubareas([]);
      } finally {
        setLoadingSubareas(false);
      }
    };
    fetchSubareas();
  }, [id]);

  const bumpBranchUpdateDate = async () => {
    if (!branch) return;
    try {
      const now = new Date().toISOString();
      setBranch(prev => ({ ...prev, updatedAt: now }));
      await BranchService.update(id, { name: branch.name, areacode: branch.areacode });
    } catch (e) {
      console.log('Failed to bump branch date', e);
    }
  };

  const handleSaveSubarea = async (e) => {
    e.preventDefault();
    if (!subareaForm.name.trim()) {
      toast.error('Subarea name cannot be empty');
      return;
    }
    
    setSavingSubarea(true);
    try {
      if (editingSubareaId) {
        // Edit Mode
        const res = await axios.post(`/ds/subareas/update/${editingSubareaId}`, {
          name: subareaForm.name.trim(),
          area: id,
          postcode: subareaForm.postcode.trim(),
          status: subareaForm.status
        });
        
        toast.success('Subarea updated successfully!');
        
        // Update local state
        setSubareas(prev => prev.map(sub => {
          if (sub._id === editingSubareaId) {
            return { ...sub, name: subareaForm.name.trim(), postcode: subareaForm.postcode.trim(), status: subareaForm.status };
          }
          return sub;
        }));
      } else {
        // Create Mode
        const res = await axios.post('/ds/subareas/create', {
          name: subareaForm.name.trim(),
          area: id, 
          postcode: subareaForm.postcode.trim(),
          status: subareaForm.status
        });
        
        toast.success('Subarea added successfully!');
        
        const newSubarea = res.data?.data || res.data?.subarea || res.data || { 
          name: subareaForm.name.trim(), 
          area: id,
          postcode: subareaForm.postcode.trim(),
          status: subareaForm.status
        };
        setSubareas((prev) => [...prev, newSubarea]);
      }
      
      await bumpBranchUpdateDate();
      
      setSubareaForm({ name: '', postcode: '', status: 'true' });
      setShowSubareaModal(false);
      setEditingSubareaId(null);
    } catch (error) {
      console.error("Failed to save subarea", error);
      toast.error(error.response?.data?.message || 'Failed to save subarea');
    } finally {
      setSavingSubarea(false);
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setSavingPackage(true);
    try {
      if (editingPackageId) {
        // 1. Update Package Details
        await updatePackage(editingPackageId, {
          package_name: packageForm.package_name,
          package_slug: packageForm.package_slug,
          duration: Number(packageForm.duration),
          area: id
        });

        // 2. Update or Add Pricing
        const pricingPayload = {
          branch_id: id,
          package_id: editingPackageId,
          price: Number(packageForm.price)
        };

        if (matchedPricingId) {
          await updatePricing(matchedPricingId, pricingPayload);
        } else {
          await addPricing(pricingPayload);
        }
        
        toast.success('Package & Pricing updated successfully!');
        
        await bumpBranchUpdateDate();
        
        // Refresh packages and pricing
        await fetchPackagesData();
        await fetchPricing();
      }
      
      setShowPackageModal(false);
      setEditingPackageId(null);
    } catch (error) {
      console.error("Failed to save package", error);
      toast.error('Failed to save package configuration');
    } finally {
      setSavingPackage(false);
    }
  };

  const openEditPackageModal = (pkg) => {
    const matchedPricing = pricing?.find(p => p.package_id?._id === pkg._id && p.branch_id?._id === branch?._id);
    setEditingPackageId(pkg._id);
    setMatchedPricingId(matchedPricing?._id || null);
    setPackageForm({
      package_name: pkg.package_name || '',
      package_slug: pkg.package_slug || '',
      duration: pkg.duration || '',
      price: matchedPricing?.price || ''
    });
    setShowPackageModal(true);
  };

  const openAddModal = () => {
    setEditingSubareaId(null);
    setSubareaForm({ name: '', postcode: '', status: 'true' });
    setShowSubareaModal(true);
  };

  const openEditModal = (sub) => {
    setEditingSubareaId(sub._id);
    setSubareaForm({
      name: sub.name || '',
      postcode: sub.postcode || '',
      status: sub.status === 'false' || sub.status === false || sub.status?.toString().toLowerCase() === 'inactive' ? 'false' : 'true'
    });
    setShowSubareaModal(true);
  };

  const handleDeleteSubarea = async (subId) => {
    if (!window.confirm('Are you sure you want to delete this subarea?')) return;
    
    try {
      await axios.post(`/ds/subareas/delete/${subId}`);
      toast.success('Subarea deleted successfully!');
      setSubareas(prev => prev.filter(sub => sub._id !== subId));
      await bumpBranchUpdateDate();
    } catch (error) {
      console.error("Failed to delete subarea", error);
      toast.error(error.response?.data?.message || 'Failed to delete subarea');
    }
  };

  if (!loading && !branch) {
    return <Navigate to="/areas" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen font-sans text-slate-900 dark:text-slate-100">
      
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/areas"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <MdArrowBack className="text-lg" />
          Back to Areas
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-10">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            {/* Minimalist Avatar */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold uppercase shadow-sm">
              {branch.name?.charAt(0) || <FiMapPin />}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
                  {branch.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                  branch.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                  {branch.status}
                </span>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50 font-mono text-[12px]">
                  <span className="text-slate-400 dark:text-slate-500">CODE:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{branch.areacode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right-side Meta Info */}
          <div className="flex flex-row md:flex-col gap-4 md:gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-slate-400" />
              <span>Created <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(branch.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-slate-400" />
              <span>Updated <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(branch.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <FiBox className="text-xl text-slate-400 dark:text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Associated Packages</h3>
          </div>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {packages.length} {packages.length === 1 ? 'Package' : 'Packages'}
          </span>
        </div>

        {(() => {
          if (loadingPackages) {
            return (
              <div className="flex justify-center items-center h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            );
          }
          
          if (packages && packages.length > 0) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {packages.map((pkg, idx) => (
                  <div key={pkg._id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all duration-200 group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                          <FiPackage className="text-lg" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-md text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                            {pkg.package_slug || 'N/A'}
                          </span>
                          <button 
                            onClick={() => openEditPackageModal(pkg)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors"
                            title="Edit Package"
                            aria-label="Edit Package"
                          >
                            <span className="sr-only">Edit Package</span>
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {pkg.package_name}
                      </h4>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-sm font-medium">
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <FiClock className="mr-2 text-slate-400" />
                        {pkg.duration} Hours
                      </div>
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        {(() => {
                          const matchedPricing = pricing?.find(p => 
                            p.package_id?._id === pkg._id && 
                            p.branch_id?._id === branch?._id
                          );
                          const currentPrice = matchedPricing?.price;
                          return currentPrice !== undefined && currentPrice !== null ? `£${currentPrice}` : '£0.00';
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                <FiBox className="text-xl" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No Packages</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">This area doesn&apos;t have any associated packages yet.</p>
            </div>
          );
        })()}
      </div>

      {/* Subareas Section */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-2.5">
            <FiList className="text-xl text-slate-400 dark:text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Subareas</h3>
            <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              {subareas.length} {subareas.length === 1 ? 'Subarea' : 'Subareas'}
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name or postcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <FiPlus className="text-lg" />
              Add Subarea
            </button>
          </div>
        </div>

        {(() => {
          if (loadingSubareas) {
            return (
              <div className="flex justify-center items-center h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            );
          }
          
          const filteredSubareas = subareas.filter(sub => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            const nameMatch = (sub.name || sub.title || '').toLowerCase().includes(term);
            const postcodeMatch = (sub.postcode || '').toLowerCase().includes(term);
            return nameMatch || postcodeMatch;
          });

          if (filteredSubareas && filteredSubareas.length > 0) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredSubareas.map((sub, idx) => (
                  <div 
                    key={sub._id || idx} 
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden border border-slate-100 dark:border-slate-800"
                  >
                    {/* Decorative gradient blob */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 transform group-hover:rotate-6 transition-transform duration-300">
                          {(sub.name || sub.title || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-tight">
                            {sub.name || sub.title || 'Unnamed Subarea'}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 block">
                            Subarea
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Edit Subarea"
                          aria-label="Edit Subarea"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteSubarea(sub._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Subarea"
                          aria-label="Delete Subarea"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4 relative z-10 pt-2">
                      {sub.postcode && (
                        <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-md">
                                <FiMapPin className="text-indigo-600 dark:text-indigo-400" size={12} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Covered Postcodes</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-1">
                            {sub.postcode.split(',').map((code, i) => {
                              const trimmed = code.trim();
                              if (!trimmed) return null;
                              return (
                                <span key={i} className="inline-flex items-center justify-center px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-600">
                                  {trimmed}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between px-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Status</span>
                        {sub.status && (
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                            sub.status === 'true' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                              : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                          }`}>
                            {sub.status === 'true' ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                <FiList className="text-xl" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No Subareas</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">There are no subareas defined for this area yet.</p>
            </div>
          );
        })()}
      </div>

      {/* Subarea Modal */}
      {showSubareaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingSubareaId ? 'Edit Subarea' : 'Add New Subarea'}
              </h3>
              <button 
                onClick={() => setShowSubareaModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveSubarea} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subarea Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={subareaForm.name}
                  onChange={(e) => setSubareaForm({...subareaForm, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                  placeholder="e.g. North Side"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Postcode</label>
                <input
                  type="text"
                  value={subareaForm.postcode}
                  onChange={(e) => setSubareaForm({...subareaForm, postcode: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                  placeholder="e.g. AB12 3CD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select
                  value={subareaForm.status}
                  onChange={(e) => setSubareaForm({...subareaForm, status: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white appearance-none"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubareaModal(false)}
                  className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSubarea || !subareaForm.name.trim()}
                  className="inline-flex items-center justify-center min-w-[100px] px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {savingSubarea && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {!savingSubarea && (editingSubareaId ? 'Update Subarea' : 'Save Subarea')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Edit Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Edit Package Configuration
              </h3>
              <button 
                onClick={() => setShowPackageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSavePackage} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg mb-4 text-xs text-amber-800 dark:text-amber-400 flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <p>Note: Editing the Package Name, Slug, or Duration will update this package globally for all areas. The Price field is specific to this area only.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageForm.package_name}
                  onChange={(e) => setPackageForm({...packageForm, package_name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug ID</label>
                    <input
                      type="text"
                      required
                      value={packageForm.package_slug}
                      onChange={(e) => setPackageForm({...packageForm, package_slug: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Duration (Hours)</label>
                    <input
                      type="number"
                      required
                      value={packageForm.duration}
                      onChange={(e) => setPackageForm({...packageForm, duration: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price (GBP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">£</span>
                  <input
                    type="number"
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPackage || !packageForm.package_name.trim()}
                  className="inline-flex items-center justify-center min-w-[100px] px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {savingPackage && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {!savingPackage && 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AreaView;
