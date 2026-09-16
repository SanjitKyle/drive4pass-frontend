import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FaChevronCircleRight } from 'react-icons/fa';
import {
  GridComponent,
  Inject,
  ColumnsDirective,
  ColumnDirective,
  Search,
  Page,
  Selection,
  Edit,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

import { useStateContext } from '../contexts/ContextProvider';
import { Header } from '../components';
import ViewEnquiryCell from '../components/grid/ViewEnquiryCell';
import EditEnquiryTemplate from '../components/templates/EditEnquiryTemplate';
import { Enquires } from '../services/Enquires';
import toast from 'react-hot-toast';


const NameTemplate = (rowData) => {
  const name = rowData.name || '';
  const truncatedName = name.length > 15 ? `${name.substring(0, 15)}...` : name || '—';
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#03C9D7] flex items-center justify-center text-white font-bold text-xs shadow-md">
        {name?.charAt(0)?.toUpperCase() || 'E'}
      </div>
      <span className="font-bold text-slate-800 dark:text-slate-100">
        {truncatedName}
      </span>
    </div>
  );
};

const EmailTemplate = (rowData) => {
  const email = rowData.email || '';
  const truncatedEmail = email.length > 5 ? `${email.substring(0, 5)}...` : email || '—';
  
  return (
    <span className="font-medium text-slate-500 dark:text-slate-400" title={email}>
      {truncatedEmail}
    </span>
  );
};

const PhoneTemplate = (rowData) => {
  const phone = rowData.phone || '';
  const truncatedPhone = phone.length > 5 ? `${phone.substring(0, 5)}...` : phone || '—';
  return (
    <div className="flex justify-center">
      <span className="px-3 py-1 rounded-md bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-100 dark:border-slate-700">
        {truncatedPhone}
      </span>
    </div>
  );
};

const EntryTypeTemplate = (rowData) => (
  <div className="flex justify-center">
    <span className="px-3 py-1 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 font-medium text-xs border border-purple-100 dark:border-purple-800/50">
      {rowData.type_of_training || rowData.LessonType || rowData.lesson_type || '—'}
    </span>
  </div>
);

const StatusTemplate = (rowData) => {
  const styles = {
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    Contacted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    'Follow-up': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    Converted: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Booked: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
    Lost: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    'Not Interested': 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
    Waiting: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    'Waiting list': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    'No Response': 'bg-gray-200 text-gray-700 dark:bg-gray-600/20 dark:text-gray-400',
    'Test-Only Enquiry': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    'Passed To Office': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    'Passed to Office': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    Quoted: 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400',
    'Quoted / Price Given': 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400',
    'Call Back Later': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    'Under Review': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-400',
    'Converted to Instructor': 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  };
  const matchedKey = Object.keys(styles).find(k => k.toLowerCase() === rowData.status?.toLowerCase());
  const statusClass = matchedKey ? styles[matchedKey] : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  return (
    <div className="flex justify-center">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {rowData.status || 'New'}
      </span>
    </div>
  );
};

const AssignedCell = ({ rowData }) => {
  const { instructors } = useStateContext();
  let name = 'Unassigned';
  
  // Check common properties for assigned instructor
  const inst = rowData?.instructor_id || rowData?.assigned_to || rowData?.instructor;
  
  if (inst) {
    if (typeof inst === 'object') {
      name = inst?.name || inst?.full_name || inst?.first_name || 'Unassigned';
    } else if (typeof inst === 'string' && inst.trim() !== '') {
      const found = instructors?.find(i => i._id === inst || i.id === inst);
      if (found) {
        name = found.name || found.full_name || found.InstructorName || 'Unassigned';
      } else {
        name = rowData?.instructor_name || rowData?.assigned_name || 'Unassigned';
      }
    }
  } else if (rowData?.instructor_name) {
    name = rowData.instructor_name;
  } else if (rowData?.assigned_name) {
    name = rowData.assigned_name;
  } else if (rowData?.instructor_id) {
    name = 'Unassigned';
  }
  
  return (
    <div className="flex justify-center">
      <span className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap border ${name === 'Unassigned' ? 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700' : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'}`}>
        {name}
      </span>
    </div>
  );
};

const assignedTemplate = (rowData) => <AssignedCell rowData={rowData} />;

const EditTemplateWrapper = React.memo(({ enquiryData }) => <EditEnquiryTemplate enquiryData={enquiryData} />);
const GridEditTemplate = (props) => <EditTemplateWrapper enquiryData={props} />;

const Enquiries = () => {
  const location = useLocation();
  const [filterType, setFilterType] = useState(() => {
    return location.state?.filterType || localStorage.getItem('enquiryFilterType') || 'lessons';
  });
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const selectionsettings = { type: 'Single' };
  const gridRef = React.useRef(null);

  const { allenquies, addEnquiry, addAdiTrainingEnquiry, addIntensiveEnquiry, addFranchiseEnquiry, getAllEnquires, instructors } = useStateContext();

  const instructorDropdownTemplate = () => (
    <div className="w-[180px] -mt-1.5 flex items-center h-full">
      <DropDownListComponent
        id="instructor-filter"
        dataSource={[
          { text: 'All Instructors', value: '' },
          ...(instructors || []).map(inst => ({
            text: inst.name || inst.full_name || inst.InstructorName || 'Unknown Instructor',
            value: inst._id || inst.id
          }))
        ]}
        fields={{ text: 'text', value: 'value' }}
        value={selectedInstructorId}
        change={(e) => setSelectedInstructorId(e.value || '')}
        allowFiltering
        placeholder="All Instructors"
        className="text-sm cursor-pointer"
        cssClass="e-custom-dropdown"
      />
    </div>
  );

  const toolbarOptions = ['Add', 'Edit', 'Delete', { template: instructorDropdownTemplate, align: 'Right' }];

  const editing = {
    allowDeleting: true,
    allowEditing: true,
    allowAdding: true,
  };


  useEffect(() => {
    localStorage.setItem('enquiryFilterType', filterType);
    if (getAllEnquires) getAllEnquires(filterType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const handleActionBegin = async (args) => {
    if (args.requestType === 'save') {
      const saveBtn = document.querySelector('.e-dialog .e-footer-content .e-primary');
      let originalHtml = '';
      if (saveBtn) {
        originalHtml = saveBtn.innerHTML;
        saveBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...`;
        saveBtn.disabled = true;
        saveBtn.style.opacity = "0.7";
        saveBtn.style.cursor = "not-allowed";
      }

      try {
        if (args.action === 'add') {
          if (filterType === 'adi') {
            await addAdiTrainingEnquiry(args.data);
            // console.log('ADI training enquiry is created', args.data);
          } else if (filterType === 'intensives') {
            await addIntensiveEnquiry(args.data);
            // console.log('Intensive enquiry is created', args.data);
          } else if (filterType === 'franchise') {
            await addFranchiseEnquiry(args.data);
            // console.log('Franchise enquiry is created', args.data);
          } else {
            await addEnquiry(args.data);
            // console.log('enquire is create', args.data);
          }
        } else if (args.action === 'edit') {
          const id = args.data._id || args.data.id || args.data.EnquiryID;
          const currentToken = localStorage.getItem('authToken');
          if (filterType === 'adi') {
            await Enquires.updateAdiTrainingEnquiry(id, args.data, currentToken);
          } else if (filterType === 'intensives') {
            await Enquires.updateIntensiveEnquiry(id, args.data, currentToken);
          } else if (filterType === 'franchise') {
            await Enquires.updateFranchiseEnquiry(id, args.data, currentToken);
          } else {
            await Enquires.updateFullEnquiry(id, args.data, currentToken);
          }
          toast.success('Enquiry updated successfully!');
          if (getAllEnquires) getAllEnquires(filterType);
        }
      } catch (error) {
        // console.error('Save failed', error);
        toast.error('Save failed');
      } finally {
        if (saveBtn) {
          saveBtn.innerHTML = originalHtml || "SAVE";
          saveBtn.disabled = false;
          saveBtn.style.opacity = "1";
          saveBtn.style.cursor = "pointer";
        }
      }
    }

    if (args.requestType === 'delete') {
      const records = Array.isArray(args.data) ? args.data : [args.data];
      let hasError = false;
      
      const deletePromises = records.map(async (row) => {
        if (!row._id && !row.id && !row.EnquiryID) return;
        const id = row._id || row.id || row.EnquiryID;
        try {
          if (filterType === 'adi') {
            await Enquires.deleteAdiTrainingEnquiry(id);
          } else if (filterType === 'intensives') {
            await Enquires.deleteIntensiveEnquiry(id);
          } else if (filterType === 'franchise') {
            await Enquires.deleteFranchiseEnquiry(id);
          } else {
            await Enquires.deleteEnquiry(id);
          }
        } catch (err) {
          hasError = true;
          toast.error(`Failed to delete enquiry ${row.name || ''}`);
        }
      });
      
      await Promise.all(deletePromises);

      if (!hasError) toast.success('Deleted successfully!');
      if (getAllEnquires) getAllEnquires(filterType);
    }
  };

  const [gridKey, setGridKey] = useState(Date.now());
  
  useEffect(() => {
    setGridKey(Date.now());
  }, [allenquies, filterType]);

  const baseGridData = React.useMemo(() => {
    return (allenquies || []).map((row, index) => ({
      ...row,
      _id: String(row._id || row.id || row.EnquiryID || `temp-${Date.now()}-${index}-${Math.random()}`)
    }));
  }, [allenquies]);

  const gridData = React.useMemo(() => {
    if (!selectedInstructorId) return baseGridData;
    return baseGridData.filter(row => {
      const inst = row.instructor_id || row.assigned_to || row.instructor;
      if (!inst) return false;
      const instId = typeof inst === 'object' ? inst._id || inst.id : inst;
      return instId === selectedInstructorId;
    });
  }, [baseGridData, selectedInstructorId]);

  return (
    <div className="m-2 md:m-6 mt-6 p-2 md:p-4 bg-white dark:bg-secondary-dark-bg rounded-2xl">
      <Header title="Enquiries" />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button 
          onClick={() => { setFilterType('lessons'); localStorage.setItem('enquiryFilterType', 'lessons'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${filterType === 'lessons' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={filterType === 'lessons' ? 'text-white' : 'text-[#c60000]'} /> Lessons
        </button>
        <button 
          onClick={() => { setFilterType('intensives'); localStorage.setItem('enquiryFilterType', 'intensives'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${filterType === 'intensives' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={filterType === 'intensives' ? 'text-white' : 'text-[#c60000]'} /> Intensives
        </button>
        <button 
          onClick={() => { setFilterType('adi'); localStorage.setItem('enquiryFilterType', 'adi'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${filterType === 'adi' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={filterType === 'adi' ? 'text-white' : 'text-[#c60000]'} /> ADI Training
        </button>
        <button 
          onClick={() => { setFilterType('franchise'); localStorage.setItem('enquiryFilterType', 'franchise'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${filterType === 'franchise' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={filterType === 'franchise' ? 'text-white' : 'text-[#c60000]'} /> Franchise Enquiries
        </button>
      </div>

      <div className="mb-8 bg-slate-50 dark:bg-[#2b2536] border border-slate-200 dark:border-[#383145] rounded-2xl p-5 md:p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-slate-800 dark:text-white text-lg font-bold">Enquiry overview</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {(filterType === 'franchise' ? [
            { label: 'Total', count: gridData.length },
            { label: 'New', count: gridData.filter(e => e.status?.toLowerCase() === 'new').length },
            { label: 'Contacted', count: gridData.filter(e => e.status?.toLowerCase() === 'contacted').length },
            { label: 'Under Review', count: gridData.filter(e => e.status?.toLowerCase() === 'under review').length },
            { label: 'Waiting list', count: gridData.filter(e => e.status?.toLowerCase() === 'waiting list' || e.status?.toLowerCase() === 'waiting').length },
            { label: 'Converted to Instructor', count: gridData.filter(e => e.status?.toLowerCase() === 'converted to instructor').length },
            { label: 'No Response', count: gridData.filter(e => e.status?.toLowerCase() === 'no response').length },
          ] : [
            { label: 'Total', count: gridData.length },
            { label: 'New', count: gridData.filter(e => e.status?.toLowerCase() === 'new').length },
            { label: 'Contacted', count: gridData.filter(e => e.status?.toLowerCase() === 'contacted').length },
            { label: 'Booked', count: gridData.filter(e => e.status?.toLowerCase() === 'booked').length },
            { label: 'Waiting list', count: gridData.filter(e => e.status?.toLowerCase() === 'waiting list' || e.status?.toLowerCase() === 'waiting').length },
            { label: 'No Response', count: gridData.filter(e => e.status?.toLowerCase() === 'no response').length },
            { label: 'Test-Only Enquiry', count: gridData.filter(e => e.status?.toLowerCase() === 'test-only enquiry').length },
            { label: 'Passed to Office', count: gridData.filter(e => e.status?.toLowerCase() === 'passed to office').length },
            { label: 'Quoted / Price Given', count: gridData.filter(e => e.status?.toLowerCase() === 'quoted / price given').length },
            { label: 'Call Back Later', count: gridData.filter(e => e.status?.toLowerCase() === 'call back later').length },
            { label: 'Lost', count: gridData.filter(e => e.status?.toLowerCase() === 'lost').length },
          ]).map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#322c3f] border border-slate-200/60 dark:border-[#423a52] rounded-xl p-4 flex flex-col justify-center shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
              <span className="text-slate-500 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-1 font-bold">{stat.label}</span>
              <span className="text-slate-800 dark:text-white text-2xl font-extrabold">{stat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <GridComponent
        ref={gridRef}
        key={gridKey}
        id="gridcomp"
        dataSource={gridData}
        enableHover={false}
        width="auto"
        allowPaging
        allowSorting
        pageSettings={{ pageCount: 5, pageSizes: ['10', '20', '50', '100', 'All'], pageSize: 10 }}
        selectionSettings={selectionsettings}
        rowSelecting={(args) => {
          if (gridRef.current && args.isInteracted) {
            gridRef.current.clearSelection();
          }
        }}
        actionBegin={handleActionBegin}
        rowDataBound={(args) => {
          if (args && args.row && args.data) {
            // Unread style
            if (args.data.seen === false || args.data.seen === 'false') {
              if (args.row.classList) {
                args.row.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
              }
              if (args.row.style) {
                args.row.style.fontWeight = 'bold';
              }
            }
            
            // Status row color - ONLY for Booked
            if (args.row.classList && args.data.status === 'Booked') {
              args.row.classList.add('bg-teal-50/60', 'dark:bg-teal-900/20');
            }
          }
        }}
        actionComplete={(args) => {
          if ((args.requestType === 'beginEdit' || args.requestType === 'add') && args.dialog) {
            if (args.requestType === 'beginEdit') {
              const name = args.rowData.name || args.rowData.full_name || 'Details';
              args.dialog.header = `Details of ${name}`;
            } else {
              args.dialog.header = 'Add New Enquiry';
            }
          }
        }}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          mode: 'Dialog',
          template: GridEditTemplate,
          dialog: { width: '800px' },
          showDeleteConfirmDialog: true,
        }}
        toolbar={toolbarOptions}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective
            field="name"
            headerText="Name"
            width="200"
            textAlign="Left"
            template={NameTemplate}
          />

          <ColumnDirective
            field="email"
            headerText="Email"
            width="120"
            textAlign="Left"
            template={EmailTemplate}
          />

          <ColumnDirective
            field="phone"
            headerText="Phone"
            width="120"
            textAlign="Center"
            template={PhoneTemplate}
          />

          <ColumnDirective
            field="status"
            headerText="Status"
            width="140"
            textAlign="Center"
            template={StatusTemplate}
          />
          {filterType === 'lessons' ? (
            <ColumnDirective
              field="type_of_training"
              headerText="Entry Type"
              width="150"
              textAlign="Center"
              template={EntryTypeTemplate}
            />
          ) : null}
          {/* Hidden columns for form data extraction */}
          <ColumnDirective field="_id" isPrimaryKey visible={false} />
          <ColumnDirective field="id" visible={false} />
          <ColumnDirective field="EnquiryID" visible={false} />
          <ColumnDirective field="enquiry_type" visible={false} />
          <ColumnDirective field="postcode" visible={false} />
          <ColumnDirective field="driving_experience" visible={false} />
          <ColumnDirective field="licence" visible={false} />
          <ColumnDirective field="lesson_preference_time" visible={false} />
          <ColumnDirective field="preferred_start_date" visible={false} />
          <ColumnDirective field="preferred_contact_method" visible={false} />
          <ColumnDirective field="source" visible={false} />
          <ColumnDirective field="additional_message" visible={false} />
          
          {/* Hidden columns for new forms (ADI, Intensive, Franchise) */}
          <ColumnDirective field="training_status" visible={false} />
          <ColumnDirective field="franchise_status" visible={false} />
          <ColumnDirective field="message" visible={false} />
          <ColumnDirective field="course_interested" visible={false} />
          <ColumnDirective field="previous_lessons" visible={false} />
          <ColumnDirective field="transmission" visible={false} />
          <ColumnDirective field="first_name" visible={false} />
          <ColumnDirective field="instructor_type" visible={false} />

          <ColumnDirective
            headerText="Assigned"
            width="150"
            textAlign="Center"
            template={assignedTemplate}
          />

          <ColumnDirective
            headerText="View"
            width="100"
            textAlign="Center"
            template={ViewEnquiryCell}
          />
        </ColumnsDirective>

        <Inject
          services={[
            Search,
            Page,
            Selection,
            Edit,
            Toolbar,
            Sort,
            Filter,
          ]}
        />
      </GridComponent>
    </div>
  );
};

export default Enquiries;