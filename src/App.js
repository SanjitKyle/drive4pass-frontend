import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { FiSettings, FiBell } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Toaster } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import { Orders, Calendar, Employees, Instructors, Stacked, Pyramid, Customers, Kanban, Line, Area, Bar, Pie, Financial, ColorPicker, ColorMapping, Editor, Diary, Transfers } from './pages';
import Login from './pages/Auth/Login';
import './App.css';

import { useStateContext } from './contexts/ContextProvider';
import Learners from './pages/Learners';
import UserProfilePage from './pages/UserProfilePage';
import InstructorProfilePage from './pages/InstructorProfilePage';
import LearnerProfilePage from './pages/LearnerProfilePage';
import LessonProfilePage from './pages/LessonProfilePage';
import Lessons from './pages/Lessons';
import Enquiries from './pages/Enquiries';
import PackageProfilePage from './pages/PackagePofilePage';
import Packages from './pages/Packages';
import EnquiryProfilePage from './pages/EnquiryProfilePage';
import FranchiseEnquiryProfilePage from './pages/FranchiseEnquiryProfilePage';
import Areas from './pages/Area';
import ProtectedRoute from './routes/ProtectedRoute';
import AreaView from './pages/AreaView';
import Pricing from './pages/Pricing';
import { getFCMToken } from './services/getfcmtoken';
import { StorePcm } from './services/storePcm';
import { onMessage } from "firebase/messaging";
import { messaging } from "./services/firebase";

const App = () => {
  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    fetchInstructors,
    fetchLearners,
    fetchBranches,
    fetchPackages,
    getAllEnquires,
    fetchNotifications
  } = useStateContext();
  const location = useLocation();
  const navigate = useNavigate();
  const tokenSentRef = useRef(undefined);

  const isAuthPage = location.pathname === '/login';

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor) {
      setCurrentColor(currentThemeColor);
    }
    if (currentThemeMode) {
      setCurrentMode(currentThemeMode);
    }
  }, [setCurrentColor, setCurrentMode]);

  useEffect(() => {
    let link = document.getElementById('syncfusion-theme');
    if (!link) {
      link = document.createElement('link');
      link.id = 'syncfusion-theme';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (currentMode === 'Dark') {
      link.href = 'https://cdn.syncfusion.com/ej2/19.4.48/material-dark.css';
      document.body.classList.add('dark');
    } else {
      link.href = 'https://cdn.syncfusion.com/ej2/19.4.48/material.css';
      document.body.classList.remove('dark');
    }
  }, [currentMode]);

  async function fetchFCMToken() {
    try {
      const token = await getFCMToken();
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('user id', user);

      console.log("FCM Token in App.js:", token);
      if (!user?._id) return;
      const data = {
        token,
        platform: "web",
        id: user._id
      }
      if (token) {
        const res = await StorePcm.storePcmData(data);
        console.log("Response from storing FCM token:", res);
      } else {
        console.warn("FCM token is empty; skipping storage registration.");
      }
    } catch (err) {
      console.error("Error in fetchFCMToken hook:", err);
    }
  }

  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    if (tokenSentRef.current !== currentToken) {
      if (currentToken) {
        fetchFCMToken();
        if (fetchInstructors) fetchInstructors();
        if (fetchLearners) fetchLearners();
        if (fetchBranches) fetchBranches();
        if (fetchPackages) fetchPackages();
        if (getAllEnquires) {
          const type = localStorage.getItem('enquiryFilterType') || 'lessons';
          getAllEnquires(type);
        }
      }
      tokenSentRef.current = currentToken;
    }
  }, [location.pathname, fetchInstructors, fetchLearners, fetchBranches, fetchPackages, getAllEnquires]);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received:", payload);

      // 1. Play "Tin" notification sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed (browser policy):', e));
      } catch (e) {
        console.log('Audio setup failed', e);
      }

      // Extract redirect URL from data or notification body
      const redirectUrl = payload.data?.redirect_url || payload.data?.url || payload.notification?.click_action;

      const handleNotificationClick = () => {
        if (redirectUrl) {
          if (redirectUrl.startsWith('http')) {
            window.location.href = redirectUrl;
          } else {
            // Ensure leading slash for react-router
            navigate(redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`);
          }
        }
      };

      // 2. Display a beautiful custom popup notification
      toast(
        <div className="flex items-start gap-4 cursor-pointer" onClick={handleNotificationClick}>
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <FiBell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <p className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100">
              {payload.notification?.title || "New Notification"}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {payload.notification?.body || "You have a new message!"}
            </p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: handleNotificationClick,
          theme: currentMode === 'Dark' ? "dark" : "light",
          style: {
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: currentMode === 'Dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            background: currentMode === 'Dark' ? '#1e293b' : '#ffffff'
          }
        }
      );

      const notification = new Notification(
        payload.notification?.title || "Notification",
        {
          body: payload.notification?.body || "",
        }
      );
      notification.onclick = () => {
        window.focus();
        handleNotificationClick();
      };
    });

    fetchNotifications()

    return () => unsubscribe();
  }, [currentMode, navigate]);

  let className = '';

  switch (true) {
    case isAuthPage:
      className = 'w-full min-h-screen bg-gray-100';
      break;
    case activeMenu:
      className = 'dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full';
      break;
    default:
      className = 'bg-main-bg dark:bg-main-dark-bg w-full min-h-screen flex-2';
  }

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <ToastContainer />

      <Toaster position="top-right" />

      <div className="flex relative dark:bg-main-dark-bg">
        {!isAuthPage && (
          <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
            <TooltipComponent
              content="Settings"
              position="Top"
            >
              <button
                type="button"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: '50%' }}
                className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
              >
                <FiSettings />
              </button>
            </TooltipComponent>
          </div>
        )}
        {!isAuthPage && activeMenu && (
          <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
            <Sidebar />
          </div>
        )}
        <div className={className}>
          {!isAuthPage && (
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
              <Navbar />
            </div>
          )}
          <div>
            {!isAuthPage && themeSettings && <ThemeSettings />}
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* Protected Routes */}
              <Route
                path="/*"
                element={(
                  <ProtectedRoute>
                    <Routes>
                      {/* dashboard  */}
                      <Route path="/" element={<Diary />} />
                      <Route path="/diary" element={<Diary />} />
                      {/* Profile */}
                      <Route path="/profile" element={<UserProfilePage />} />
                      <Route path="/instructors/:id" element={<InstructorProfilePage />} />
                      <Route path="/pupil/:id" element={<LearnerProfilePage />} />
                      <Route path="/lessons/:id" element={<LessonProfilePage />} roles={['admin', 'instructor']} />
                      <Route path="/packages/:id" element={<PackageProfilePage />} />
                      <Route path="/enquiries/:id" element={<EnquiryProfilePage />} />
                      <Route path="/franchise-enquiries/:id" element={<FranchiseEnquiryProfilePage />} />
                      <Route path="/areas/:id" element={<AreaView />} />
                      {/* pages  */}
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/lessons" element={<Lessons />} />
                      <Route path="/instructors" element={<Instructors />} />
                      <Route path="/pupil" element={<Learners />} />
                      <Route path="/transfers" element={<Transfers />} />
                      <Route path="/enquiries" element={<Enquiries />} />
                      <Route path="/packages" element={<Packages />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/areas" element={<Areas />} />
                      <Route path="/pricing" element={<Pricing />} />
                      {/* apps  */}
                      <Route path="/kanban" element={<Kanban />} />
                      <Route path="/editor" element={<Editor />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/color-picker" element={<ColorPicker />} />
                      {/* charts  */}
                      <Route path="/line" element={<Line />} />
                      <Route path="/area" element={<Area />} />
                      <Route path="/bar" element={<Bar />} />
                      <Route path="/pie" element={<Pie />} />
                      <Route path="/financial" element={<Financial />} />
                      <Route path="/color-mapping" element={<ColorMapping />} />
                      <Route path="/pyramid" element={<Pyramid />} />
                      <Route path="/stacked" element={<Stacked />} />
                    </Routes>
                  </ProtectedRoute>
                )}
              />
            </Routes>
          </div>
          {!isAuthPage && <Footer />}

        </div>
      </div>

    </div>
  );
};

export default App;
