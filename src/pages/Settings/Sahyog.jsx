import { useMemo, useState } from "react";
import moment from "moment";
import {
	Button,
	Col,
	Form,
	Modal,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";
import { MenuItem, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
	hideModal,
	showModal,
	toggleForm,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { BsChatLeftDotsFill } from "react-icons/bs";
import DeleteModal from "../../components/DeleteModal";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { userService } from "../../../service/service";
import ModalComponent from "../../components/ModalComponent";
import Toast from "../../components/Toast";

const thStyle = {
	backgroundColor: "#1e293b",
	color: "#fff",
	fontWeight: 600,
	fontSize: 12,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	whiteSpace: "nowrap",
	padding: "10px 12px",
	borderColor: "#334155",
};

export default function Sahyog() {
	const dispatch = useDispatch();
	const addButton = useSelector((state) => state.addFormButton.show);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const [formTitle, setFormTitle] = useState("Add Sahyog");
	const [modalRemarksShow, setModalRemarksShow] = useState(false);
	const [remarksModalData, setremarksModalData] = useState([]);

	const deleteMessage = useSelector((state) => state.removeModal.message);
	const deleteModalData = { id: deleteMessage?.p_category_id };

	const initialValues = {
		p_operation: "INSERT",
		request_id: 0,
		status: "",
		reason: "",
		remarks: "",
		updated_by_type: "",
	};

	const [inputValues, setinputValues] = useState(initialValues);
	const [errors, setErrors] = useState({});

	const [remarkUpdate, setRemarksUpdate] = useState({
		request_id: null,
		status: "",
		remarks: "",
		updated_by: null,
		updated_by_type: "",
	});
	const [modalErrors, setModalErrors] = useState({});

	const [body, setbody] = useState({ refresh: "" });
	const [updateGrid, setupdateGrid] = useState(0);

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
	// end userRights

	const validateForm = () => {
		const newErrors = {};
		if (!inputValues.reason.trim()) newErrors.reason = "Sahyog reason is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateUpdate = () => {
		const newErrors = {};
		if (!remarkUpdate.status) newErrors.status = "Status is required.";
		if (!remarkUpdate.remarks.trim()) newErrors.remarks = "Remarks is required.";
		setModalErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handler for Add Sahyog form fields
	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setinputValues((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	// Handler for Status Update modal fields
	const handleChange = (event) => {
		const { name, value } = event.target;
		setRemarksUpdate((prev) => ({ ...prev, [name]: value }));
		if (modalErrors[name]) setModalErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleClose = () => {
		setFormTitle("Add Sahyog");
		setinputValues(initialValues);
		setErrors({});
		dispatch(toggleForm());
	};

	const handleCloseModal = () => {
		setModalRemarksShow(false);
		setRemarksUpdate({
			request_id: null,
			status: "",
			remarks: "",
			updated_by: null,
			updated_by_type: "",
		});
		setModalErrors({});
		setremarksModalData([]);
	};

	const insertForm = async () => {
		if (!validateForm()) return;
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/web_sahyog_reason_manage",
				inputValues,
			);
			if (response.status === 200 && response.data.status !== 400) {
				setinputValues(initialValues);
				showToast("success", "Sahyog saved successfully!");
				setupdateGrid(updateGrid + 1);
				setbody({ ...body, refresh: 2 });
				dispatch(toggleForm());
			} else {
				showToast("error", response.data.message || "Duplicate entry detected. Please check the entered details.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	async function handleBrowseRemarks(data) {
		setModalRemarksShow(true);
		setremarksModalData([]);
		setRemarksUpdate((prev) => ({ ...prev, request_id: data.request_id }));
		try {
			const response = await userService.post(
				"/api/v0/web/web_sahyog_request_history_browse",
				{ request_id: data.request_id },
			);
			if (response.status === 200 && response.data.status !== 400) {
				setremarksModalData(response.data.data || []);
			} else {
				showToast("error", response.data.message || "Failed to load history.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		}
	}

	async function handleUpdateRemarks() {
		if (!validateUpdate()) return;
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/web_sahyog_request_history_manage",
				remarkUpdate,
			);
			if (response.status === 200 && response.data.status !== 400) {
				showToast("success", "Status updated successfully!");
				setupdateGrid((prev) => prev + 1);
				handleCloseModal();
			} else {
				showToast("error", response.data.message || "Failed to update status. Please try again.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	}

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
				accessorKey: "customer_code",
				header: "Customer Code",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "customer_name",
				header: "Company Name",
				enableColumnFilter: false,
				size: 300,
			},
			{
				accessorKey: "reason",
				header: "Sahyog Reason",
				enableColumnFilter: false,
				size: 300,
			},
			{
				accessorKey: "guard_emp_code",
				header: "Guard Emp. Code",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "guard_mobile",
				header: "Guard Mobile No.",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "status",
				header: "Status",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "created_by_name",
				header: "Created By",
				enableColumnFilter: false,
				size: 270,
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
							{moment(createdAt).format("DD/MM/YYYY")} ({moment(createdAt).format("LT")})
						</span>
					);
				},
			},
			{
				accessorKey: "request_date",
				header: "Request Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const requestAt = row.original.updated_at;
					if (!requestAt) return "N/A";
					return (
						<span>
							{moment(requestAt).format("DD/MM/YYYY")} ({moment(requestAt).format("LT")})
						</span>
					);
				},
			},
			{
				accessorKey: "updated_by_name",
				header: "Updated By",
				enableColumnFilter: false,
				size: 200,
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
							{moment(updatedAt).format("DD/MM/YYYY")} ({moment(updatedAt).format("LT")})
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
					<Button
						size="sm"
						variant="none"
						onClick={() => handleBrowseRemarks(row.original)}
					>
						<BsChatLeftDotsFill style={{ marginRight: 4 }} />
					</Button>
				),
			},
		],
		[isUserRight],
	);

	const addFormJsx = (
		<Form>
			<Row>
				<Col md={12} className="mb-4">
					<TextField
						size="small"
						fullWidth
						label="Sahyog Reason"
						name="reason"
						value={inputValues.reason}
						onChange={handleInputChange}
						error={!!errors.reason}
						helperText={errors.reason}
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
					<Button size="sm" variant="none" className="cancelBtn" onClick={handleClose}>
						Cancel
					</Button>
				</Col>
			</Row>
		</Form>
	);

	async function handleDelete(id) {
		try {
			const response = await userService.post("/api/v0/web/issue_subcategory_delete", {
				p_subcategory_id: id,
			});
			if (response.data.valid) {
				showToast("success", "Deleted successfully!");
				setupdateGrid((prev) => prev + 1);
				setbody({ ...body, refresh: Math.random() });
				dispatch(toggleSpinnerAndDisableButton(false));
			} else {
				showToast("error", response.data.message || "Failed to delete.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(hideModal());
		}
	}

	return (
		<MainLayout
			pageName="Sahyog Request"
			hasAddButton={isUserRight?.can_insert}
			branchDropdown={false}
		>
			<CommonDataGrid
				url="/api/v0/web/web_sahyog_request_browse"
				columns={gridColumn}
				body={body}
				jsonUpd={updateGrid}
			/>
			<ModalComponent innerJsx={addFormJsx} modalTitle={formTitle} hidden={addButton} />
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />

			{/* Status Update Modal */}
			<Modal
				show={modalRemarksShow}
				onHide={handleCloseModal}
				size="lg"
				centered
				className="modalwrapper"
			>
				<Modal.Header className="border-0">
					<Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>Status Update</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row className="mb-3">
							<Col md={6}>
								<TextField
									select
									size="small"
									fullWidth
									label="Status*"
									name="status"
									value={remarkUpdate.status}
									onChange={handleChange}
									error={!!modalErrors.status}
									helperText={modalErrors.status}
									required
								>
									<MenuItem value="Pending">Pending</MenuItem>
									<MenuItem value="In Process">In Process</MenuItem>
									<MenuItem value="Complete">Complete</MenuItem>
								</TextField>
							</Col>
							<Col md={12} className="mt-3">
								<TextField
									size="small"
									fullWidth
									multiline
									rows={3}
									label="Remarks*"
									name="remarks"
									value={remarkUpdate.remarks}
									onChange={handleChange}
									error={!!modalErrors.remarks}
									helperText={modalErrors.remarks}
									required
								/>
							</Col>
						</Row>
					</Form>

					{/* History table */}
					<p
						style={{
							margin: "16px 0 8px",
							fontSize: 11,
							fontWeight: 600,
							letterSpacing: "0.07em",
							textTransform: "uppercase",
							color: "#64748b",
						}}
					>
						History
						{remarksModalData.length > 0 && (
							<span style={{ marginLeft: 8, color: "#94a3b8", fontWeight: 400 }}>
								({remarksModalData.length})
							</span>
						)}
					</p>
					<div
						style={{
							border: "1px solid #e2e8f0",
							borderRadius: 6,
							overflow: "auto",
							maxHeight: 260,
						}}
					>
						<Table
							bordered={false}
							size="sm"
							style={{ marginBottom: 0, verticalAlign: "middle", minWidth: 600 }}
						>
							<thead>
								<tr>
									<th style={thStyle}>Status</th>
									<th style={thStyle}>Remarks</th>
									<th style={thStyle}>Updated By</th>
									<th style={thStyle}>Updated By Type</th>
								</tr>
							</thead>
							<tbody>
								{remarksModalData.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											style={{
												padding: "28px 0",
												textAlign: "center",
												color: "#94a3b8",
												fontSize: 13,
											}}
										>
											No history available
										</td>
									</tr>
								) : (
									remarksModalData.map((item, index) => (
										<tr
											key={index}
											style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc" }}
										>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.status}</td>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.remarks}</td>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.updated_by_name}</td>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.updated_by_type}</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</div>
				</Modal.Body>
				<Modal.Footer className="border-0 pt-0">
					<Button
						size="sm"
						variant="none"
						type="button"
						className="commonBtn"
						onClick={handleUpdateRemarks}
						disabled={spinnerButton}
					>
						{spinnerButton ? (
							<Spinner animation="border" variant="dark" size="sm" />
						) : (
							"Submit"
						)}
					</Button>
					<Button size="sm" variant="none" className="cancelBtn" onClick={handleCloseModal}>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</MainLayout>
	);
}
