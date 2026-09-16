import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useStateContext } from "../contexts/ContextProvider";

const DAY_MAP = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const WeeklyAvailability = ({ instructor, workingDays = [], onSave }) => {
  const { instructorWorkingDaysCreateAndUpdate, fetchInstructorWorkingDays } = useStateContext()
  const [showSetup, setShowSetup] = useState(false);
  const [availability, setAvailability] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  /* ------------------------------------
     MAP BACKEND DATA → STATE
  ------------------------------------ */
  useEffect(() => {
    if (!workingDays || workingDays.length === 0) return;

    const mappedAvailability = {};

    workingDays.forEach((day, index) => {
      const dayNumber = day.day ?? index + 1;

      mappedAvailability[dayNumber] = {
        open: day.is_working === 1 || !!day.start_time,
        enabled: day.enabled ?? false,
        is_working: day.is_working ?? 1,
        workStart: day.start_time ?? "",
        workEnd: day.end_time ?? "",
        breakStart: day.break_start ?? "",
        breakEnd: day.break_end ?? "",
        color: day.color ?? "",
      };
    });

    setAvailability(mappedAvailability);
  }, [workingDays]);

  /* ------------------------------------
     TOGGLE DAY ENABLE
  ------------------------------------ */
  const toggleDay = (dayNumber) => {
    setAvailability((prev) => ({
      ...prev,
      [dayNumber]: {
        ...(prev[dayNumber] || {}),
        open: !prev[dayNumber]?.open,
      },
    }));
  };

  /* ------------------------------------
     UPDATE FIELD
  ------------------------------------ */
  const updateTime = (dayNumber, key, value) => {
    setAvailability((prev) => ({
      ...prev,
      [dayNumber]: {
        ...(prev[dayNumber] || {}),
        [key]: value,
      },
    }));
  };

  /* ------------------------------------
     SAVE
  ------------------------------------ */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const workingDaysPayload = {};

      Object.entries(availability).forEach(([day, data]) => {
        if (!data.open) {
          workingDaysPayload[day] = {
            is_working: false
          };
        } else {
          workingDaysPayload[day] = {
            is_working: true,
            ...(data.workStart && { workStart: data.workStart }),
            ...(data.workEnd && { workEnd: data.workEnd }),
            ...(data.breakStart && { breakStart: data.breakStart }),
            ...(data.breakEnd && { breakEnd: data.breakEnd }),
            ...(data.color && { color: data.color }),
          };
        }
      });

      const payload = {
        instructor_id: instructor,
        workingDays: workingDaysPayload,
      };

      console.log("FINAL PAYLOAD 👉", payload);
      const res = await instructorWorkingDaysCreateAndUpdate(payload);

      console.log('res', res)
      if (res) {
        toast.success("Availability saved");
      }

      setShowSetup(false);
    } catch (error) {
      console.log('error', error)
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      {/* HEADER */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSetup(true)}
          className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-blue-600/30 active:scale-95"
        >
          Setup
        </button>
      </div>

      {/* MODAL */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">
              Setup Weekly Availability
            </h2>

            <div className="space-y-4">
              {Object.entries(DAY_MAP).map(([dayNumber, dayName]) => {
                const day = availability[dayNumber] || { open: false };

                return (
                  <div key={dayNumber} className="border rounded-xl p-4">
                    {/* DAY HEADER */}
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{dayName}</p>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.open}
                          onChange={() => toggleDay(dayNumber)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500"></div>
                        <span className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-secondary-dark-bg rounded-full transition peer-checked:translate-x-5"></span>
                      </label>
                    </div>

                    {/* TIME AND COLOR INPUTS */}
                    {!!day.open && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {[
                            ["Work Start", "workStart"],
                            ["Work End", "workEnd"],
                            ["Break Start", "breakStart"],
                            ["Break End", "breakEnd"],
                          ].map(([label, key]) => (
                            <div key={key}>
                              
                              <label className="block text-sm text-gray-500">
                                {label}
                              </label>
                              {day[key]==="" || day[key]===null? <p className="text-red-500">Please Fill the fields</p>:""} 
                              <input
                                type="time"
                                value={day[key] || ""}
                                onChange={(e) =>
                                  updateTime(dayNumber, key, e.target.value)
                                }
                                className="w-full mt-1 rounded-lg border px-3 py-2"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm text-gray-500 mb-1">
                            Shift Color (Optional)
                          </label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={day.color || ""}
                              onChange={(e) => updateTime(dayNumber, "color", e.target.value)}
                              className="h-10 w-14 cursor-pointer rounded-lg border px-1 py-1"
                            />
                            <span className="text-xs text-slate-500 font-bold uppercase">Custom Day Color</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSetup(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default WeeklyAvailability;
