import React from "react";

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours.toString().padStart(2, '0')}:${parts[1]} ${ampm}`;
};

const DAY_MAP = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const WeeklyAvailabilityList = ({ workingDays = [] }) => {
  // show only working days




  if (workingDays.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No working days configured
      </p>
    );
  }

  return (

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
      {workingDays.map((day) => (
        day.is_working === 1 ?
          (<div
            key={day._id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-150 dark:border-slate-800 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <p className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                {DAY_MAP[day.day_of_week]}
              </p>

              {day.is_working === 1 && day.start_time ? <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1.5 rounded-lg">
                Working
              </span> : ""}
            </div>

            {/* Work Time */}
            {day.is_working === 1 && day.start_time ? <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium pt-2">
              <div className="flex items-start gap-1">
                <strong className="text-slate-800 dark:text-slate-200 w-[52px] shrink-0">
                  Work:
                </strong>
                <span className="leading-snug font-semibold text-slate-600 dark:text-slate-400">
                  {formatTimeAMPM(day.start_time)} - {formatTimeAMPM(day.end_time)}
                </span>
              </div>

              {/* Break Time (ONLY IF EXISTS) */}
              {day.break_start && day.break_end && (
                <div className="flex items-start gap-1">
                  <strong className="text-slate-800 dark:text-slate-200 w-[52px] shrink-0">
                    Break:
                  </strong>
                  <span className="leading-snug font-semibold text-slate-600 dark:text-slate-400">
                    {formatTimeAMPM(day.break_start)} - {formatTimeAMPM(day.break_end)}
                  </span>
                </div>
              )}
            </div> : <div></div>}

          </div>) : ""

      ))}
    </div>
  );
};

export default WeeklyAvailabilityList;
