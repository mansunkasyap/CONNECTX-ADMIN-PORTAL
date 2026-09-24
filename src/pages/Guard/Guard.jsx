/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import moment from "moment";
import { Badge, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton,
	Menu,
} from "@mui/material";
import { BsChatLeftDotsFill, BsTrash3Fill } from "react-icons/bs";
import { MdOutlineEdit, MdOutlineSecurity, MdMoreVert } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import DeleteModal from "../../components/DeleteModal";
import { useDispatch, useSelector } from "react-redux";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { userService } from "../../../service/service";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { TextField } from "@mui/material";
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

function Guard() {
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const [showModalVertical, setShowModalVertical] = useState(false);
	const [verticalData, setVerticalData] = useState({});
	const [formData, setFormData] = useState({
		vertical: "",
		facility_type: "",
	});
	const [verticalErrors, setVerticalErrors] = useState({
		facility_type: "",
	});
	const [modalRemarksShow, setModalRemarksShow] = useState(false);
	const [filters, setFilters] = useState({
		company: "",
		customer_id: null,
		refresh: "",
	});
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const deleteModalData = {
		id: deleteMessage?.guard_id,
		name: deleteMessage?.full_name,
	};
	const [syncDates, setSyncDates] = useState({
		from_date: moment().format("YYYY-MM-DD"),
		to_date: moment().format("YYYY-MM-DD"),
	});
	const [isSyncing, setIsSyncing] = useState(false);
	const [remarksSaving, setRemarksSaving] = useState(false);

	const handleBulkReport = async () => {
		setIsSyncing(true);
		try {
			const response = await userService.get(
				`/api/v0/service/web_master_guard_bulk_insert?from_date=${syncDates.from_date}&to_date=${syncDates.to_date}`,
			);
			if (response?.data?.valid || response?.status === 200) {
				setupdateGrid(updateGrid + 1);
			} else {
				// alert(response?.data?.message || "Failed to bulk upsert");
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsSyncing(false);
		}
	};
	// user rights starts
	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (!getUser) {
			return {
				can_view: false,
				can_insert: false,
				can_edit: false,
				can_delete: false,
				can_print: false,
			};
		}

		const moduleRights = getUser.find(
			(val) => val.module_name?.toLowerCase() === url[1],
		);
		const finalModule = moduleRights?.rights?.find(
			(val) => val.transaction_code.replace(/ /g, "-").toLowerCase() === url[2],
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
	}, [getUser, url]);
	// user rights ends
	async function handleDelete(id) {
		const obj = {
			guard_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_guard_delete",
				obj,
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setFilters({
					...filters,
					refresh: Math.random(),
				});
				dispatch(toggleSpinnerAndDisableButton(false));
				setTimeout(() => {}, 1700);
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		}
		dispatch(hideModal());
	}

	const [remarkUpdate, setRemarksUpdate] = useState({
		guard_id: null,
		new_customer_id: null,
		changed_by: 206,
		remarks: "",
		company_name: "",
	});
	const handleChange = (event) => {
		setRemarksUpdate({
			...remarkUpdate,
			[event.target.name]: event.target.value,
		});
	};

	function handleModalRemarks(row) {
		setModalRemarksShow(true);
		setRemarksUpdate({ ...remarkUpdate, guard_id: row.guard_id });
		// setselectedGuardId(row.guard_id)
	}

	async function handleUpdateRemarks() {
		setRemarksSaving(true);
		try {
			const response = await userService.post(
				"/api/v0/web/web_guard_customer_update",
				{ ...remarkUpdate },
			);
			if (response.status === 200) {
				if (response.data.status === 400) {
					showToast("error", response.data.message || "Found Duplicate Entries");
				} else {
					showToast("success", "Status updated successfully!");
					setModalRemarksShow(false);
					setRemarksUpdate();
				}
			} else {
				showToast("error", response.data.message || "Something went wrong. Please try again.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "Something went wrong. Please try again.");
		} finally {
			setRemarksSaving(false);
		}
	}

	async function handleSubmitVerticalMaster() {
		if (formData.vertical === "Facility" && !formData.facility_type) {
			setVerticalErrors({ facility_type: "Please select facility type." });
			return;
		}

		try {
			const response = await userService.post(
				"/api/v0/web/update_vertical_guard_master",
				{ ...formData, guard_id: verticalData.guard_id },
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setTimeout(() => {
					setShowModalVertical(false);
					// refresh grid data
					setFilters((prev) => ({ ...prev, refresh: Math.random() }));
				}, 1000);
			}
		} catch (err) {
			console.error(err);
		}
	}

	function handleVerticalModal(rowData) {
		// populate modal data from the selected grid row
		setVerticalData(rowData);
		setFormData({
			vertical: rowData?.vertical || "",
			facility_type: rowData?.facility_type || "",
		});
		setShowModalVertical(true);
	}

	function handleChangeVertical(event) {
		const { name, value } = event.target;
		// if vertical changed away from Facility, clear facility_type and any error
		if (name === "vertical" && value !== "Facility") {
			setFormData((prev) => ({ ...prev, facility_type: "", vertical: value }));
			setVerticalErrors({ facility_type: "" });
			return;
		}

		// clear facility_type error when it changes
		if (name === "facility_type") {
			setVerticalErrors({ facility_type: "" });
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	}

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
				accessorKey: "emp_code",
				header: "Emp. Code",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "full_name",
				header: "Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "gender",
				header: "Gender",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "mobile",
				header: "Mobile",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "otp",
				header: "OTP",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "email",
				header: "Email",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "father_name",
				header: "Father Name",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "date_of_joining",
				header: "Date Of Joining",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ renderedCellValue, row }) => {
					return <span>{moment(renderedCellValue).format("DD/MM/YYYY")}</span>;
				},
			},
			{
				accessorKey: "date_of_birth",
				header: "Date Of Birth",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ renderedCellValue, row }) => {
					return <span>{moment(renderedCellValue).format("DD/MM/YYYY")}</span>;
				},
			},
			{
				accessorKey: "bank_name",
				header: "Bank Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				id: "company_name",
				Header: () => {
					return (
						<div className="tabletopheader">
							<AutoCompletedDropdown
								url={"/api/v0/web/web_customer_dropdown"}
								handleDataChange={(val) => {
									setFilters({
										...filters,
										customer_id: val?.customer_id ?? null,
										customer_code: val?.customer_code ?? "",
										company_name: val?.company_name ?? "",
									});
								}}
								valueInput={filters.company_name}
								objLevel={"company_name"}
							/>
						</div>
					);
				},
				columns: [
					{
						accessorKey: "customer_code",
						header: "Customer Details",
						enableColumnFilter: false,
						size: 350,
						Cell: ({ row }) => (
							<>
								<div>
									{row.original.customer_code} - {row.original.company_name}
								</div>
							</>
						),
					},
				],
			},
			{
				accessorKey: "vertical",
				header: "Vertical",
				enableColumnFilter: false,
				size: 180,
				Cell: ({ _, row }) => (
					<Badge
						bg="dark"
						className="cursor-pointer"
						onClick={() => handleVerticalModal(row.original)}
					>
						{row.original.vertical ? row.original.vertical : `View`}
					</Badge>
				),
			},
			{
				accessorKey: "created_by_name",
				header: "Created by",
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "created_at",
				header: "Created Date",
				enableColumnFilter: false,
				size: 180,
				Cell: ({ renderedCellValue, row }) => {
					return (
						<span>
							{moment(renderedCellValue).format("DD/MM/YYYY")} (
							{moment(renderedCellValue).format("LT")})
						</span>
					);
				},
			},
			{
				accessorKey: "updated_by_name",
				header: "Updated By",
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "updated_at",
				header: "Updated Date",
				enableColumnFilter: false,
				size: 180,
				Cell: ({ renderedCellValue, row }) => {
					return (
						<span>
							{renderedCellValue ? (
								<>
									{moment(renderedCellValue).format("DD/MM/YYYY")} (
									{moment(renderedCellValue).format("LT")})
								</>
							) : (
								"NA"
							)}
						</span>
					);
				},
			},
			{
				accessorKey: "action",
				header: "Action",
				enableColumnFilter: false,
				size: 130,
				// eslint-disable-next-line react/prop-types
				Cell: ({ row }) => (
					<RowActionMenu
						row={row.original}
						onEdit={handleEdit}
						onPreview={handlePreview}
						onDelete={(data) => dispatch(showModal(data))}
						onRemarks={handleModalRemarks}
						canEdit={isUserRight?.can_edit}
						canView={isUserRight?.can_view}
						canDelete={isUserRight?.can_delete}
					/>
				),
			},
		],
		[filters, isUserRight],
	);

	const handlePreview = (data) => {
		const obj = { ...data };
		obj.p_action = "UPDATE";
		navigate("add", {
			state: {
				id: obj.guard_id,
				type: "preview",
			},
		});
	};

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "UPDATE";
		navigate("add", {
			state: {
				id: obj.guard_id,
				type: "edit",
			},
		});
	};

	return (
		<MainLayout
			isShowing={false}
			pageName="Guards"
			hasAddButton={isUserRight?.can_insert}
			linkto={"add"}
		>
			<div style={{ position: "relative" }}>
				{/* Floats inside cdgToolbar's right padding — pointer-events:none lets clicks pass through to Search/Export */}
				<div
					style={{
						position: "absolute",
						top: 12,
						right: 185,
						zIndex: 5,
						display: "flex",
						alignItems: "center",
						gap: 6,
						pointerEvents: "none",
					}}
				>
					<Form.Control
						id="from_date"
						type="date"
						size="sm"
						value={syncDates.from_date}
						onChange={(e) =>
							setSyncDates((prev) => ({ ...prev, from_date: e.target.value }))
						}
						style={{ width: 130, fontSize: 13, pointerEvents: "auto" }}
					/>
					<span
						style={{
							fontSize: 12,
							color: "#64748b",
							fontWeight: 500,
							pointerEvents: "auto",
						}}
					>
						to
					</span>
					<Form.Control
						id="to_date"
						type="date"
						size="sm"
						value={syncDates.to_date}
						onChange={(e) =>
							setSyncDates((prev) => ({ ...prev, to_date: e.target.value }))
						}
						style={{ width: 130, fontSize: 13, pointerEvents: "auto" }}
					/>
					<Button
						size="sm"
						variant="none"
						className="commonBtn ms-1 p-0 pt-1 pb-1"
						onClick={handleBulkReport}
						disabled={isSyncing}
						style={{ pointerEvents: "auto" }}
					>
						{isSyncing ? (
							<Spinner animation="border" size="sm" variant="dark" />
						) : (
							"Search"
						)}
					</Button>
				</div>
				<CommonDataGrid
					url={"/api/v0/web/web_master_guard_browse"}
					columns={gridColumns}
					body={filters}
					// jsonUpd={updateGrid}
				/>
			</div>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>

			<Modal show={showModalVertical} size="lg" centered>
				<Modal.Header>
					<Modal.Title>Vertical Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row>
							<Col md={6} className="mb-4 validate">
								<FormControl fullWidth variant="outlined" size="small">
									<InputLabel>Vertical</InputLabel>
									<Select
										name="vertical"
										value={formData.vertical}
										onChange={handleChangeVertical}
										label="Vertical"
									>
										<MenuItem value="Facility">Facility</MenuItem>
										<MenuItem value="Security">Security</MenuItem>
									</Select>
								</FormControl>
							</Col>
							{formData.vertical === "Facility" && (
								<Col md={6} className="mb-4 validate">
									<FormControl fullWidth variant="outlined" size="small">
										<InputLabel>Facitlity Type</InputLabel>
										<Select
											name="facility_type"
											value={formData.facility_type}
											onChange={handleChangeVertical}
											label="Facitlity Type"
										>
											<MenuItem value="E&M">E&M</MenuItem>
											<MenuItem value="HK">HK</MenuItem>
										</Select>
									</FormControl>
									{verticalErrors.facility_type && (
										<div
											style={{
												color: "#d32f2f",
												fontSize: "0.875rem",
												marginTop: 6,
											}}
										>
											{verticalErrors.facility_type}
										</div>
									)}
								</Col>
							)}
							<Col md={12} className="d-flex gap-3 align-items-center">
								<Button
									size="sm"
									variant="none"
									type="button"
									className="commonBtn"
									onClick={handleSubmitVerticalMaster}
									disabled={spinnerButton}
								>
									{spinnerButton ? (
										<Spinner animation="border" variant="light" size="sm" />
									) : (
										"Submit"
									)}
								</Button>

								<Button
									size="sm"
									variant="none"
									type="button"
									className="cancelBtn"
									onClick={() => setShowModalVertical(false)}
								>
									Cancel
								</Button>
							</Col>
						</Row>
					</Form>
				</Modal.Body>
			</Modal>

			<Modal
				show={modalRemarksShow}
				onHide={() => setModalRemarksShow(false)}
				size="md"
				centered
				className="modalwrapper"
			>
				<Modal.Body style={{ padding: 0 }}>
					{/* Header */}
					<div
						style={{
							padding: "16px 20px",
							borderBottom: "1px solid #f1f3f5",
						}}
					>
						<p
							style={{
								margin: 0,
								fontSize: 11,
								fontWeight: 600,
								letterSpacing: "0.07em",
								textTransform: "uppercase",
								color: "#64748b",
							}}
						>
							Status Update
						</p>
					</div>

					{/* Form fields */}
					<div style={{ padding: "20px" }}>
						<Form>
							<Row className="g-3">
								<Col md={12}>
									<AutoCompletedDropdown
										url={"/api/v0/web/web_customer_dropdown"}
										body={{}}
										handleDataChange={(val) => {
											setRemarksUpdate({
												...remarkUpdate,
												customer_id: val?.customer_id ?? null,
												customer_code: val?.customer_code ?? "",
												company_name: val?.company_name ?? "",
											});
										}}
										valueInput={remarkUpdate?.company_name}
										objLevel={"company_name"}
										labelName={"Customer"}
									/>
								</Col>
								<Col md={12}>
									<TextField
										size="small"
										fullWidth
										label={"Remarks"}
										name="remarks"
										value={remarkUpdate?.remarks}
										onChange={handleChange}
									/>
								</Col>
							</Row>
						</Form>
					</div>

					{/* Footer */}
					<div
						style={{
							padding: "12px 20px",
							borderTop: "1px solid #f1f3f5",
							display: "flex",
							justifyContent: "flex-end",
							gap: 8,
						}}
					>
						<Button
							size="sm"
							variant="none"
							type="button"
							className="cancelBtn"
							onClick={() => setModalRemarksShow(false)}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							variant="none"
							type="button"
							className="commonBtn"
							onClick={handleUpdateRemarks}
							disabled={remarksSaving}
						>
							{remarksSaving ? (
								<Spinner animation="border" variant="light" size="sm" />
							) : (
								"Submit"
							)}
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</MainLayout>
	);
}

export default Guard;
