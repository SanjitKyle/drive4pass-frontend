import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop
} from '@syncfusion/ej2-react-schedule';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { useStateContext } from '../contexts/ContextProvider';
import EditorTemplate from '../components/templates/EditorTemplate';
import { FiUser, FiSliders, FiCheckCircle, FiRefreshCw, FiBookOpen } from 'react-icons/fi';
import { getUser } from '../utils/auth';

/* ---------- UTIL ---------- */

const toDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toTime = (date) => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
/* ---------- COMPONENT ---------- */

const Scheduler = ({ instructorId }) => {
  const { GetBooking, createBooking, UpdateBooking, GetAllBookings, learners, instructors, getPupilBookings } = useStateContext();

  const scheduleRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedLearner, setSelectedLearner] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const user = getUser();
  const isLearner = user?.role === 'learner';
  const isInstructor = user?.role === 'instructor';
  const effectiveInstructorId = instructorId || (isInstructor ? user?._id : null);

  /* ---------- FETCH BOOKINGS ---------- */

  const fetchBookings = useCallback(async () => {
    try {
      let res = [];
      if (isLearner) {
        const response = await getPupilBookings(user?._id);
        res = response?.data || [];
      } else if (effectiveInstructorId) {
        res = await GetBooking(effectiveInstructorId);
      } else {
        res = await GetAllBookings();
      }

      const formatted = res.map((b) => {
        const dateOnly = b.booking_date.split('T')[0];
        const status = b.status?.toLowerCase(); // normalize

        return {
          Id: b._id,
          Subject: b.title || 'Booking',
          StartTime: new Date(`${dateOnly}T${b.start_time}`),
          EndTime: new Date(`${dateOnly}T${b.end_time}`),
          InstructorId: b.instructor_id?._id || (typeof b.instructor_id === 'string' ? b.instructor_id : undefined),
          PupilId: b.pupil_id?._id || (typeof b.pupil_id === 'string' ? b.pupil_id : undefined),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          Status: status,
          IsAllDay: false
        };
      });

      setEvents(formatted);
    } catch (err) {
      console.error(err);
    }
  }, [isLearner, user?._id, effectiveInstructorId, GetBooking, getPupilBookings, GetAllBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      const matchInstructor = !selectedInstructor || e.InstructorId === selectedInstructor;
      const matchLearner = !selectedLearner || e.PupilId === selectedLearner;
      const matchStatus = !selectedStatus || 
        (selectedStatus === 'scheduled' 
          ? (e.Status === 'pending' || e.Status === 'scheduled' || !e.Status)
          : e.Status === selectedStatus);
      return matchInstructor && matchLearner && matchStatus;
    });
  }, [events, selectedInstructor, selectedLearner, selectedStatus]);

  /* ---------- DATE PICKER ---------- */

  const onDateChange = (args) => {
    setSelectedDate(args.value);

    if (scheduleRef.current) {
      scheduleRef.current.selectedDate = args.value;
      scheduleRef.current.dataBind();
    }
  };

  /* ---------- POPUP OPEN ---------- */

  const onPopupOpen = (args) => {
    if (args.type === 'Editor') {
      const targetInstructorId = instructorId || (isInstructor ? user?._id : '');
      if (!args.data.Id && targetInstructorId) {
        args.data.InstructorId = targetInstructorId;
        args.data.Subject = 'Booking';

        setTimeout(() => {
          const instructorField =
            args.element.querySelector('[name="InstructorId"]');

          if (instructorField) {
            instructorField.value = targetInstructorId;
          }
        }, 0);
      }
    }
  };
  /* ---------- DRAG ---------- */

  const onDragStart = (args) => {
    args.navigation.enable = true;
  };

  /* ---------- COLOR RENDERING ---------- */

  const onEventRendered = (args) => {
    const status = args.data.Status;

    if (status === "completed") {
      args.element.style.setProperty(
        "background-color",
        "#16a34a",
        "important"
      );
    } else if (status === "cancelled") {
      args.element.style.setProperty(
        "background-color",
        "#dc2626",
        "important"
      );
      args.element.style.opacity = "0.6";
      args.element.style.textDecoration = "line-through";
    } else if (status === "booking_request") {
      args.element.style.setProperty(
        "background-color",
        "#8b5cf6", // purple
        "important"
      );
    } else if (status === "pending") {
      args.element.style.setProperty(
        "background-color",
        "#f59e0b", // amber
        "important"
      );
    } else {
      args.element.style.setProperty(
        "background-color",
        "#3b82f6", // blue
        "important"
      );
    }
  };

  /* ---------- CREATE / UPDATE ---------- */

  const onActionBegin = async (args) => {
    if (
      args.requestType === 'eventCreate' ||
      args.requestType === 'eventChange'
    ) {
      args.cancel = true;
      const data = Array.isArray(args.data)
        ? args.data[0]
        : args.data;

      if (!data.Subject || data.Subject.trim() === '' || !data.InstructorId || !data.PupilId) {
          args.cancel = true;
          toast.error("Please fill all required fields: Title, Instructor, and Pupil");
          return;
      }

      const body = {
        pupil_id: data.PupilId,
        instructor_id: data.InstructorId,
        booking_date: toDate(data.StartTime),
        start_time: toTime(data.StartTime),
        end_time: toTime(data.EndTime),
        title: data.Subject
      };

      try {
        if (args.requestType === 'eventCreate') {
          const result = await createBooking(body);
          if (result) {
            toast.success('Booking Added');
          }
        } else if (args.requestType === 'eventChange') {
          const result = await UpdateBooking(data.Id || data._id, body);
          if (result) {
            toast.success('Booking Updated');
          }
        }

        if (scheduleRef.current) {
          scheduleRef.current.closeEditor();
        }

        await fetchBookings();

      } catch (err) {
        console.error(err);
      }
    }
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="space-y-6 m-2 p-2 md:p-4 transition-colors duration-300">
      {/* Premium Filter Controls Panel */}
      <div className="bg-slate-50 dark:bg-[#121620] border border-slate-150/40 dark:border-slate-800/40 rounded-2xl p-4 md:p-6 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/45 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <FiSliders className="text-lg" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Calendar Bookings & Filters
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
                Select a date and filter bookings by pupil, instructor, or status
              </p>
            </div>
          </div>
          {(selectedInstructor || selectedLearner || selectedStatus) && (
            <button
              type="button"
              onClick={() => {
                setSelectedInstructor('');
                setSelectedLearner('');
                setSelectedStatus('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/25 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 border border-rose-100/30 dark:border-rose-950/30"
            >
              <FiRefreshCw className="text-xs animate-spin-once" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Date Picker Selector */}
          <div className="flex-1 min-w-[160px] space-y-1.5 custom-datepicker-container">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
              <FiUser className="text-indigo-500" />
              Jump to Date
            </label>
            <div className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2 py-0.5 text-sm focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all cursor-pointer shadow-sm">
              <DatePickerComponent
                value={selectedDate}
                format="dd/MM/yy"
                showClearButton={false}
                placeholder="Current Date"
                floatLabelType="Never"
                change={onDateChange}
                className="w-full bg-transparent border-0 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Instructor Filter - shown if not locked to one instructor */}
          {!effectiveInstructorId && (
            <div className="flex-1 min-w-[160px] space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <FiUser className="text-indigo-500" />
                Instructor
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="" disabled>Select an Instructor...</option>
                {instructors && instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Learner Filter - shown if not a learner */}
          {!isLearner && (
            <div className="flex-1 min-w-[160px] space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <FiBookOpen className="text-teal-500" />
                Pupil (Learner)
              </label>
              <select
                value={selectedLearner}
                onChange={(e) => setSelectedLearner(e.target.value)}
                className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="">All Pupils</option>
                {learners && learners.map((learn) => (
                  <option key={learn._id} value={learn._id}>
                    {learn.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex-1 min-w-[160px] space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
              <FiCheckCircle className="text-emerald-500" />
              Booking Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="booking_request">Booking Request</option>
              <option value="pending">Pending</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100/50 dark:border-slate-800/40 shadow-sm overflow-hidden p-2 md:p-4">
        <ScheduleComponent
          height="650px"
          ref={scheduleRef}
          currentView="Month"
          firstDayOfWeek={1}
          workDays={[0, 1, 2, 3, 4, 5, 6]}
          startHour="06:00"
          endHour="22:00"
          selectedDate={selectedDate}
          timeScale={{ enable: true, interval: 60, slotCount: 4 }}
          eventSettings={{ dataSource: filteredEvents }}
          editorTemplate={EditorTemplate}
          popupOpen={onPopupOpen}
          actionBegin={onActionBegin}
          dragStart={onDragStart}
          timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          eventRendered={onEventRendered}
        >
          <ViewsDirective>
            <ViewDirective option="Day" startHour="06:00" endHour="22:00" />
            <ViewDirective option="Week" startHour="06:00" endHour="22:00" />
            <ViewDirective option="WorkWeek" startHour="06:00" endHour="22:00" />
            <ViewDirective option="Month" />
            <ViewDirective option="Agenda" />
          </ViewsDirective>

          <Inject
            services={[
              Day,
              Week,
              WorkWeek,
              Month,
              Agenda,
              Resize,
              DragAndDrop
            ]}
          />
        </ScheduleComponent>
      </div>
    </div>
  );
};

export default Scheduler;