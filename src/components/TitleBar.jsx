import React from 'react';

export default function TitleBar() {
  const handleMinimize = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('window-min');
  };

  const handleMaximize = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('window-max');
  };

  const handleClose = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('window-close');
  };

  return (
    <div className="window-drag-bar h-9 bg-[#f6f2ea] dark:bg-[#1f1b17] border-b border-[#e8dfd1] dark:border-[#2d2720] flex items-center justify-between px-4 select-none shrink-0 z-50">
      <span className="text-xs font-serif tracking-widest text-[#8c7e6b] font-medium uppercase">
        Natasha's Poetry Sanctuary
      </span>

      {/* Window Controls (window-no-drag ensures buttons remain clickable) */}
      <div className="window-no-drag flex items-center space-x-2">
        <button 
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-amber-600/70 hover:bg-amber-600 transition-colors"
          title="Minimize"
        />
        <button 
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-emerald-600/70 hover:bg-emerald-600 transition-colors"
          title="Maximize"
        />
        <button 
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-rose-600/70 hover:bg-rose-600 transition-colors"
          title="Close"
        />
      </div>
    </div>
  );
}