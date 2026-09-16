import React, { useEffect, useState } from 'react';
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject
} from '@syncfusion/ej2-react-schedule';
import { useStateContext } from '../contexts/ContextProvider';

const AllInstructorsCalendar = () => {
  const { GetAllBookings } = useStateContext();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      const res = await GetAllBookings();
      if (!mounted) return;

      const formatted = res.map((b) => {
        const dateOnly = b.booking_date.split('T')[0];

        return {
          Id: b._id,
          Subject: 'Lesson', // 👈 no details shown
          StartTime: new Date(`${dateOnly}T${b.start_time}`),
          EndTime: new Date(`${dateOnly}T${b.end_time}`),
          IsAllDay: false
        };
      });

      setEvents(formatted);
    };

    loadBookings();
    return () => { mounted = false; };
  }, [GetAllBookings]);

  // 🚫 Disable all interaction
  const disablePopup = (args) => {
    args.cancel = true;
  };

  return (
    <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-4">
      <ScheduleComponent
        height="650px"
        selectedDate={new Date()}
        firstDayOfWeek={1}
        workDays={[0, 1, 2, 3, 4, 5, 6]}
        timeScale={{ enable: true, interval: 60, slotCount: 4 }}
        eventSettings={{ dataSource: events }}
        popupOpen={disablePopup}
        readonly
      >
        <ViewsDirective>
          <ViewDirective option="Day" />
          <ViewDirective option="Week" />
          <ViewDirective option="WorkWeek" />
          <ViewDirective option="Month" />
          <ViewDirective option="Agenda" />
        </ViewsDirective>

        <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
      </ScheduleComponent>
    </div>
  );
};

export default AllInstructorsCalendar;
