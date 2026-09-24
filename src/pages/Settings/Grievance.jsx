import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import { Button, Col, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { BsChatLeftDotsFill } from "react-icons/bs";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { userService } from "../../../service/service";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import { MenuItem, TextField } from "@mui/material";
import moment from "moment";
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

function Grievance() {
	const dispatch = useDispatch();
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

	const [remarksModalData, setremarksModalData] = useState([]);
	const [updateGrid, setupdateGrid] = useState(0);
	const [remarkUpdate, setRemarksUpdate] = useState({
		grievance_id: null,
		status: "",
		remarks: "",
		updated_by: null,
		updated_by_type: "",
	});
	const [errors, setErrors] = useState({});

	const [filters, setFilters] = useState({
		category: "",
		category_id: null,
		subcategory: "",
		subcategory_id: null,
		detail: "",
		detail_id: null,
		company: "",
		customer_id: null,
		branch: "",
		branch_id: null,
		branchManager: "",
		branch_manager_id: null,
		opsManager: "",
		ops_manager_id: null,
		areaManager: "",
		area_manager_id: null,
		grievance_status: "",
		grievanceStatus: "",
	});

	const [modalRemarksShow, setModalRemarksShow] = useState(false);

	const validateUpdate = () => {
		const newErrors = {};
		if (!remarkUpdate.status) newErrors.status = "Status is required.";
		if (!remarkUpdate.remarks.trim())
			newErrors.remarks = "Remarks is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilters((prevFilters) => ({
			...prevFilters,
			[filterKey]: value || "",
			[filterKeyId]: id,
		}));
		setupdateGrid((prev) => prev + 1);
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setRemarksUpdate((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleCloseModal = () => {
		setModalRemarksShow(false);
		setRemarksUpdate({
			grievance_id: null,
			status: "",
			remarks: "",
			updated_by: null,
			updated_by_type: "",
		});
		setErrors({});
		setremarksModalData([]);
	};

	async function handleBrowseRemarks(data) {
		setModalRemarksShow(true);
		setRemarksUpdate((prev) => ({
			...prev,
			grievance_id: data.grievance_id,
		}));
		try {
			const response = await userService.post(
				"/api/v0/web/web_grievance_history_browse",
				{ grievance_id: data.grievance_id },
			);
			if (response.status === 200 && response.data.status !== 400) {
				setremarksModalData(response.data.data || []);
			} else {
				showToast(
					"error",
					response.data.message || "Failed to load grievance history.",
				);
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
				"/api/v0/web/web_grievance_status_update",
				remarkUpdate,
			);
			if (response.status === 200 && response.data.status !== 400) {
				showToast("success", "Status updated successfully!");
				setupdateGrid((prev) => prev + 1);
				handleCloseModal();
			} else {
				showToast(
					"error",
					response.data.message || "Failed to update status. Please try again.",
				);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	}

	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "grievance_no",
				header: "Grievance No.",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "grievance_date",
				header: "Grievance Date",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "guard_name",
				header: "Guard Name",
				enableColumnFilter: false,
				size: 250,
			},
			{
				accessorKey: "emp_code",
				header: "Employee Code",
				enableColumnFilter: false,
				size: 250,
			},
			{
				accessorKey: "mobile",
				header: "Mobile No.",
				enableColumnFilter: false,
				size: 250,
			},
			{
				id: "category_name",
				Header: () => (
					<AutoCompletedDropdown
						url={"/api/v0/web/issue_category_dropdown"}
						body={{ category_id: filters.category_id }}
						handleDataChange={(value) =>
							handleFilterChange(
								"category",
								value?.category_name,
								"category_id",
								value?.category_id,
							)
						}
						valueInput={filters.category}
						objLevel="category_name"
					/>
				),
				columns: [
					{
						accessorKey: "category_name",
						header: "Category Name",
						width: 290,
						enableColumnFilter: false,
						minSize: 260,
					},
				],
			},
			{
				id: "subcategory_name",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/issue_subcategory_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"subcategory",
									value?.subcategory_name,
									"subcategory_id",
									value?.subcategory_id,
								)
							}
							valueInput={filters.subcategory}
							objLevel="subcategory_name"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "subcategory_name",
						header: "Sub-Category Name",
						width: 360,
						enableColumnFilter: false,
						minSize: 250,
					},
				],
			},
			{
				id: "detail_name",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/issue_detail_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"detail",
									value?.detail_name,
									"detail_id",
									value?.detail_id,
								)
							}
							valueInput={filters.detail}
							objLevel="detail_name"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "issue_detail_name",
						header: "Issue Detail Name",
						width: 280,
						enableColumnFilter: false,
						minSize: 300,
					},
				],
			},
			{
				id: "company_name",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_customer_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"company",
									value?.company_name,
									"customer_id",
									value?.customer_id,
								)
							}
							valueInput={filters.company}
							objLevel="company_name"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "customer_name",
						header: "Customer Name",
						width: 280,
						enableColumnFilter: false,
						minSize: 350,
					},
				],
			},
			{
				id: "branch_code",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_branch_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"branch",
									value?.branch_code,
									"branch_id",
									value?.branch_id,
								)
							}
							valueInput={filters.branch}
							objLevel="branch_code"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "branch_code",
						header: "Branch Code",
						width: 280,
						enableColumnFilter: false,
						minSize: 230,
					},
				],
			},
			{
				id: "branch_manager_code",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_branch_manager_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"branchManager",
									value?.emp_code,
									"branch_manager_id",
									value?.branch_manager_id,
								)
							}
							valueInput={filters.branchManager}
							objLevel="emp_code"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "branch_manager_name",
						header: "Branch Manager Code",
						width: 280,
						enableColumnFilter: false,
						minSize: 200,
					},
				],
			},
			{
				id: "ops_manager",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_ops_manager_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"opsManager",
									value?.full_name,
									"ops_manager_id",
									value?.ops_manager_id,
								)
							}
							valueInput={filters.opsManager}
							objLevel="full_name"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "ops_manager_name",
						header: "OPS Manager Name",
						width: 280,
						enableColumnFilter: false,
						minSize: 200,
					},
				],
			},
			{
				id: "area_manager",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_area_manager_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"areaManager",
									value?.areaManager,
									"area_manager_id",
									value?.area_manager_id,
								)
							}
							valueInput={filters.areaManager}
							objLevel="full_name"
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "area_manager_name",
						header: "Area Manager Name",
						width: 280,
						enableColumnFilter: false,
						minSize: 200,
					},
				],
			},
			{
				id: "grievance_status",
				Header: () => (
					<div className="tabletopheader">
						<Form.Select
							size="sm"
							value={filters.grievanceStatus || ""}
							onChange={(e) =>
								handleFilterChange(
									"grievanceStatus",
									e.target.value,
									"grievance_status",
									null,
								)
							}
						>
							<option value="">All</option>
							<option value="Pending">Pending</option>
							<option value="In Process">In Process</option>
							<option value="Completed">Completed</option>
						</Form.Select>
					</div>
				),
				columns: [
					{
						accessorKey: "grievance_status",
						header: "Status",
						size: 190,
						enableColumnFilter: false,
					},
				],
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
						className="text-info border"
						onClick={() => handleBrowseRemarks(row.original)}
					>
						<BsChatLeftDotsFill style={{ marginRight: 4 }} />
					</Button>
				),
			},
		],
		[filters],
	);

	return (
		<MainLayout pageName="Grievance" hasAddButton={false}>
			<CommonDataGrid
				url="/api/v0/web/web_guard_grievance_browse"
				columns={gridColumns}
				body={filters}
				jsonUpd={updateGrid}
			/>

			{/* Status Update Modal */}
			<Modal
				show={modalRemarksShow}
				onHide={handleCloseModal}
				size="lg"
				centered
				className="modalwrapper"
			>
				<Modal.Header className="border-0">
					<Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>
						Status Update
					</Modal.Title>
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
									error={!!errors.status}
									helperText={errors.status}
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
									error={!!errors.remarks}
									helperText={errors.remarks}
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
							<span
								style={{ marginLeft: 8, color: "#94a3b8", fontWeight: 400 }}
							>
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
							style={{
								marginBottom: 0,
								verticalAlign: "middle",
								minWidth: 600,
							}}
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
											style={{
												backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc",
											}}
										>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>
												{item.status}
											</td>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>
												{item.remarks}
											</td>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>
												{item.updated_by_name}
											</td>
											<td style={{ fontSize: 13, padding: "7px 12px" }}>
												{item.updated_by_type}
											</td>
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
					<Button
						size="sm"
						variant="none"
						className="cancelBtn"
						onClick={handleCloseModal}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
}

export default Grievance;
