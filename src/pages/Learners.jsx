import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { FaChevronCircleRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useStateContext } from '../contexts/ContextProvider';
import { learnersGrid } from '../data/dummy';
import { Header } from '../components';
import EditLearnerTemplate from '../components/templates/EditLearnerTemplate';

const GridLearnerTemplate = (props) => {
  const { branches, packages, instructors } = useStateContext();



  return (
    <EditLearnerTemplate
      learnerData={props}
      branches={branches || []}
      packages={packages || []}
      instructors={instructors || []}
    />
  );
};

const Learners = () => {
  const {
    learners,
    fetchLearners,
    addLearner,
    updateLearner,
    instructors,
    deleteLearner,
    branches,
    packages,
    fetchInstructors,
    fetchBranches,
    fetchPackages,
    learnerLoading,
  } = useStateContext();
  const location = useLocation();
  const [selectedRowCount, setSelectedRowCount]=useState(0);
  const [selectedInstructorId, setSelectedInstructorId] = useState(() => location.state?.selectedInstructorId || '');
  const [loginFilterType, setLoginFilterType] = useState('all');
  const gridRef = React.useRef(null);
  
  useEffect(() => {
    if (gridRef.current) {
      if (learnerLoading) {
        gridRef.current.showSpinner();
      } else {
        gridRef.current.hideSpinner();
      }
    }
  }, [learnerLoading]);
  const instructorDropdownTemplate = React.useCallback(() => (
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
  ), [instructors, selectedInstructorId]);


  async function FetchLearner() {
    try {
      if (!learners || learners.length === 0) fetchLearners();
      if ((!instructors || instructors.length === 0) && fetchInstructors) fetchInstructors();
      if ((!branches || branches.length === 0) && fetchBranches) fetchBranches();
      if ((!packages || packages.length === 0) && fetchPackages) fetchPackages();
    } catch (error) {
      toast.error("failed to load learners or related data")
    }
  }
  
  useEffect(() => {
    FetchLearner()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLearners, fetchInstructors, fetchBranches, fetchPackages]);

const handleActionBegin = async (args) => {

  if (args.requestType === 'save') {
    const { full_name, phone, email, area_id, instructor_id, package_id } = args.data;

    if (!full_name || !phone || !email || !area_id || !instructor_id || (args.action === 'add' && !package_id)) {
      args.cancel = true;
      toast.error('Please fill all fields before saving.');
      return;
    }

    // 🔥 VERY IMPORTANT
    args.data.active = parseInt(args.data.active, 10);

    if (args.data.active !== 0 && args.data.active !== 1) {
      args.data.active = 1;
    }

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
        await addLearner(args.data);
      }

      if (args.action === 'edit') {
        await updateLearner(args.data._id, args.data);
      }

    } catch (error) {
      console.log("SAVE ERROR:", error);
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
    const row = args.data?.[0];
    if (!row?._id) return;

    try {
      await deleteLearner(row._id);
    } catch {
      toast.error('Delete failed');
    }
  }
};
const updateSelection = () => {
  if (gridRef.current) {
    setSelectedRowCount(gridRef.current.getSelectedRecords().length);
  }
};

  const handleActionComplete = (args) => {
    if (args.requestType === 'beginEdit') {
      const name = args.rowData.full_name || args.rowData.name || args.rowData.package_name || args.rowData.title || 'Details';
      if (args.dialog) {
        args.dialog.header = `Details of ${name}`;
      }
    }
  };

  const debounceTimerRef = React.useRef(null);
  
  const handleCustomSearchChange = (e) => {
    const val = e.target.value;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.search(val);
      }
    }, 500);
  };

  const customSearchTemplate = React.useCallback(() => {
    return (
      <div className="e-input-group e-search" role="search" style={{ width: '200px' }}>
        <input 
          className="e-input e-searchinput" 
          type="text" 
          placeholder="Search" 
          onChange={handleCustomSearchChange}
          defaultValue={gridRef.current?.searchSettings?.key || ''} 
        />
        <span className="e-input-group-icon e-search-icon e-icons"></span>
      </div>
    );
  }, []);

  const tools = React.useMemo(() => [
    'Add', 
    ...(selectedRowCount > 1 ? [] : ['Edit', 'Delete']),
    { template: instructorDropdownTemplate, align: 'Right' },
    { template: customSearchTemplate, align: 'Right' }
  ], [selectedRowCount, instructorDropdownTemplate, customSearchTemplate]);

  const filteredLearners = learners?.filter(l => {
    // Instructor filter
    if (selectedInstructorId) {
      const instId = typeof l.instructor_id === 'object' ? l.instructor_id?._id || l.instructor_id?.id : l.instructor_id;
      if (instId !== selectedInstructorId) return false;
    }
    
    // Login filter
    if (loginFilterType === 'logged_in') {
      if (!l.is_login) return false;
    } else if (loginFilterType === 'not_logged_in') {
      if (l.is_login) return false;
    }

    return true;
  }) || [];

  return (
    <div className="m-2 md:m-6 mt-6 p-2 md:p-4 bg-white dark:bg-secondary-dark-bg rounded-2xl">
      <Header title="Pupils" />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button 
          onClick={() => setLoginFilterType('all')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${loginFilterType === 'all' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={loginFilterType === 'all' ? 'text-white' : 'text-[#c60000]'} /> All Pupils
        </button>
        <button 
          onClick={() => setLoginFilterType('logged_in')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${loginFilterType === 'logged_in' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={loginFilterType === 'logged_in' ? 'text-white' : 'text-[#c60000]'} /> Logged In
        </button>
        <button 
          onClick={() => setLoginFilterType('not_logged_in')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border whitespace-nowrap ${loginFilterType === 'not_logged_in' ? 'bg-[#c60000] text-white border-[#c60000]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
        >
          <FaChevronCircleRight className={loginFilterType === 'not_logged_in' ? 'text-white' : 'text-[#c60000]'} /> Not Logged In
        </button>
      </div>

      <GridComponent
        ref={gridRef}
        dataSource={filteredLearners}
        searchSettings={{ fields: ['_id', 'full_name', 'email', 'phone'] }}
        allowPaging
        pageSettings={{ pageCount: 5, pageSizes: ['10', '20', '50', '100', 'All'], pageSize: 10 }}
        selectionSettings={{ type: 'Single' }}
        allowSorting
        toolbar={tools}
        rowSelecting={(args) => {
          if (gridRef.current && args.isInteracted) {
            gridRef.current.clearSelection();
          }
        }}
        rowSelected={updateSelection}
        rowDeselected={updateSelection}
        actionBegin={handleActionBegin}
        actionComplete={handleActionComplete}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          mode: 'Dialog',
          template: GridLearnerTemplate,
          dialog: { width: '1000px', minHeight: '450px' },
          showDeleteConfirmDialog: true,
        }}
      >
        <ColumnsDirective>
          {learnersGrid.map((item, index) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Search, Page, Selection, Edit, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default Learners;
