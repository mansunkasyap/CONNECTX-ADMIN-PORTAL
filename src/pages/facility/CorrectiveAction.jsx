import { useCallback, useMemo, useState } from "react";
import moment from "moment";
import { Badge, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
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

export default function CorrectiveAction() {
	const dispatch = useDispatch();
	const getUser = useSelector((state) => state.getUserRight.data);
	const addButton = useSelector((state) => state.addFormButton.show);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [formTitle, setFormTitle] = useState("Add Corrective Action");

	const deleteMessage = useSelector((state) => state.removeModal.message);
	const deleteModalData = {
		id: deleteMessage?.corrective_action_id,
		name: deleteMessage?.corrective_action_name,
	};

	const initialValues = {
		corrective_action_id: 0,
		corrective_action_name: "",
	};

	const [inputValues, setinputValues] = useState(initialValues);
	const [errors, setErrors] = useState({});

	const [updateGrid, setupdateGrid] = useState(0);

	const handleClose = () => {
		setFormTitle("Add Corrective Action");
		setinputValues(initialValues);
		setErrors({});
		dispatch(toggleForm());
	};

	const handleQrCodeChange = (event) => {
		const value = event.target.value;
		setinputValues((prevValues) => ({
			...prevValues,
			corrective_action_name: value,
		}));
		if (value.trim()) {
			setErrors((prev) => ({ ...prev, corrective_action_name: "" }));
		}
	};

	// start userRights

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

	const handleEdit = useCallback(
		async (data) => {
			dispatch(toggleForm());
			setFormTitle("Edit Corrective Action");
			try {
				const response = await userService.post(
					"/api/v0/web/preview_master_facility_corrective_action",
					{ corrective_action_id: data.corrective_action_id },
				);
				if (response.data.valid) {
					const value =
						response.data.data[0].preview_master_facility_corrective_action;
					setinputValues({
						corrective_action_id: value.corrective_action_id,
						corrective_action_name: value.corrective_action_name,
					});
					setErrors({});
				} else {
					showToast("error", response.data.message || "Failed to load data.");
				}
			} catch (err) {
				console.error(err);
				showToast("error", "An unexpected error occurred.");
			}
		},
		[dispatch],
	);

	const gridColumn = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ _, row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "corrective_action_name",
				header: "Corrective Action Name",
				enableColumnFilter: false,
				size: 300,
			},
			{
				accessorKey: "created_at",
				header: "Created Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const createdAt = row.original.created_at;

					if (!createdAt) return "N/A";

					return (
						<span>
							{moment(createdAt).format("DD/MM/YYYY")} (
							{moment(createdAt).format("LT")})
						</span>
					);
				},
			},
			{
				accessorKey: "updated_at",
				header: "Updated Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const updatedAt = row.original.updated_at;

					if (!updatedAt) return "N/A";

					return (
						<span>
							{moment(updatedAt).format("DD/MM/YYYY")} (
							{moment(updatedAt).format("LT")})
						</span>
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
						canDelete={isUserRight?.can_delete}
					/>
				),
			},
		],
		[isUserRight, dispatch],
	);

	const handleChange = useCallback((event) => {
		setinputValues((prev) => ({
			...prev,
			corrective_action_name: event.target.value,
		}));
		if (event.target.value.trim()) {
			setErrors((prev) => ({ ...prev, corrective_action_name: "" }));
		}
	}, []);

	const insertForm = async () => {
		if (!inputValues.corrective_action_name.trim()) {
			setErrors({ corrective_action_name: "Corrective Action Name is required." });
			return;
		}

		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/insert_or_update_master_facility_corrective_action",
				inputValues,
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setupdateGrid((prev) => prev + 1);
				setinputValues(initialValues);
				setErrors({});
				dispatch(toggleForm());
			} else {
				showToast("error", response.data.message || "Found Duplicate Entries.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An error occurred while saving.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	async function handleDelete(id) {
		try {
			dispatch(toggleSpinnerAndDisableButton(true));
			const response = await userService.post(
				"/api/v0/web/delete_master_facility_corrective_action",
				{ corrective_action_id: id },
			);
			if (response.data.valid) {
				showToast("success", "Deleted successfully!");
				setupdateGrid((prev) => prev + 1);
			} else {
				const msg = response.data.message || "";
				const errorMessage = msg.includes("violates foreign key constraint")
					? "Corrective Action has been used in the module and cannot be deleted."
					: msg || "Failed to delete.";
				showToast("error", errorMessage);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
			dispatch(hideModal());
		}
	}

	return (
		<MainLayout
			isShowing={false}
			pageName={"Corrective Action"}
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			branchDropdown={false}
		>
			<CommonDataGrid
				url={"/api/v0/web/browse_master_facility_corrective_action"}
				columns={gridColumn}
				jsonUpd={updateGrid}
			/>
			<Modal size="lg" show={addButton} onHide={handleClose} centered className="modalwrapper">
				<Modal.Header className="border-0">
					<Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>{formTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row>
							<Col xs={12}>
								<TextField
									size="small"
									fullWidth
									label="Corrective Action Name *"
									name="corrective_action_name"
									value={inputValues.corrective_action_name}
									placeholder="Enter corrective action name"
									onChange={handleChange}
									error={Boolean(errors.corrective_action_name)}
									helperText={errors.corrective_action_name}
								/>
							</Col>
							<Col md={12} className="d-flex justify-content-end gap-2 mt-4">
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
				</Modal.Body>
			</Modal>
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
