import React, { useEffect, useState } from 'react';
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
import { pricingGrid } from '../data/pricingGrid';
import { Header } from '../components';
import EditPricingTemplate from '../components/templates/EditPricingTemplate';

const GridEditTemplate = (props) => {
  const { branches, packages } = useStateContext();

  return (
    <EditPricingTemplate
      {...props}
      branches={branches || []}
      packages={packages || []}
    />
  );
};

const Pricing = () => {

  const {
    pricing,
    fetchPricing,
    fetchBranches,
    fetchPackages,
    addPricing,
    updatePricing,
    deletePricing,
    branches,
    packages
  } = useStateContext();
  const [rowCount, setRowCount]=useState(0);
  const gridRef = React.useRef(null);
  const toolbarOptions = ['Add', 'Search', ...(rowCount > 1 ? [] : ['Edit', 'Delete'])];

  useEffect(() => {
    if (!pricing || pricing.length === 0) fetchPricing();
    if (!branches || branches.length === 0) fetchBranches();
    if (!packages || packages.length === 0) fetchPackages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSelection = () => {
    if (gridRef.current) {
      setRowCount(gridRef.current.getSelectedRecords().length);
    }
  };
  const handleActionBegin = async (args) => {

    // SAVE
    if (args.requestType === 'save') {

      args.cancel = true;

      const form = args.form;

      const payload = {
        branch_id: form.querySelector('[name="branch_id"]').value,
        package_id: form.querySelector('[name="package_id"]').value,
        price: Number(form.querySelector('[name="price"]').value),
      };

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
          await addPricing(payload);
          toast.success('Pricing Added');
        }

        if (args.action === 'edit') {
          await updatePricing(args.data._id, payload);
          toast.success('Pricing Updated');
        }

        await fetchPricing();
        args.dialog.close();

      } catch (err) {
        console.log(err);
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

    // DELETE
    if (args.requestType === 'delete') {

      const row = Array.isArray(args.data)
        ? args.data[0]
        : args.data;

      if (!row?._id) return;

      try {
        await deletePricing(row._id);
        await fetchPricing();
        toast.success('Pricing Deleted');
      } catch (err) {
        console.log(err);
        toast.error('Delete failed');
      }
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
    if (!pricing) return [];
    return pricing.map(p => ({
      ...p,
      search_area_name: p.branch_id?.name || p.branch_id || '',
      search_package_name: p.package_id?.package_name || p.package_id || '',
      search_price: String(p.price || '')
    }));
  }, [pricing]);

  return (
    <div className="m-2 md:m-6 mt-6 p-2 md:p-4 bg-white dark:bg-secondary-dark-bg rounded-2xl">
      <Header title="Pricing" />

      <GridComponent
        ref={gridRef}
        dataSource={gridData}
        allowPaging
        pageSettings={{ pageCount: 5, pageSizes: true, pageSize: 10 }}
        allowSorting
        toolbar={toolbarOptions}
        rowSelected={updateSelection}
        rowDeselected={updateSelection}
        actionBegin={handleActionBegin}
        actionComplete={handleActionComplete}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          mode: 'Dialog',
          template: GridEditTemplate,
          dialog: { width: '500px', minHeight: '260px' },
          showDeleteConfirmDialog: true,
        }}
      >
        <ColumnsDirective>
          {pricingGrid.map((item, index) => (
            <ColumnDirective
              key={index}
              {...item}
            />
          ))}
        </ColumnsDirective>

        <Inject services={[Search, Page, Selection, Edit, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default Pricing;
