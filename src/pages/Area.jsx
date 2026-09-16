import React, { useEffect, memo , useState} from 'react';
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
import toast from 'react-hot-toast';
import { useStateContext } from '../contexts/ContextProvider';
import { areaGrid } from '../data/areaGrid';
import { Header } from '../components';
import EditBranchTemplate from '../components/templates/EditBranchTemplate';

// Memoized wrapper for EditBranchTemplate
const EditTemplateWrapper = memo(({ branchData }) => <EditBranchTemplate branchData={branchData} />);

// Separate component to satisfy no-unstable-nested-components
// const GridEditTemplate = ({ data }) => <EditTemplateWrapper branchData={data} />;
const GridEditTemplate = (props) => <EditTemplateWrapper branchData={props} />;

const Area = () => {
  const { branches, fetchBranches, addBranch, updateBranch, deleteBranch } = useStateContext();

  const selectionsettings = { persistSelection: true };

  const [RowCount, setRow]=useState(0);
  const gridRef = React.useRef(null);
  const toolbarOptions = ['Add', 'Search', ...(RowCount > 1 ? [] : ['Edit', 'Delete'])];

  async function GettingBranches()
  {
    try{
       if (!branches || branches.length === 0) {
         await fetchBranches(); 
       }
    }catch(error)
    {
      toast.error('Failed to load areas ')
    }
  }

  useEffect(() => {
    GettingBranches()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActionBegin = async (args) => {
  // eslint-disable-next-line no-param-reassign
  const { data } = args; // just destructure the data object

  if (args.requestType === 'add') {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      // ✅ mutate the local 'data' variable, not 'args' directly
      data.school_id = user.school_id?._id;
      data.branch_id = user.branch_id;
      data.address = user.school_id?.address_line_1 || '';
      data.contact_email = user.school_id?.email || '';
      data.phone = user.school_id?.phone || '';
      data.branch_currency = user.school_id?.currency || 'USD';
      data.currency_symbol = user.school_id?.currency_symbol || '$';
      data.branch_timezones = user.school_id?.timezone || '';
      data.status = 'Active';
    }
  }

  if (args.requestType === 'save') {
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
        console.log('Data before creating area:', data);
        await addBranch(data);
      }
      if (args.action === 'edit') {
        await updateBranch(data._id, data);
      }
    } catch (err) {
      toast.error('Failed to save branch');
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
    const deletedRow = data?.[0];
    if (!deletedRow?._id) return;

    try {
      await deleteBranch(deletedRow._id);
    } catch {
      toast.error('Delete failed');
    }
  }
};

const updateSelection = () => {
  if (gridRef.current) {
    setRow(gridRef.current.getSelectedRecords().length);
  }
};

const handleActionComplete = (args) => {
  if (args.requestType === 'beginEdit') {
    const name = args.rowData.name || args.rowData.full_name || args.rowData.package_name || args.rowData.title || 'Details';
    if (args.dialog) {
      args.dialog.header = `Details of ${name}`;
    }
  }
};

  return (
    <div className="m-2 md:m-6 mt-6 p-2 md:p-4 bg-white dark:bg-secondary-dark-bg rounded-2xl">
      <Header title="Area" />
      <GridComponent
        ref={gridRef}
        dataSource={branches}
        enableHover={false}
        width="auto"
        allowPaging
        allowSorting
        pageSettings={{ pageCount: 5, pageSizes: true, pageSize: 10 }}
        selectionSettings={selectionsettings}
        actionComplete={handleActionComplete}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          mode: 'Dialog',
          template: GridEditTemplate, // use separate component
          dialog: { width: '600px' },
          showDeleteConfirmDialog: true
        }}
        toolbar={toolbarOptions}
        rowSelected={updateSelection}
        rowDeselected={updateSelection}

        actionBegin={handleActionBegin}
        loadingIndicator={{ indicatorType: 'Shimmer' }}
      >
        <ColumnsDirective>
          {areaGrid.map((item, index) => (
            <ColumnDirective
              key={index}
              field={item.field}
              headerText={item.headerText}
              width={item.width}
              textAlign={item.textAlign}
              isPrimaryKey={item.isPrimaryKey || false}
              visible={item.visible !== undefined ? item.visible : true}
              allowEditing={item.allowEditing !== undefined ? item.allowEditing : true}
              type={item.type}
              template={item.template}
            />
          ))}
        </ColumnsDirective>

        <Inject services={[Search, Page, Selection, Edit, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default Area;
