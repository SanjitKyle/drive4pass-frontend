import React, { useEffect,useState, memo } from 'react';
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
import { packagesGrid } from '../data/packagesGrid';
import { Header } from '../components';
import EditPackageTemplate from '../components/templates/EditPackageTemplate';

// Memo wrapper
// const EditTemplateWrapper = memo((props) => <EditPackageTemplate {...props} />);
const EditTemplateWrapper = memo(({ packageData }) => <EditPackageTemplate packageData={packageData} />);
const GridEditTemplate = (props) => <EditTemplateWrapper packageData={props} />;

const Packages = () => {
  const {
    packages,
    fetchPackages,
    addPackage,
    updatePackage,
    deletePackage,
  } = useStateContext();

  const [rowCount, setRowCount]=useState(0);
  const selectionsettings = { persistSelection: true };
  const gridRef = React.useRef(null);
  const toolbarOptions = ['Add', 'Search', ...(rowCount > 1 ? [] : ['Edit', 'Delete'])];

  async function PackagesLoad()
  {
    try{
      if (!packages || packages.length === 0) {
        fetchPackages();
      }
    }catch(error)
    {
        toast.error('Failed to load packages.');
    }
  }
  useEffect(() => {
    PackagesLoad();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActionBegin = async (args) => {
    const newArgs = { ...args };

    if (newArgs.requestType === 'save') {
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
        const payload = {
          package_name: newArgs.data.package_name,
          package_slug: newArgs.data.package_slug,
          duration: Number(newArgs.data.duration),
          area: typeof newArgs.data.area === 'object' ? newArgs.data.area._id : newArgs.data.area,
        };

        if (newArgs.action === 'add') {
          await addPackage(payload);
        }
        if (newArgs.action === 'edit') {
          await updatePackage(newArgs.data._id, payload);
        }
      } catch {
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
        await deletePackage(row._id);
      } catch {
        toast.error('Delete failed');
      }
    }
  };
  const updateSelection = () => {
    if (gridRef.current) {
      setRowCount(gridRef.current.getSelectedRecords().length);
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

  const gridData = React.useMemo(() => {
    if (!packages) return [];
    return packages.map(p => ({
      ...p,
      search_area_name: p.area?.name || p.area || ''
    }));
  }, [packages]);

  return (
    <div className="m-2 md:m-6 mt-6 p-2 md:p-4 bg-white dark:bg-secondary-dark-bg rounded-2xl">
      <Header title="Packages" />
      <GridComponent
        ref={gridRef}
        dataSource={gridData}
        allowPaging
        pageSettings={{ pageCount: 5, pageSizes: true, pageSize: 10 }}
        allowSorting
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        actionBegin={handleActionBegin}
        actionComplete={handleActionComplete}
        rowSelected={updateSelection}
        rowDeselected={updateSelection}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          mode: 'Dialog',
          template: GridEditTemplate,
          dialog: { width: '500px', minHeight: '240px' },
          showDeleteConfirmDialog: true,
        }}
      >
        <ColumnsDirective>
          {packagesGrid.map((item, index) => (
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

export default Packages;
