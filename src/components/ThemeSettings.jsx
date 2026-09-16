import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { themeColors } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';

const ThemeSettings = () => {
  const { setColor, setMode, currentMode, currentColor, setThemeSettings } = useStateContext();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 flex justify-end">
      <div className="h-screen w-[360px] md:w-[400px] bg-white dark:bg-[#121620] border-l border-slate-200/40 dark:border-slate-800/40 shadow-2xl p-6 flex flex-col justify-start z-50 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <div>
            <p className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Settings</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Customize your workspace</p>
          </div>
          <button
            type="button"
            onClick={() => setThemeSettings(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl p-1.5 rounded-xl hover:bg-slate-200/40 dark:hover:bg-slate-800/60 transition-all"
          >
            <MdOutlineCancel />
          </button>
        </div>

        {/* Theme Options */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800/50">
          <p className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4">Theme Option</p>

          <div className="flex gap-4">
            {/* Light Option */}
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer select-none transition-all ${
              currentMode === 'Light'
                ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 font-bold dark:bg-indigo-500/20 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}>
              <input
                type="radio"
                id="light"
                name="theme"
                value="Light"
                className="hidden"
                onChange={setMode}
                checked={currentMode === 'Light'}
              />
              <span className="text-xs tracking-wide">Light Mode</span>
            </label>

            {/* Dark Option */}
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer select-none transition-all ${
              currentMode === 'Dark'
                ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 font-bold dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}>
              <input
                type="radio"
                id="dark"
                name="theme"
                value="Dark"
                className="hidden"
                onChange={setMode}
                checked={currentMode === 'Dark'}
              />
              <span className="text-xs tracking-wide">Dark Mode</span>
            </label>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="py-6">
          <p className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4">Theme Colors</p>
          <div className="grid grid-cols-5 gap-3">
            {themeColors.map((item, index) => (
              <TooltipComponent key={index} content={item.name} position="TopCenter">
                <div className="relative flex items-center justify-center py-1">
                  <button
                    type="button"
                    className="h-10 w-10 rounded-xl cursor-pointer flex items-center justify-center shadow-md active:scale-95 transition-transform duration-200 relative"
                    style={{ backgroundColor: item.color }}
                    onClick={() => setColor(item.color)}
                  >
                    <BsCheck className={`text-2xl text-white ${item.color === currentColor ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} transition-all duration-200`} />
                    {item.color === currentColor && (
                      <span className="absolute -inset-1 rounded-2xl border-2 border-indigo-500 pointer-events-none opacity-40 animate-pulse" />
                    )}
                  </button>
                </div>
              </TooltipComponent>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
