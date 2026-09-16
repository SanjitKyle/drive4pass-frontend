import React from 'react';
import avatar from '../data/avatar.jpg';
import { getUser } from '../utils/auth';

const UserProfilePage = () => {
  const user = getUser();
  const name = user?.name || 'User';
  const email = user?.email || '—';
  const role = user?.role || 'Guest';
  const avatarUrl = user?.avatar || avatar;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen transition-colors duration-300">
      {/* Back */}
      <div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-[#1e293b] px-4 py-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/40 shadow-xs active:scale-95 transition-all select-none"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PROFILE */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/40 shadow-sm transition-all duration-300 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-slate-100 dark:border-slate-800/40 pb-6">
            <img
              src={avatarUrl}
              alt="profile"
              className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500/20 dark:border-indigo-500/30 ring-4 ring-indigo-500/5 shadow-md"
            />
            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{name}</h1>
              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">{role}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{email}</p>
            </div>
          </div>

          {/* BIO */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
              <span className="w-1 h-4 bg-indigo-500 rounded-full" />
              Instructor Bio
            </h3>
            <p className="text-slate-650 dark:text-slate-350 text-sm leading-relaxed bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl">
              Hi, I’m {name}! I help learners gain confidence and independence
              on the road. My teaching style is calm, supportive, and
              safety-focused. Whether you’re a beginner or preparing for your
              test, I’m here to help.
            </p>
          </div>

          {/* DETAILS */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              Certifications & Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✔</span> Auto lessons & test packages
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✔</span> Verified working with children
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✔</span> Driving instructor licence
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✔</span> Instructing for 4+ months
              </div>
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
              <span className="w-1 h-4 bg-purple-500 rounded-full" />
              Spoken Languages
            </h3>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-950/50 text-xs font-bold uppercase tracking-wider">
                English
              </span>
              <span className="px-4 py-1.5 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-950/50 text-xs font-bold uppercase tracking-wider">
                Arabic
              </span>
            </div>
          </div>

          {/* REVIEWS */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800/45 pt-6 text-xs font-semibold text-slate-400 dark:text-slate-500 text-center sm:text-left">
            ℹ️ No reviews yet. This instructor is new to the platform.
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-8">

          {/* PRICE CARD */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm">
            <button 
              type="button" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              Edit Profile settings
            </button>
          </div>

          {/* INFO */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm text-xs font-bold text-slate-650 dark:text-slate-350 space-y-3">
            <p className="flex items-center gap-2">
              <span className="text-indigo-500">✔</span> Reschedule online
            </p>
            <p className="flex items-center gap-2">
              <span className="text-indigo-500">✔</span> Instructor choice
            </p>
            <p className="flex items-center gap-2">
              <span className="text-indigo-500">✔</span> Book now or later
            </p>
            <p className="flex items-center gap-2">
              <span className="text-indigo-500">✔</span> Real-time availability
            </p>
          </div>

          {/* VEHICLE */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/40 w-full">
              <span className="w-1 h-4 bg-teal-500 rounded-full" />
              Assigned Vehicle
            </h3>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Toyota Corolla Hatchback (2022 – Auto)
            </p>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
              ⭐ 5-star ANCAP · Dual controls
            </p>
          </div>

          {/* MAP PLACEHOLDER */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-3 border border-slate-100 dark:border-slate-800/40 shadow-sm">
            <div className="h-44 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              📍 Google Map Area Coverage
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
