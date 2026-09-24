/* eslint-disable react/prop-types */
import { useCallback, useMemo, useState } from "react";
import { Badge, Form, Modal, Button, Row, Col, Table, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import MainLayout from "../../components/MainLayout";
import moment from "moment";
import { Link } from "react-router-dom";
import CommonDataGrid from "../../components/CommonDataGrid";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { userService } from "../../../service/service";
import { FaStar } from "react-icons/fa";
import Toast from "../../components/Toast";

export default function FacilityCheckPointReports() {
	// const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false);
	// const [statusHistoryData, setStatusHistoryData] = useState([]);
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [updateGrid, setUpdateGrid] = useState(0);
	const [assetNames, setAssetNames] = useState([]);
	const [assetModal, setAssetModal] = useState({ show: false, data: null });
	const [showSuccess, setShowSuccess] = useState(false);
	const [statusModal, setStatusModal] = useState({ show: false });
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});
	const [statusForm, setStatusForm] = useState({
		scan_id: "",
		type: "",
		status: "",
		remarks: "",
		rating: 0,
	});

	const [filters, setFilters] = useState({
		company: "",
		customer_id: null,
		guard_id: null,
		full_name: "",
		type: null,
		location_name: "",
		location_id: null,
	});

	const fetchAssetNames = useCallback(async (customerId, locationId) => {
		if (!customerId) {
			setAssetNames([]);
			return;
		}
		try {
			const res = await userService.post(
				"/api/v0/web/facility_asset_names",
				{ customer_id: customerId, location_id: locationId || null }
			);
			if (res?.data?.valid) {
				setAssetNames(
					(res.data.data || []).map((r) => r.asset_name).filter(Boolean)
				);
			}
		} catch (err) {
			console.error("Error fetching asset names:", err);
		}
	}, []);

	const handleCustomerChange = (value) => {
		const cid = value?.customer_id || null;
		setFilters((prev) => ({
			...prev,
			company: value?.company_name || "",
			customer_id: cid,
			guard_id: null,
			full_name: "",
			location_name: "",
			location_id: null,
		}));
		fetchAssetNames(cid, null);
		setUpdateGrid((p) => p + 1);
	};

	const handleLocationChange = (value) => {
		const lid = value?.location_id || null;
		setFilters((prev) => ({
			...prev,
			location_name: value?.location_name || "",
			location_id: lid,
		}));
		fetchAssetNames(filters.customer_id, lid);
		setUpdateGrid((p) => p + 1);
	};

	const debounce = (func, delay) => {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	};

	const handleFilterChange = debounce((key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value === "" ? null : value }));
		setUpdateGrid((p) => p + 1);
	}, 500);

	const handleOpenStatusModal = (row) => {
		setStatusForm((s) => ({ ...s, scan_id: row.original.scan_id || "" }));
		setStatusModal({ show: true, row });
	};

	const handleCloseStatusModal = () => {
		setStatusModal({ show: false });
		setStatusForm({
			scan_id: "",
			type: "",
			status: "",
			remarks: "",
			rating: 0,
		});
		setErrors({});
		setSubmitting(false);
	};

	const validateAndSubmit = () => {
		const newErrors = {};
		if (!statusForm.status) newErrors.status = "Status is required.";
		if (!statusForm.remarks.trim()) newErrors.remarks = "Remarks is required.";
		if (statusForm.rating === 0) newErrors.rating = "Rating is required.";
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) handleSubmitStatus();
	};

	const canSubmit = () => {
		const { status, remarks, rating } = statusForm;
		return status && remarks && rating > 0 && !submitting;
	};

	const handleSubmitStatus = async () => {
		if (!canSubmit()) return;
		setSubmitting(true);
		try {
			const payload = { ...statusForm };
			const response = await userService.post(
				"/api/v0/web/insert_facility_checkpoint_approve",
				payload,
			);
			if (response && response.data && response.data.valid) {
				setUpdateGrid((u) => u + 1);
				showToast("success", "Saved successfully!");
				setTimeout(() => {
					handleCloseStatusModal();
				}, 2000);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

	const statusBadge = (val) => {
		if (!val) return "-";
		const bg =
			val === "OK" || val === "Completed"
				? "success"
				: val === "Pending"
					? "warning"
					: "secondary";
		return (
			<Badge bg={bg} style={{ fontSize: "0.7rem", padding: "3px 6px" }}>
				{val}
			</Badge>
		);
	};

	const gridColumns = useMemo(() => {
		const staticCols = [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 70,
			},
			{
				accessorKey: "scan_date",
				header: "Date",
				enableColumnFilter: false,
				size: 110,
			},
			{
				id: "company_name",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_customer_dropdown"}
							handleDataChange={handleCustomerChange}
							valueInput={filters.company}
							objLevel={"company_name"}
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "company_name",
						header: "Customer",
						enableColumnFilter: false,
						size: 220,
						Cell: ({ row }) => {
							const code = row.original.customer_code || "";
							const name = row.original.company_name || "";
							return code ? `${code} - ${name}` : name;
						},
					},
				],
			},
			{
				id: "location_group",
				Header: () => (
					<div className="tabletopheader">
						{filters.customer_id && (
							<AutoCompletedDropdown
								url={"/api/v0/web/list_facility_location_checkpoint"}
								body={{ customer_id: filters.customer_id }}
								handleDataChange={handleLocationChange}
								valueInput={filters.location_name}
								objLevel={"location_name"}
							/>
						)}
					</div>
				),
				columns: [
					{
						accessorKey: "location_name",
						header: "Location",
						enableColumnFilter: false,
						size: 200,
					},
				],
			},
			{
				id: "type_filter",
				Header: () => (
					<div className="tabletopheader">
						<Form.Select
							name="type"
							onChange={(e) => handleFilterChange("type", e.target.value)}
							value={filters.type || ""}
							size="sm"
						>
							<option value="">All</option>
							<option value="E&M">E&M</option>
							<option value="HK">HK</option>
						</Form.Select>
					</div>
				),
				columns: [
					{
						accessorKey: "type",
						header: "Type",
						enableColumnFilter: false,
						size: 100,
					},
				],
			},
			{
				accessorKey: "total_assets",
				header: "Total Assets",
				enableColumnFilter: false,
				size: 110,
			},
			{
				accessorKey: "scanned_assets",
				header: "Scanned",
				enableColumnFilter: false,
				size: 100,
				Cell: ({ row }) => (
					<span className="text-success fw-bold">
						{row.original.scanned_assets ?? 0}
					</span>
				),
			},
			{
				accessorKey: "missed_assets",
				header: "Missed",
				enableColumnFilter: false,
				size: 100,
				Cell: ({ row }) => {
					const missed = row.original.missed_assets ?? 0;
					return (
						<span className={missed > 0 ? "text-danger fw-bold" : ""}>
							{missed}
						</span>
					);
				},
			},
			{
				accessorKey: "task_status",
				header: "Status",
				enableColumnFilter: false,
				size: 110,
				Cell: ({ row }) => {
					const s = row.original.task_status || "Not Done";
					const bg = s === "Done" ? "success" : s === "Partial" ? "warning" : "danger";
					return (
						<Badge bg={bg} style={{ fontSize: "0.75rem" }}>
							{s}
						</Badge>
					);
				},
			},
			{
				accessorKey: "guard_name",
				header: "Guard",
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "scan_time",
				header: "Time",
				enableColumnFilter: false,
				size: 90,
			},
		];

		const actionCol = {
			accessorKey: "action",
			header: "Assets",
			enableColumnFilter: false,
			enableSorting: false,
			size: 120,
			Cell: ({ row }) => (
				<Button
					size="sm"
					variant="outline-primary"
					className="d-inline-flex align-items-center gap-1"
					onClick={() =>
						setAssetModal({ show: true, data: row.original })
					}
				>
					<FaEye /> View
				</Button>
			),
		};

		return [...staticCols, actionCol];
	}, [filters, assetNames]);

	return (
		<MainLayout pageName="Facility Checkpoint Report" hasAddButton={false}>
			{!filters.customer_id ? (
				<div
					className="d-flex flex-column align-items-center justify-content-center bg-white rounded-3 p-5"
					style={{ minHeight: 300 }}
				>
					<p className="text-muted mb-3 fw-semibold">
						Select a customer to view the report
					</p>
					<div style={{ width: 350 }}>
						<AutoCompletedDropdown
							url={"/api/v0/web/web_customer_dropdown"}
							handleDataChange={handleCustomerChange}
							valueInput={filters.company}
							objLevel={"company_name"}
						/>
					</div>
				</div>
			) : (
				<CommonDataGrid
					url={"/api/v0/web/report_facility_checkpoint_pivot"}
					columns={gridColumns}
					body={filters}
					jsonUpd={updateGrid}
				/>
			)}

			{/* Status Modal */}
			<Modal
				size="lg"
				show={statusModal.show}
				onHide={handleCloseStatusModal}
				centered
				className="modalwrapper"
			>
				<Modal.Header className="border-0">
					<Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>Update Status</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row className="mb-3">
							<Col md={6}>
								<Form.Group>
									<Form.Label>Status *</Form.Label>
									<Form.Select
										size="sm"
										value={statusForm.status}
										onChange={(e) => {
											setStatusForm((s) => ({ ...s, status: e.target.value }));
											if (errors.status) setErrors((prev) => ({ ...prev, status: "" }));
										}}
										isInvalid={!!errors.status}
									>
										<option value="">Select Status</option>
										<option value="Pending">Pending</option>
										<option value="Close">Close</option>
									</Form.Select>
									<Form.Control.Feedback type="invalid">
										{errors.status}
									</Form.Control.Feedback>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group>
									<Form.Label>Rating *</Form.Label>
									<div>
										{[1, 2, 3, 4, 5].map((i) => (
											<FaStar
												key={i}
												size={22}
												style={{
													marginRight: 6,
													cursor: "pointer",
													color: statusForm.rating >= i ? "#ffc107" : "#cdced1",
												}}
												onClick={() => {
													setStatusForm((s) => ({ ...s, rating: i }));
													if (errors.rating) setErrors((prev) => ({ ...prev, rating: "" }));
												}}
											/>
										))}
									</div>
									{errors.rating && (
										<div style={{ color: "#dc3545", fontSize: "0.875em", marginTop: "0.25rem" }}>
											{errors.rating}
										</div>
									)}
								</Form.Group>
							</Col>
						</Row>
						<Form.Group className="mb-3">
							<Form.Label>Remarks *</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								size="sm"
								value={statusForm.remarks}
								onChange={(e) => {
									setStatusForm((s) => ({ ...s, remarks: e.target.value }));
									if (errors.remarks) setErrors((prev) => ({ ...prev, remarks: "" }));
								}}
								isInvalid={!!errors.remarks}
								placeholder="Enter remarks..."
							/>
							<Form.Control.Feedback type="invalid">
								{errors.remarks}
							</Form.Control.Feedback>
						</Form.Group>
						<Row>
							<Col md={12} className="d-flex justify-content-end gap-2 mt-1">
								<Button
									size="sm"
									variant="none"
									type="button"
									className="commonBtn"
									onClick={validateAndSubmit}
									disabled={submitting}
								>
									{submitting ? (
										<Spinner animation="border" variant="dark" size="sm" />
									) : (
										"Submit"
									)}
								</Button>
								<Button
									size="sm"
									variant="none"
									className="cancelBtn"
									onClick={handleCloseStatusModal}
								>
									Cancel
								</Button>
							</Col>
						</Row>
					</Form>
				</Modal.Body>
			</Modal>
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
			{/* <Modal
				size="md"
				show={showStatusHistoryModal}
				onHide={handleCloseStatusHistoryModal}
			<SuccessMessage hidden={showSuccess} />

			{/* Asset Breakdown Modal */}
			<Modal
				show={assetModal.show}
				onHide={() => setAssetModal({ show: false, data: null })}
				size="lg"
				scrollable
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title className="d-flex flex-column">
						<span>Asset Breakdown</span>
						{assetModal.data && (
							<small className="text-muted fs-6">
								{assetModal.data.location_name} · {assetModal.data.scan_date} · {assetModal.data.type}
							</small>
						)}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{assetModal.data && assetModal.data.assets ? (
						<>
							<div className="d-flex gap-2 mb-3 flex-wrap">
								<Badge bg="primary" className="p-2">
									Total: {assetModal.data.total_assets ?? 0}
								</Badge>
								<Badge bg="success" className="p-2">
									<FaCheckCircle className="me-1" />
									Scanned: {assetModal.data.scanned_assets ?? 0}
								</Badge>
								<Badge bg="danger" className="p-2">
									<FaTimesCircle className="me-1" />
									Missed: {assetModal.data.missed_assets ?? 0}
								</Badge>
								{assetModal.data.guard_name && (
									<Badge bg="secondary" className="p-2">
										Guard: {assetModal.data.guard_name}
									</Badge>
								)}
							</div>
							<Table hover size="sm" className="mb-0 align-middle">
								<thead className="table-light">
									<tr>
										<th style={{ width: 50 }}>#</th>
										<th>Asset Name</th>
										<th>Frequency</th>
										<th>Scan Time</th>
										<th style={{ width: 90 }} className="text-center">Status</th>
										<th>Remarks</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(assetModal.data.assets)
										.sort(([a], [b]) => a.localeCompare(b))
										.map(([name, info], i) => (
											<tr key={name}>
												<td>{i + 1}</td>
												<td className="fw-semibold">{name}</td>
												<td className="text-muted">{info.frequency || "-"}</td>
												<td>{info.scan_time || "-"}</td>
												<td className="text-center">
													{info.checked ? (
														<FaCheckCircle className="text-success fs-5" />
													) : (
														<FaTimesCircle className="text-danger fs-5" />
													)}
												</td>
												<td className="text-muted">
													{info.corrective_action || info.remarks || "-"}
												</td>
											</tr>
										))}
								</tbody>
							</Table>
						</>
					) : (
						<div className="text-center py-4 text-muted">No asset data</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setAssetModal({ show: false, data: null })}
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</MainLayout>
	);
}
