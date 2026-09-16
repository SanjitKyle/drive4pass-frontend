import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineCancel } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';

import Button from './Button';
import { useStateContext } from '../contexts/ContextProvider';
import axiosInstance from '../services/axios';
import avatar from '../data/avatar.jpg';

const currentToken = localStorage.getItem('authToken');

const Notification = () => {
  const { currentColor, setUnRead, UnRead, notifications, setNotifications, fetchNotifications } =
    useStateContext();
  useEffect(() => {
    const UpdateIsRead = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?._id) return;
        
        const response = await axiosInstance.post(
          `/ds/notification/mark-as-read/${user._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );
        console.log('response to mark as read', response);
        fetchNotifications();
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    UpdateIsRead();
  }, []);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const confirmDelete = async (id) => {
    setDeleteConfirmId(null);
    if (setNotifications) {
      setNotifications(prev => prev.filter(n => n._id !== id));
    }
    try {
      await axiosInstance.post(`/ds/notification/delete/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      fetchNotifications(); // Restore the item if deletion failed
    }
  };

  return (
    <div className="nav-item absolute right-5 md:right-40 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 z-50 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <p className="font-semibold text-lg dark:text-gray-200">
            Notifications
          </p>
          <button
            type="button"
            className="text-white text-xs rounded p-1 px-2 bg-orange-theme "
          >
            {' '}
            {notifications.length} New
          </button>
        </div>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="mt-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        {notifications?.map((item, index) => {
          const isUnread = item.is_read === false || item.isRead === false || item.status === 'unread';
          
          const handleDelete = (e, id) => {
            e.stopPropagation();
            setDeleteConfirmId(id);
          };

          return (
          <div
            key={item._id || index}
            className={`flex items-center leading-8 gap-5 border-b-1 border-color p-3 cursor-pointer transition-colors ${
              isUnread 
                ? 'bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/40' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() =>
              item.redirect_url && window.open(item.redirect_url, '_blank')
            }
          >
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${isUnread ? 'bg-blue-100 dark:bg-blue-800 text-blue-500 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
              <FaUser className="text-xl" />
            </div>
            <div className="flex-1">
              <p className="font-semibold dark:text-gray-200 text-sm">
                {item.message}
              </p>
            </div>
            <button 
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => handleDelete(e, item._id)}
              title="Delete Notification"
            >
              <MdOutlineCancel className="text-xl" />
            </button>
          </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-center text-gray-500 py-4">No new notifications</p>
        )}
      </div>

      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#42464D] p-6 rounded-xl shadow-2xl w-[90%] max-w-sm transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Notification</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
                onClick={() => confirmDelete(deleteConfirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Notification;
