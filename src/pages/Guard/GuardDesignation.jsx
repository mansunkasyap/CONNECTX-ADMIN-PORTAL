import { useMemo, useState } from "react";
import moment from "moment";
import { Badge, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { TextField, IconButton, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
	hideModal,
	showModal,
	toggleForm,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import { BsPenFill, BsTrash3Fill } from "react-icons/bs";
import DeleteModal from "../../components/DeleteModal";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { userService } from "../../../service/service";
import ModalComponent from "../../components/ModalComponent";
import Toast from "../../components/Toast";

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

export default function GuardDesignation() {
	const dispatch = useDispatch();
	const addButton = useSelector((state) => state.addFormButton.show);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const deleteMessage = useSelector((state) => state.removeModal.message);

	const [formTitle, setFormTitle] = useState("Add Guard Designation");
	const [errors, setErrors] = useState({});
	const [inputValues, setInputValues] = useState({
		p_action: "INSERT",
		designation_id: null,
		designation: "",
	});
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [updateGrid, setUpdateGrid] = useState(0);
	const [body, setBody] = useState({ refresh: "" });

	const deleteModalData = {
		id: deleteMessage?.designation_id,
		name: deleteMessage?.designation,
	};

	const validateForm = () => {
		const newErrors = {};
		if (!inputValues.designation.trim())
			newErrors.designation = "Guard Designation is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleClose = () => {
		setFormTitle("Add Guard Designation");
		setInputValues({
			p_action: "INSERT",
			designation_id: null,
			designation: "",
		});
		dispatch(toggleForm());
	};

	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (getUser) {
			const moduleRights = getUser.find(
				(val) => val.module_name.toLowerCase() === url[1],
			);
			const finalModule = moduleRights?.rights.find(
				(val) =>
					val.transaction_code.replace(/ /g, "-").toLowerCase() === url[2],
			);
			return (
				finalModule || {
					can_view: false,
					can_insert: false,
					can_edit: false,
					can_delete: false,
					can_print: false,
				}
			);
		}
		return {
			can_view: false,
			can_insert: false,
			can_edit: false,
			can_delete: false,
			can_print: false,
		};
	}, [getUser, url]);

	const gridColumn = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "designation",
				header: "Designation",
				size: 200,
			},
			{
				accessorKey: "created_by_name",
				header: "Created By",
				size: 270,
			},
			{
				accessorKey: "created_at",
				header: "Created Date",
				size: 160,
				Cell: ({ row }) =>
					row.original.created_at
						? `${moment(row.original.created_at).format("DD/MM/YYYY")} (${moment(row.original.created_at).format("HH:mm A")})`
						: "N/A",
			},
			{
				accessorKey: "updated_by_name",
				header: "Updated By",
				size: 200,
			},
			{
				accessorKey: "updated_at",
				header: "Updated Date",
				size: 160,
				Cell: ({ row }) =>
					row.original.updated_at
						? `${moment(row.original.updated_at).format("DD/MM/YYYY")} (${moment(row.original.updated_at).format("LT")})`
						: "N/A",
			},
			{
				accessorKey: "action",
				header: "Action",
				size: 100,
				Cell: ({ row }) => (
					<RowActionMenu
						row={row.original}
						onEdit={handleEdit}
						onDelete={(data) => dispatch(showModal(data))}
						canEdit={isUserRight?.can_edit}
						canDelete={isUserRight?.can_delete}
					/>
				),
			},
		],
		[isUserRight],
	);

	const handleEdit = async (data) => {
		dispatch(toggleForm());
		setFormTitle("Edit Guard Designation");
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_guard_designation_preview",
				{ designation_id: data.designation_id, p_action: "UPDATE" },
			);
			if (response.data.valid) {
				const value = response.data.data[0];
				setInputValues({
					p_action: "UPDATE",
					designation_id: data.designation_id,
					designation: value.designation_name || value.designation || "",
				});
			} else {
				showToast(
					"error",
					response.data.message || "Failed to load designation.",
				);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		}
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setInputValues((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const insertForm = async () => {
		if (!validateForm()) {
			return;
		}
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_guard_designation_manage",
				inputValues,
			);
			if (response.status === 200 && response.data.status !== 400) {
				setInputValues({
					p_action: "INSERT",
					designation_id: null,
					designation: "",
				});
				showToast("success", "Guard Designation saved successfully!");
				setUpdateGrid(updateGrid + 1);
				setBody({ ...body, refresh: 2 });
				dispatch(toggleForm());
			} else {
				showToast(
					"error",
					response.data.message ||
						"Duplicate entry detected. Please check the entered details.",
				);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	const handleDelete = async (id) => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_guard_designation_delete",
				{ designation_id: id },
			);
			if (response.data.valid) {
				setBody({ ...body, refresh: Math.random() });
				setUpdateGrid((prev) => prev + 1);
				showToast("success", "Guard Designation deleted successfully!");
				dispatch(toggleSpinnerAndDisableButton(false));
			} else {
				showToast(
					"error",
					response.data.message || "Failed to delete designation.",
				);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		}
		dispatch(hideModal());
	};

	const addFormJsx = (
		<Form>
			<Row>
				<Col md={12} className="mb-4">
					<TextField
						size="small"
						fullWidth
						label={"Guard Designation"}
						name="designation"
						value={inputValues.designation}
						onChange={handleChange}
						error={!!errors.designation}
						helperText={errors.designation}
						required
					/>
				</Col>
				<Col md={12} className="d-flex justify-content-end gap-2">
					<Button
						size="sm"
						variant="none"
						type="button"
						className="commonBtn"
						onClick={insertForm}
						disabled={spinnerButton}
					>
						{spinnerButton ? (
							<Spinner animation="border" variant="dark" size="sm" />
						) : (
							"Submit"
						)}
					</Button>
					<Button
						size="sm"
						variant="none"
						className="cancelBtn"
						onClick={handleClose}
					>
						Cancel
					</Button>
				</Col>
			</Row>
		</Form>
	);

	return (
		<MainLayout
			isShowing={false}
			pageName={"Guard Designation"}
			hasAddButton={isUserRight?.can_insert}
			branchDropdown={false}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_master_guard_designation_browse"}
				columns={gridColumn}
				body={body}
				jsonUpd={updateGrid}
			/>
			<ModalComponent
				innerJsx={addFormJsx}
				modalTitle={formTitle}
				hidden={addButton}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
}
