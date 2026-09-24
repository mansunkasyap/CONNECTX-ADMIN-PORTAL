/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import { Col, Form, Row, Button, Badge, Spinner } from "react-bootstrap";
import ModalComponent from "../../components/ModalComponent";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Datetime from "react-datetime";
import "react-datepicker/dist/react-datepicker.css";
import { ConnectXDateRange } from "../../components/DateRange";
import {
	Autocomplete,
	FormControl,
	IconButton,
	Input,
	InputLabel,
	Menu,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import {
	hideModal,
	showModal,
	toggleForm,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { userService } from "../../../service/service";
import TimeRange from "react-time-range";
import DatePicker from "react-datepicker";
import Datepicker from "react-datepicker";
import { MdCheck, MdOutlineEdit, MdMoreVert } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { BsTrash3Fill } from "react-icons/bs";
import { CommonController } from "../../components/CommonController";
import DeleteModal from "../../components/DeleteModal";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";

function RowActionMenu({
	row,
	onEdit,
	onPreview,
	onDelete,
	onRemarks,
	canEdit,
	canView,
	canDelete,
}) {
	const [anchorEl, setAnchorEl] = useState(null);
	const [openUpward, setOpenUpward] = useState(false);
	const open = Boolean(anchorEl);
	const handleClose = () => setAnchorEl(null);
	const handleOpen = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setOpenUpward(window.innerHeight - rect.bottom < 160);
		setAnchorEl(e.currentTarget);
	};
	return (
		<>
			<IconButton size="small" onClick={handleOpen}>
				<MdMoreVert />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				anchorOrigin={{
					vertical: openUpward ? "top" : "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: openUpward ? "bottom" : "top",
					horizontal: "right",
				}}
				slotProps={{
					paper: { elevation: 3, sx: { minWidth: 120, borderRadius: 2 } },
				}}
			>
				{canEdit && (
					<MenuItem
						onClick={() => {
							onEdit(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14 }}
					>
						<MdOutlineEdit size={16} /> Edit
					</MenuItem>
				)}
				{canView && (
					<MenuItem
						onClick={() => {
							onPreview(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14 }}
					>
						<FaEye size={14} /> View
					</MenuItem>
				)}
				{onRemarks && (
					<MenuItem
						onClick={() => {
							onRemarks(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14 }}
					>
						<BsChatLeftDotsFill size={14} /> Remarks
					</MenuItem>
				)}
				{canDelete && (
					<MenuItem
						onClick={() => {
							onDelete(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14, color: "error.main" }}
					>
						<BsTrash3Fill size={13} /> Delete
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

export default function Schedule() {
	const addButton = useSelector((state) => state.addFormButton.show);
	const dispatch = useDispatch();
	const [formTitle, setFormTitle] = useState("Add Schedule Reason");
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const date = new Date();
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [updateGrid, setupdateGrid] = useState(0);
	const [start, startRef] = useState(null);
	const [end, endRef] = useState(null);
	const navigate = useNavigate();
	const [filters, setFilters] = useState({
		company: "",
		customer_id: null,
		area: "",
		from_time: moment().format("YYYY-MM-DD"),
		to_time: `${date.getFullYear()}-${date.getMonth() + 1}-${
			date.getDate() + 1
		}`,
		category_id: null,
	});
	const deleteMessage = useSelector((state) => state.removeModal.message);

	const deleteModalData = {
		id: deleteMessage?.schedule_id,
		name: deleteMessage?.training_type,
	};
	const [body, setbody] = useState({
		refresh: "",
	});
	const [trainerList, setTrainerList] = useState([]);
	const [trainerIDS, setTrainerIDS] = useState([]);

	// start userRights
	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (getUser) {
			const moduleRights = getUser.find(
				(val) => val.module_name.toLowerCase() === url[1],
			);
			const finalModule = moduleRights?.rights.filter(
				(val) =>
					val.transaction_code.replace(/ /g, "-").toLowerCase() === url[2],
			);
			return finalModule?.length > 0
				? finalModule[0]
				: {
						can_view: false,
						can_insert: false,
						can_edit: false,
						can_delete: false,
						can_print: false,
					};
		}
	}, [getUser, url]);
	//end UserRights
	async function handleDelete(id) {
		try {
			const response = await userService.post(
				`/api/v0/web/web_training_schedule_delete?schedule_id=${id}`,
			);
			if (response.data.valid) {
				showToast("success", "Schedule deleted successfully!");
				setbody({ ...body, refresh: Math.random() });
				setupdateGrid((prev) => prev + 1);
				dispatch(toggleSpinnerAndDisableButton(false));
			} else {
				showToast(
					"error",
					response.data.message || "Failed to delete schedule.",
				);
			}
		} catch (err) {
			console.error("Error occurred while deleting:", err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(hideModal());
		}
	}
	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilters((prevFilters) => ({
			...prevFilters,
			[filterKey]: value || "",
			[filterKeyId]: id,
		}));
		setupdateGrid((prev) => prev + 1);
	};
	const handleEndTimeChange = (newEndTime) => {
		if (moment(newEndTime).isAfter(startTime)) {
			setEndTime(moment(newEndTime));
		} else {
			showToast("error", "End time must be after start time.");
		}
	};

	const handleDateChange = (field, date) => {
		setinputValues({
			...inputValues,
			[field]: date,
		});
	};
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);

	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
				size: 90,
			},

			{
				accessorKey: "training_date",
				header: "Training Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => (
					<span>
						{moment(row.original.training_date).format("DD/MM/YYYY")}
						{/* ( */}
						{/* {moment(row.original.training_date).format("LT")}) */}
					</span>
				),
			},
			{
				header: "Trainers(Emp. Code)",
				enableColumnFilter: false,
				size: 200,
				accessorFn: (row) => {
					if (
						!row?.trainer_details ||
						!Array.isArray(row.trainer_details) ||
						row.trainer_details.length === 0
					) {
						return "--";
					}
					return row.trainer_details
						.map(
							(trainer) =>
								`${trainer?.name ?? "--"} (${trainer?.emp_code ?? "--"})`,
						)
						.join(", ");
				},
			},
			{
				accessorKey: "location",
				header: "Location",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "training_type",
				header: "Training Type",
				enableColumnFilter: false,
				size: 250,
			},
			{
				accessorKey: "from_time",
				header: "Start Time",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const rawTime = row.original.from_time;
					let mTime = moment(rawTime, ["HH:mm:ss", "HH:mm A"], true);
					if (!mTime.isValid()) {
						mTime = moment(rawTime);
					}

					return (
						<span>{mTime.isValid() ? mTime.format("HH:mm A") : "N/A"}</span>
					);
				},
			},
			{
				accessorKey: "to_time",
				header: "End Time",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const rawTime = row.original.to_time;
					let mTime = moment(rawTime, ["HH:mm:ss", "HH:mm A"], true);
					if (!mTime.isValid()) {
						mTime = moment(rawTime);
					}

					return (
						<span>{mTime.isValid() ? mTime.format("HH:mm A") : "N/A"}</span>
					);
				},
			},
			{
				accessorKey: "action",
				header: "Action",
				enableColumnFilter: false,
				size: 100,
				Cell: ({ row }) => (
					<RowActionMenu
						row={row.original}
						onEdit={handleEdit}
						onDelete={(data) => dispatch(showModal(data))}
						canEdit={isUserRight?.can_edit}
						canView={isUserRight?.can_view}
						canDelete={isUserRight?.can_delete}
					/>
				),
			},
		],
		[isUserRight],
	);

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "UPDATE";
		navigate("/training/schedule/add", {
			state: {
				id: obj.schedule_id,
				type: "edit",
			},
		});
	};
	const dateFilter = (date) => {
		setFilters((prevFilters) => ({
			...prevFilters,
			from_date: moment(date.startDate || new Date()).format("YYYY-MM-DD"),
			to_date: moment(date.endDate || new Date()).format("YYYY-MM-DD"),
		}));
		setupdateGrid((prev) => prev + 1);
	};
	return (
		<MainLayout
			pageName="Training Schedule"
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			linkto={"/training/schedule/add"}
		>
			{/* <Row className="mb-0">
				<Col md={11}>
					<div
						className="picker text-end d-flex"
						style={{ bottom: "-4px", right: 0 }}
					>
						<ConnectXDateRange
							onChange={dateFilter}
							dateLevel="Date Filter"
							getData={{
								startDate: filters.from_date
									? moment(filters.from_date).toDate()
									: moment().toDate(),
								endDate: filters.to_date
									? moment(filters.to_date).toDate()
									: moment().toDate(),
							}}
							position={"right"}
						/>
					</div>
				</Col>
			</Row> */}
			<CommonDataGrid
				url={"/api/v0/web/web_training_schedule_browse"}
				columns={gridColumns}
				body={filters}
				jsonUpd={updateGrid}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
			<ModalComponent
				// innerJsx={addFormJsx}
				modalTitle={formTitle}
				// hidden={addButton}
				hasAddButton={isUserRight?.can_insert}
			/>
		</MainLayout>
	);
}
