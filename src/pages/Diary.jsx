import React, { useEffect, useState } from 'react';
import { Header, Stacked, Pie } from '../components';
import { lessonsData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import MasterBookingCalendar from './MasterBookingCalender';
import { FiBookOpen, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiFileText } from 'react-icons/fi';

const Diary = () => {
    const { currentColor, GetAllBookings } = useStateContext();
    const [Bookings, setBookings] = useState([]);

    async function FetchBookings() {
        try {
            const res = await GetAllBookings();
            console.log('response', res);
            
            let dataArray = [];
            if (Array.isArray(res)) dataArray = res;
            else if (res && Array.isArray(res.data)) dataArray = res.data;
            else if (res && res.data && Array.isArray(res.data.data)) dataArray = res.data.data;
            else if (res && Array.isArray(res.bookings)) dataArray = res.bookings;

            // Filter out bookings with missing pupil or instructor
            // Removed strict filter so general block-out times or incomplete bookings still show
            setBookings(dataArray);
        } catch (error) {
            console.log('error', error)
        }
    }

    const completed = Bookings.filter(l => l.status?.toLowerCase() === 'completed').length;
    const cancelled = Bookings.filter(l => l.status?.toLowerCase() === 'cancelled').length;
    const pending = Bookings.filter(l => l.status?.toLowerCase() === 'pending').length;
    const booked = Bookings.filter(l => l.status?.toLowerCase() === 'booked').length;
    const bookingRequest = Bookings.filter(l => l.status?.toLowerCase() === 'booking_request').length;
    const totalLessons = Bookings.length;

    const [calendarMode, setCalendarMode] = useState('all');

    useEffect(() => {
        FetchBookings()
    }, [])

    // Data for Pie Chart
    const pieData = [
        { x: 'Pending', y: pending, text: pending > 0 ? `${pending}` : '' },
        { x: 'Booked', y: booked, text: booked > 0 ? `${booked}` : '' },
        { x: 'Completed', y: completed, text: completed > 0 ? `${completed}` : '' },
        { x: 'Cancelled', y: cancelled, text: cancelled > 0 ? `${cancelled}` : '' },
        { x: 'Request', y: bookingRequest, text: bookingRequest > 0 ? `${bookingRequest}` : '' },
    ];

    return (
        <div className="mt-6 p-2 md:p-6 transition-colors duration-300">
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <StatCard 
                    title="Total Bookings" 
                    value={totalLessons} 
                    color={currentColor} 
                    icon={<FiBookOpen className="text-lg md:text-xl" />} 
                    bgClass="bg-indigo-50/50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                />
                <StatCard 
                    title="Pending" 
                    value={pending} 
                    color="#f59e0b" 
                    icon={<FiClock className="text-lg md:text-xl" />} 
                    bgClass="bg-amber-50/50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                />
                <StatCard 
                    title="Booked" 
                    value={booked} 
                    color="#3b82f6" 
                    icon={<FiCalendar className="text-lg md:text-xl" />} 
                    bgClass="bg-blue-50/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                />
                <StatCard 
                    title="Booking Request" 
                    value={bookingRequest} 
                    color="#8b5cf6" 
                    icon={<FiFileText className="text-lg md:text-xl" />} 
                    bgClass="bg-violet-50/50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
                />
                <StatCard 
                    title="Completed" 
                    value={completed} 
                    color="#10b981" 
                    icon={<FiCheckCircle className="text-lg md:text-xl" />} 
                    bgClass="bg-emerald-50/50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard 
                    title="Cancelled" 
                    value={cancelled} 
                    color="#f43f5e" 
                    icon={<FiAlertCircle className="text-lg md:text-xl" />} 
                    bgClass="bg-rose-50/50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                />
            </div>

            {/* Title before calendar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ml-2">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white capitalize">
                    Instructors Calender
                </h2>
            </div>

            {/* Calendar Card Section */}
            <div className="mb-8">
                {/* eslint-disable-next-line react/jsx-no-bind */}
                <MasterBookingCalendar mode={calendarMode} onBookingChange={FetchBookings} />
            </div>

            {/* Overview Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ display: 'none' }}>
                <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                        Booking Status Overview
                    </h3>
                    <div className="flex justify-center items-center py-4">
                        <Pie
                            id="lesson-status"
                            data={pieData}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1 h-4 bg-purple-500 rounded-full" />
                        Bookings Overview
                    </h3>
                    <div className="py-4">
                        <Stacked />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;

const StatCard = ({ title, value, color, icon, bgClass }) => (
    <div className="premium-card bg-white dark:bg-[#1e293b] rounded-2xl p-4 lg:p-5 border border-slate-100 dark:border-slate-800/40 shadow-sm flex items-center justify-between gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="flex-1 min-w-0">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider leading-tight break-words">{title}</p>
            <p className="text-2xl lg:text-3xl font-extrabold mt-1 lg:mt-2 tracking-tight text-slate-800 dark:text-white" style={{ color }}>
                {value}
            </p>
        </div>
        <div className={`p-2.5 lg:p-3.5 rounded-2xl ${bgClass} shadow-inner flex-shrink-0 flex items-center justify-center`}>
            {icon}
        </div>
    </div>
);
