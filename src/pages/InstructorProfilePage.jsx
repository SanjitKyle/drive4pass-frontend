import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import {
    FiEdit2,
    FiSave,
    FiX,
    FiCamera,
    FiArrowLeft,
    FiUser,
    FiUsers,
    FiMail,
    FiPhone,
    FiCheckCircle,
    FiCalendar,
    FiFileText,
    FiPaperclip,
    FiBriefcase,
    FiUploadCloud,
    FiCreditCard,
    FiAward,
    FiChevronDown,
    FiChevronUp,
    FiPlus,
    FiHash,
    FiLock,
    FiEye,
    FiEyeOff,
    FiSend
} from 'react-icons/fi';
import { useStateContext } from '../contexts/ContextProvider';
import Scheduler from './Calendar';
import WeeklyAvailability from '../components/SetupWeeklyPopup';
import WeeklyAvailabilityList from '../components/InstructorWeeklyDisplay';
import { InstructorService } from '../services/instructor.service';
import { NotesService } from '../services/notes.service';

const PDITrainingSection = ({ instructorId, instructorData }) => {
    const { updateInstructor } = useStateContext();
    const [loading, setLoading] = useState(false);

    const [fee, setFee] = useState(instructorData.training_fee || '');
    const [paid, setPaid] = useState(instructorData.training_paid || '');
    const [notes, setNotes] = useState(instructorData.training_notes || '');

    useEffect(() => {
        const fetchPdiFees = async () => {
            if (!instructorId) return;
            try {
                const res = await InstructorService.getPdiFeesAmount(instructorId);
                const data = res?.data || res;
                
                let record = null;
                if (Array.isArray(data)) {
                    if (data.length > 0) record = data[data.length - 1]; 
                } else if (data && typeof data === 'object') {
                    const possibleArray = Object.values(data).find(v => Array.isArray(v));
                    const extracted = possibleArray || data.data || data.records || data;
                    if (Array.isArray(extracted) && extracted.length > 0) {
                        record = extracted[extracted.length - 1];
                    } else if (!Array.isArray(extracted)) {
                        record = extracted;
                    }
                }
                
                if (record) {
                    if (record.fees_amount !== undefined) setFee(record.fees_amount);
                    if (record.amount_paid !== undefined) setPaid(record.amount_paid);
                    if (record.notes !== undefined) setNotes(record.notes);
                }
            } catch (err) {
                console.error("Failed to fetch PDI fees:", err);
            }
        };
        fetchPdiFees();
    }, [instructorId]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                instructor: instructorId,
                fees_amount: Number(fee) || 0,
                amount_paid: Number(paid) || 0,
                notes
            };

            const res = await InstructorService.addPdiFeesAmount(payload);
            if (res) {
                toast.success('PDI training updated successfully');
            }
        } catch {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const numFee = parseFloat(fee) || 0;
    const numPaid = parseFloat(paid) || 0;
    const outstanding = Math.max(0, numFee - numPaid);

    return (
        <div className="relative group overflow-hidden bg-white dark:bg-[#1e293b] p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-500" />

            <div className="relative z-10 space-y-7">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
                        <FiAward className="text-white text-xl" />
                    </div>
                    <h3 className="font-black text-xl text-slate-800 dark:text-white tracking-tight">PDI Training</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Fee</span>
                        <span className="font-bold text-slate-800 dark:text-white text-base">{numFee > 0 ? `£${numFee.toFixed(2)}` : '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-slate-100 dark:border-slate-800/60 pl-4">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Paid</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{numPaid > 0 ? `£${numPaid.toFixed(2)}` : '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-slate-100 dark:border-slate-800/60 pl-4">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Outstanding</span>
                        <span className={`font-bold text-base ${outstanding > 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>{outstanding > 0 ? `£${outstanding.toFixed(2)}` : '—'}</span>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Fee amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                            <input
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Amount paid</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                            <input
                                type="number"
                                value={paid}
                                onChange={(e) => setPaid(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="2"
                            placeholder="Add any relevant notes here..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-slate-800 dark:text-white resize-none"
                        ></textarea>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave size={16} /> Save PDI Training
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FranchiseFeesSection = ({ instructorId, instructorData }) => {
    const { updateInstructor } = useStateContext();
    const [loading, setLoading] = useState(false);
    const[loading1,setLoading1]=useState(false)

    const [feeType, setFeeType] = useState(instructorData.franchise_fee_type || 'Weekly');
    const [feeAmount, setFeeAmount] = useState(instructorData.franchise_fee_amount || '');
    const [dueRule, setDueRule] = useState(instructorData.franchise_due_rule || 'Sunday');
    const [customDueDay, setCustomDueDay] = useState(instructorData.franchise_custom_due_day || 'Default (Sunday)');
    const [action_type, setAction_type] = useState("add payment")
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [showAllPayments, setShowAllPayments] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!instructorId) return;
            try {
                setLoadingPayments(true);
                const res = await InstructorService.getFranchiseFees(instructorId);
                const data = res?.data || res;

                let extracted = [];
                if (Array.isArray(data)) {
                    extracted = data;
                } else if (data && typeof data === 'object') {
                    const possibleArray = Object.values(data).find(v => Array.isArray(v));
                    extracted = possibleArray || data.data || data.records || [];
                }
                const paymentsList = Array.isArray(extracted) ? extracted : [];
                setPayments(paymentsList);

                const settingRecord = paymentsList.find(p => p.action_type === 'payment setting');
                if (settingRecord) {
                    if (settingRecord.fees_type) setFeeType(settingRecord.fees_type);
                    if (settingRecord.fees_amount) setFeeAmount(settingRecord.fees_amount);
                    if (settingRecord.due_rule) setDueRule(settingRecord.due_rule);
                    if (settingRecord.custom_rule) setCustomDueDay(settingRecord.custom_rule);
                }
            } catch (err) {
                console.error("Failed to fetch payments:", err);
            } finally {
                setLoadingPayments(false);
            }
        };
        fetchPayments();
    }, [instructorId]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                fees_type: feeType,
                instructor: instructorId,
                fees_amount: String(feeAmount),
                due_rule: dueRule,
                action_type: "payment setting"
            };

            if (customDueDay && customDueDay !== 'Default (Sunday)') {
                payload.custom_rule = customDueDay;
            }

            const res = await InstructorService.addFranchiseFees(payload);
            if (res) {
                toast.success('Franchise fee settings updated successfully');
            }
        } catch {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMoney = async () => {
        try {
            setLoading1(true);
            const payload = {
                fees_type: feeType,
                instructor: instructorId,
                fees_amount: String(feeAmount),
                due_rule: dueRule,
                action_type: "add payment"
            };

            if (customDueDay && customDueDay !== 'Default (Sunday)') {
                payload.custom_rule = customDueDay;
            }

            const res = await InstructorService.addFranchiseFees(payload);
            if (res) {
                toast.success('Franchise fee settings updated successfully');
            }
        } catch {
            toast.error('Update failed');
        } finally {
            setLoading1(false);
        }
    };

    const displayPayments = payments ? payments.filter(p => p.action_type === 'add payment') : [];

    return (
        <div className="relative group overflow-hidden bg-white dark:bg-[#1e293b] p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-500" />

            <div className="relative z-10 space-y-7">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/30">
                        <FiCreditCard className="text-white text-xl" />
                    </div>
                    <h3 className="font-black text-xl text-slate-800 dark:text-white tracking-tight">Franchise Fees</h3>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Fee type</label>
                        <div className="relative">
                            <select
                                value={feeType}
                                onChange={(e) => setFeeType(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                <FiChevronDown />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Fee amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                            <input
                                type="number"
                                value={feeAmount}
                                onChange={(e) => setFeeAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Due rule</label>
                        <div className="relative">
                            <select
                                value={dueRule}
                                onChange={(e) => setDueRule(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="Sunday">Sunday</option>
                                <option value="Last day of month">Last day of month</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                <FiChevronDown />
                            </div>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Or set a custom due date below to override this rule.</p>
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 dark:text-slate-400">Custom due day of week <span className="font-normal opacity-70">(optional)</span></label>
                        <div className="relative">
                            <select
                                value={customDueDay}
                                onChange={(e) => setCustomDueDay(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="Default (Sunday)">Default (Sunday)</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednessday">Wednesday</option>
                                <option value="Thusday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                <FiChevronDown />
                            </div>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Leave as default to use Sunday. If set, payment will be due on this day each week.</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave size={16} /> Save Fee Settings
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={loading1}

                        onClick={handleAddMoney}

                        className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98]"
                    >
                       {!loading1? (<><FiPlus size={16} /> Add Payment Record</>):'saving...'}
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs uppercase tracking-wider font-black text-slate-700 dark:text-slate-300">Recent Payments</h4>
                    <button 
                        onClick={() => setShowAllPayments(true)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
                    >
                        View All
                    </button>
                </div>
                {loadingPayments && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center text-center">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loadingPayments && displayPayments && displayPayments.length > 0 && (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {displayPayments.slice(0, 3).map((payment, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">£{payment.fees_amount}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} • {payment.due_rule}</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg">
                                    {payment.fees_type}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {!loadingPayments && (!displayPayments || displayPayments.length === 0) && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center text-center">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">No payments recorded yet.</p>
                    </div>
                )}
            </div>

            {showAllPayments && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] w-full max-w-lg border border-slate-100 dark:border-slate-800/60 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col overflow-hidden">
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <FiCreditCard size={18} />
                                </div>
                                <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    Transaction History
                                </h2>
                            </div>
                            <button 
                                onClick={() => setShowAllPayments(false)}
                                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30 dark:bg-transparent">
                            {displayPayments && displayPayments.length > 0 ? (
                                displayPayments.map((payment, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <FiCheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-0.5 flex items-center gap-2">
                                                    Payment Received
                                                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                                        {payment.fees_type}
                                                    </span>
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: '2-digit', year: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })} • Due Rule: {payment.due_rule}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-800 dark:text-white">
                                                £{payment.fees_amount}
                                            </p>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Successful</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 text-slate-300 dark:text-slate-600">
                                        <FiFileText size={32} />
                                    </div>
                                    <p className="text-base font-black text-slate-700 dark:text-slate-300">No transactions found</p>
                                    <p className="text-xs text-slate-500 mt-2 max-w-xs">It looks like there are no payment records logged for this instructor yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const EXCLUDED_FIELDS = [
    '_id',
    '__v',
    'createdAt',
    'updatedAt',
    'school_id',
    'branch_id',
    'approved_by',
    'instructor_user_id',
    'password',
    'entry_type',
    'experience'
];

const InstructorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        instructors,
        approvedInstructor,
        fetchInstructors,
        fetchInstructorWorkingDays,
        updateInstructor,
        IsUpdate,
    } = useStateContext();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordHeader, setShowPasswordHeader] = useState(false);
    const [sendingCredentials, setSendingCredentials] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePreview, setProfilePreview] = useState(null);
    const [workingDays, setWorkingDays] = useState([]);
    const [isInstructorDetailsOpen, setIsInstructorDetailsOpen] = useState(false);
    const [internalNote, setInternalNote] = useState('');
    const [savingInternalNote, setSavingInternalNote] = useState(false);

    const instructor = instructors.find((i) => i._id === id);

    /* ================= SYNC DATA ================= */
    useEffect(() => {
        if (instructor) {
            setFormData({
                entry_type: instructor.entry_type || '',
                work_type: instructor.work_type || '',
                type: instructor.type || '',
                start_date: instructor.start_date || '',
                franchise_start_date: instructor.franchise_start_date || '',
                car_make: instructor.car_make || '',
                car_model: instructor.car_model || '',
                car_reg: instructor.car_reg || '',
                badge_number: instructor.badge_number || '',
                status: instructor.status || '1',
                driving_experience: instructor.driving_experience || '',
                ...instructor
            });
            setProfilePreview(instructor.profile || null);
        }
        console.log('instructors', instructor)
    }, [instructor]);

    /* ================= WORKING DAYS ================= */
    useEffect(() => {
        if (id) {
            const loadDays = async () => {
                setLoading(true);
                const res = await fetchInstructorWorkingDays(id);
                setWorkingDays(res || []);
                setLoading(false);
            };
            loadDays();
        }
    }, [id, IsUpdate, fetchInstructorWorkingDays]);

    /* ================= INTERNAL NOTES ================= */
    useEffect(() => {
        if (id) {
            const loadInternalNotes = async () => {
                try {
                    const res = await NotesService.getInternalNotesByEntity('InstructorMaster', id);
                    let noteText = '';
                    
                    if (typeof res === 'string') {
                        noteText = res;
                    } else if (res?.notes && Array.isArray(res.notes) && res.notes.length > 0) {
                        noteText = res.notes.map(n => n.note || '').join('\n\n');
                    } else if (Array.isArray(res) && res.length > 0) {
                        noteText = res.map(n => n.note || '').join('\n\n');
                    } else if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                        noteText = res.data.map(n => n.note || '').join('\n\n');
                    } else if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                        noteText = res.data.data.map(n => n.note || '').join('\n\n');
                    } else if (res?.data?.note) {
                        noteText = res.data.note;
                    } else if (res?.data?.data?.note) {
                        noteText = res.data.data.note;
                    } else if (res?.note) {
                        noteText = res.note;
                    }
                    
                    if (noteText) {
                        setInternalNote(noteText);
                    }
                } catch (error) {
                    console.error('Error fetching internal notes:', error);
                }
            };
            loadInternalNotes();
        }
    }, [id]);

    if (!instructor) return <Navigate to="/instructors" replace />;

    /* ================= HANDLERS ================= */
    const handleSendCredentials = async () => {
        setSendingCredentials(true);
        try {
            await InstructorService.notifyCredentials(id);
            toast.success('Credentials notification sent successfully.');
        } catch (error) {
            const errMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to send credentials notification.';
            toast.error(errMsg);
        } finally {
            setSendingCredentials(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfilePreview(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, profile: file }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                // Skip excluded fields, null/undefined, or internal metadata that causes casting errors
                const internalMetadata = ['deleted_at', 'deleted_by', 'updated_by', 'updatedAt', 'updated_at'];

                if (
                    EXCLUDED_FIELDS.includes(key) ||
                    internalMetadata.includes(key) ||
                    value === null ||
                    value === undefined ||
                    value === 'null'
                ) {
                    return;
                }

                payload.append(key, value);
            });

            if (formData.internal_notes) {
                await NotesService.saveInternalNote({
                    entityId: id,
                    entityModel: 'InstructorMaster',
                    note: formData.internal_notes
                });
            }

            // 🔥 CALL UPDATE API HERE
            const res = await updateInstructor(id, payload);
            console.log('response to update instructor', res)
            if (res) {
                toast.success('Instructor updated successfully');
            }

            setIsEditing(false);
            setLoading(false);
        } catch {
            toast.error('Update failed');
            setLoading(false);
        }
    };

    const handleSaveInternalNote = async () => {
        try {
            setSavingInternalNote(true);
            await NotesService.saveInternalNote({
                entityId: id,
                entityModel: 'InstructorMaster',
                note: internalNote
            });

            const payload = new FormData();
            payload.append('internal_notes', internalNote);
            await updateInstructor(id, payload);

            toast.success('Internal notes saved successfully!');
        } catch (error) {
            console.error('Error saving internal notes:', error);
            toast.error('Failed to save internal notes.');
        } finally {
            setSavingInternalNote(false);
        }
    };

    const handleConfirmApprove = async () => {
        try {
            setLoading(true);
            const res = await approvedInstructor(instructor._id);
            if (res?.success) {
                toast.success(res.message);
                fetchInstructors();
                setIsApproved(true);
                setOpen(false);
            }
            setLoading(false);
        } catch {
            toast.error('Approval failed');
            setLoading(false);
        }
    }; return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-[#1e293b] px-4 py-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/40 shadow-sm hover:shadow-md active:scale-95 transition-all select-none"
                >
                    <FiArrowLeft className="text-sm transition-transform group-hover:-translate-x-0.5" />
                    Back to List
                </button>

                {!isEditing && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-blue-50/80 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm backdrop-blur-sm w-full sm:w-auto">
                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 whitespace-nowrap">
                            Notify instructor about credential change:
                        </span>
                        <button
                            type="button"
                            onClick={handleSendCredentials}
                            disabled={sendingCredentials}
                            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto"
                        >
                            {sendingCredentials ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiSend size={14} />
                            )}
                            Send
                        </button>
                    </div>
                )}
            </div>

            {/* ================= PREMIUM HEADER CARD ================= */}
            <div className="relative overflow-hidden bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800/60 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300">
                {/* Background Accent Banner */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-center w-full md:w-auto">

                        {/* PROFILE IMAGE */}
                        <div className="relative group select-none flex-shrink-0 w-28 h-28 md:w-32 md:h-32">
                            {profilePreview ? (
                                <img
                                    src={profilePreview}
                                    alt="Profile"
                                    className="w-full h-full rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-xl border-4 border-white dark:border-slate-800 transition-transform duration-500 group-hover:scale-105">
                                    {formData.name?.charAt(0)?.toUpperCase() || 'I'}
                                </div>
                            )}

                            {isEditing && (
                                <>
                                    <label
                                        htmlFor="profile-upload"
                                        className="absolute bottom-0 right-0 bg-white dark:bg-slate-850 p-2.5 rounded-full shadow-lg border border-slate-200/50 dark:border-slate-700/60 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <FiCamera className="text-slate-600 dark:text-slate-300" size={14} />
                                    </label>

                                    <input
                                        id="profile-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleProfileChange}
                                        accept="image/*"
                                    />
                                </>
                            )}
                        </div>

                        {/* NAME / EMAIL / MOBILE / ID */}
                        <div className="space-y-2.5 w-full text-center sm:text-left">
                            {['name', '_id', 'email', 'password', 'mobile'].map((field) => (
                                <div key={field}>
                                    {isEditing ? (
                                        <div className="relative w-full sm:w-80">
                                            {field === 'name' && <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />}
                                            {field === '_id' && <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />}
                                            {field === 'email' && <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />}
                                            {field === 'password' && <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />}
                                            {field === 'mobile' && <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />}
                                            <input
                                                name={field}
                                                type={field === 'password' && !showPasswordHeader ? 'password' : 'text'}
                                                value={formData[field] || ''}
                                                onChange={handleChange}
                                                disabled={field === '_id'} // Disable ID editing
                                                placeholder={`Enter ${field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
                                                className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white ${field === '_id' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            />
                                            {field === 'password' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordHeader(!showPasswordHeader)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                                >
                                                    {showPasswordHeader ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p
                                            className={`${field === 'name'
                                                ? 'text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3 drop-shadow-sm'
                                                : 'text-sm md:text-base text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center sm:justify-start gap-2.5'
                                                } break-words`}
                                        >
                                            {field === '_id' && <FiHash className="text-slate-400" />}
                                            {field === 'email' && <FiMail className="text-slate-400" />}
                                            {field === 'password' && <FiLock className="text-slate-400 mt-0.5" />}
                                            {field === 'mobile' && <FiPhone className="text-slate-400" />}
                                            {field === 'password' ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{showPasswordHeader ? formData[field] : '•'.repeat(Math.min(formData[field]?.length || 8, 12))}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswordHeader(!showPasswordHeader)}
                                                        className="text-slate-400 hover:text-indigo-500 transition-colors ml-1"
                                                    >
                                                        {showPasswordHeader ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                                    </button>
                                                </div>
                                            ) : (
                                                formData[field]
                                            )}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 w-full lg:w-auto justify-center lg:justify-end border-t border-slate-100 dark:border-slate-800/40 md:border-t-0 pt-4 md:pt-0 flex-wrap">
                        {!isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate('/pupil', { state: { selectedInstructorId: id } })}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 border-2 border-indigo-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-indigo-700 hover:border-indigo-700 active:scale-95 transition-all w-full sm:w-auto"
                                >
                                    <FiUsers size={16} /> View your pupils
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm uppercase tracking-wider hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition-all w-full sm:w-auto"
                                >
                                    <FiEdit2 size={16} /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 flex-1 sm:flex-initial"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave /> Save
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-95 transition-all flex-1 sm:flex-initial"
                                >
                                    <FiX /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= DETAILS ================= */}
                <div className="mt-16">
                    <div 
                        className="flex items-center justify-between mb-8 cursor-pointer select-none group"
                        onClick={() => setIsInstructorDetailsOpen(!isInstructorDetailsOpen)}
                    >
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                <FiBriefcase className="text-indigo-600 dark:text-indigo-400 text-xl" />
                            </div>
                            Instructor Details
                        </h3>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {isInstructorDetailsOpen ? 'Hide Details' : 'View Details'}
                            </span>
                            {isInstructorDetailsOpen ? (
                                <FiChevronUp className="text-lg" />
                            ) : (
                                <FiChevronDown className="text-lg" />
                            )}
                        </div>
                    </div>

                    {isInstructorDetailsOpen && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
                        {Object.entries(formData).map(([key, value]) => {
                            if (EXCLUDED_FIELDS.includes(key)) return null;

                            if (
                                [
                                    'name',
                                    'email',
                                    'mobile',
                                    'profile',
                                    'deleted_at',
                                    'deleted_by',
                                    'updatedAt',
                                    'updated_by',
                                ].includes(key)
                            ) {
                                return null;
                            }

                            /* ==== LICENCE IMAGE ==== */
                            if (key === 'upload_licence_copy') {
                                return (
                                    <div
                                        key={key}
                                        className="sm:col-span-2 lg:col-span-3 border border-slate-150/40 dark:border-slate-800/40 rounded-3xl p-6 bg-slate-50/20 dark:bg-[#1a202c]/20 shadow-xs"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                                            <FiPaperclip className="text-slate-400 text-xs" />
                                            Upload Licence Copy
                                        </p>

                                        <div className="flex flex-col sm:flex-row items-start gap-6">
                                            {value ? (
                                                <div className="relative group rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
                                                    <img
                                                        src={
                                                            typeof value === 'string'
                                                                ? value
                                                                : URL.createObjectURL(value)
                                                        }
                                                        alt="Licence"
                                                        className="w-64 max-w-full rounded-xl object-contain transition-transform group-hover:scale-[1.02] duration-300"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-64 h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-2 items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                                    <FiUploadCloud size={24} className="text-slate-300" />
                                                    No licence copy uploaded
                                                </div>
                                            )}

                                            {isEditing && (
                                                <div className="mt-2 sm:mt-0 flex flex-col gap-2">
                                                    <label className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-[1.02] cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-500/10 text-center">
                                                        Select File
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    upload_licence_copy:
                                                                        e.target.files[0],
                                                                }))
                                                            }
                                                        />
                                                    </label>
                                                    <span className="text-[10px] font-bold text-slate-400">Supported formats: JPG, PNG</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            const isDate = key.includes('date');

                            let labelText = key.replace(/_/g, ' ');
                            if (key === 'badge_number') labelText = 'ADI / PDI number (6 digits)';
                            else if (key === 'driving_experience') labelText = 'Teaching Experience';

                            return (
                                <div
                                    key={key}
                                    className="group relative overflow-hidden premium-card border border-slate-100 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-[#1e293b] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                        {labelText}
                                    </p>

                                    {(() => {
                                        if (isEditing) {
                                            if (key === 'transmission_type') {
                                                return (
                                                    <select
                                                        name={key}
                                                        value={value || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Manual">Manual</option>
                                                        <option value="Automatic">Automatic</option>
                                                        <option value="Both">Both</option>
                                                    </select>
                                                );
                                            }
                                            if (key === 'entry_type') {
                                                return (
                                                    <select
                                                        name={key}
                                                        value={value || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Manual">Manual</option>
                                                        <option value="Automatic">Automatic</option>
                                                    </select>
                                                );
                                            }
                                            if (key === 'work_type') {
                                                return (
                                                    <select
                                                        name={key}
                                                        value={value || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Full-time">Full-time</option>
                                                        <option value="Part-time">Part-time</option>
                                                    </select>
                                                );
                                            }
                                            if (key === 'type') {
                                                return (
                                                    <select
                                                        name={key}
                                                        value={value || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="ADI">ADI</option>
                                                        <option value="PDI">PDI</option>
                                                    </select>
                                                );
                                            }
                                            if (key === 'status') {
                                                return (
                                                    <select
                                                        name={key}
                                                        value={value || '1'}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                    >
                                                        <option value="1">Active</option>
                                                        <option value="0">Inactive</option>
                                                    </select>
                                                );
                                            }
                                            if (key === 'contract_signed') {
                                                return (
                                                    <select
                                                        name={key}
                                                        value={value || 'No'}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                    >
                                                        <option value="No">No</option>
                                                        <option value="Yes">Yes</option>
                                                    </select>
                                                );
                                            }
                                            let parsedValue = value;
                                            if (typeof parsedValue === 'string') {
                                                try {
                                                    // Handle potentially double-stringified JSON
                                                    let temp = JSON.parse(parsedValue);
                                                    if (typeof temp === 'string') temp = JSON.parse(temp);
                                                    parsedValue = temp;
                                                } catch (e) {
                                                    /* ignore parsing error */
                                                }
                                            }

                                            let inputValue = parsedValue || '';
                                            if (isDate && parsedValue) {
                                                inputValue = String(parsedValue).slice(0, 10);
                                            } else if (Array.isArray(parsedValue)) {
                                                inputValue = parsedValue.map(v => typeof v === 'object' && v !== null ? v.name || v.area_name || JSON.stringify(v) : v).join(', ');
                                            } else if (typeof parsedValue === 'object' && parsedValue !== null) {
                                                inputValue = parsedValue.name || parsedValue.area_name || JSON.stringify(parsedValue);
                                            } else {
                                                inputValue = parsedValue || '';
                                            }

                                            let inputType = 'text';
                                            if (isDate) inputType = 'date';
                                            else if (key === 'driving_experience') inputType = 'number';

                                            return (
                                                <input
                                                    name={key}
                                                    type={inputType}
                                                    value={inputValue}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                                                />
                                            );
                                        }
                                        let parsedValue = value;
                                        if (typeof parsedValue === 'string') {
                                            try {
                                                // Handle potentially double-stringified JSON
                                                let temp = JSON.parse(parsedValue);
                                                if (typeof temp === 'string') temp = JSON.parse(temp);
                                                parsedValue = temp;
                                            } catch (e) {
                                                /* ignore parsing error */
                                            }
                                        }

                                        let displayValue = parsedValue || '—';
                                        if (isDate && parsedValue) {
                                            displayValue = new Date(parsedValue).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
                                        } else if (key === 'status') {
                                            displayValue = (parsedValue === '1' || parsedValue === 1) ? 'Active' : 'Inactive';
                                        } else if (Array.isArray(parsedValue)) {
                                            displayValue = parsedValue.map(v => typeof v === 'object' && v !== null ? v.name || v.area_name || JSON.stringify(v) : v).join(', ') || '—';
                                        } else if (typeof parsedValue === 'object' && parsedValue !== null) {
                                            displayValue = parsedValue.name || parsedValue.area_name || JSON.stringify(parsedValue);
                                        }

                                        return (
                                            <p className="text-base font-extrabold text-slate-700 dark:text-slate-200 break-all leading-relaxed">
                                                {displayValue}
                                            </p>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                    )}
                </div>


                {/* APPROVE BUTTON */}
                {instructor.status !== 1 && (
                    <div className="mt-12 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all select-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10 flex items-center gap-3">
                                <FiCheckCircle size={20} />
                                Approve Instructor Account
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* ================= APPROVE MODAL ================= */}
            {open && !isApproved && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl max-w-md w-full border border-slate-100 dark:border-slate-850 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <FiCheckCircle className="text-teal-500" />
                            Confirm Approval
                        </h2>

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                            Are you sure you want to approve this instructor? This will authorize their access and enable their public calendar scheduler.
                        </p>

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmApprove}
                                disabled={loading}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading
                                    ? 'Approving...'
                                    : 'Yes, Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= APPROVED VIEW (SCHEDULER & AVAILABILITY) ================= */}
            {instructor.status === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                            <Scheduler instructorId={id} />
                        </div>

                        {/* ================= WEEKLY AVAILABILITY SETUP ================= */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-6">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    Weekly Availability
                                </h3>
                                <WeeklyAvailability
                                    instructor={id}
                                    workingDays={workingDays}
                                />
                            </div>

                            <WeeklyAvailabilityList
                                workingDays={workingDays}
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <FranchiseFeesSection instructorId={id} instructorData={instructor} />

                        {/* INTERNAL NOTES */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Internal notes</h3>
                            <div className="space-y-3">
                                <textarea
                                    rows="4"
                                    value={internalNote}
                                    onChange={(e) => setInternalNote(e.target.value)}
                                    placeholder="Add private notes visible only to admins..."
                                    className="w-full bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                                ></textarea>
                                <button
                                    type="button"
                                    onClick={handleSaveInternalNote}
                                    disabled={savingInternalNote}
                                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 dark:bg-[#151a23] dark:hover:bg-[#0f1319] border border-transparent dark:border-white/5 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {savingInternalNote ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="text-lg" /> Save notes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {(instructor.type?.toUpperCase() === 'PDI' || formData.type?.toUpperCase() === 'PDI') && (
                            <PDITrainingSection instructorId={id} instructorData={instructor} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorProfilePage;
