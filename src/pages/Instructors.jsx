import { GridComponent, Inject, ColumnsDirective, ColumnDirective, Search, Page, Selection, Edit, Toolbar, Sort, Filter } from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import toast from 'react-hot-toast';
import React,{ useEffect, useState } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { instructorsGrid } from '../data/instructorsGrid';
import { Header } from '../components';
import EditInstructorTemplate from '../components/templates/EditInstructorTemplate';

const GridEditTemplate = (props) => <EditInstructorTemplate instructorData={props} />;

const Instructors = () => {
  const { instructors, fetchInstructors, addInstructor, updateInstructor, deleteInstructor, instructorLoading } = useStateContext();
  const selectionsettings = { type: 'Single' };
  const [selectedRecords, setSelectedRecords] = useState(0);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const gridRef = React.useRef(null);

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

  const toolbarOptions = ['Add', ...(selectedRecords > 1 ? [] : ['Delete']), { template: instructorDropdownTemplate, align: 'Right' }];

  const updateSelection = () => {
    if (gridRef.current) {
      setSelectedRecords(gridRef.current.getSelectedRecords().length);
    }
  };
  async function InstructorGets()
  {
    try{
      if (!instructors || instructors.length === 0) {
        await fetchInstructors();
      }
    }catch(error)
    {
      toast.error("failed to load instructors")
    }
  }
  React.useEffect(() => {
    InstructorGets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchInstructors]);

  React.useEffect(() => {
    if (gridRef.current) {
      if (instructorLoading) {
        gridRef.current.showSpinner();
      } else {
        gridRef.current.hideSpinner();
      }
    }
  }, [instructorLoading]);

  const handleActionBegin = async (args) => {
    const newArgs = { ...args };
    if (newArgs.requestType === 'save') {
      try {
        if (newArgs.action === 'add') {
          args.cancel = true; // MUST mutate the original args to stop Syncfusion!
          
          if (gridRef.current) {
            gridRef.current.showSpinner();
          }

          const formData = new FormData();
          
          // Get the exact React state from the form component
          const formState = window.__instructorFormValues || {};

          formData.append("name", formState.name || "");
          formData.append("email", formState.email || "");
          formData.append("mobile", formState.mobile || "");
          formData.append("password", formState.password || "");
          formData.append("school_id", "69524353687858bc38b14330");
          formData.append("branch_id", "696233c450d46e1336df3c4e");
          formData.append("instructor_bio", formState.instructor_bio || "");
          formData.append("full_address", formState.full_address || "");
          formData.append("driving_details", formState.driving_details || "");
          formData.append("driving_lichence_number", formState.driving_licence_number || "");
          formData.append("licence_expiry_date", formState.licence_expiry_date || "");
          formData.append("pdi_badge_number", formState.badge_number || "");
          formData.append("badge_expiry_date", formState.badge_expiry_date || "");
          formData.append("experience", formState.driving_experience || "");
          if (formState.transmission_type) formData.append("transmission_type", formState.transmission_type);
          formData.append("entry_type", formState.entry_type || "");
          formData.append("work_type", formState.work_type || "");
          formData.append("type", formState.type || "");
          formData.append("start_date", formState.start_date || "");
          formData.append("franchise_start_date", formState.franchise_start_date || "");
          formData.append("car_make", formState.car_make || "");
          formData.append("car_model", formState.car_model || "");
          formData.append("car_reg", formState.car_reg || "");
          formData.append("status", formState.status || "1");
          formData.append("contract_signed", formState.contract_signed || "No");

          let areas = [];
          if (formState.service_areas) {
            areas = formState.service_areas.split(',').map(a => a.trim()).filter(a => a !== "");
          }
          formData.append("service_provided_area", JSON.stringify(areas));

          if (formState.licence_copy) {
            formData.append("upload_licence_copy", formState.licence_copy);
          }

          // Use setTimeout to allow Syncfusion to finish its synchronous cancellation logic before we update the UI
          // Select the currently open dialog specifically
          const saveBtn = document.querySelector('.e-dialog.e-popup-open .e-footer-content .e-primary');
          let originalHtml = "";
          if (saveBtn) {
            originalHtml = saveBtn.innerHTML;
            setTimeout(() => {
              if (saveBtn) {
                saveBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...`;
                saveBtn.disabled = true;
                saveBtn.style.opacity = "0.7";
                saveBtn.style.cursor = "not-allowed";
              }
            }, 0);
          }

          try {
            const res = await addInstructor(formData);
            console.log('response', res);
            toast.success('Instructor added successfully');
            if (gridRef.current) {
              gridRef.current.hideSpinner();
              gridRef.current.closeEdit(); 
            }
          } catch (err) {
            if (gridRef.current) {
              gridRef.current.hideSpinner();
            }
            throw err; // throw to outer catch
          } finally {
            if (saveBtn) {
              saveBtn.innerHTML = originalHtml || "SAVE";
              saveBtn.disabled = false;
              saveBtn.style.opacity = "1";
              saveBtn.style.cursor = "pointer";
            }
          }
        }
        if (newArgs.action === 'edit') {
          args.cancel = true; // Prevent Syncfusion native submit if we want to handle the button state manually. (Actually, for edit they didn't have it, but wait...)
          if (gridRef.current) gridRef.current.showSpinner();
          const formState = window.__instructorFormValues || {};
          const formData = new FormData();
          
          formData.append("name", formState.name || "");
          formData.append("email", formState.email || "");
          formData.append("mobile", formState.mobile || "");
          if (formState.password) {
            formData.append("password", formState.password);
          }

          const saveBtn = document.querySelector('.e-dialog.e-popup-open .e-footer-content .e-primary');
          let originalHtml = "";
          if (saveBtn) {
            originalHtml = saveBtn.innerHTML;
            setTimeout(() => {
              if (saveBtn) {
                saveBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...`;
                saveBtn.disabled = true;
                saveBtn.style.opacity = "0.7";
                saveBtn.style.cursor = "not-allowed";
              }
            }, 0);
          }
          formData.append("instructor_bio", formState.instructor_bio || "");
          formData.append("full_address", formState.full_address || "");
          formData.append("driving_details", formState.driving_details || "");
          formData.append("driving_lichence_number", formState.driving_licence_number || "");
          formData.append("licence_expiry_date", formState.licence_expiry_date || "");
          formData.append("pdi_badge_number", formState.badge_number || "");
          formData.append("badge_expiry_date", formState.badge_expiry_date || "");
          formData.append("experience", formState.driving_experience || "");
          formData.append("transmission_type", formState.transmission_type || "");
          formData.append("entry_type", formState.entry_type || "");
          formData.append("work_type", formState.work_type || "");
          formData.append("type", formState.type || "");
          formData.append("start_date", formState.start_date || "");
          formData.append("franchise_start_date", formState.franchise_start_date || "");
          formData.append("car_make", formState.car_make || "");
          formData.append("car_model", formState.car_model || "");
          formData.append("car_reg", formState.car_reg || "");
          formData.append("status", formState.status || "1");
          formData.append("contract_signed", formState.contract_signed || "No");

          let areas = [];
          if (formState.service_areas) {
            areas = formState.service_areas.split(',').map(a => a.trim()).filter(a => a !== "");
          }
          formData.append("service_provided_area", JSON.stringify(areas));

          if (formState.licence_copy) {
            formData.append("upload_licence_copy", formState.licence_copy);
          }

          try {
            await updateInstructor(newArgs.data._id, formData);
            toast.success('Instructor updated successfully');
            if (gridRef.current) {
              gridRef.current.hideSpinner();
              gridRef.current.closeEdit();
            }
          } catch (err) {
            if (gridRef.current) gridRef.current.hideSpinner();
            throw err;
          } finally {
            if (saveBtn) {
              saveBtn.innerHTML = originalHtml || "SAVE";
              saveBtn.disabled = false;
              saveBtn.style.opacity = "1";
              saveBtn.style.cursor = "pointer";
            }
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error_message || err.response?.data?.message || err.message || 'Save failed';
        toast.error(errorMsg);
      }
    }

    if (args.requestType === 'delete') {
      const row = args.data?.[0];
      if (!row?._id) return;
      try {
        await deleteInstructor(row._id);
      } catch {
        toast.error('Delete failed');
      }
    }
  };
  
  useEffect(()=>{
console.log('rows',selectedRecords)
  },[selectedRecords])

  const handleActionComplete = (args) => {
    if (args.requestType === 'beginEdit') {
      const name = args.rowData.name || args.rowData.full_name || args.rowData.package_name || args.rowData.title || 'Details';
      if (args.dialog) {
        args.dialog.header = `Details of ${name}`;
      }
    }
  };

  const filteredInstructors = React.useMemo(() => {
    if (!selectedInstructorId) return instructors;
    return (instructors || []).filter(inst => {
      const id = inst._id || inst.id;
      return id === selectedInstructorId;
    });
  }, [instructors, selectedInstructorId]);

  return (
    <div className="m-2 md:m-6 mt-6 p-2 md:p-4 bg-white dark:bg-secondary-dark-bg rounded-2xl">
      <Header title="Instructors" />
      <GridComponent
        ref={gridRef}
        dataSource={filteredInstructors}
        searchSettings={{ fields: ['_id', 'name', 'email', 'mobile', 'type', 'work_type', 'entry_type'] }}
        enableHover={false}
        width="auto"
        allowPaging
        allowSorting
        pageSettings={{ pageCount: 5, pageSizes: ['10', '20', '50', '100', 'All'], pageSize: 10 }}
        selectionSettings={selectionsettings}
        actionBegin={handleActionBegin}
        actionComplete={handleActionComplete}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          mode: 'Dialog',
          template: GridEditTemplate,
          dialog: { width: '1000px', minHeight: '450px' },
          showDeleteConfirmDialog: true,
        }}
        toolbar={toolbarOptions}
        rowSelecting={(args) => {
          if (gridRef.current && args.isInteracted) {
            gridRef.current.clearSelection();
          }
        }}
        rowSelected={updateSelection}
        rowDeselected={updateSelection}
      >
        <ColumnsDirective>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          {instructorsGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
        </ColumnsDirective>
        <Inject services={[Search, Page, Selection, Edit, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};
export default Instructors;
