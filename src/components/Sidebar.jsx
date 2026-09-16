import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MdOutlineCancel, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { links } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize, unreadEnquiriesCount, branches, fetchInstructors, fetchLearners, fetchBranches, fetchPackages, getAllEnquires, fetchPricing } = useStateContext();
  const [isAreasExpanded, setIsAreasExpanded] = useState(false);

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const handleTabClick = (name) => {
    switch (name) {
      case 'instructors':
        if (fetchInstructors) fetchInstructors();
        break;
      case 'pupil':
        if (fetchLearners) fetchLearners();
        break;
      case 'areas':
        if (fetchBranches) fetchBranches();
        break;
      case 'packages':
        if (fetchPackages) fetchPackages();
        break;
      case 'enquiries':
        if (getAllEnquires) {
          const type = localStorage.getItem('enquiryFilterType') || 'lessons';
          getAllEnquires(type);
        }
        break;
      case 'pricing':
        if (fetchPricing) fetchPricing();
        break;
      default:
        break;
    }
  };


  const activeLink = 'flex items-center justify-between gap-4 pl-4 pr-2 pt-3 pb-3 rounded-xl text-white text-sm font-semibold m-2 shadow-lg shadow-indigo-500/10 transition-all duration-300 ease-out transform scale-[1.02]';
  const normalLink = 'flex items-center justify-between gap-4 pl-4 pr-2 pt-3 pb-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 m-2 transition-all duration-200 ease-in-out';

  return (
    <div className="h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 border-r border-slate-150/40 dark:border-slate-800/40 dark:bg-[#121620] bg-white transition-colors duration-300">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center px-4 py-5">
            <Link 
              to="/" 
              onClick={handleCloseSideBar} 
              className="mt-1 flex group select-none"
            >
              <img 
                src="/drive4passlogo.webp" 
                alt="logo" 
                className="h-14 w-40 object-contain transition-transform group-hover:scale-[1.03] duration-200" 
              />
            </Link>
            <TooltipComponent content="Menu" position="BottomCenter">
              <button
                type="button"
                onClick={() => setActiveMenu(!activeMenu)}
                style={{ color: currentColor }}
                className="text-xl rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 mt-1 block md:hidden transition-colors"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>
          
          <div className="mt-6 px-2">
            {links.map((item) => (
              <div key={item.title} className="mb-4">
                <p className="text-slate-400 dark:text-slate-500 px-4 text-xs font-bold uppercase tracking-widest mb-2">
                  {item.title}
                </p>
                <div className="space-y-1">
                  {item.links.map((link) => (
                    <React.Fragment key={link.name}>
                      <NavLink
                        to={`/${link.name}`}
                        onClick={(e) => {
                          if (link.name === 'areas') {
                            setIsAreasExpanded(true);
                          }
                          handleCloseSideBar();
                          handleTabClick(link.name);
                        }}
                        style={({ isActive }) => ({
                          backgroundColor: isActive ? currentColor : '',
                        })}
                        className={({ isActive }) => (isActive ? activeLink : normalLink)}
                      >
                        <div className="relative flex items-center gap-3.5 w-full">
                          <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                            {link.icon}
                          </span>
                          <span className="capitalize tracking-wide">{link.name}</span>

                          {/* 🔔 Enquiry badge */}
                          {link.name === 'enquiries' && unreadEnquiriesCount > 0 && (
                            <span
                              className="absolute right-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-md shadow-rose-500/20 animate-pulse"
                            >
                              {unreadEnquiriesCount}
                            </span>
                          )}
                        </div>
                        {link.name === 'areas' && (
                          <div 
                            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsAreasExpanded(!isAreasExpanded);
                            }}
                          >
                            {isAreasExpanded ? <MdKeyboardArrowUp className="text-lg" /> : <MdKeyboardArrowDown className="text-lg" />}
                          </div>
                        )}
                      </NavLink>
                      
                      {/* Sub-areas dropdown */}
                      {link.name === 'areas' && isAreasExpanded && branches && branches.length > 0 && (
                        <div className="ml-8 mt-1 mb-2 space-y-1 border-l-2 border-slate-100 dark:border-slate-800">
                          {branches.map((branch) => (
                            <NavLink
                              key={branch._id}
                              to={`/areas/${branch._id}`}
                              onClick={handleCloseSideBar}
                              className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                                  isActive 
                                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-r-lg border-l-2 border-indigo-500 -ml-[2px]' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-r-lg'
                                }`
                              }
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm flex-shrink-0" style={{ backgroundColor: currentColor }}>
                                {branch.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="truncate">{branch.name}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
