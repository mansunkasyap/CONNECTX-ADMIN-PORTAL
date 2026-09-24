// NotificationContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { userService } from "../../service/service";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
	const [notificationCount, setNotificationCount] = useState(0);

	const fetchNotificationCount = useCallback(async () => {
		try {
			const response = await userService.get(
				"/api/v0/web/get_unread_notifications_count"
			);
			if (response.data.valid) {
				setNotificationCount(
					response.data.data[0].get_unread_notifications_count
				);
			}
		} catch (err) {
			console.error("Error fetching notifications:", err);
		}
	}, []);

	const decrementNotificationCount = useCallback(() => {
		setNotificationCount((prev) => Math.max(0, prev - 1));
	}, []);

	return (
		<NotificationContext.Provider
			value={{
				notificationCount,
				fetchNotificationCount,
				decrementNotificationCount,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within NotificationProvider"
		);
	}
	return context;
};
