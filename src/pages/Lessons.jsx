import React, { useEffect, useState } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Search,
  Page,
  Selection,
  Toolbar,
} from '@syncfusion/ej2-react-grids';
import { Header } from '../components';
import { useStateContext } from '../contexts/ContextProvider';
import { FaEye } from 'react-icons/fa';

/* ===================== INITIAL AVATAR ===================== */

const InitialAvatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="w-8 h-8 rounded-full bg-[#0c969e] text-white flex items-center justify-center text-sm font-semibold">
      {initial}
    </div>
  );
};

/* ===================== GRID TEMPLATES ===================== */

const InstructorTemplate = (props) => (
  <div className="flex items-center gap-2">
    <InitialAvatar name={props.Instructor} />
    <span>{props.Instructor}</span>
  </div>
);

const LearnerTemplate = (props) => (
  <div className="flex items-center gap-2">
    <InitialAvatar name={props.Learner} />
    <span>{props.Learner}</span>
  </div>
);

const StatusTemplate = (props) => {
  const colors = {
    booking_request: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    booked: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[props.Status] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
      }`}
    >
      {props.Status}
    </span>
  );
};

const ViewTemplate = () => (
  <FaEye className="text-[#03C9D7] cursor-pointer mx-auto" />
);

/* ===================== MAIN COMPONENT ===================== */

const Lessons = () => {
  const { GetAllBookings } = useStateContext();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    const res = await GetAllBookings();
    console.log('bookings data', res);

    let dataArray = [];
    if (Array.isArray(res)) dataArray = res;
    else if (res && Array.isArray(res.data)) dataArray = res.data;
    else if (res && res.data && Array.isArray(res.data.data)) dataArray = res.data.data;
    else if (res && Array.isArray(res.bookings)) dataArray = res.bookings;

    const formatted = dataArray.map((b) => ({
      LessonID: b._id,
      Instructor: b.instructor_id?.name || 'N/A',
      Learner: b.pupil_id?.full_name || 'N/A',
      Status: b.status || 'booking_request',
      Payment: b.payment_status || 'Pending',
    }));

    setLessons(formatted);
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-6 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Page" title="Lessons" />

      <GridComponent
        dataSource={lessons}
        allowPaging
        allowSorting
        toolbar={['Search']}
        pageSettings={{ pageCount: 5, pageSizes: true, pageSize: 10 }}
        selectionSettings={{ persistSelection: true }}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="LessonID"
            headerText="Lesson ID"
            width="120"
            textAlign="Center"
          />

          <ColumnDirective
            headerText="View"
            width="70"
            textAlign="Center"
            template={ViewTemplate}
          />

          <ColumnDirective
            headerText="Instructor"
            width="220"
            template={InstructorTemplate}
          />

          <ColumnDirective
            headerText="Learner"
            width="220"
            template={LearnerTemplate}
          />

          <ColumnDirective
            headerText="Status"
            width="130"
            template={StatusTemplate}
          />

          <ColumnDirective
            field="Payment"
            headerText="Payment"
            width="120"
            textAlign="Center"
          />
        </ColumnsDirective>

        <Inject services={[Search, Page, Selection, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default Lessons;
