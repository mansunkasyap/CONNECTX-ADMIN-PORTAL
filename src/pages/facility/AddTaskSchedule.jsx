import {
	Button,
	Col,
	Container,
	Form,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";

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
import MainLayout from "../../components/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import Toast from "../../components/Toast";
import { userService } from "../../../service/service";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import { Autocomplete, TextField } from "@mui/material";
import { CommonController } from "../../components/CommonController";

const MultiSelectDropdown = ({
	url,
	handleDataChange,
	labelName,
	valueInput = [],
	objLevel,
	disabled,
	body = {},
	idKey = "id", // Added idKey for uniqueness
}) => {
	const [listData, setListData] = useState([]);
	const [searchText, setSearchText] = useState("");

	const dropDownList = async (search, body) => {
		try {
			const response = await CommonController.commonApiCallFilter(
				url,
				{ p_search: search, ...body },
				"post",
				"node",
			);
			if (response?.valid) {
				setListData(response.data);
			}
		} catch (error) {
			console.error("Error fetching multi-select dropdown data:", error);
			setListData([]);
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			dropDownList(searchText, body);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchText, body, url]);

	return (
		<Autocomplete
			multiple
			size="small"
			options={listData}
			disabled={disabled}
			getOptionLabel={(option) => option?.[objLevel] || ""}
			fullWidth
			value={valueInput}
			disableCloseOnSelect
			isOptionEqualToValue={(option, value) => {
				// Use idKey for comparison if available, fallback to objLevel or strict equality
				if (!value) return false;
				return option[idKey] === value[idKey];
			}}
			onChange={(_, value) => {
				handleDataChange(value);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					onChange={(e) => setSearchText(e.target.value)}
					label={labelName}
					variant="outlined"
				/>
			)}
		/>
	);
};

export default function AddTaskSchedule() {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const RowData = location.state;
	const previewMode = RowData?.type === "preview";
	const [isEditMode, setIsEditMode] = useState(false);

	const [formData, setformData] = useState({
		location_name: "",
		location_id: "",
		type: "",
		task_id: null,
		guards: [],
	});
	const [customerData, setCustomerData] = useState({
		customer_id: "",
		customer_code: "",
		company_name: "",
	});
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [errors, setErrors] = useState({});
	const [checkListTable, setCheckListTable] = useState([]);
	const [shouldFetchLocation, setShouldFetchLocation] = useState(false);
	const [typeLocked, setTypeLocked] = useState(false);

	// Handle input change for specific row
	const handleInputChange = (index, field, value) => {
		// lock the type select once user starts editing any row input
		if (!typeLocked) setTypeLocked(true);
		const updatedTable = [...checkListTable];
		updatedTable[index] = {
			...updatedTable[index],
			[field]: value,
		};
		setCheckListTable(updatedTable);
	};

	// Handle asset selection from AutoCompleteDropdown
	const handleAssetChange = (index, val) => {
		const updatedTable = [...checkListTable];
		updatedTable[index] = {
			...updatedTable[index],
			asset_name: val.asset_name,
			asset_id: val.id || val.asset_id,
			asset_display_name: val.asset_name,
		};
		setCheckListTable(updatedTable);
	};

	// Add new empty row (only for HK type)
	const handleAddRow = () => {
		const newRow = {
			asset_name: "",
			asset_id: "",
			asset_display_name: "",
			frequency: "",
			frequency_times: null,
			service_type: "",
		};
		setCheckListTable([...checkListTable, newRow]);
	};

	// Delete row (only for HK type)
	const handleDelete = (index) => {
		const updatedTable = checkListTable.filter((_, i) => i !== index);
		setCheckListTable(updatedTable);
	};

	const validateForm = () => {
		const newErrors = {};
		if (!customerData.customer_id)
			newErrors.customer_id = "Customer is required.";
		if (!formData.location_id) newErrors.location_id = "Location is required.";
		if (!formData.type) newErrors.type = "Type is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Validate all rows before submission
	const validateRows = () => {
		for (let i = 0; i < checkListTable.length; i++) {
			const row = checkListTable[i];
			const rowNum = i + 1;

			if (!row.asset_id) {
				showToast("error", `Please select an Asset in row ${rowNum}`);
				return false;
			}

			if (!row.frequency) {
				showToast("error", `Please select Frequency in row ${rowNum}`);
				return false;
			}

			if (row.frequency === "DAILY" && !row.frequency_times) {
				showToast(
					"error",
					`Please enter Daily Frequency times in row ${rowNum}`,
				);
				return false;
			}
		}
		return true;
	};

	// Fetch E&M checklist data based on location_id
	const fetchEMChecklistData = async (customerId, selectedType) => {
		try {
			const response = await userService.post(
				"/api/v0/web/list_master_asset_facility",
				{
					customer_id: customerId,
					type: selectedType,
				},
			);

			if (response?.data?.valid && response?.data?.data?.length) {
				const items = response.data.data;
				const formattedItems = items.map((item) => ({
					asset_name: item.asset_name || "",
					asset_id: item.asset_id || "",
					asset_display_name: item.asset_name || "",
					frequency: item.frequency || "",
					frequency_times: item.frequency_times
						? Number(item.frequency_times)
						: null,
					service_type: item.service_type || "",
				}));
				setCheckListTable(formattedItems);
			} else {
				setCheckListTable([]);
			}
		} catch (err) {
			console.error("Error fetching E&M checklist data:", err);
			setCheckListTable([]);
		}
	};

	// Handle type change
	const handleTypeChange = (selectedType) => {
		setformData({ ...formData, type: selectedType });

		if (selectedType) {
			fetchEMChecklistData(customerData.customer_id, selectedType);
		} else {
			setCheckListTable([]);
		}
		// if (selectedType === "E&M" && formData.location_id) {
		// 	// Fetch E&M data when E&M is selected
		// 	fetchEMChecklistData(formData.location_id);
		// } else if (selectedType === "HK") {
		// 	// Clear table for HK
		// 	setCheckListTable([]);
		// }
	};

	// Handle location change
	const handleLocationChange = (val) => {
		const newLocationId = val.location_id;
		setformData({
			...formData,
			location_name: val.location_name,
			location_id: newLocationId,
		});
		// If E&M is already selected, fetch data for new location
		if (formData.type === "E&M") {
			fetchEMChecklistData(customerData.customer_id, formData.type);
		}
	};

	const insertForm = async () => {
		if (checkListTable.length === 0) {
			showToast("error", "Please add at least one item");
			return;
		}

		if (!validateForm()) return;
		if (!validateRows()) return;

		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const insertData = {
				...formData,
				...customerData,
				items: checkListTable.map((item) => ({
					frequency: item.frequency,
					service_type: item.service_type,
					frequency_times:
						item.frequency === "DAILY"
							? item.frequency_times !== ""
								? Number(item.frequency_times)
								: null
							: null,
					asset_name: item.asset_name,
					asset_id: item.asset_id,
				})),
			};

			const response = await userService.post(
				"/api/v0/web/insert_or_update_facility_task_schedule_and_items",
				insertData,
			);

			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				navigate("/facility/task-schedule");
			} else {
				const msg = response.data.message || "";
				const errorMessage = msg.includes(
					"duplicate key value violates unique constraint",
				)
					? "A task schedule with the same details already exists."
					: msg || "Failed to save.";
				showToast("error", errorMessage);
			}
		} catch (err) {
			console.error("error", err);
			showToast("error", "Error submitting form");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/preview_facility_task_schedule",
				{
					task_id: RowData.id,
				},
			);

			if (response?.data?.data?.length) {
				const value = response.data.data[0];
				const previewData = value.preview_facility_task_schedule;

				setIsEditMode(true);

				// Update formData with location and type
				let updatedFormData = { ...formData };

				// Set location_name and location_id
				if (previewData.location_name) {
					updatedFormData.location_name = previewData.location_name;
				}

				if (previewData.location_id) {
					updatedFormData.location_id = previewData.location_id;
				}

				// Set type
				if (previewData.type) {
					updatedFormData.type = previewData.type;
				}

				// Set task_id for update
				if (previewData.task_id) {
					updatedFormData.task_id = previewData.task_id;
				}

				updatedFormData.p_action = "update";
				setformData(updatedFormData);

				// Update customer data if available
				if (previewData.customer_id) {
					setCustomerData({
						customer_id: previewData.customer_id || "",
						customer_code: "",
						company_name: previewData.customer_name || "",
					});

					// If guards are present in preview data, set them
					if (previewData.guards) {
						updatedFormData.guards = previewData.guards;
					}
					setformData(updatedFormData);
					// Enable location fetch for preview/edit mode
					setShouldFetchLocation(true);
				}

				// Extract and format items for the table
				const items = previewData.items || [];
				const formattedItems = items.map((item) => ({
					asset_name: item.asset_name || "",
					asset_id: item.item_id || "",
					asset_display_name: item.asset_name || "",
					frequency: item.frequency || "",
					frequency_times: item.frequency_times || null,
					service_type: item.service_type || "",
				}));

				setCheckListTable(formattedItems);
			} else {
				console.error("No data found in response:", response?.data?.message);
			}
		} catch (err) {
			console.error("Error while fetching data:", err);
		}
	};

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		}
	}, [RowData?.id]);

	// compute table column count for dynamic colspan (SR + Assets(if E&M) + Service + Frequency + DailyFrequency(if not E&M) + Action(if HK))
	const tableColCount =
		1 +
		(formData.type === "E&M" ? 2 : 0) +
		1 +
		1 +
		(formData.type === "E&M" ? 0 : 1) +
		(formData.type === "HK" && !previewMode ? 1 : 0);

	return (
		<>
			<MainLayout
				isShowing={false}
				pageName="Add Task Schedule"
				hasAddButton={false}
			>
				<Container className="formwrapper mt-0" fluid>
					<Row>
						<Col md={3}>
							<AutoCompletedDropdown
								url={"/api/v0/web/web_customer_dropdown"}
								body={{ p_limit: 10, reload: false }}
								handleDataChange={(val) => {
									setCustomerData({
										customer_id: val.customer_id || null,
										customer_code: val.customer_code || "",
										company_name: val.company_name || "",
									});
									setformData({ ...formData, type: "", guards: [] });
									setCheckListTable([]);
									setShouldFetchLocation(true);
									if (val.customer_id)
										setErrors((prev) => ({ ...prev, customer_id: "" }));
								}}
								valueInput={customerData.company_name}
								objLevel={"company_name"}
								labelName={"Customer *"}
								disabled={isEditMode || formData.location_name}
								error={!!errors.customer_id}
								helperText={errors.customer_id}
							/>
						</Col>
						<Col md={3}>
							{shouldFetchLocation && customerData.customer_id ? (
								<AutoCompletedDropdown
									url={"/api/v0/web/list_facility_location_checkpoint"}
									body={{ limit: 100, customer_id: customerData.customer_id }}
									handleDataChange={(val) => {
										handleLocationChange(val);
										if (val.location_id)
											setErrors((prev) => ({ ...prev, location_id: "" }));
									}}
									valueInput={formData.location_name}
									objLevel={"location_name"}
									labelName={"Location *"}
									disabled={isEditMode || formData.location_name}
									error={!!errors.location_id}
									helperText={errors.location_id}
								/>
							) : (
								<Form.Group>
									<Form.Control
										size="md"
										placeholder="Select Customer first"
										disabled
										isInvalid={!!errors.location_id}
									/>
									{errors.location_id && (
										<Form.Control.Feedback type="invalid">
											{errors.location_id}
										</Form.Control.Feedback>
									)}
								</Form.Group>
							)}
						</Col>
						<Col md={3}>
							<Form.Group>
								<Form.Select
									value={formData.type}
									name="type"
									size="md"
									isInvalid={!!errors.type}
									onChange={(e) => {
										handleTypeChange(e.target.value);
										if (e.target.value)
											setErrors((prev) => ({ ...prev, type: "" }));
									}}
								>
									<option value="">Select Type *</option>
									<option value="E&M">E&M</option>
									<option value="HK">HK</option>
								</Form.Select>
								<Form.Control.Feedback type="invalid">
									{errors.type}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
						<Col md={12} className="mt-4">
							{customerData.customer_id && (
								<Form.Group>
									<MultiSelectDropdown
										url={"/api/v0/web/guard_list"}
										handleDataChange={(val) => {
											setformData((prev) => ({
												...prev,
												guards: val,
											}));
										}}
										valueInput={formData.guards}
										objLevel={"full_name"}
										idKey={"guard_id"}
										labelName={"Select Guards"}
										body={{ customer_id: customerData.customer_id }}
										disabled={previewMode}
									/>
								</Form.Group>
							)}
						</Col>
					</Row>
					<Row className="mt-4">
						<Col md={12}>
							<div className="d-flex justify-content-between align-items-end mb-3">
								<div className="srftitle">
									<h5>Checklist Items</h5>
								</div>
								{!previewMode && (
									<Button
										type="button"
										variant="danger"
										size="sm"
										onClick={handleAddRow}
									>
										<FaPlus /> Add List
									</Button>
								)}
							</div>

							<div style={{ overflowX: "auto" }}>
								<Table
									bordered
									responsive
									variant="light"
									size="sm"
									className="mt-1"
								>
									<thead>
										<tr>
											<th style={{ ...thStyle, width: "70px" }}>SR No.</th>
											<th style={{ ...thStyle, minWidth: "200px" }}>Assets</th>
											<th style={{ ...thStyle, minWidth: "200px" }}>
												Frequency
											</th>
											<th style={{ ...thStyle, minWidth: "150px" }}>
												Daily Frequency{" "}
												{formData.type === "HK" ? "(in Minutes)" : "(Times)"}
											</th>
											<th style={{ ...thStyle, minWidth: "80px" }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{checkListTable.length <= 0 ? (
											<tr>
												<td
													colSpan={tableColCount + 1}
													className="text-center fs-5"
												>
													{formData.type === "E&M"
														? "Please select a Location to load checklist items"
														: "No Data - Click 'Add List' to add items"}
												</td>
											</tr>
										) : (
											checkListTable.map((item, index) => {
												return (
													<tr key={index}>
														<td>{index + 1}</td>
														<td>
															<AutoCompletedDropdown
																url={"/api/v0/web/list_master_asset_facility"}
																body={{
																	limit: 10,
																	customer_id: customerData.customer_id,
																	type: formData.type,
																}}
																handleDataChange={(val) =>
																	handleAssetChange(index, val)
																}
																valueInput={
																	item.asset_display_name || item.asset_name
																}
																objLevel={"asset_name"}
																labelName={""}
																disabled={previewMode}
															/>
														</td>
														{/* <td>
															<Form.Control
																size="sm"
																value={item.asset_name || ""}
																onChange={(e) =>
																	handleInputChange(
																		index,
																		"service_type",
																		e.target.value
																	)
																}
																disabled={previewMode}
																required
																placeholder="Enter Service..."
															/>
														</td> */}
														<td>
															<Form.Select
																size="sm"
																value={item.frequency || ""}
																onChange={(e) =>
																	handleInputChange(
																		index,
																		"frequency",
																		e.target.value,
																	)
																}
																disabled={previewMode}
																required
															>
																<option value="">-Select-</option>
																<option value="DAILY">DAILY</option>
																<option value="WEEKLY">WEEKLY</option>
																<option value="MONTHLY">MONTHLY</option>
																<option value="QUARTERLY">QUARTERLY</option>
																<option value="SEMI ANNUALLY">
																	SEMI ANNUALLY
																</option>
																<option value="ANNUALLY">ANNUALLY</option>
															</Form.Select>
														</td>
														<td>
															{item.frequency === "DAILY" ? (
																<Form.Control
																	size="sm"
																	type="number"
																	value={item.frequency_times || ""}
																	onChange={(e) =>
																		handleInputChange(
																			index,
																			"frequency_times",
																			e.target.value
																				? Number(e.target.value)
																				: null,
																		)
																	}
																	disabled={previewMode}
																	placeholder={
																		formData.type === "HK"
																			? "Enter Minutes..."
																			: "Enter Times..."
																	}
																	min="0"
																/>
															) : (
																""
															)}
														</td>
														{/* {formData.type !== "E&M" && (
													)} */}
														<td className="text-center">
															<FaTrash
																className="text-danger cursor-pointer"
																onClick={() => handleDelete(index)}
																style={{ cursor: "pointer" }}
															/>
														</td>
													</tr>
												);
											})
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
										{spinnerButton ? (
											<Spinner animation="border" variant="dark" size="sm" />
										) : (
											"Save"
										)}
									</Button>
								)}
								<Button
									size="sm"
									variant="none"
									type="button"
									className="cancelBtn"
									onClick={() => navigate("/facility/task-schedule")}
								>
									Cancel
								</Button>
							</Col>
						</Col>
					</Row>
				</Container>

				<Toast
					show={toast.show}
					type={toast.type}
					message={toast.message}
					onClose={hideToast}
				/>
			</MainLayout>
		</>
	);
}
