import React, { useState } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import axiosInstance from '../services/axios';
import { toast } from 'react-hot-toast';

const TransferModelDisplay = ({ pupil_id, setTransferModelOpen, isOpen, onClose, currentInstructor, onTransfer }) => {
    const [transferTo, setTransferTo] = useState('');
    const [reason, setReason] = useState('');
    const { instructors } = useStateContext(); // Assuming you have a context that provides the list of instructors

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentInstructorId = currentInstructor?._id || "Unassigned";
            const data = {
                pupil_id,
                transfer_from: currentInstructorId,
                transfer_to: transferTo,
                reason
            }
         const res= await axiosInstance.post('/ds/transfers', data);
        toast.success('Transfer successful');
        if (onTransfer) onTransfer();
        setTransferModelOpen(false);
        } catch (error) {
            console.error('Error during transfer ', error)
        }

    };

    const filterInstructors=instructors.filter((inst)=>inst._id!==currentInstructor?._id)
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
            {/* Modal Container */}
            <div
                className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            >

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                            Transfer Learner
                        </h3>
                        <button
                            type="button"
                            onClick={() => setTransferModelOpen(false)}
                            aria-label="Close"
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 pl-3.5">
                        Move this pupil to a different instructor.
                    </p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Current Instructor (Read Only) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Current Instructor
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={currentInstructor?.name || "Unassigned"}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed"
                        />
                    </div>

                    {/* Transfer To */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Transfer To <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                required
                                value={transferTo}
                                onChange={(e) => setTransferTo(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none"
                            >
                                <option value="" disabled>Select New Instructor</option>
                                {filterInstructors.map(inst => (
                                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Reason for Transfer <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Please provide a reason..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setTransferModelOpen(false)}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span>Confirm Transfer</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModelDisplay;
