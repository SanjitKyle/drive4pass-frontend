import React from 'react';

const Header = ({ category, title }) => (
  <div className="mb-8 flex flex-col gap-1.5 relative pb-3 border-b border-slate-100 dark:border-slate-800/40">
    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
      {title}
    </h1>
    <div className="absolute bottom-[-1px] left-0 w-16 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
  </div>
);

export default Header;
