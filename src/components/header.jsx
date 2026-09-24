import { useEffect, useState } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import { CgPushRight } from "react-icons/cg";
import { FaBarsStaggered, FaBell } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import HeaderDateTime from "./HeaderDateTime";
import { userService } from "../../service/service";
import HeaderProfleImage from "./HeaderProfleImage";
import { Link } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { CommonController } from "./CommonController";
import DutyTimeFilter from "./TimeRange";
import { useNotifications } from "../context/NotifcationContext";
export default function Header({
	hideSideBar,
	pageName,
	type,
	isShowing = true,
}) {
	const [toggleBarIcon, setToggleBarIcon] = useState(false);
	// const [notificationCount, setNotificationCount] = useState();
	const [branch, setBranch] = useState(() => {
		try {
			const cached = localStorage.getItem("_profile_cache");
			return cached ? JSON.parse(cached) : {};
		} catch {
			return {};
		}
	});
	const { notificationCount, fetchNotificationCount } = useNotifications();

	useEffect(() => {
		fetchNotificationCount();
	}, [fetchNotificationCount]);

	const [dateTimeFilter, setDateTimeFilter] = useState({
		startDate: "",
		endDate: "",
	});
	const [pendingFilter, setPendingFilter] = useState({
		startDate: "",
		endDate: "",
	});
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const handleToggle = () => {
		hideSideBar();
		setToggleBarIcon((prev) => !prev);
	};

	useEffect(() => {
		selectBranchList();
		handleProfile();
	}, []);

	const handleProfile = async () => {
		try {
			const response = await userService.get("/api/v0/web/web_login_profile", {
				login_id: branch,
			});
			if (response.data.valid) {
				const profileData = response.data.data[0];
				setBranch(profileData);
				localStorage.setItem("_profile_cache", JSON.stringify(profileData));
			}
		} catch (err) {
			console.error("Error fetching profile:", err);
		}
	};

	const selectBranchList = async () => {
		try {
			const result = await userService.get("/api/v0/web/web_get_filter_dates");
			if (result.data.valid) {
				const fetchedStartDate = result.data.data[0];
				// const fetchedEndDate = result.data.data[0];

				// setDateTimeFilter({
				//   startDate: fetchedStartDate.from_date.split('Z')[0],
				//   endDate: fetchedStartDate.to_date.split('Z')[0],
				// });
				setDateTimeFilter({
					startDate: fetchedStartDate.from_date,
					endDate: fetchedStartDate.to_date,
				});
				// setStartTime(fetchedStartDate ? parseISO(fetchedStartDate) : null);
				// setEndTime(fetchedEndDate ? parseISO(fetchedEndDate) : null);
			}
		} catch (err) {
			console.error(err);
		}
	};
	const UpdatedFilter = async (from_date, to_date) => {
		const startDate = new Date(from_date);
		const endDate = new Date(to_date);

		const fromDa =
			startDate.getFullYear() +
			"-" +
			String(startDate.getMonth() + 1).padStart(2, "0") +
			"-" +
			String(startDate.getDate()).padStart(2, "0") +
			"T" +
			String(startDate.getHours()).padStart(2, "0") +
			":" +
			String(startDate.getMinutes()).padStart(2, "0") +
			":" +
			String(startDate.getSeconds()).padStart(2, "0");

		const endDa =
			endDate.getFullYear() +
			"-" +
			String(endDate.getMonth() + 1).padStart(2, "0") +
			"-" +
			String(endDate.getDate()).padStart(2, "0") +
			"T" +
			String(endDate.getHours()).padStart(2, "0") +
			":" +
			String(endDate.getMinutes()).padStart(2, "0") +
			":" +
			String(endDate.getSeconds()).padStart(2, "0");
		try {
			const result = await CommonController.commonApiCallFilter(
				"/api/v0/web/web_login_update_date_filter",
				{
					from_date: fromDa,
					to_date: endDa,
					from_time: "00:00",
					to_time: "23:59",
					// to_time,
				},
			);

			if (result.valid) {
				window.location.reload();
			}
		} catch (err) {
			console.error("Error updating filter:", err);
		}
	};

	const dateFilter = (ranges) => {
		const sel = ranges?.selection;
		if (!sel) return;
		setPendingFilter((prev) => {
			const keepStartTime = prev.startDate
				? moment(prev.startDate)
				: moment(sel.startDate).startOf("day");
			const keepEndTime = prev.endDate
				? moment(prev.endDate)
				: moment(sel.endDate).endOf("day");
			const newStart = moment(sel.startDate)
				.hour(keepStartTime.hour())
				.minute(keepStartTime.minute())
				.second(keepStartTime.second())
				.toDate();
			const newEnd = moment(sel.endDate)
				.hour(keepEndTime.hour())
				.minute(keepEndTime.minute())
				.second(keepEndTime.second())
				.toDate();
			return { ...prev, startDate: newStart, endDate: newEnd };
		});
	};

	const pendingTimeChange = (time, type) => {
		if (!time || !(time instanceof Date) || isNaN(time.getTime())) return;
		setPendingFilter((prev) => {
			const base = new Date(
				type === "start" ? prev.startDate || new Date() : prev.endDate || new Date(),
			);
			base.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
			return {
				...prev,
				[type === "start" ? "startDate" : "endDate"]: base,
			};
		});
	};

	const openFilterMenu = (nextShow) => {
		if (nextShow) {
			setPendingFilter({
				startDate: dateTimeFilter.startDate,
				endDate: dateTimeFilter.endDate,
			});
		}
		setShowFilterMenu(nextShow);
	};

	const handleApplyFilter = () => {
		if (!pendingFilter.startDate || !pendingFilter.endDate) return;
		setShowFilterMenu(false);
		UpdatedFilter(pendingFilter.startDate, pendingFilter.endDate);
	};

	const handleCancelFilter = () => {
		setShowFilterMenu(false);
	};

	const presets = [
		{
			label: "Today",
			getRange: () => ({
				start: moment().startOf("day").toDate(),
				end: moment().endOf("day").toDate(),
			}),
		},
		{
			label: "Yesterday",
			getRange: () => ({
				start: moment().subtract(1, "day").startOf("day").toDate(),
				end: moment().subtract(1, "day").endOf("day").toDate(),
			}),
		},
		{
			label: "Last 7 Days",
			getRange: () => ({
				start: moment().subtract(6, "days").startOf("day").toDate(),
				end: moment().endOf("day").toDate(),
			}),
		},
		{
			label: "This Month",
			getRange: () => ({
				start: moment().startOf("month").toDate(),
				end: moment().endOf("day").toDate(),
			}),
		},
		{
			label: "Last Month",
			getRange: () => ({
				start: moment().subtract(1, "month").startOf("month").toDate(),
				end: moment().subtract(1, "month").endOf("month").toDate(),
			}),
		},
	];

	const applyPreset = (preset) => {
		const { start, end } = preset.getRange();
		setPendingFilter({ startDate: start, endDate: end });
	};

	const filterLabel = dateTimeFilter.startDate && dateTimeFilter.endDate
		? `${moment(dateTimeFilter.startDate).format("DD MMM YYYY")} - ${moment(
				dateTimeFilter.endDate
			).format("DD MMM YYYY")}`
		: "Date Filter";

	return (
		<header className={"topheader border-bottom"}>
			<style>{`
				.filterDropdownMenu { border: 1px solid #e4e7eb; border-radius: 12px; overflow: hidden; }
				.filterDropdownBody { min-width: 640px; }
				.filterDropdownBody .presetsPane { background: #f8f9fb; min-width: 160px; }
				.filterDropdownBody .presetsPane .btn { justify-content: flex-start; font-weight: 500; }
				.filterDropdownBody .calendarPane { flex: 1; }
				.filterDropdownBody .rdrDefinedRangesWrapper { display: none; }
				.filterDropdownBody .rdrDateDisplayWrapper { display: none; }
				.filterDropdownBody .rdrCalendarWrapper { font-size: 12px; }
				.filterDropdownBody .rdrMonth { width: 280px; padding: 0 6px; }
				.filterDropdownBody .filterSummary { border: 1px dashed #cfd8dc; }
				.filterToggleBtn { background: #fff; padding: 6px 12px; border-radius: 8px; }
				.filterToggleBtn:hover { background: #f1f3f5; }
			`}</style>
			<Container fluid>
				<Row className="align-items-center justify-content-between">
					<Col md={3}>
						<div className="d-flex gap-3 align-items-center fs-5">
							<div className={"bar"} onClick={handleToggle}>
								{!toggleBarIcon ? (
									<FaBarsStaggered size={25} />
								) : (
									<CgPushRight size={25} />
								)}
							</div>
							{pageName && (
								<div className="pagename">
									{pageName}
									<span>.</span>
								</div>
							)}
						</div>
					</Col>
					<Col
						md={9}
						className={
							isShowing && "d-flex justify-content-end gap-4 align-items-center"
						}
					>
						{isShowing && (
							<Dropdown
								align="end"
								autoClose="outside"
								show={showFilterMenu}
								onToggle={openFilterMenu}
							>
								<Dropdown.Toggle
									as={Button}
									variant="light"
									className="border d-flex align-items-center gap-2 filterToggleBtn"
								>
									<FaRegCalendarAlt />
									<span className="fw-semibold">{filterLabel}</span>
								</Dropdown.Toggle>
								<Dropdown.Menu className="shadow-sm filterDropdownMenu p-0">
									<div className="d-flex filterDropdownBody">
										<div className="presetsPane p-3 border-end">
											<div className="mb-2 fw-semibold text-uppercase text-muted small">
												Step 1 · Quick Ranges
											</div>
											<div className="d-flex flex-column gap-2">
												{presets.map((p) => (
													<Button
														key={p.label}
														size="sm"
														variant="outline-primary"
														className="text-start"
														onClick={() => applyPreset(p)}
													>
														{p.label}
													</Button>
												))}
											</div>
										</div>
										<div className="calendarPane p-3">
											<div className="mb-2 fw-semibold text-uppercase text-muted small">
												Or pick custom dates
											</div>
											<DateRangePicker
												ranges={[
													{
														startDate: pendingFilter.startDate || new Date(),
														endDate: pendingFilter.endDate || new Date(),
														key: "selection",
													},
												]}
												onChange={dateFilter}
												maxDate={new Date()}
												months={1}
												direction="horizontal"
												showMonthAndYearPickers
												showDateDisplay={false}
												rangeColors={["#4b6cb7"]}
											/>
											<div className="mb-2 mt-3 fw-semibold text-uppercase text-muted small">
												Step 2 · Time
											</div>
											<div className="d-flex gap-3 align-items-center">
												<DutyTimeFilter
													value={pendingFilter.startDate}
													onChange={(time) => pendingTimeChange(time, "start")}
													label="Start Time"
												/>
												<DutyTimeFilter
													value={pendingFilter.endDate}
													onChange={(time) => pendingTimeChange(time, "end")}
													label="End Time"
												/>
											</div>
											<div className="filterSummary mt-3 p-2 rounded bg-light small">
												<span className="text-muted">Selected: </span>
												<strong>
													{pendingFilter.startDate
														? moment(pendingFilter.startDate).format(
																"DD MMM YYYY HH:mm",
															)
														: "—"}
												</strong>
												<span className="mx-1">→</span>
												<strong>
													{pendingFilter.endDate
														? moment(pendingFilter.endDate).format(
																"DD MMM YYYY HH:mm",
															)
														: "—"}
												</strong>
											</div>
											<div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
												<Button
													size="sm"
													variant="light"
													className="border"
													onClick={handleCancelFilter}
												>
													Cancel
												</Button>
												<Button
													size="sm"
													variant="primary"
													onClick={handleApplyFilter}
													disabled={
														!pendingFilter.startDate || !pendingFilter.endDate
													}
												>
													OK
												</Button>
											</div>
										</div>
									</div>
								</Dropdown.Menu>
							</Dropdown>
						)}

						<div className="d-flex justify-content-end gap-3 align-items-center">
							<Link
								className="btn btn-light border btn-sm notifybox"
								to="/notifications"
							>
								{notificationCount > 0 && (
									<span className="w-auto">{notificationCount}</span>
								)}
								<FaBell />
							</Link>

							<HeaderDateTime />

							<HeaderProfleImage profileData={branch} />
						</div>
					</Col>
				</Row>
			</Container>
		</header>
	);
}
