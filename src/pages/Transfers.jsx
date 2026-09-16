import React, { useState, useEffect } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Search,
  Page,
  Selection,
  Toolbar,
  Edit,
} from '@syncfusion/ej2-react-grids';
import { Header } from '../components';
import { useStateContext } from '../contexts/ContextProvider';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

import axiosInstance from '../services/axios';
import toast from 'react-hot-toast';
import { FaEye } from 'react-icons/fa';

/* ===================== INITIAL AVATAR ===================== */
const InitialAvatar = ({ name, color }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className={`w-8 h-8 rounded-full ${color || 'bg-blue-500'} text-white flex items-center justify-center text-sm font-semibold`}>
      {initial}
    </div>
  );
};

/* ===================== GRID TEMPLATES ===================== */
const PupilTemplate = (props) => {
  const pupilName = props.pupil_name || 'Unknown Pupil';
  return (
    <div className="flex items-center gap-2">
      <InitialAvatar name={pupilName} color="bg-pink-500" />
      <span className="font-semibold text-slate-800 dark:text-slate-200">{pupilName}</span>
    </div>
  );
};

const FromInstructorTemplate = (props) => {
  const fromName = props.from_name || 'N/A';
  return (
    <div className="flex items-center gap-2">
      <InitialAvatar name={fromName} color="bg-slate-400" />
      <span className="text-slate-600 dark:text-slate-400">{fromName}</span>
    </div>
  );
};

const ToInstructorTemplate = (props) => {
  const toName = props.to_name || 'N/A';
  return (
    <div className="flex items-center gap-2">
      <InitialAvatar name={toName} color="bg-emerald-500" />
      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{toName}</span>
    </div>
  );
};

const ReasonTemplate = (props) => {
  return <span>{props.reason || 'No reason provided'}</span>;
};

const DateTemplate = (props) => {
  if (!props.createdAt) return <span>N/A</span>;
  const date = new Date(props.createdAt);
  return <span>{date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>;
};

const PupilDropdown = ({ data }) => {
  const { learners } = useStateContext();

  const handlePupilChange = (e) => {
    // Only auto-update if the user triggered the change (not on initial load)
    if (e.isInteracted && e.value) {
      const selectedLearner = learners?.find(l => l._id === e.value);
      if (selectedLearner && selectedLearner.instructor_id) {
        const instructorId = selectedLearner.instructor_id._id || selectedLearner.instructor_id;
        
        const transferFromElem = document.getElementById('transfer_from');
        if (transferFromElem && transferFromElem.ej2_instances && transferFromElem.ej2_instances.length > 0) {
          const dropDownObj = transferFromElem.ej2_instances[0];
          dropDownObj.value = instructorId;
        }
      }
    }
  };

  const onFiltering = (e) => {
    let filteredLearners = learners || [];
    if (e.text !== '') {
      const searchStr = e.text.toLowerCase();
      filteredLearners = filteredLearners.filter(l => 
        (l.full_name && l.full_name.toLowerCase().includes(searchStr)) || 
        (l._id && l._id.toLowerCase().includes(searchStr))
      );
    }
    e.updateData(filteredLearners);
  };

  return (
    <DropDownListComponent
      id="pupil_id"
      name="pupil_id"
      dataSource={learners || []}
      fields={{ text: 'full_name', value: '_id' }}
      value={data.pupil_id}
      placeholder="Select a Pupil"
      floatLabelType="Auto"
      allowFiltering
      filtering={onFiltering}
      change={handlePupilChange}
    />
  );
};

const InstructorFromDropdown = ({ data }) => {
  const { instructors } = useStateContext();
  return (
    <DropDownListComponent
      id="transfer_from"
      name="transfer_from"
      dataSource={instructors || []}
      fields={{ text: 'name', value: '_id' }}
      value={data.transfer_from}
      placeholder="Select Transfer From"
      floatLabelType="Auto"
      allowFiltering
    />
  );
};

const InstructorToDropdown = ({ data }) => {
  const { instructors } = useStateContext();
  return (
    <DropDownListComponent
      id="transfer_to"
      name="transfer_to"
      dataSource={instructors || []}
      fields={{ text: 'name', value: '_id' }}
      value={data.transfer_to}
      placeholder="Select Transfer To"
      floatLabelType="Auto"
      allowFiltering
    />
  );
};

const ReasonEditTemplate = ({ data }) => {
  return (
    <TextBoxComponent
      id="reason"
      name="reason"
      value={data.reason}
      placeholder="Reason"
      floatLabelType="Auto"
    />
  );
};

let globalViewHandler = null;

const ActionTemplate = (props) => {
  if (!props || !props._id) return <div></div>;
  return (
    <div className="flex items-center justify-center w-full">
      <FaEye
        onClick={(e) => {
          e.stopPropagation();
          if (globalViewHandler && props._id) {
            globalViewHandler(props._id);
          }
        }}
        className="cursor-pointer text-blue-600 hover:text-blue-800"
        size={18}
      />
    </div>
  );
};

/* ===================== MAIN COMPONENT ===================== */
const Transfers = () => {
  const { fetchLearners, fetchInstructors, learners, instructors, getPupilSell, pricing, fetchPricing, fetchPupilsMoney } = useStateContext();
  const [transfers, setTransfers] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransferDetails, setSelectedTransferDetails] = useState(null);
  const [moneyHistory, setMoneyHistory] = useState([]);
  const [sellHistory, setSellHistory] = useState([]);

  const pupilEditTemplate = (props) => <PupilDropdown data={props} />;
  const fromEditTemplate = (props) => <InstructorFromDropdown data={props} />;
  const toEditTemplate = (props) => <InstructorToDropdown data={props} />;
  const reasonEditTemplate = (props) => <ReasonEditTemplate data={props} />;

  const gridRef = React.useRef(null);

  const handleViewTransfer = async (id) => {
    try {
      const response = await axiosInstance.get(`/ds/transfers/${id}`);
      const transferData = response.data?.data || response.data;
      setSelectedTransferDetails(transferData);

      const pupilId = transferData?.pupil_id?._id || transferData?.pupil_id;
      if (pupilId) {
        try {
          if (fetchPupilsMoney) {
            const moneyRes = await fetchPupilsMoney(pupilId);
            setMoneyHistory(Array.isArray(moneyRes) ? moneyRes : (moneyRes?.data || []));
          }
          try {
            if (getPupilSell) {
              const sellRes = await getPupilSell(pupilId);
              setSellHistory(sellRes || []);
            }
          } catch(e) {
            console.error('Failed to fetch sell history', e);
            setSellHistory([]);
          }

        } catch (mErr) {
          console.error('Failed to fetch money history', mErr);
          setMoneyHistory([]);
          setSellHistory([]);
        }
      } else {
        setMoneyHistory([]);
        setSellHistory([]);
      }

      setViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching transfer details:', error);
      toast.error('Failed to load transfer details');
    }
  };

  globalViewHandler = handleViewTransfer;

  const fetchTransfers = React.useCallback(async (isMountedObj = { current: true }) => {
    try {
      const response = await axiosInstance.get('/ds/transfers');
      if (!isMountedObj.current) return;
      console.log('API Response Data for Transfers:', response);
      
      const mapData = (data) => data.map(t => ({
        ...t,
        pupil_id: t.pupil_id?._id || t.pupil_id,
        transfer_from: t.transfer_from?._id || t.transfer_from,
        transfer_to: t.transfer_to?._id || t.transfer_to,
        pupil_name: t.pupil_id?.name || t.pupil_name || t.pupil_id?.full_name,
        from_name: t.transfer_from?.name || 'N/A',
        to_name: t.transfer_to?.name || 'N/A',
      }));

      if (response.data && Array.isArray(response.data.data)) {
        setTransfers(mapData(response.data.data));
      } else if (response.data && Array.isArray(response.data)) {
        setTransfers(mapData(response.data));
      } else if (Array.isArray(response)) {
        setTransfers(mapData(response));
      } else if (response.transfers && Array.isArray(response.transfers)) {
        setTransfers(mapData(response.transfers));
      } else {
        setTransfers([]);
      }
    } catch (error) {
      if (!isMountedObj.current) return;
      console.error('Error fetching transfers:', error);
      toast.error('Failed to load transfers');
    }
  }, []);

  useEffect(() => {
    const isMountedObj = { current: true };
    fetchTransfers(isMountedObj);
    if (fetchLearners && (!learners || learners.length === 0)) fetchLearners();
    if (fetchInstructors && (!instructors || instructors.length === 0)) fetchInstructors();
    if (fetchPricing && (!pricing || pricing.length === 0)) fetchPricing();

    return () => {
      isMountedObj.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActionBegin = async (args) => {
    if (args.requestType === 'save') {
      if (args.action === 'add' || args.action === 'edit') {
        const { pupil_id, transfer_from, transfer_to, reason, _id } = args.data;
        
        if (!pupil_id || !transfer_from || !transfer_to || !reason) {
          args.cancel = true;
          toast.error('Please fill all required fields.');
          return;
        }

        if (transfer_from === transfer_to) {
          args.cancel = true;
          toast.error('Transfer from and Transfer to cannot be the same instructor.');
          return;
        }

        args.cancel = true; // Prevent default local save
        const saveBtn = document.querySelector('.e-dialog .e-footer-content .e-primary');
        let originalHtml = '';
        if (saveBtn) {
          originalHtml = saveBtn.innerHTML;
          saveBtn.innerHTML = "Saving...";
          saveBtn.disabled = true;
          saveBtn.style.opacity = "0.7";
          saveBtn.style.cursor = "not-allowed";
        }
        try {
          if (args.action === 'add') {
            await axiosInstance.post('/ds/transfers', args.data);
            toast.success('Transfer added successfully');
          } else {
            await axiosInstance.post(`/ds/transfers/${_id}`, args.data);
            toast.success('Transfer updated successfully');
          }
          if (gridRef.current) {
            gridRef.current.closeEdit();
          }
          fetchTransfers();
        } catch (error) {
          console.error(error);
          toast.error(args.action === 'add' ? 'Failed to save transfer' : 'Failed to update transfer');
        } finally {
          if (saveBtn) {
            saveBtn.innerHTML = originalHtml || "SAVE";
            saveBtn.disabled = false;
            saveBtn.style.opacity = "1";
            saveBtn.style.cursor = "pointer";
          }
        }
      }
    } else if (args.requestType === 'delete') {
      args.cancel = true; // Handle deletion manually for bulk select support
      try {
        const recordsToDelete = Array.isArray(args.data) ? args.data : [args.data];
        
        // Use Promise.all to delete multiple records if selected
        await Promise.all(
          recordsToDelete.map(record => 
            axiosInstance.get(`/ds/transfers/delete/${record._id}`)
          )
        );
        
        toast.success(recordsToDelete.length > 1 ? `${recordsToDelete.length} transfers deleted successfully` : 'Transfer deleted successfully');
        fetchTransfers();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete transfer(s)');
      }
    }
  };

  const handleActionComplete = (args) => {
    if (args.requestType === 'beginEdit' || args.requestType === 'add') {
      const dateInput = document.querySelector('input[name="createdAt"]');
      if (dateInput) {
        const parentRow = dateInput.closest('tr') || dateInput.closest('.e-form-group') || dateInput.parentElement.parentElement;
        if (parentRow) {
          parentRow.style.display = 'none';
        }
      }
      
      const actionsInput = document.querySelector('input[name="view_action"]');
      if (actionsInput) {
        const parentRow = actionsInput.closest('tr') || actionsInput.closest('.e-form-group') || actionsInput.parentElement.parentElement;
        if (parentRow) {
          parentRow.style.display = 'none';
        }
      }
      
      if (args.requestType === 'beginEdit' && args.dialog) {
        const name = args.rowData.name || args.rowData.pupil_name || args.rowData.full_name || 'Details';
        args.dialog.header = `Details of ${name}`;
      }
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-6 bg-white dark:bg-secondary-dark-bg rounded-3xl shadow-sm">
      <Header category="Page" title="Pupil Transfers" />

      <GridComponent
        ref={gridRef}
        dataSource={transfers}
        allowPaging
        allowSorting
        toolbar={['Add', 'Edit', 'Delete', 'Search']}
        searchSettings={{ fields: ['pupil_name', 'from_name', 'to_name', '_id', 'pupil_id', 'transfer_from', 'transfer_to', 'reason'] }}
        editSettings={{ allowAdding: true, allowEditing: true, allowDeleting: true, mode: 'Dialog' }}
        actionBegin={handleActionBegin}
        actionComplete={handleActionComplete}
        pageSettings={{ pageCount: 5, pageSizes: true, pageSize: 10 }}
        selectionSettings={{ persistSelection: true }}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective
            field="_id"
            headerText="ID"
            width="100"
            textAlign="Left"
            isPrimaryKey
            isIdentity
            visible={false}
          />

          <ColumnDirective field="pupil_name" visible={false} />
          <ColumnDirective field="from_name" visible={false} />
          <ColumnDirective field="to_name" visible={false} />

          <ColumnDirective
            field="pupil_id"
            headerText="Pupil"
            width="150"
            template={PupilTemplate}
            textAlign="Left"
            editTemplate={pupilEditTemplate}
          />

          <ColumnDirective
            field="transfer_from"
            headerText="Transferred From"
            width="160"
            template={FromInstructorTemplate}
            textAlign="Left"
            editTemplate={fromEditTemplate}
          />

          <ColumnDirective
            field="transfer_to"
            headerText="Transferred To"
            width="160"
            template={ToInstructorTemplate}
            textAlign="Left"
            editTemplate={toEditTemplate}
          />

          <ColumnDirective
            field="createdAt"
            headerText="Date"
            width="120"
            template={DateTemplate}
            textAlign="Left"
            allowAdding={false}
            allowEditing={false}
          />

          <ColumnDirective
            field="reason"
            headerText="Reason"
            width="160"
            template={ReasonTemplate}
            editTemplate={reasonEditTemplate}
            textAlign="Left"
          />

          <ColumnDirective
            field="view_action"
            headerText="Actions"
            width="80"
            template={ActionTemplate}
            textAlign="Center"
            allowAdding={false}
            allowEditing={false}
          />

        </ColumnsDirective>

        <Inject services={[Search, Page, Selection, Toolbar, Edit]} />
      </GridComponent>

      {viewModalOpen && selectedTransferDetails && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[650px] max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col relative overflow-hidden transform transition-all border border-slate-200/50 dark:border-slate-700/50">
            
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121620]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <FaEye className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Transfer Details</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {selectedTransferDetails._id}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-90"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 p-6 md:p-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 flex-shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 flex flex-col justify-center">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Date</span>
                  <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200">
                    {new Date(selectedTransferDetails.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 flex flex-col justify-center">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">Pupil</span>
                  <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedTransferDetails.pupil_id?.name || selectedTransferDetails.pupil_id?.full_name || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 flex flex-col justify-center">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">From Instructor</span>
                  <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedTransferDetails.transfer_from?.name || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 flex flex-col justify-center">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">To Instructor</span>
                  <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedTransferDetails.transfer_to?.name || 'N/A'}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 block">Reason for Transfer</span>
                  <p className="text-[15px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedTransferDetails.reason || 'No reason provided'}
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <div className="pt-2 pb-4 flex-shrink-0">
                <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-3">
                  <div className="h-5 w-1.5 bg-indigo-500 rounded-full"></div>
                  Pupil Payment History
                </h3>

                {/* Summary Metrics */}
                {(() => {
                  const totalPaid = moneyHistory
                    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

                  const totalPending = moneyHistory
                    .filter(m => (m.status || '').toLowerCase() === 'pending')
                    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

                  const currentPupilId = selectedTransferDetails?.pupil_id?._id || selectedTransferDetails?.pupil_id;
                  const currentPupil = learners?.find(l => l._id === currentPupilId);
                  
                  const totalPurchased = sellHistory?.reduce((acc, sell) => {
                      const pkgId = sell.package_id?._id || sell.package_id;
                      const areaId = currentPupil?.area_id?._id || currentPupil?.area_id;
                      const matchedPricing = pricing?.find(p => 
                          (p.package_id?._id === pkgId || p.package_id === pkgId) && 
                          (p.branch_id?._id === areaId || p.branch_id === areaId)
                      );
                      const price = Number(sell.price) || Number(sell.amount) || Number(matchedPricing?.price) || Number(sell.package_id?.price) || 0;
                      return acc + price;
                  }, 0) || Number(currentPupil?.total_packages_price) || 0;

                  const totalDue = totalPurchased > totalPaid ? totalPurchased - totalPaid : 0;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">Purchased Amount</span>
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-300">£{totalPurchased.toFixed(2)}</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Total Paid</span>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">£{totalPaid.toFixed(2)}</p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20">
                        <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest block mb-1">Total Due</span>
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-300">£{totalDue.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })()}

                {moneyHistory && moneyHistory.length > 0 ? (
                  <div className="border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/40">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200/60 dark:border-slate-700/60">
                        <tr>
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5">Amount</th>
                          <th className="px-5 py-3.5">Method</th>
                          <th className="px-5 py-3.5">Instructor</th>
                          <th className="px-5 py-3.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {moneyHistory.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-5 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                              {new Date(m.createdAt || m.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </td>
                            <td className="px-5 py-3.5 font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              £{m.amount || 0}
                            </td>
                            <td className="px-5 py-3.5 capitalize text-slate-600 dark:text-slate-300 font-medium">
                              {m.payment_method || m.type || 'N/A'}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                              {m.instructor_id?.name || m.instructor?.name || 'N/A'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                                (m.status || '').toLowerCase() === 'paid' || (m.status || '').toLowerCase() === 'completed' || (m.status || '').toLowerCase() === 'success' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                  : 'bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                              }`}>
                                {m.status || 'Completed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-slate-400 dark:text-slate-500 text-lg">💳</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No payment history found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121620] flex justify-end">
              <button 
                onClick={() => setViewModalOpen(false)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
