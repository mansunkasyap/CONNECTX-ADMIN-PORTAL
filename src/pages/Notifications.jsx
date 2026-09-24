import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import {
	Button,
	Col,
	Container,
	Row,
	Spinner,
} from "react-bootstrap";
import { userService } from "../../service/service";
import moment from "moment";
import { useNotifications } from "../context/NotifcationContext";

function Notifications() {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [markingId, setMarkingId] = useState(null);
  const { decrementNotificationCount } = useNotifications();

	const fetchSosData = async () => {
		try {
			const response = await userService.get(
				"/api/v0/web/web_notifications_browse"
			);
			if (response.data.valid) {
				setNotifications(response.data.data);
				setLoading(false);
			}
		} catch (err) {
			console.error("Error fetching SOS data:", err);
		}
	};

	const handleMarkAsRead = useCallback(async (id) => {
		setMarkingId(id);
		try {
			const response = await userService.post(
				"/api/v0/web/update_notification_status",
				{ notification_id: id, mark: true }
			);

			if (response.status === 200) {
				setNotifications((prev) =>
					prev.map((notification) =>
						notification.notification_id === id
							? { ...notification, is_read: true }
							: notification
					)
				);

        decrementNotificationCount();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setMarkingId(null);
		}
	}, [decrementNotificationCount]);

	useEffect(() => {
		fetchSosData();
	}, []);

	return (
		<MainLayout isShowing={false} pageName="Notifications" hasAddButton={false}>
			<Container className="bg-white p-4 pt-3 pb-3 rounded-3 mb-4" fluid>
				<Row>
					{loading ? (
						<p>Loading...</p>
					) : (
						notifications.map((item, index) => {
							const isMarking = markingId === item.notification_id;
							return (
								<Col
									md={9}
									key={index}
									className={`rounded-3 border p-3 notificationbox mb-1 m-2 ${
										item.is_read ? "" : "notred"
									}`}
								>
									<div className="d-flex justify-content-between">
										<p className="mb-1">
											<strong>{item.guard_name}:</strong>{" "}
											{item.notification_type} request-
										</p>
										<span>
											{moment(item.created_at).format("DD-MM-YYYY - (HH:mm A)")}
										</span>
									</div>
									<Row>
										<Col>
											<p className="m-0">{item.message}</p>
										</Col>
										<Col xs={2} className="text-end">
											{!item.is_read && (
												<Button
													size="sm"
													variant="none"
													className="bg-white border"
													onClick={() => handleMarkAsRead(item.notification_id)}
													disabled={isMarking}
													style={{ minWidth: "80px" }}
												>
													{isMarking ? (
														<Spinner
															as="span"
															animation="border"
															size="sm"
															role="status"
															aria-hidden="true"
														/>
													) : (
														"Mark read"
													)}
												</Button>
											)}
										</Col>
									</Row>
								</Col>
							);
						})
					)}
				</Row>
			</Container>
		</MainLayout>
	);
}

export default Notifications;
