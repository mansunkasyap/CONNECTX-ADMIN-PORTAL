import { Button, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import MainLayout from "../../components/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import { FaPlus, FaTrash } from "react-icons/fa6";
import Toast from "../../components/Toast";
import { userService } from "../../../service/service";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";

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

export default function AddAssets() {
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;
	const previewMode = RowData?.type === "preview";
	const editMode = RowData?.type === "edit";
	const dispatch = useDispatch();
	const spinnerButton = useSelector((state) => state.toggleSpinnerAndDisableButton.show);

	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [assetsTable, setAssetsTable] = useState([]);
	const [errors, setErrors] = useState({});

	// Customer dropdown state
	const [customerData, setCustomerData] = useState({
		customer_id: null,
		customer_code: "",
		company_name: "",
		type: "",
	});

	// Handle input change for specific row
	const handleInputChange = (index, field, value) => {
		const updatedTable = [...assetsTable];
		updatedTable[index] = {
			...updatedTable[index],
			[field]: value,
		};
		setAssetsTable(updatedTable);
	};

	// Handle location dropdown change for specific row
	const handleLocationChange = (index, locationData) => {
		const updatedTable = [...assetsTable];
		updatedTable[index] = {
			...updatedTable[index],
			location_id: locationData.location_id,
			location: locationData.location_name,
		};
		setAssetsTable(updatedTable);
	};

	// Add new empty row
	const handleAddRow = () => {
		const newRow = {
			check_list_name: "",
			asset_id: null,
			// serial_no: "",
			date_of_expiry: null,
			date_of_inspection: null,
			location_id: null,
			location: "",
		};
		setAssetsTable([...assetsTable, newRow]);
	};

	// Delete row
	const handleDelete = (index) => {
		const updatedTable = assetsTable.filter((_, i) => i !== index);
		setAssetsTable(updatedTable);
	};

	const validateForm = () => {
		const newErrors = {};
		if (!customerData.customer_id) newErrors.customer_id = "Customer is required.";
		if (!customerData.type) newErrors.type = "Type is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Validate all rows before submission
	const validateRows = () => {
		for (let i = 0; i < assetsTable.length; i++) {
			const row = assetsTable[i];

			if (!row.check_list_name || row.check_list_name.trim() === "") {
				showToast("error", `Please enter Asset/Service Name in row ${i + 1}`);
				return false;
			}

			// For E&M type customers, require both dates
			if (customerData.type === "E&M") {
				if (!row.date_of_expiry || row.date_of_expiry === "") {
					showToast("error", `Please enter Date Of Expiry in row ${i + 1}`);
					return false;
				}
				if (!row.date_of_inspection || row.date_of_inspection === "") {
					showToast("error", `Please enter Date of Inspection in row ${i + 1}`);
					return false;
				}
			}
		}
		return true;
	};

	const insertForm = async () => {
		if (assetsTable.length === 0) {
			showToast("error", "Please add at least one item");
			return;
		}

		if (!validateForm()) return;
		if (!validateRows()) return;

		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const insertData = {
				customer_id: customerData.customer_id,
				assets: assetsTable.map((item) => ({
					check_list_name: item.check_list_name,
					// serial_no: item.serial_no,
					date_of_expiry: item.date_of_expiry || null,
					date_of_inspection: item.date_of_inspection || null,
					location_id: item.location_id,
					asset_id: item.asset_id,
					location: item.location,
				})),
				type: customerData.type,
			};

			const response = await userService.post(
				"/api/v0/web/upsert_master_assets_bulk",
				insertData
			);

			if (!response) {
				showToast("error", "No response from server. Please try again.");
				return;
			}

			const status = response.status ?? response?.data?.status ?? null;

			if (status === 200) {
				const dataStatus = response?.data?.status;
				if (dataStatus === 400) {
					showToast("error", "Found Duplicate Entries");
				} else {
					showToast("success", "Saved successfully!");
					navigate("/facility/assets-/-services");
				}
			} else {
				const message = response?.data?.message || response?.message || "Unknown error";
				showToast("error", message);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "Error submitting form");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/preview_master_asset",
				{
					asset_id: RowData.id,
				}
			);

			if (response?.data?.data?.preview_master_asset) {
				const assetData = response.data.data.preview_master_asset;

				// Set customer data if available
				if (assetData.company_name) {
					setCustomerData({
						customer_id: assetData.customer_id || null,
						customer_code: assetData.customer_code || "",
						company_name: assetData.company_name || "",
						type: assetData.type || "",
					});
				}

				// Format the single asset into an array with one item for the table
				const formattedItem = {
					asset_id: assetData.asset_id,
					check_list_name: assetData.check_list_name || "",
					// serial_no: assetData.serial_no || "",
					date_of_expiry: assetData.date_of_expiry || null,
					date_of_inspection: assetData.date_of_inspection || null,
					location_id: assetData.location_id || null,
					location: assetData.location || "",
				};

				// Set the table with one row containing the asset data
				setAssetsTable([formattedItem]);
			} else {
				console.error("No data found in response:", response?.data?.message);
			}
		} catch (err) {
			console.error("Error while fetching asset data:", err);
		}
	};

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		}
	}, [RowData?.id]);

	return (
		<>
			<MainLayout isShowing={false} pageName="Add Assets" hasAddButton={false}>
				<Container className="formwrapper mt-0" fluid>
					<Row>
						<Col md={4}>
							{/* Customer Dropdown */}
							<div className="mb-4">
								<AutoCompletedDropdown
									url={"/api/v0/web/web_customer_dropdown"}
									body={{ p_limit: 10, reload: false }}
									handleDataChange={(val) => {
										setCustomerData((prev) => ({
											...prev,
											customer_id: val.customer_id || null,
											customer_code: val.customer_code || "",
											company_name: val.company_name || "",
										}));
										if (val.customer_id) setErrors((prev) => ({ ...prev, customer_id: "" }));
									}}
									valueInput={customerData.company_name}
									objLevel={"company_name"}
									labelName={"Customer *"}
									disabled={editMode}
									error={!!errors.customer_id}
									helperText={errors.customer_id}
								/>
							</div>
						</Col>
						<Col md={4}>
							<div className="mb-4">
								<Form.Group>
									<Form.Select
										value={customerData.type}
										name="type"
										size="md"
										isInvalid={!!errors.type}
										onChange={(e) => {
											setCustomerData((prev) => ({
												...prev,
												type: e.target.value,
											}));
											if (e.target.value) setErrors((prev) => ({ ...prev, type: "" }));
										}}
										disabled={previewMode}
									>
										<option value="">Select Type *</option>
										<option value="E&M">E&M</option>
										<option value="HK">HK</option>
									</Form.Select>
									<Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
								</Form.Group>
							</div>
						</Col>
						<Col md={12} className="mb-4">
							<div className="d-flex justify-content-between align-items-end mb-3">
								<div className="srftitle">
									<h5>Assets</h5>
								</div>
								{!previewMode && (
									<Button
										type="button"
										variant="danger"
										size="sm"
										onClick={handleAddRow}
									>
										<FaPlus /> Add
									</Button>
								)}
							</div>

							<div style={{ overflowX: "auto" }}>
								<Table
									bordered
									responsive
									variant="light"
									size="sm"
									className="mt-3"
								>
									<thead>
										<tr>
											<th style={{ ...thStyle, width: "70px" }}>SR No.</th>
											<th style={{ ...thStyle, minWidth: "180px" }}>
												{customerData.type === "HK" ? "Service Name" : "Asset Name"}{" "}
												<span className="text-danger">*</span>
											</th>
											{customerData.type === "E&M" && (
												<th style={{ ...thStyle, minWidth: "150px" }}>Date Of Expiry</th>
											)}
											{customerData.type === "E&M" && (
												<th style={{ ...thStyle, minWidth: "180px" }}>Date of Inspection</th>
											)}
											<th style={{ ...thStyle, width: "100px" }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{assetsTable.length <= 0 ? (
											<tr>
												<td colSpan={6} className="text-center fs-5">
													No Data - Click "Add List" to add items
												</td>
											</tr>
										) : (
											assetsTable.map((item, index) => (
												<tr key={index}>
													<td>{index + 1}</td>
													{/* <td>
															<AutoCompletedDropdown
																url={
																	"/api/v0/web/list_facility_location_checkpoint"
																}
																body={{
																	limit: 100,
																	customer_id: customerData.customer_id,
																}}
																handleDataChange={(val) => {
																	handleLocationChange(index, val);
																}}
																valueInput={item.location}
																objLevel={"location_name"}
																labelName={""}
																disabled={previewMode}
															/>
														</td> */}
													<td>
														<Form.Control
															size="sm"
															type="text"
															value={item.check_list_name}
															onChange={(e) =>
																handleInputChange(
																	index,
																	"check_list_name",
																	e.target.value
																)
															}
															placeholder="Enter name"
															disabled={previewMode}
														/>
													</td>
													{/* {customerData.type === "E&M" && (
														<td>
															<Form.Control
																size="sm"
																type="text"
																value={item.serial_no}
																onChange={(e) =>
																	handleInputChange(
																		index,
																		"serial_no",
																		e.target.value
																	)
																}
																placeholder="Serial no"
																disabled={previewMode}
															/>
														</td>
													)} */}
													{customerData.type === "E&M" && (
														<td>
															<Form.Control
																size="sm"
																type="date"
																value={item.date_of_expiry}
																onChange={(e) =>
																	handleInputChange(
																		index,
																		"date_of_expiry",
																		e.target.value
																	)
																}
																disabled={previewMode}
															/>
														</td>
													)}
													{customerData.type === "E&M" && (
														<td>
															<Form.Control
																size="sm"
																type="date"
																value={item.date_of_inspection}
																onChange={(e) =>
																	handleInputChange(
																		index,
																		"date_of_inspection",
																		e.target.value
																	)
																}
																disabled={previewMode}
															/>
														</td>
													)}
													<td className="text-center">
														{!previewMode && (
															<FaTrash
																className="text-danger cursor-pointer"
																onClick={() => handleDelete(index)}
																style={{ cursor: "pointer" }}
															/>
														)}
													</td>
												</tr>
											))
										)}
									</tbody>
								</Table>
							</div>

							<Col className="d-flex justify-content-end gap-2 mt-4">
								{!previewMode && (
									<Button
										size="sm"
										variant="none"
										type="button"
										className="commonBtn"
										onClick={insertForm}
										disabled={spinnerButton}
									>
										{spinnerButton ? <Spinner animation="border" variant="dark" size="sm" /> : "Save"}
									</Button>
								)}
								<Button
									size="sm"
									variant="none"
									type="button"
									className="cancelBtn"
									onClick={() => navigate("/facility/assets-/-services")}
								>
									Cancel
								</Button>
							</Col>
						</Col>
					</Row>
				</Container>

				<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
			</MainLayout>
		</>
	);
}
