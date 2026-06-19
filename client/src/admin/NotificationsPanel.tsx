import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the shape of a single notification object
interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Define the props that this component will accept
interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  isOpen: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onMarkAllAsRead, isOpen }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border dark:border-neutral-700 text-sm z-50"
        >
          <div className="flex justify-between items-center p-3 border-b dark:border-neutral-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={onMarkAllAsRead} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium">
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification._id} className={`p-3 border-b dark:border-neutral-700/50 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <p className="text-gray-700 dark:text-gray-300">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Bell className="mx-auto mb-2" />
                You're all caught up!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// This is the crucial line that fixes the error
export default NotificationsPanel;