import React, { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiSliders, FiCheckCircle, FiRefreshCw, FiBookOpen, FiSun, FiMoon } from 'react-icons/fi';

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
import EditorTemplate from '../components/templates/EditorTemplate';
import { InstructorService } from '../services/instructor.service';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

/* ================= DATE HELPERS ================= */

// Convert any value safely into Date
const safeDate = (value) => {
    return value instanceof Date
        ? value
        : new Date(value);
};

// Convert local date -> YYYY-MM-DD
const toDate = (date) => {
    const d = safeDate(date);

    return `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')}`;
};

// Convert local date -> HH:mm
const toTime = (date) => {
    const d = safeDate(date);

    return `${String(
        d.getHours()
    ).padStart(2, '0')}:${String(
        d.getMinutes()
    ).padStart(2, '0')}`;
};

// Parse time string handling AM/PM
const parseTimeString = (timeString) => {
    let hour = 0;
    let minute = 0;
    if (timeString) {
        const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
        if (timeParts) {
            hour = parseInt(timeParts[1], 10);
            minute = parseInt(timeParts[2], 10);
            const modifier = timeParts[3]?.toUpperCase();
            if (modifier === 'PM' && hour < 12) hour += 12;
            if (modifier === 'AM' && hour === 12) hour = 0;
        }
    }
    return { hour, minute };
};

// Create LOCAL timezone date
const createLocalDateTime = (
    dateString,
    timeString
) => {
    let year;
    let month;
    let day;
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts[2].length === 4) {
            year = Number(parts[2]);
            month = Number(parts[0]);
            day = Number(parts[1]);
        } else {
            year = Number(parts[0]);
            month = Number(parts[1]);
            day = Number(parts[2]);
        }
    } else {
        const parts = dateString.split('-');
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
    }

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return new Date(); // Fallback

    const { hour, minute } = parseTimeString(timeString);

    return new Date(
        year,
        month - 1,
        day,
        hour,
        minute
    );
};

/* ================= COMPONENT ================= */

const MasterBookingCalendar = ({ mode = 'bookings', onBookingChange }) => {
    const scheduleRef = useRef(null);

    const {
        GetAllBookings,
        CreateBooking,
        UpdateBooking,
        RemoveBooking,
        instructors,
        learners,
        fetchInstructors,
        fetchLearners
    } = useStateContext();

    const [events, setEvents] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [selectedLearner, setSelectedLearner] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const [workColor, setWorkColor] = useState(localStorage.getItem('calendar_work_color') || '#ecfdf5');
    const [leaveColor, setLeaveColor] = useState('#e5e7eb');
    const [gapColor, setGapColor] = useState(localStorage.getItem('calendar_gap_color') || '#fef08a'); // amber/yellow
    const [awayColor, setAwayColor] = useState(localStorage.getItem('calendar_away_color') || '#e9d5ff'); // purple

    const getContrastYIQ = (hexcolor) => {
        if (!hexcolor) return '#1e293b';
        hexcolor = hexcolor.replace("#", "");
        if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(c => c+c).join('');
        const r = parseInt(hexcolor.substr(0, 2), 16) || 0;
        const g = parseInt(hexcolor.substr(2, 2), 16) || 0;
        const b = parseInt(hexcolor.substr(4, 2), 16) || 0;
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#1e293b' : '#ffffff';
    };

    const filteredEvents = React.useMemo(() => {
        if (!selectedInstructor) return [];

        return events.filter((e) => {
            const matchInstructor = !selectedInstructor || e.InstructorId === selectedInstructor;
            const matchLearner = !selectedLearner || e.PupilId === selectedLearner;
            const matchStatus = !selectedStatus || 
                (selectedStatus === 'scheduled' 
                    ? (e.Status === 'pending' || e.Status === 'scheduled' || e.Status === 'booked' || !e.Status)
                    : e.Status === selectedStatus);
            return matchInstructor && matchLearner && matchStatus;
        });
    }, [events, selectedInstructor, selectedLearner, selectedStatus]);

    const [isLoading, setIsLoading] = useState(false);

    /* ================= LOAD BOOKINGS ================= */

    const loadBookings = useCallback(async () => {
        setIsLoading(true);
        if (scheduleRef.current) scheduleRef.current.showSpinner();
        try {
            const promises = [];
            
            // 1. Fetch Bookings
            promises.push(GetAllBookings().then(res => ({ type: 'bookings', data: res })).catch(() => ({ type: 'bookings', data: [] })));
            
            // 2. Fetch Working Days, Gaps, and Away
            if (instructors && instructors.length > 0) {
                promises.push(
                    Promise.all(instructors.map(inst => 
                        InstructorService.instructorWorkingDays(inst._id)
                            .then(res => ({ instructor: inst, data: res.data || res.data?.data || res || [] }))
                            .catch(() => null)
                    )).then(res => ({ type: 'leaves', data: res }))
                );
                
                promises.push(
                    Promise.all(instructors.map(inst => 
                        InstructorService.instructorGaps(inst._id)
                            .then(res => ({ instructor: inst, data: res.data || res.data?.data || res || [] }))
                            .catch(() => null)
                    )).then(res => ({ type: 'gaps', data: res }))
                );
                
                promises.push(
                    Promise.all(instructors.map(inst => 
                        InstructorService.instructorAway(inst._id)
                            .then(res => ({ instructor: inst, data: res.data || res.data?.data || res || [] }))
                            .catch(() => null)
                    )).then(res => ({ type: 'away', data: res }))
                );
            }
            
            const results = await Promise.all(promises);
            const allFormattedEvents = [];
            
            const dayToRecurrence = {
                1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA', 7: 'SU'
            };
            const getBaseDateForDay = (dayOfWeek) => {
                const targetJSDay = dayOfWeek === 7 ? 0 : dayOfWeek;
                const d = new Date(2023, 0, 1);
                while (d.getDay() !== targetJSDay) { d.setDate(d.getDate() + 1); }
                return d;
            };

            results.forEach(resultObj => {
                if (resultObj.type === 'bookings') {
                    const res = resultObj.data;
                    let dataArray = [];
                    if (Array.isArray(res)) dataArray = res;
                    else if (res && Array.isArray(res.data)) dataArray = res.data;
                    else if (res && res.data && Array.isArray(res.data.data)) dataArray = res.data.data;
                    else if (res && Array.isArray(res.bookings)) dataArray = res.bookings;

                    dataArray.forEach((b) => {
                        if (!b.booking_date) return;
                        const dateOnly = b.booking_date.split('T')[0];
                        const status = b.status?.toLowerCase();
                        const startDate = createLocalDateTime(dateOnly, b.start_time);
                        const endDate = createLocalDateTime(dateOnly, b.end_time);

                        allFormattedEvents.push({
                            Id: b._id,
                            Subject: b.title || 'Booking',
                            title: b.title || 'Booking',
                            StartTime: startDate,
                            EndTime: endDate,
                            InstructorId: b.instructor_id?._id || (typeof b.instructor_id === 'string' ? b.instructor_id : undefined),
                            InstructorName: b.instructor_id?.name || 'Unknown Instructor',
                            PupilId: b.pupil_id?._id || (typeof b.pupil_id === 'string' ? b.pupil_id : undefined),
                            PupilName: b.pupil_id?.full_name || 'Unknown Pupil',
                            Status: status,
                            EventType: 'booking',
                            IsAllDay: false,
                            color: b.color || undefined,
                            Reason: b.reason || b.details || undefined
                        });
                    });
                }
                
                else if (resultObj.type === 'leaves') {
                    const leafResults = resultObj.data;
                    leafResults.forEach(result => {
                        if (!result) return;
                        let workingDaysArray = null;
                        if (Array.isArray(result?.data)) workingDaysArray = result.data;
                        else if (Array.isArray(result?.data?.data)) workingDaysArray = result.data.data;
                        else if (Array.isArray(result?.data?.data?.data)) workingDaysArray = result.data.data.data;

                        if (!workingDaysArray) return;
                        
                        workingDaysArray.forEach(day => {
                            if (day.is_working === 0 || day.is_working === false || (!day.start_time && !day.end_time)) {
                                const baseDate = getBaseDateForDay(day.day_of_week);
                                allFormattedEvents.push({
                                    Id: day._id || `leave-${result.instructor._id}-${day.day_of_week}`,
                                    Subject: 'Leave / Day Off',
                                    title: 'Leave / Day Off',
                                    StartTime: new Date(new Date(baseDate).setHours(6, 0, 0, 0)),
                                    EndTime: new Date(new Date(baseDate).setHours(21, 0, 0, 0)),
                                    InstructorId: result.instructor._id,
                                    InstructorName: result.instructor.name || 'Unknown Instructor',
                                    Status: 'leave',
                                    EventType: 'leave',
                                    DayOfWeek: day.day_of_week,
                                    IsAllDay: false,
                                    RecurrenceRule: `FREQ=WEEKLY;BYDAY=${dayToRecurrence[day.day_of_week]};INTERVAL=1`,
                                    color: day.color || undefined
                                });
                            } else if (day.break_start && day.break_end) {
                                // Add Break Time Event
                                const baseDate = getBaseDateForDay(day.day_of_week);
                                
                                const [bStartH, bStartM] = day.break_start.split(':').map(Number);
                                    const [bEndH, bEndM] = day.break_end.split(':').map(Number);
                                    
                                    const startTime = new Date(baseDate);
                                    startTime.setHours(bStartH, bStartM, 0, 0);
                                    
                                    const endTime = new Date(baseDate);
                                    endTime.setHours(bEndH, bEndM, 0, 0);
                                    
                                    allFormattedEvents.push({
                                        Id: `break-${result.instructor._id}-${day.day_of_week}`,
                                        Subject: 'Break',
                                        title: 'Break',
                                        StartTime: startTime,
                                        EndTime: endTime,
                                        InstructorId: result.instructor._id,
                                        InstructorName: result.instructor.name || 'Unknown Instructor',
                                        Status: 'break',
                                        EventType: 'break',
                                        DayOfWeek: day.day_of_week,
                                        IsAllDay: false,
                                        RecurrenceRule: `FREQ=WEEKLY;BYDAY=${dayToRecurrence[day.day_of_week]};INTERVAL=1`,
                                        color: '#fffbeb' // very light yellow for break time
                                    });
                                }
                        });
                    });
                }
                
                else if (resultObj.type === 'gaps' || resultObj.type === 'away') {
                    const eventMode = resultObj.type;
                    const modeResults = resultObj.data;
                    modeResults.forEach(result => {
                        if (!result) return;
                        let dataArray = null;
                        if (Array.isArray(result?.data)) dataArray = result.data;
                        else if (Array.isArray(result?.data?.data)) dataArray = result.data.data;
                        else if (Array.isArray(result?.data?.data?.data)) dataArray = result.data.data.data;
                        else if (Array.isArray(result?.data?.aways)) dataArray = result.data.aways;
                        else if (Array.isArray(result?.data?.gaps)) dataArray = result.data.gaps;

                        if (!dataArray) return;
                        
                        dataArray.forEach(item => {
                            const eventTitle = eventMode === 'gaps' ? 'Gap' : 'Away';
                            const statusVal = eventMode === 'gaps' ? 'gap' : 'away';
                            
                            if (item.day_of_week) {
                                const baseDate = getBaseDateForDay(item.day_of_week);
                                let start = new Date(baseDate.setHours(0, 0, 0, 0));
                                let end = new Date(baseDate.setHours(23, 59, 59, 999));
                                let isAllDay = true;
                                
                                if (item.start_time) {
                                    const startParsed = parseTimeString(item.start_time);
                                    start = new Date(new Date(baseDate).setHours(startParsed.hour, startParsed.minute, 0, 0));
                                    
                                    if (item.end_time) {
                                        const endParsed = parseTimeString(item.end_time);
                                        end = new Date(new Date(baseDate).setHours(endParsed.hour, endParsed.minute, 0, 0));
                                    } else if (item.duration_hours || item.duration_minutes) {
                                        end = new Date(start.getTime());
                                        end.setHours(end.getHours() + (Number(item.duration_hours) || 0));
                                        end.setMinutes(end.getMinutes() + (Number(item.duration_minutes) || 0));
                                    }
                                    isAllDay = false;
                                }
                                
                                allFormattedEvents.push({
                                    Id: item._id || `${statusVal}-${result.instructor._id}-${item.day_of_week}`,
                                    Subject: eventTitle,
                                    title: eventTitle,
                                    StartTime: start,
                                    EndTime: end,
                                    InstructorId: result.instructor._id,
                                    InstructorName: result.instructor.name || 'Unknown Instructor',
                                    Status: statusVal,
                                    EventType: statusVal,
                                    IsAllDay: isAllDay,
                                    RecurrenceRule: `FREQ=WEEKLY;BYDAY=${dayToRecurrence[item.day_of_week]};INTERVAL=1`,
                                    Reason: item.reason || '',
                                    color: item.color || undefined
                                });
                            } else {
                                const dateOnly = (item.date || item.away_date || item.gap_date || item.start_date || new Date().toISOString()).split('T')[0];
                                const start = createLocalDateTime(dateOnly, item.start_time || '00:00');
                                
                                let end;
                                if (item.end_time) {
                                    end = createLocalDateTime(dateOnly, item.end_time);
                                } else if (item.start_time && (item.duration_hours || item.duration_minutes)) {
                                    end = new Date(start.getTime());
                                    end.setHours(end.getHours() + (Number(item.duration_hours) || 0));
                                    end.setMinutes(end.getMinutes() + (Number(item.duration_minutes) || 0));
                                } else {
                                    end = createLocalDateTime(dateOnly, '23:59');
                                }
                                
                                allFormattedEvents.push({
                                    Id: item._id || `${statusVal}-${result.instructor._id}-${Math.random()}`,
                                    Subject: eventTitle,
                                    title: eventTitle,
                                    StartTime: start,
                                    EndTime: end,
                                    InstructorId: result.instructor._id,
                                    InstructorName: result.instructor.name || 'Unknown Instructor',
                                    Status: statusVal,
                                    EventType: statusVal,
                                    IsAllDay: (!item.start_time),
                                    Reason: item.reason || '',
                                    color: item.color || undefined
                                });
                            }
                        });
                    });
                }
            });

            setEvents(allFormattedEvents);

        } catch (err) {
            console.error(err);
            toast.error('Failed to load bookings');
        } finally {
            setIsLoading(false);
            if (scheduleRef.current) scheduleRef.current.hideSpinner();
        }
    }, [GetAllBookings, instructors]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    useEffect(() => {
        if (!instructors || instructors.length === 0) {
            if (fetchInstructors) fetchInstructors();
        }
        if (!learners || learners.length === 0) {
            if (fetchLearners) fetchLearners();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ================= SAVE BOOKINGS ================= */

    const onActionBegin = async (args) => {
        if (
            args.requestType === 'eventCreate' ||
            args.requestType === 'eventChange' ||
            args.requestType === 'eventRemove'
        ) {
            args.cancel = true;

            const data = Array.isArray(args.data)
                ? args.data[0]
                : args.data;

            let eventMode = data.EventType || (mode === 'all' ? 'booking' : mode);
            if (eventMode === 'bookings' || eventMode === 'lesson') eventMode = 'booking';
            if (eventMode === 'gaps') eventMode = 'gap';

            if (args.requestType !== 'eventRemove') {
                if (!data.StartTime || !data.EndTime) {
                    return;
                }

                if (!data.Subject || data.Subject.trim() === '' || !data.InstructorId || (eventMode === 'booking' && !data.PupilId)) {
                    toast.error(`Please fill all required fields: Title, Instructor${eventMode === 'booking' ? ', and Pupil' : ''}`);
                    return;
                }
            }

            const modeTitles = {
                'gap': 'Gap',
                'away': 'Away',
                'leave': 'Leave'
            };
            const defaultTitle = modeTitles[eventMode] || 'Booking';

            const payload = {
                title: data.Subject || defaultTitle,
                booking_date: toDate(data.StartTime),
                start_time: toTime(data.StartTime),
                end_time: toTime(data.EndTime),
                instructor_id: data.InstructorId,
            };

            if (eventMode === 'booking') {
                payload.pupil_id = data.PupilId;
            }

            if (data.color) {
                payload.color = data.color;
            }

            // Also map Reason to details if applicable
            if (data.Reason && eventMode !== 'booking') {
                payload.reason = data.Reason;
                payload.details = data.Reason;
            }

            let finalPayload = payload;

            if (eventMode === 'gap') {
                const start = new Date(data.StartTime);
                const end = new Date(data.EndTime);
                const diffMs = end - start;
                const totalMinutes = Math.floor(diffMs / 60000);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                let startHour = start.getHours();
                const startMin = String(start.getMinutes()).padStart(2, '0');
                const ampm = startHour >= 12 ? 'PM' : 'AM';
                startHour %= 12;
                startHour = startHour || 12;
                const paddedStartHour = String(startHour).padStart(2, '0');
                const startTimeAmPm = `${paddedStartHour}:${startMin} ${ampm}`;

                finalPayload = {
                    date: toDate(data.StartTime),
                    start_time: startTimeAmPm,
                    duration_hours: hours,
                    duration_minutes: minutes,
                    duration: `${hours}h ${minutes}m`,
                    instructor: data.InstructorId,
                    color: data.color || '#f59e0b',
                    title: data.Subject || defaultTitle,
                    reason: data.Reason || ''
                };
            }

            if (eventMode === 'away') {
                const formatAmPm = (dateStr) => {
                    const d = new Date(dateStr);
                    let h = d.getHours();
                    const m = String(d.getMinutes()).padStart(2, '0');
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    h %= 12;
                    h = h || 12;
                    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
                };

                finalPayload = {
                    instructor_id: data.InstructorId,
                    date: toDate(data.StartTime),
                    start_time: formatAmPm(data.StartTime),
                    end_time: formatAmPm(data.EndTime),
                    reason: data.Reason || '',
                    color: data.color || '#e9d5ff'
                };

                if (args.requestType === 'eventCreate') {
                    finalPayload.status = 'Active';
                }
            }

            try {
                // CREATE
                if (args.requestType === 'eventCreate') {
                    let result;
                    if (eventMode === 'booking') result = await CreateBooking(payload);
                    else if (eventMode === 'gap') result = await InstructorService.createGap(finalPayload);
                    else if (eventMode === 'away') result = await InstructorService.createAway(finalPayload);
                    else if (eventMode === 'leave') result = await InstructorService.createLeave(payload);

                    if (result) {
                        toast.success(`${defaultTitle} Added`);
                    }
                }

                // UPDATE
                if (args.requestType === 'eventChange') {
                    const eventId = data.Id || data._id;
                    let result;
                    if (eventMode === 'booking') result = await UpdateBooking(eventId, payload);
                    else if (eventMode === 'gap') result = await InstructorService.updateGap(eventId, finalPayload);
                    else if (eventMode === 'away') result = await InstructorService.updateAway(eventId, finalPayload);
                    else if (eventMode === 'leave') {
                        // Fetch existing weekly setup
                        const existingDaysReq = await InstructorService.instructorWorkingDays(data.InstructorId);
                        const existingDays = existingDaysReq.data || existingDaysReq.data?.data || existingDaysReq;
                        const payloadDays = {};
                        if (Array.isArray(existingDays)) {
                            existingDays.forEach(d => {
                                payloadDays[d.day_of_week] = {
                                    is_working: d.is_working === 1 || d.is_working === true,
                                    ...(d.start_time && { workStart: d.start_time }),
                                    ...(d.end_time && { workEnd: d.end_time }),
                                    ...(d.break_start_time && { breakStart: d.break_start_time }),
                                    ...(d.break_end_time && { breakEnd: d.break_end_time }),
                                    ...(d.color && { color: d.color })
                                };
                            });
                        }
                        
                        // Override just the color for this specific day (and ensure it's still marked as leave/not working)
                        if (data.DayOfWeek) {
                            payloadDays[data.DayOfWeek] = {
                                ...(payloadDays[data.DayOfWeek] || {}),
                                is_working: false,
                                color: data.color
                            };
                            
                            const leavePayload = {
                                instructor_id: data.InstructorId,
                                workingDays: payloadDays
                            };
                            
                            result = await InstructorService.instructorWorkingDayCreateAndUpdate(leavePayload);
                        } else {
                           // Fallback if DayOfWeek is missing
                           result = { data: 'No DayOfWeek specified' };
                        }
                    }

                    if (result) {
                        toast.success(`${defaultTitle} Updated`);
                    }
                }

                // DELETE
                if (args.requestType === 'eventRemove') {
                    const eventId = data.Id || data._id;
                    let result;
                    if (eventMode === 'booking') result = await RemoveBooking(eventId);
                    else if (eventMode === 'gap') result = await InstructorService.deleteGap(eventId);
                    else if (eventMode === 'away') result = await InstructorService.deleteAway(eventId);
                    else if (eventMode === 'leave') result = await InstructorService.deleteLeave(eventId);

                    if (result) {
                        toast.success(`${defaultTitle} Deleted`);
                    }
                }

                // Close popup
                if (
                    scheduleRef.current
                ) {
                    scheduleRef.current.closeEditor();
                }

                // Reload data
                await loadBookings();
                await GetAllBookings();
                if (onBookingChange) onBookingChange();

            } catch (err) {

                console.error(err);

                toast.error(
                    'Failed to save booking'
                );
                        }
        }
    };

    /* ================= DISABLE QUICK POPUP ================= */

    const onPopupOpen = (args) => {
        if (args.type === 'QuickInfo') {
            args.cancel = true;
        }
        if (args.type === 'Editor') {
            const status = args.data?.Status || args.data?.EventType;
            if (status === 'leave' || status === 'Day Off') {
                args.cancel = true;
            }
        }
    };

    /* ================= EVENT COLORS ================= */

    const onEventRendered = (args) => {

        const status = args.data?.Status;
        const customColor = args.data?.color;

        // Completed
        if (
            status === 'completed'
        ) {
            const finalColor = customColor || '#16a34a'; // green
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
        }

        // Cancelled
        else if (
            status === 'cancelled'
        ) {
            const finalColor = customColor || '#dc2626'; // red
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
            args.element.style.opacity = '0.6';
            args.element.style.textDecoration = 'line-through';
        }

        // Leave
        else if (
            status === 'leave' || status === 'Day Off'
        ) {
            const finalColor = '#e5e7eb';
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
            // Striped background for leaves
            args.element.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)';
        }


        // Working Shift
        else if (
            status === 'working_shift'
        ) {
            const finalColor = customColor || workColor;
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
            args.element.style.borderLeft = `4px solid ${getContrastYIQ(finalColor)}`;
        }

        // Gap
        else if (
            status === 'gap'
        ) {
            const finalColor = customColor || gapColor;
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
            args.element.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)';
        }

        // Away
        else if (
            status === 'away'
        ) {
            const finalColor = customColor || awayColor;
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
        }

        // Booking Request
        else if (
            status === 'booking_request'
        ) {
            const finalColor = customColor || '#8b5cf6'; // purple
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
        }

        // Pending
        else if (
            status === 'pending'
        ) {
            const finalColor = customColor || '#f59e0b'; // amber
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
        }

        // Default (Booked or unknown)
        else {
            const finalColor = customColor || '#3b82f6'; // blue
            args.element.style.setProperty(
                'background-color',
                finalColor,
                'important'
            );
            args.element.style.setProperty(
                'color',
                getContrastYIQ(finalColor),
                'important'
            );
        }
    };

    /* ================= RENDER ================= */

    return (
        <div className="space-y-6">
            {/* Premium Filter Controls Panel */}
            <div className="bg-slate-50 dark:bg-[#121620] border border-slate-150/40 dark:border-slate-800/40 rounded-2xl p-4 md:p-6 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/45 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <FiSliders className="text-lg" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 capitalize">
                                {{
                                    'bookings': 'Filter Bookings',
                                    'leaves': 'Filter Leaves',
                                    'gaps': 'Filter Gaps',
                                    'away': 'Filter Away Days'
                                }[mode] || 'Filter Bookings'}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
                                {mode === 'bookings' 
                                    ? 'Narrow down schedules by instructor, pupil, and status' 
                                    : 'Narrow down schedules by instructor'}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Instructor Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                            <FiUser className="text-indigo-500" />
                            Instructor
                        </label>
                        <DropDownListComponent
                            id="instructor-filter"
                            dataSource={(() => {
                                if (!instructors) return [];
                                return instructors.map(i => ({ text: i.name, value: i._id }));
                            })()}
                            fields={{ text: 'text', value: 'value' }}
                            value={selectedInstructor}
                            change={(e) => setSelectedInstructor(e.value || '')}
                            allowFiltering
                            placeholder={(mode === 'leaves' || mode === 'gaps' || mode === 'away') ? "Select an Instructor..." : "Search Instructor..."}
                            className="w-full bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm cursor-pointer shadow-sm"
                        />
                    </div>



                    {/* Learner Filter (Hidden in Leaves/Gaps/Away modes) */}
                    {(mode !== 'leaves' && mode !== 'gaps' && mode !== 'away') && (
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                            <FiBookOpen className="text-teal-500" />
                            Pupil (Learner)
                        </label>
                        <select
                            value={selectedLearner}
                            onChange={(e) => setSelectedLearner(e.target.value)}
                            className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
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

                    {/* Status Filter (Hidden in Leaves/Gaps/Away modes) */}
                    {(mode !== 'leaves' && mode !== 'gaps' && mode !== 'away') && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                            <FiCheckCircle className="text-emerald-500" />
                            Booking Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="booking_request">Booking Request</option>
                            <option value="pending">Pending</option>
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100/50 dark:border-slate-800/40 shadow-sm overflow-hidden p-2 md:p-4">
                <ScheduleComponent
                    ref={scheduleRef}

                    height="650px"

                    currentView="Week"
                    firstDayOfWeek={1}
                    workDays={[0, 1, 2, 3, 4, 5, 6]}
                    startHour="06:00"
                    endHour="22:00"
                    timeScale={{ enable: true, interval: 60, slotCount: 4 }}
                    scrollTo="09:00"

                    selectedDate={
                        new Date()
                    }

                    // AUTO LOCAL MACHINE TIMEZONE
                    timezone={
                        Intl.DateTimeFormat()
                            .resolvedOptions()
                            .timeZone
                    }

                    eventSettings={{
                        dataSource: filteredEvents
                    }}

                    // eslint-disable-next-line react/no-unstable-nested-components
                    editorTemplate={(props) =>
                        <EditorTemplate {...props} mode={mode} />
                    }

                    popupOpen={
                        onPopupOpen
                    }

                    actionBegin={
                        onActionBegin
                    }

                    eventRendered={
                        onEventRendered
                    }
                >
                    <ViewsDirective>

                        <ViewDirective option="Day" startHour="06:00" endHour="22:00" />

                        <ViewDirective option="Week" startHour="06:00" endHour="22:00" />

                        <ViewDirective option="WorkWeek" displayName={mode === 'gaps' ? 'Gap Week' : 'Work Week'} startHour="06:00" endHour="22:00" />

                        {(mode !== 'leaves' && mode !== 'gaps' && mode !== 'away') && <ViewDirective option="Month" />}

                        {(mode !== 'leaves' && mode !== 'gaps' && mode !== 'away') && <ViewDirective option="Agenda" />}

                    </ViewsDirective>

                    <Inject
                        services={[
                            Day,
                            Week,
                            WorkWeek,
                            Month,
                            Agenda
                        ]}
                    />
                </ScheduleComponent>
            </div>
        </div>
    );
};

export default MasterBookingCalendar;