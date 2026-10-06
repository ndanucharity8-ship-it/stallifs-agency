import { useCallback, useMemo, useState } from 'react';
import { NotificationContext } from './NotificationContext';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();

    setNotifications((current) => [
      ...current,
      {
        id,
        type: 'info',
        duration: 4000,
        ...notification,
      },
    ]);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => (
      current.filter((notification) => notification.id !== id)
    ));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
    }),
    [notifications, addNotification, removeNotification, clearNotifications],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;