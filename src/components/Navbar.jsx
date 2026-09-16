import React, { useEffect, useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
// import { FiShoppingCart } from 'react-icons/fi';
import { BsChatLeft } from 'react-icons/bs';
import { RiNotification3Line } from 'react-icons/ri';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import avatar from '../data/avatar.jpg';
// import { Cart, Chat, Notification, UserProfile } from '.';
import Cart from './Cart';
import Chat from './Chat';
import Notification from './Notification';
import UserProfile from './UserProfile';

import { useStateContext } from '../contexts/ContextProvider';
import { getUser } from '../utils/auth';
import axiosInstance from '../services/axios';

const NavButton = ({
  title,
  customFunc,
  icon,
  color,
  dotColor,
  badgeCount,
}) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 transition-all"
    >
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className="absolute flex items-center justify-center h-4 w-4 right-1 top-1 text-[9px] font-bold text-white rounded-full shadow-sm"
          style={{ backgroundColor: dotColor || '#facc15' }}
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      {dotColor && (badgeCount === undefined || badgeCount === 0) && (
        <span className="absolute flex h-2 w-2 right-2.5 top-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: dotColor }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: dotColor }}
          />
        </span>
      )}
      {icon}
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setScreenSize,
    screenSize,
    UnRead,
  } = useStateContext();
  const user = getUser();
  const name = user?.name || 'User';
  // const email = user?.email || '—';
  // const role = user?.role || 'Guest';
  const avatarUrl = user?.avatar || avatar;

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotificationsCount = async () => {
      try {
        const response = await axiosInstance.get(
          '/ds/notification/get-notification'
        );
        if (response && response.data && Array.isArray(response.data)) {
          setNotificationCount(response.data.length);
        } else if (Array.isArray(response)) {
          setNotificationCount(response.length);
        }
      } catch (error) {
        console.error('Error fetching notifications count:', error);
      }
    };
    fetchNotificationsCount();
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize, setActiveMenu]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  return (
    <div className="sticky top-0 z-40 w-full flex justify-between p-3 px-6 backdrop-blur-md bg-white/70 dark:bg-[#20232a]/70 border-b border-slate-100/50 dark:border-slate-800/40 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <NavButton
          title="Menu"
          customFunc={handleActiveMenu}
          color={currentColor}
          icon={<AiOutlineMenu />}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* <NavButton title="Cart" customFunc={() => handleClick('cart')} color={currentColor} icon={<FiShoppingCart />} /> */}
        {/* <NavButton title="Chat" dotColor="#03C9D7" customFunc={() => handleClick('chat')} color={currentColor} icon={<BsChatLeft />} /> */}
        <NavButton
          title="Notification"
          dotColor="#ef4444"
          badgeCount={UnRead}
          customFunc={() => handleClick('notification')}
          color={currentColor}
          icon={<RiNotification3Line />}
        />

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700/60 mx-1" />

        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all select-none border border-transparent hover:border-slate-200/40 dark:hover:border-slate-700/40"
            onClick={() => handleClick('userProfile')}
          >
            <p className="hidden md:block">
              <span className="text-slate-400 text-xs">Hi,</span>{' '}
              <span className="text-slate-700 dark:text-slate-200 font-bold ml-0.5 text-xs">
                {name}
              </span>
            </p>
            <MdKeyboardArrowDown className="text-slate-400 text-xs hidden md:block" />
          </div>
        </TooltipComponent>

        {isClicked.cart && <Cart />}
        {isClicked.chat && <Chat />}
        {isClicked.notification && <Notification />}
        {isClicked.userProfile && <UserProfile />}
      </div>
    </div>
  );
};

export default Navbar;
