import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { userProfileData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import avatarFallback from '../data/avatar.jpg';
import { getUser } from '../utils/auth';

const UserProfile = () => {
  const { currentColor, setIsClicked, initialState } = useStateContext();
  const navigate = useNavigate();

  const user = getUser();

  // console.log('User Profile:', user);

  const name = user?.name || 'Unknown User';
  const email = user?.email || '—';
  const role = user?.role || 'Guest';
  const avatar = user?.avatar || avatarFallback;

  const handleLogout = () => {
     localStorage.clear();

    // 🔄 Reset UI popups
    setIsClicked(initialState);

    // 🔀 Redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <div className="absolute right-4 top-16 p-6 rounded-2xl w-[360px] shadow-2xl border border-slate-200/50 dark:border-slate-800/60 z-50 animate-in fade-in slide-in-from-top-3 duration-200 bg-white dark:bg-[#1e293b]">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <p className="font-bold text-base text-slate-800 dark:text-slate-200">User Profile</p>
        <button
          type="button"
          onClick={() => setIsClicked(initialState)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl p-1 rounded-lg hover:bg-slate-150/40 dark:hover:bg-slate-800/60 transition-colors"
        >
          <MdOutlineCancel />
        </button>
      </div>

      {/* User Details */}
      <div className="flex gap-4 items-center mt-5 pb-5 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <p className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-tight"> {name} </p>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold capitalize mt-0.5"> {role} </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 truncate max-w-[200px]"> {email} </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleLogout}
          style={{ backgroundColor: currentColor }}
          className="w-full text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
        >
          Logout Account
        </button>
      </div>
    </div>

  );
};

export default UserProfile;
