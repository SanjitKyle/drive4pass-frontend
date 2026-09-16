import React, { useState, useEffect } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';

const EditorTemplate = (props) => {
  const { learners, instructors } = useStateContext();
  const isEditMode = !!props.Id && typeof props.Id === 'string' && props.Id.length > 5;
  const [eventType, setEventType] = useState(props.EventType || props.Status || (props.mode === 'all' ? 'booking' : props.mode));

  const safeDate = (d) => {
      if (!d) return new Date();
      return new Date(d);
  };

  const [localStart, setLocalStart] = useState(safeDate(props.StartTime));
  const [localEndState, setLocalEndState] = useState(safeDate(props.EndTime));
  const [durationMins, setDurationMins] = useState(() => {
    if (props.StartTime && props.EndTime) {
      return Math.round((new Date(props.EndTime) - new Date(props.StartTime)) / 60000);
    }
    return 60;
  });

  useEffect(() => {
    setEventType(props.EventType || props.Status || (props.mode === 'all' ? 'booking' : props.mode));
    setLocalStart(safeDate(props.StartTime));
    setLocalEndState(safeDate(props.EndTime));
    if (props.StartTime && props.EndTime) {
      setDurationMins(Math.round((new Date(props.EndTime) - new Date(props.StartTime)) / 60000));
    }
  }, [props.StartTime, props.EndTime, props.EventType, props.Status, props.mode]);

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-');
    const updated = new Date(localStart);
    updated.setFullYear(parseInt(y, 10));
    updated.setMonth(parseInt(m, 10) - 1);
    updated.setDate(parseInt(d, 10));
    setLocalStart(updated);
  };

  const handleTimeChange = (e) => {
    if (!e.target.value) return;
    const [h, min] = e.target.value.split(':');
    const updated = new Date(localStart);
    updated.setHours(parseInt(h, 10));
    updated.setMinutes(parseInt(min, 10));
    setLocalStart(updated);
  };

  const handleEndDateChange = (e) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-');
    const updated = new Date(localEndState);
    updated.setFullYear(parseInt(y, 10));
    updated.setMonth(parseInt(m, 10) - 1);
    updated.setDate(parseInt(d, 10));
    setLocalEndState(updated);
  };

  const handleEndTimeChange = (e) => {
    if (!e.target.value) return;
    const [h, min] = e.target.value.split(':');
    const updated = new Date(localEndState);
    updated.setHours(parseInt(h, 10));
    updated.setMinutes(parseInt(min, 10));
    setLocalEndState(updated);
  };

  const finalEnd = eventType === 'booking' ? localEndState : new Date(localStart.getTime() + durationMins * 60000);
  
  const toDateString = (d) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const toTimeString = (d) => {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderDateTimeDuration = () => (
    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mt-4 shadow-sm">
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Date</label>
          <input 
            type="date" 
            className="input w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm bg-white" 
            value={toDateString(localStart)} 
            onChange={handleDateChange} 
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Start Time</label>
          <input 
            type="time" 
            className="input w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm bg-white" 
            value={toTimeString(localStart)} 
            onChange={handleTimeChange} 
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Duration (Minutes)</label>
        <input 
          type="number" 
          className="input w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm bg-white" 
          value={durationMins} 
          onChange={(e) => setDurationMins(parseInt(e.target.value, 10) || 0)} 
        />
      </div>
      
      {/* Hidden fields mapped for Syncfusion Calendar extraction */}
      <input type="hidden" name="StartTime" className="e-field" value={localStart.toISOString()} />
      <input type="hidden" name="EndTime" className="e-field" value={finalEnd.toISOString()} />
    </div>
  );

  const renderLessonDateTime = () => (
    <div className="mt-4">
      <div className="mb-4">
        <label className="text-[12px] text-slate-500 mb-1 block">Start Time</label>
        <div className="flex gap-3">
          <input 
            type="date" 
            className="input flex-1 p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm" 
            value={toDateString(localStart)} 
            onChange={handleDateChange} 
          />
          <input 
            type="time" 
            className="input flex-1 p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm" 
            value={toTimeString(localStart)} 
            onChange={handleTimeChange} 
          />
        </div>
      </div>
      <div className="mb-2">
        <label className="text-[12px] text-slate-500 mb-1 block">End Time</label>
        <div className="flex gap-3">
          <input 
            type="date" 
            className="input flex-1 p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm" 
            value={toDateString(localEndState)} 
            onChange={handleEndDateChange} 
          />
          <input 
            type="time" 
            className="input flex-1 p-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm" 
            value={toTimeString(localEndState)} 
            onChange={handleEndTimeChange} 
          />
        </div>
      </div>
      
      {/* Hidden fields mapped for Syncfusion Calendar extraction */}
      <input type="hidden" name="StartTime" className="e-field" value={localStart.toISOString()} />
      <input type="hidden" name="EndTime" className="e-field" value={finalEnd.toISOString()} />
    </div>
  );

  const renderLeaveForm = () => (
    <div className="event-editor-card p-4">
      <h3 className="text-lg font-bold mb-4">Edit Leave / Day Off</h3>
      <p className="text-xs text-gray-500 mb-4">Select the color for this day off.</p>
      <input type="hidden" name="EventType" className="e-field" value="leave" />
      <input type="hidden" name="DayOfWeek" className="e-field" value={props.DayOfWeek} />
      <input type="hidden" name="InstructorId" className="e-field" value={props.InstructorId} />
      <input type="hidden" name="StartTime" className="e-field" value={props.StartTime} />
      <input type="hidden" name="EndTime" className="e-field" value={props.EndTime} />
      <div className="field">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Color</label>
        <div className="flex gap-2 items-center">
            <input type="color" name="color" className="e-field" defaultValue={props.color || '#ff0000'} style={{width: '50px', height: '40px', padding: '0', border: 'none', borderRadius: '5px'}} />
        </div>
      </div>
    </div>
  );

  const renderGapForm = () => (
    <div className="event-editor-card p-4">
      <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit' : 'New'} Gap</h3>
      <input type="hidden" name="EventType" className="e-field" value="gap" />
      
      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Title</label>
        <input type="text" name="Subject" className="e-field input w-full p-2 border rounded" defaultValue={props.Subject || 'Gap'} />
      </div>
      
      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Instructor</label>
        <select name="InstructorId" className="e-field input w-full p-2 border rounded" defaultValue={props.InstructorId || ''} disabled={isEditMode}>
          <option value="">Select Instructor</option>
          {instructors?.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          {props.InstructorId && !instructors?.find(i => i._id === props.InstructorId) && (
            <option key={props.InstructorId} value={props.InstructorId}>{props.InstructorName || 'Deleted Instructor'}</option>
          )}
        </select>
      </div>

      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Reason / Details</label>
        <input type="text" name="Reason" className="e-field input w-full p-2 border rounded" defaultValue={props.Reason || props.details || ''} />
      </div>

      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Color</label>
        <input type="color" name="color" className="e-field" defaultValue={props.color || '#fef08a'} style={{width: '50px', height: '40px', padding: '0', border: 'none', borderRadius: '5px'}} />
      </div>
      
      {renderDateTimeDuration()}
    </div>
  );

  const renderAwayForm = () => (
    <div className="event-editor-card p-4">
      <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit' : 'New'} Away Day</h3>
      <input type="hidden" name="EventType" className="e-field" value="away" />
      
      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Title</label>
        <input type="text" name="Subject" className="e-field input w-full p-2 border rounded" defaultValue={props.Subject || 'Away'} />
      </div>
      
      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Instructor</label>
        <select name="InstructorId" className="e-field input w-full p-2 border rounded" defaultValue={props.InstructorId || ''} disabled={isEditMode}>
          <option value="">Select Instructor</option>
          {instructors?.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          {props.InstructorId && !instructors?.find(i => i._id === props.InstructorId) && (
            <option key={props.InstructorId} value={props.InstructorId}>{props.InstructorName || 'Deleted Instructor'}</option>
          )}
        </select>
      </div>

      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Reason / Details</label>
        <input type="text" name="Reason" className="e-field input w-full p-2 border rounded" defaultValue={props.Reason || props.details || ''} />
      </div>

      <div className="field mb-3">
        <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Color</label>
        <input type="color" name="color" className="e-field" defaultValue={props.color || '#e9d5ff'} style={{width: '50px', height: '40px', padding: '0', border: 'none', borderRadius: '5px'}} />
      </div>
      
      {renderDateTimeDuration()}
    </div>
  );

  const renderBookingForm = () => (
    <div className="event-editor-card p-4">
      <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit' : 'New'} Booking</h3>
      <input type="hidden" name="EventType" className="e-field" value="booking" />

      <div className="field mb-3">
        <label className="text-[12px] text-slate-500 mb-1 block">Title</label>
        <input
          type="text"
          name="Subject"
          className="e-field input w-full p-2 border border-slate-200 rounded outline-none"
          defaultValue={props.Subject || ''}
        />
      </div>
      <div className="field mb-3">
        <label className="text-[12px] text-slate-500 mb-1 block">Instructor</label>
        <select
          name="InstructorId"
          className="e-field input w-full p-2 border border-slate-200 rounded outline-none"
          defaultValue={props.InstructorId || ''}
        >
          <option value="">Select Instructor</option>
          {instructors?.map((i) => (
            <option key={i._id} value={i._id}>
              {i.name}
            </option>
          ))}
          {props.InstructorId && !instructors?.find(i => i._id === props.InstructorId) && (
            <option key={props.InstructorId} value={props.InstructorId}>
              {props.InstructorName || 'Deleted Instructor'}
            </option>
          )}
        </select>
      </div>

      <div className="field mb-3">
        <label className="text-[12px] text-slate-500 mb-1 block">Pupil</label>
        <select 
          name="PupilId" 
          className="e-field input w-full p-2 border border-slate-200 rounded outline-none" 
          defaultValue={props.PupilId || ''} 
          disabled={isEditMode}
        >
          <option value="" disabled>Select Pupil</option>
          {learners?.map(l => (
            <option key={l._id} value={l._id}>
              {l.full_name}
            </option>
          ))}
          {props.PupilId && !learners?.find(l => l._id === props.PupilId) && (
            <option key={props.PupilId} value={props.PupilId}>
              {props.PupilName || 'Deleted Pupil'}
            </option>
          )}
        </select>
      </div>

      {isEditMode && (
        <div className="field mb-3">
          <label className="text-[12px] text-slate-500 mb-1 block">Color</label>
          <input 
            type="color" 
            name="color" 
            className="e-field" 
            defaultValue={props.color || '#4ade80'} 
            style={{width: '50px', height: '40px', padding: '0', border: 'none', borderRadius: '5px'}} 
          />
        </div>
      )}

      {renderLessonDateTime()}
    </div>
  );

  const renderForm = () => {
    if (eventType === 'leave' || props.Status === 'leave' || props.Status === 'Day Off') return renderLeaveForm();
    if (eventType === 'gap') return renderGapForm();
    if (eventType === 'away') return renderAwayForm();
    return renderBookingForm();
  };

  return (
    <div className="event-editor-wrapper">
      {!isEditMode && (
        <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setEventType('booking'); }}
            className={`flex-1 py-2 px-4 text-sm font-bold rounded-md transition-all ${
              (eventType === 'booking' || eventType === 'lesson') 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Lesson
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setEventType('gap'); }}
            className={`flex-1 py-2 px-4 text-sm font-bold rounded-md transition-all ${
              eventType === 'gap' 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Gap
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setEventType('away'); }}
            className={`flex-1 py-2 px-4 text-sm font-bold rounded-md transition-all ${
              eventType === 'away' 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Away
          </button>
        </div>
      )}
      {renderForm()}
    </div>
  );
};

export default EditorTemplate;
