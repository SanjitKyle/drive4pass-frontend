import React from 'react';
import {
  ScheduleComponent,
  Day,
  Week,
  Inject,
} from '@syncfusion/ej2-react-schedule';

const LessonCalendar = ({ lessons }) => {
  const events = lessons.map((l) => ({
    Id: l.LessonID,
    Subject: `${l.Learner} (${l.Instructor})`,
    StartTime: new Date(l.StartTime),
    EndTime: new Date(l.EndTime),
  }));

  return (
    <div className="bg-white dark:bg-secondary-dark-bg rounded-xl p-4 shadow">
      <ScheduleComponent
        height="650px"
        firstDayOfWeek={1}
        eventSettings={{ dataSource: events }}
        selectedDate={new Date()}
      >
        <Inject services={[Day, Week]} />
      </ScheduleComponent>
    </div>
  );
};

export default LessonCalendar;
