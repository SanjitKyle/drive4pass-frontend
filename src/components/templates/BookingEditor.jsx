import React, { useEffect, useState } from 'react';

import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';

/* ===== COMPONENT ===== */

const BookingEditor = ({
    Id,
    Subject,
    StartTime,
    EndTime,
    InstructorId,
    LearnerId,
    instructors = [],
    learners = [],
    scheduleRef
}) => {

    const [title, setTitle] = useState('');
    const [instructor, setInstructor] = useState('');
    const [learner, setLearner] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    /* ===== LOAD EVENT DATA INTO FORM ===== */

    useEffect(() => {

        setTitle(Subject || 'Booking');
        setInstructor(InstructorId || '');
        setLearner(LearnerId || '');

        setStart(StartTime ? new Date(StartTime) : null);
        setEnd(EndTime ? new Date(EndTime) : null);
        // console.log('instructors',instru)

    }, [Id, Subject, InstructorId, LearnerId, StartTime, EndTime]);

    useEffect(()=>{
        console.log('instructors',instructors)
    },[instructors])
    /* ===== RENDER ===== */

    return (
        <div className="p-6 w-[420px] space-y-5">

            {/* TITLE */}
            <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                    name="Subject"
                    className="e-field w-full border rounded-lg px-3 py-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* INSTRUCTOR */}
            <div>
                <label className="block text-sm mb-1">Instructor</label>

                <select
                    name="InstructorId"
                    className="e-field w-full border rounded-lg px-3 py-2"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                >
                    <option value="">Select Instructor</option>

                    {instructors.map((i) => (
                        <option key={i._id} value={i._id}>
                            {i.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* LEARNER */}
            <div>
                <label className="block text-sm mb-1">Learner</label>

                <select
                    name="LearnerId"
                    className="e-field w-full border rounded-lg px-3 py-2"
                    value={learner}
                    onChange={(e) => setLearner(e.target.value)}
                >
                    <option value="">Select Learner</option>

                    {learners.map((l) => (
                        <option key={l._id} value={l._id}>
                            {l.full_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* START TIME */}
            <div>
                <label className="block text-sm mb-1">Start Time</label>

                <DateTimePickerComponent
                    id="StartTime"
                    name="StartTime"
                    data-name="StartTime"
                    className="e-field"
                    format="dd/MM/yy hh:mm a"
                    value={start}
                    change={(e) => setStart(e.value)}
                />
            </div>

            {/* END TIME */}
            <div>
                <label className="block text-sm mb-1">End Time</label>

                <DateTimePickerComponent
                    id="EndTime"
                    name="EndTime"
                    data-name="EndTime"
                    className="e-field"
                    format="dd/MM/yy hh:mm a"
                    value={end}
                    change={(e) => setEnd(e.value)}
                />
            </div>

        </div>
    );
};

export default BookingEditor;