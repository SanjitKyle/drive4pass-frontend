
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import TransferModelDisplay from '../components/TransferModelDisplay';
import { bookingService } from "../services/booking.service";
import { LearnerService } from "../services/Learner";
import toast from "react-hot-toast";
import { FiEdit } from "react-icons/fi";

const LearnerProfilePage = () => {
    const {
        learners,
        fetchPupilsMoney,
        getPupilBookings,
        getPupilCreditsLog,
        getPupilSell,
        pricing,
        fetchPricing,
        fetchLearners
    } = useStateContext();

    const [MoneyHistory, setMoneyHistory] = useState([]);
    const [SellHistory, setSellHistory] = useState([]);
    const [CreditLogs, setCreditLogs] = useState([]);
    const [AllBookings, setBookings] = useState([]);

    const [Cancelled, setCancelled] = useState(0);
    const [Completed, setCompleted] = useState(0);
    const [transferModelOpen, setTransferModelOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [modalEmail, setModalEmail] = useState('');
    const [modalPhone, setModalPhone] = useState('');
    const [isEmailEditable, setIsEmailEditable] = useState(false);
    const [isPhoneEditable, setIsPhoneEditable] = useState(false);
    
    const [viewAllBookings, setViewAllBookings] = useState(false);
    const [updatingBooking, setUpdatingBooking] = useState(null);

    const { id } = useParams();

    const learner = learners.find((l) => l._id === id);

    /* ================= CALCULATIONS ================= */
    const totalPurchased = learner?.total_packages_price || SellHistory?.reduce((acc, sell) => {
        if (!sell || typeof sell !== 'object') return acc;
        const pkgId = typeof sell.package_id === 'object' ? sell.package_id?._id : sell.package_id;
        const areaId = typeof sell.branch_id === 'object' ? sell.branch_id?._id : sell.branch_id;
        
        if (!pkgId || !areaId) return acc;
        
        const matchedPricing = pricing?.find(p => 
            (p.package_id?._id === pkgId || p.package_id === pkgId) && 
            (p.branch_id?._id === areaId || p.branch_id === areaId)
        );
        const price = Number(sell.price) || Number(sell.amount) || Number(matchedPricing?.price) || Number(sell.package_id?.price) || 0;
        return acc + price;
    }, 0) || 0;
    
    const totalPaid = MoneyHistory?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    const dueAmount = totalPurchased > totalPaid ? totalPurchased - totalPaid : 0;
    const extraPaidAmount = totalPaid > totalPurchased ? totalPaid - totalPurchased : 0;

    const completedBookings = AllBookings?.filter(b => b.status?.toLowerCase() === 'completed' || b.status?.toLowerCase() === 'booked') || [];

    const totalCredits = Number(learner?.total_credit) || 0;
    const usedHours = completedBookings.reduce((acc, curr) => acc + (Number(curr.credit_use) || 0), 0);
    const remainingHours = totalCredits >= usedHours ? totalCredits - usedHours : 0;

    const completedPercentage =
        totalCredits > 0 ? (usedHours / totalCredits) * 100 : 0;

    /* ================= BOOKINGS ================= */

    async function Bookings() {
        try {
            const res = await getPupilBookings(id);

            setBookings(res.data);
            console.log('booking data', res.data)

            const cancelled = res.data.filter((b) => b.status === "cancelled");
            const completed = res.data.filter((b) => b.status === "completed" || b.status === "booked");

            setCancelled(cancelled.length);
            setCompleted(completed.length);
        } catch (error) {
            console.log(error);
        }
    }

    const handleBookingStatusChange = async (bookingId, newStatus) => {
        // Optimistic UI Update
        const previousBookings = [...AllBookings];
        setBookings(prev => prev.map(book => 
            book._id === bookingId ? { ...book, status: newStatus } : book
        ));

        try {
            setUpdatingBooking(bookingId);
            await bookingService.update(bookingId, { status: newStatus });
            toast.success("Booking status updated!");
            // Bookings(); // No need to refetch immediately since UI is updated
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
            setBookings(previousBookings); // Revert on failure
        } finally {
            setUpdatingBooking(null);
        }
    };

    /* ================= MONEY HISTORY ================= */

    async function PupilsMoneyHistory() {
        try {
            const res = await fetchPupilsMoney(id);
            setMoneyHistory(res);
        } catch (error) {
            console.log(error);
        }
    }

    /* ================= PACKAGES ================= */

    async function GetAllSell() {
        try {
            const res = await getPupilSell(id);
            console.log('res', res)
            setSellHistory(res);
        } catch (error) {
            console.log(error);
        }
    }

    /* ================= CREDIT LOGS ================= */

    async function GetAllLogs() {
        try {
            const res = await getPupilCreditsLog(id);
            setCreditLogs(res);
        } catch (error) {
            console.log(error);
        }
    }

    /* ================= STATUS COLORS ================= */

    function colorSet(status) {
        if (status === "completed") return "bg-green-500";
        if (status === "cancelled") return "bg-red-500";
        if (status === "booking_request") return "bg-blue-500";
        if (status === "pending") return "bg-yellow-500";
        return "bg-gray-400";
    }
    useEffect(() => {
        if (passwordModalOpen && learner) {
            setModalEmail(learner?.email || '');
            setModalPhone(learner?.phone || '');
            setIsEmailEditable(false);
            setIsPhoneEditable(false);
        }
    }, [passwordModalOpen, learner]);

    const TransferOpen = useCallback(() => {
        setTransferModelOpen(true);
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        try {
            await LearnerService.changePassword({ 
                pupil_id: learner?._id,
                email: modalEmail, 
                password: newPassword,
                phone: modalPhone
            });
            toast.success("Password changed successfully");
            setPasswordModalOpen(false);
            setNewPassword('');
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to change password");
        }
    };

    useEffect(() => {
        PupilsMoneyHistory();
        Bookings();
        GetAllSell();
        GetAllLogs();
        if (!pricing || pricing.length === 0) {
            if (fetchPricing) fetchPricing();
        }
    }, [id]);

    const handleGoBack = () => window.history.back();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen transition-colors duration-300">
            {/* BACK BUTTON */}
            <div>
                <button
                    type="button"
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-[#1e293b] px-4 py-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/40 shadow-xs active:scale-95 transition-all select-none"
                >
                    ← Back to List
                </button>
            </div>

            {/* HEADER */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/40 shadow-sm flex items-center justify-between gap-6 transition-all duration-300">
               <div className="flex items-center gap-4">
                {learner?.ProfileImage ? (
                    <img
                        src={learner.ProfileImage}
                        alt={learner.full_name}
                        className="w-20 h-20 rounded-full object-cover aspect-square flex-shrink-0 border-2 border-indigo-500/20 dark:border-indigo-500/30 ring-4 ring-indigo-500/5 shadow-md"
                    />
                ) : (
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-3xl font-black shadow-lg shadow-indigo-500/20 aspect-square flex-shrink-0">
                        {learner?.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{learner?.full_name}</h1>
                    <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold capitalize mt-1">Pupil Account</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">ID #{learner?._id}</p>
                </div>
                </div>
                <div>
                    <div className="flex gap-4">
                    {learner?.password && (
                        <div>
                            <button
                                type="button"
                                onClick={() => setPasswordModalOpen(true)}
                                className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-extrabold text-indigo-600 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 border border-indigo-200 hover:border-indigo-300"
                            >
                                <span className="relative z-10 tracking-wide">Change Password</span>
                            </button>
                        </div>
                    )}
                    <div>
                        <button
                            type="button"
                            onClick={TransferOpen}
                            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border border-white/10"
                        >
                        {/* Shimmer effect */}
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                        
                        {/* Icon */}
                        <svg 
                            className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                        
                        <span className="relative z-10 tracking-wide">Transfer</span>
                    </button>
                </div>
                </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* PUPIL INFO */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                            Pupil Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <Info label="Full Name" value={learner?.full_name} />
                            <Info label="Phone Number" value={learner?.phone || '—'} />
                            <Info label="Assigned Instructor" value={learner?.instructor_id?.name || 'Unassigned'} />
                            <Info label="Email Address" value={learner?.email || '—'} />
                        </div>
                    </div>

                    {/* FINANCIAL SUMMARY */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                            Financial Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <Stat label="Package Price" value={`£${totalPurchased.toFixed(2)}`} />
                            <Stat label="Total Paid" value={`£${totalPaid.toFixed(2)}`} />
                            <div className="rounded-2xl border border-rose-100/60 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5">
                                <Stat label="Due Amount" value={`£${dueAmount.toFixed(2)}`} color={dueAmount > 0 ? "#f43f5e" : "#10b981"} />
                            </div>
                            <div className="rounded-2xl border border-amber-100/60 dark:border-amber-950/20 bg-amber-50/20 dark:bg-amber-950/5">
                                <Stat label="Extra Paid" value={`£${extraPaidAmount.toFixed(2)}`} color={extraPaidAmount > 0 ? "#f59e0b" : "#64748b"} />
                            </div>
                        </div>
                    </div>

                    {/* COURSE COMPLETION */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <span className="w-1 h-4 bg-purple-500 rounded-full" />
                            Course Completion
                        </h3>

                        <div className="flex flex-col sm:flex-row items-center gap-8 mt-2">
                            {/* Circular Chart */}
                            <div className="relative w-36 h-36 flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-sm transform -rotate-90">
                                    <path
                                        className="text-slate-100 dark:text-slate-800/80"
                                        strokeWidth="3"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="transition-all duration-1000 ease-out"
                                        strokeDasharray={`${completedPercentage}, 100`}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        stroke="url(#progressGradient)"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                                        {completedPercentage.toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Completed
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                <Stat label="Used Hours" value={usedHours.toFixed(2)} />
                                <Stat label="Remaining" value={remainingHours.toFixed(2)} />
                                <Stat label="Total Credits" value={totalCredits.toFixed(2)} />
                            </div>
                        </div>
                    </div>


                    {/* OVERVIEW STATS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Stat label="Total Booked" value={AllBookings?.length || 0} />
                        <Stat label="Total Completed" value={Completed || 0} />
                        <Stat label="Total Cancelled" value={Cancelled || 0} />
                        <Stat label="Total Credits" value={totalCredits || 0} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                    
                    {/* PAYMENT OVERVIEW */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <span className="w-1 h-4 bg-teal-500 rounded-full" />
                            Payment Overview
                        </h3>

                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                            {MoneyHistory?.length === 0 && (
                                <p className="text-slate-400 dark:text-slate-500 text-center py-6 text-sm font-medium">
                                    No payment history available
                                </p>
                            )}

                            {MoneyHistory?.map((money) => (
                                <div key={money._id} className="premium-card bg-slate-50/20 dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                            £{money.amount}
                                        </h2>

                                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {money.payment_method}
                                        </span>
                                    </div>

                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                        {new Date(money.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PURCHASED PACKAGES */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <span className="w-1 h-4 bg-amber-500 rounded-full" />
                            Purchased Packages
                        </h3>

                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                            {SellHistory?.length === 0 && (
                                <p className="text-slate-400 dark:text-slate-500 text-center py-6 text-sm font-medium">
                                    No packages purchased
                                </p>
                            )}

                            {SellHistory?.map((sell) => (
                                <div key={sell._id} className="premium-card bg-slate-50/20 dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col gap-1.5">
                                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                                        {sell.package_id?.package_name || 'Standard Package'}
                                    </p>

                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                        Credited Hours: {sell.credited_hour} hrs
                                    </p>

                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                                        {new Date(sell.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CREDIT LOGS 
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <span className="w-1 h-4 bg-rose-500 rounded-full" />
                            Credit Activity
                        </h3>

                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                            {CreditLogs?.length === 0 && (
                                <p className="text-slate-400 dark:text-slate-500 text-center py-6 text-sm font-medium">
                                    No credit activity found
                                </p>
                            )}

                            {CreditLogs?.map((log) => {
                                const isUsed = log.credit_hours.toString().startsWith("-");

                                return (
                                    <div
                                        key={log._id}
                                        className="premium-card bg-slate-50/20 dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/60 rounded-2xl p-4 flex justify-between items-center"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {isUsed ? "Credits Debited" : "Credits Credited"}
                                            </p>

                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </p>
                                        </div>

                                        <p
                                            className={`font-black text-sm ${
                                                isUsed ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                        >
                                            {log.credit_hours} hrs
                                        </p>
                                    </div>
                                );
                            })}
                    {/* LESSONS */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-6 flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-4 bg-pink-500 rounded-full" />
                                Lessons History
                            </div>
                        </h3>

                        <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
                            {AllBookings.length === 0 && (
                                <p className="text-slate-400 dark:text-slate-500 text-center py-6 text-sm font-medium">
                                    No lessons found
                                </p>
                            )}

                            {AllBookings.map((book) => {
                                const formattedDate = new Date(
                                    book.booking_date
                                ).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

                                return (
                                    <div
                                        key={book._id}
                                        className="premium-card bg-slate-50/30 dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/60 rounded-2xl p-5"
                                    >
                                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-150">
                                            {book.title || 'Lesson Booking'}
                                        </h4>

                                        <div className="mt-4 text-xs space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-slate-500 dark:text-slate-400">
                                            <p className="flex justify-between">
                                                <span className="font-bold">Instructor:</span> 
                                                <span className="text-slate-800 dark:text-slate-200 font-semibold">{book.instructor_id?.name || '—'}</span>
                                            </p>

                                            <p className="flex justify-between">
                                                <span className="font-bold">Duration:</span> 
                                                <span className="text-slate-800 dark:text-slate-200 font-semibold">{Number(book.credit_use).toFixed(2)} hrs</span>
                                            </p>

                                            <p className="flex justify-between">
                                                <span className="font-bold">Date:</span> 
                                                <span className="text-slate-800 dark:text-slate-200 font-semibold">{formattedDate}</span>
                                            </p>

                                            <p className="flex justify-between">
                                                <span className="font-bold">Time Slot:</span> 
                                                <span className="text-slate-800 dark:text-slate-200 font-semibold">{book.start_time} - {book.end_time}</span>
                                            </p>
                                            
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold">Status:</span> 
                                                <div className="flex items-center gap-2">
                                                    <div className="relative group">
                                                        <select 
                                                            aria-label="Booking Status"
                                                            value={book.status || 'completed'}
                                                            onChange={(e) => handleBookingStatusChange(book._id, e.target.value)}
                                                            disabled={updatingBooking === book._id}
                                                            className={`pl-3 pr-7 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer outline-none ${colorSet(book.status?.toLowerCase())} text-white appearance-none text-center disabled:opacity-50 transition-opacity relative z-10`}
                                                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                                        >
                                                            <option value="booking_request" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200">Booking Request</option>
                                                            <option value="pending" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200">Pending</option>
                                                            <option value="booked" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200">Booked</option>
                                                            <option value="completed" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200">Completed</option>
                                                            <option value="cancelled" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200">Cancelled</option>
                                                        </select>
                                                        <FiEdit className="w-3 h-3 text-white/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-20 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {/* eslint-disable-next-line react/jsx-no-bind */}
            <TransferModelDisplay pupil_id={learner?._id} setTransferModelOpen={ setTransferModelOpen} isOpen={transferModelOpen} onClose={TransferOpen} currentInstructor={learner?.instructor_id || "Unassigned"} learnerId={learner?._id} onTransfer={fetchLearners} />
            
            {passwordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">Change Password</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                                    <span>Email</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value={modalEmail}
                                        onChange={(e) => setModalEmail(e.target.value)}
                                        disabled={!isEmailEditable}
                                        className={`w-full p-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all ${!isEmailEditable ? 'bg-slate-50 dark:bg-slate-800 text-slate-500' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                                    />
                                    {!isEmailEditable && (
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEmailEditable(true)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-600 transition-colors p-1"
                                        >
                                            <FiEdit className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                                    <span>Phone Number</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={modalPhone}
                                        onChange={(e) => setModalPhone(e.target.value)}
                                        disabled={!isPhoneEditable}
                                        className={`w-full p-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all ${!isPhoneEditable ? 'bg-slate-50 dark:bg-slate-800 text-slate-500' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                                    />
                                    {!isPhoneEditable && (
                                        <button 
                                            type="button" 
                                            onClick={() => setIsPhoneEditable(true)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-600 transition-colors p-1"
                                        >
                                            <FiEdit className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                                <input 
                                    type="text" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="Enter new password"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                onClick={() => {
                                    setPasswordModalOpen(false);
                                    setNewPassword('');
                                }} 
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleChangePassword} 
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/30 active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
        </div>
    );
};

/* HELPERS */

const Info = ({ label, value }) => (
    <div className="premium-card bg-slate-50/20 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex flex-col gap-1 hover:border-indigo-500/20 transition-all">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">{label}</p>
        <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200 mt-1">{value || '—'}</p>
    </div>
);

const Stat = ({ label, value, color }) => (
    <div className="premium-card bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-850 rounded-2xl p-5 text-center flex flex-col justify-center items-center shadow-xs">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-xl font-black text-slate-800 dark:text-white" style={{ color }}>{value}</p>
    </div>
);

export default LearnerProfilePage;
// Trigger recompile

