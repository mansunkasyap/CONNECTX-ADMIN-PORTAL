import {
	Button,
	Col,
	Container,
	Form,
	Modal,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";
import MainLayout from "../../../components/MainLayout";
import { Checkbox, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { userService } from "../../../../service/service";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../../Redux/Modals";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import PickAccessoriesGrid from "../../../components/PickAccessoriesGrid";
import config from "../../../../service/config";
import { withStyles } from '@mui/styles';
import Toast from "../../../components/Toast";


const StyledTableCell = withStyles(() => ({
	head: {
		backgroundColor: "#1e293b",
		color: "#fff",
		fontWeight: 600,
		fontSize: 12,
		letterSpacing: "0.04em",
		textTransform: "uppercase",
		whiteSpace: "nowrap",
		padding: "10px 16px",
	},
	body: {
		fontSize: 13,
		padding: "6px 16px",
	},
}))(TableCell);

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

function AddCustomerLog() {
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;
	const dispatch = useDispatch();
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show
	);
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [formData, setFormData] = useState({
		customer_group_id: null,
		customer_group_name: "",
		email: "",
		mobile: "",
		customer_ids: [{}],
		users: [],
	});
	//
	const [isEditUser, setIsEditUser] = useState(false);
	const [editUserIndex, setEditUserIndex] = useState(null);
	const [customerData, setCustomerData] = useState([]);
	const [showCustomerData, setShowCustomerData] = useState(false);
	const initialUserFormData = {
		user_name: "",
		user_code: "",
		address: "",
		city: "",
		pin: "",
		state: "",
		mobile: "",
		password: "",
		email: "",
		type: "",
		disable: false,
	};
	const [errors, setErrors] = useState({});
	const validateForm = () => {
		const newErrors = {};

		if (!userFormData.user_code?.trim())
			newErrors.user_code = 'User code is required.';

		if (!userFormData.user_name?.trim())
			newErrors.user_name = 'User name is required.';

		if (!userFormData.mobile?.trim() || !/^\d{10}$/.test(userFormData.mobile))
			newErrors.mobile = 'Valid 10-digit mobile number is required.';

		if (
			!userFormData.email?.trim() ||
			!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userFormData.email)
		)
			newErrors.email = 'Valid email address is required.';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};


	const [filteredArray, setFilteredArray] = useState([]);
	const [userFormData, setuserFormData] = useState(initialUserFormData);
	const [userDataTable, setuserDataTable] = useState([]);
	const [showUserListData, setShowUserListData] = useState(false);
	const [pickCustomerId, setpickCustomerId] = useState([]);

	function handleUserFormDataChange(event) {
		setuserFormData({
			...userFormData,
			[event.target.name]: event.target.value,
		});
	}
	const handleQrCodeChange = (event) => {
		const value = event.target.value;
		setFormData((prevValues) => ({
			...prevValues,
			qrcode: value,
			checkpoint_code: value,
		}));
	};

	const CustomerColumnGrid = useMemo(
		() => [
			{
				accessorKey: "customer_code",
				header: "Customer Code",
				enableColumnFilter: false,
				size: 120,
			},

			{
				accessorKey: "company_name",
				header: "Company Name",
				enableColumnFilter: false,
				size: 150,
			},

			{
				accessorKey: "display_name",
				header: "Display Name",
				enableColumnFilter: false,
				size: 150,
			},
		],
		[]
	);

	const handlePickDataCustomer = (selectedRows, pickCusId) => {
		const rowsWithQty = selectedRows.map((row) => ({ ...row, qty: "" }));
		const allData = [...customerData, ...rowsWithQty];
		const customerMap = new Map(
			allData.map((customer) => [customer.customer_id, customer])
		);
		const mergedData = Array.from(customerMap.values());
		setCustomerData(mergedData);
		setpickCustomerId(pickCusId);
	};
	const handleRemoveCustomerData = (index) => {
		const latest = [...customerData];
		latest.splice(index, 1);
		setCustomerData(latest);
	};

	const handleDeleteUserData = (index) => {
		const latest = [...userDataTable];
		latest.splice(index, 1);
		setuserDataTable(latest);
	};

	// function handleSubmitUserForm() {
	// 	setuserDataTable((prev) => [...prev, userFormData]);
	// 	setuserFormData(initialUserFormData);
	// 	setShowUserListData(false);
	// }
	const onUserRightChange = (obj, key, checked) => {
		setFilteredArray((prev) =>
			prev.map((item) =>
				item.transaction_id === obj.transaction_id
					? { ...item, [key]: checked }
					: item
			)
		);
	};

	const handleSubmitUserForm = () => {
		if (!validateForm()) {
			return; // Stop submission if validation fails
		}
		if (isEditUser) {
			// Update mode
			const updatedUsers = [...userDataTable];
			updatedUsers[editUserIndex] = userFormData;
			setuserFormData({});
			setuserDataTable(updatedUsers);
			setIsEditUser(false);
			setEditUserIndex(null);
			setShowUserListData(false);
		} else {

			setuserDataTable([...userDataTable, userFormData]);
			setuserFormData({});
			setShowUserListData(false);
		}
	};


	const handleEditUserData = (index) => {
		const userToEdit = userDataTable[index];
		setuserFormData(userToEdit);
		setEditUserIndex(index);
		setIsEditUser(true);
		setShowUserListData(true);
	};

	//insert funtion ++++-============
	const insertForm = async () => {
		dispatch(toggleSpinnerAndDisableButton(true));
		const updatedFormData = {
			customer_group_id: formData.customer_group_id,
			customer_group_name: formData.customer_group_name,
			email: formData.email,
			mobile: formData.mobile,
			customers: customerData,
			users: userDataTable,
			userRight: filteredArray,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/insert_or_update_customer_group",
				{ group_data: updatedFormData }
			); 

			if (response.status === 200 && response.data.success) {
				showToast("success", "Customer group saved successfully!");
				setFormData({});
				setCustomerData([]);
				setuserFormData([]);
				setTimeout(() => {
					navigate("/customers/customer-group");
				}, 1500);
			} else {
				showToast("error", response?.data?.message || "Something went wrong. Please try again.");
			}
		} catch (error) {
			console.error("❌ Error saving Customer Group:", error);
			showToast("error", "Something went wrong. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	const getUserRightList = async (id) => {
		try {
			const response = await userService.get(`/api/v0/web/app_user_rights_browse`)
			if (response.status === 200 && response.data.success) {
				setFilteredArray(response.data.data);
			}
		} catch (err) {
			console.error("❌ Error while fetching data:", err);
		}

	};


	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		} else {
			getUserRightList();

		}
	}, [RowData]);

	const handleEdit = async () => {
		try {
			const response = await userService.post("/api/v0/web/preview_customer_group", {
				group_id: RowData.id,
			});

			const previewGroupData = response?.data.data;

			console.log("👀 Preview Group Data:", previewGroupData);

			if (!previewGroupData) {
				console.warn("No preview data found");
				return;
			}

			if (previewGroupData.group) {
				const tempData = { ...formData };
				const group = previewGroupData?.group;

				for (let key in tempData) {
					if (group.hasOwnProperty(key)) {
						tempData[key] = group[key];
					}
				}
				setFormData(tempData);
			}
			setuserDataTable(previewGroupData?.users);
			setCustomerData(previewGroupData?.customers || []);
			setFilteredArray(previewGroupData?.user_rights || []);

		} catch (err) {
			console.error("❌ Error while fetching data:", err);
		}
	};
	return (
		<MainLayout isShowing={false} pageName="Add Customer Group" hasAddButton={false}>
			{/* 3-zone card: header label / scrollable content / sticky footer */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "calc(100vh - 130px)",
					background: "#fff",
					borderRadius: 10,
					border: "1px solid #f1f3f5",
					boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
					overflow: "hidden",
				}}
			>
				{/* Top label bar */}
				<div
					style={{
						flexShrink: 0,
						padding: "14px 20px",
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
						Customer Group Information
					</p>
				</div>

				{/* Scrollable form content */}
				<div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
					<Form>
						{/* ── Basic fields ── */}
						<Row className="g-3 mb-4">
							<Col md={4}>
								<TextField
									size="small"
									label="Customer Group Name"
									variant="outlined"
									fullWidth
									disabled={RowData?.type === "edit"}
									name="customer_group_name"
									value={formData.customer_group_name}
									onChange={(e) =>
										setFormData({ ...formData, customer_group_name: e.target.value })
									}
								/>
							</Col>
							<Col md={4}>
								<TextField
									size="small"
									label="Mobile"
									variant="outlined"
									fullWidth
									name="mobile"
									disabled={RowData?.type === "edit"}
									value={formData.mobile}
									onChange={(e) =>
										setFormData({ ...formData, mobile: e.target.value })
									}
								/>
							</Col>
							<Col md={4}>
								<TextField
									size="small"
									label="Email"
									variant="outlined"
									fullWidth
									name="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
								/>
							</Col>
						</Row>

						{/* ── Customers List ── */}
						<div style={{ marginBottom: 24 }}>
							<div className="d-flex justify-content-between align-items-center mb-2">
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
									Customers List
									{customerData.length > 0 && (
										<span style={{ marginLeft: 8, color: "#94a3b8", fontWeight: 400 }}>
											({customerData.length})
										</span>
									)}
								</p>
								{RowData?.type !== "Preview" && (
									<button
										type="button"
										className="primary-btn btn-sm btn text-white"
										onClick={() => setShowCustomerData(true)}
									>
										<FaPlus /> Add Customers
									</button>
								)}
							</div>
							<div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
								<Table bordered={false} size="sm" style={{ marginBottom: 0, verticalAlign: "middle" }}>
									<thead>
										<tr>
											<th style={thStyle}>Customer Code</th>
											<th style={thStyle}>Company Name</th>
											{RowData?.type !== "Preview" && <th style={{ ...thStyle, width: 60, textAlign: "center" }}>Action</th>}
										</tr>
									</thead>
									<tbody>
										{customerData.length <= 0 ? (
											<tr>
												<td colSpan={3} style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
													No customers added yet
												</td>
											</tr>
										) : (
											customerData.map((customerItem, index) => (
												<tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{customerItem.customer_code}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{customerItem.company_name}</td>
													{RowData?.type !== "Preview" && (
														<td style={{ textAlign: "center", padding: "7px 12px" }}>
															<FaTrash
																className="text-danger cursor-pointer"
																onClick={() => handleRemoveCustomerData(index)}
															/>
														</td>
													)}
												</tr>
											))
										)}
									</tbody>
								</Table>
							</div>
						</div>

						{/* ── Users ── */}
						<div style={{ marginBottom: 24 }}>
							<div className="d-flex justify-content-between align-items-center mb-2">
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
									Users
									{userDataTable.length > 0 && (
										<span style={{ marginLeft: 8, color: "#94a3b8", fontWeight: 400 }}>
											({userDataTable.length})
										</span>
									)}
								</p>
								{RowData?.type !== "Preview" && (
									<button
										type="button"
										className="primary-btn btn-sm btn text-white"
										onClick={() => setShowUserListData(true)}
									>
										<FaPlus /> Add User
									</button>
								)}
							</div>
							<div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "auto" }}>
								<Table bordered={false} size="sm" style={{ marginBottom: 0, verticalAlign: "middle", minWidth: 900 }}>
									<thead>
										<tr>
											<th style={thStyle}>Username</th>
											<th style={thStyle}>User Code</th>
											<th style={thStyle}>Mobile</th>
											<th style={thStyle}>Password</th>
											<th style={thStyle}>Email</th>
											<th style={thStyle}>Address</th>
											<th style={thStyle}>City</th>
											<th style={thStyle}>Pin</th>
											<th style={thStyle}>State</th>
											<th style={thStyle}>Type</th>
											<th style={thStyle}>Disable</th>
											<th style={{ ...thStyle, textAlign: "center" }}>Action</th>
										</tr>
									</thead>
									<tbody>
										{userDataTable?.length <= 0 ? (
											<tr>
												<td colSpan={12} style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
													No users added yet
												</td>
											</tr>
										) : (
											userDataTable?.map((item, index) => (
												<tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.user_name}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.user_code}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.mobile}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.password}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.email}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.address}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.city}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.pin}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.state}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>{item.type}</td>
													<td style={{ fontSize: 13, padding: "7px 12px" }}>
														<span
															style={{
																fontSize: 11,
																fontWeight: 600,
																padding: "2px 8px",
																borderRadius: 4,
																background: item.disable ? "#fee2e2" : "#dcfce7",
																color: item.disable ? "#dc2626" : "#16a34a",
															}}
														>
															{item.disable ? "Disabled" : "Enabled"}
														</span>
													</td>
													<td style={{ textAlign: "center", padding: "7px 12px" }}>
														<FaEdit
															className="text-primary cursor-pointer me-2"
															onClick={() => handleEditUserData(index)}
														/>
														<FaTrash
															className="text-danger cursor-pointer"
															onClick={() => handleDeleteUserData(index)}
														/>
													</td>
												</tr>
											))
										)}
									</tbody>
								</Table>
							</div>
						</div>

						{/* ── User Rights ── */}
						<div>
							<p
								style={{
									margin: "0 0 8px 0",
									fontSize: 11,
									fontWeight: 600,
									letterSpacing: "0.07em",
									textTransform: "uppercase",
									color: "#64748b",
								}}
							>
								User Rights
								{filteredArray.length > 0 && (
									<span style={{ marginLeft: 8, color: "#94a3b8", fontWeight: 400 }}>
										({filteredArray.length})
									</span>
								)}
							</p>
							<div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
								<TableContainer>
									<Table stickyHeader size="small" aria-label="user rights table">
										<TableHead>
											<TableRow>
												<StyledTableCell style={{ minWidth: 200 }}>Transaction</StyledTableCell>
												<StyledTableCell style={{ minWidth: 150 }}>Module</StyledTableCell>
												<StyledTableCell align="center" style={{ minWidth: 80 }}>View</StyledTableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{filteredArray.length === 0 ? (
												<TableRow>
													<TableCell colSpan={3} align="center" style={{ padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>
														No permissions loaded
													</TableCell>
												</TableRow>
											) : (
												filteredArray.map((menu, index) => (
													<TableRow
														key={index}
														sx={{
															backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc",
															"&:hover": { backgroundColor: "#f1f5f9" },
															"&:last-child td, &:last-child th": { border: 0 },
														}}
													>
														<StyledTableCell style={{ fontWeight: 500, color: "#1e293b", textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
															{menu.transaction_code}
														</StyledTableCell>
														<StyledTableCell style={{ color: "#64748b", textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
															{menu.module_name}
														</StyledTableCell>
														<TableCell align="center" style={{ padding: "2px 16px" }}>
															<Checkbox
																size="small"
																onChange={(event) => onUserRightChange(menu, "can_view", event.target.checked)}
																color="primary"
																checked={menu.can_view === true}
															/>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</div>
						</div>
					</Form>
				</div>

				{/* Sticky bottom bar — Submit / Cancel */}
				{RowData?.type !== "preview" && (
					<div
						style={{
							flexShrink: 0,
							padding: "12px 20px",
							borderTop: "1px solid #f1f3f5",
							background: "#fff",
							display: "flex",
							gap: 8,
						}}
					>
						<Button
							size="sm"
							variant="none"
							className="commonBtn"
							onClick={insertForm}
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
							onClick={() => navigate("/customers/customer-group")}
						>
							Cancel
						</Button>
					</div>
				)}
			</div>

			{/* Add User Modal */}
			<Modal size="lg" show={showUserListData} className="modalwrapper">
				<Modal.Body>
					<Container fluid>
						<Form>
							<Row className="g-3">
								<Col md={12}>
									<p
										style={{
											margin: 0,
											fontSize: 15,
											fontWeight: 600,
											color: "#1e293b",
										}}
									>
										{isEditUser ? "Edit User" : "Add User"}
									</p>
								</Col>
								<Col md={6}>
									<Form.Control
										placeholder="Enter username*"
										type="text"
										name="user_name"
										value={userFormData.user_name}
										onChange={handleUserFormDataChange}
										isInvalid={!!errors.user_name}
									/>
									<Form.Control.Feedback type="invalid">{errors.user_name}</Form.Control.Feedback>
								</Col>
								<Col md={6}>
									<Form.Control
										placeholder="Enter user code*"
										type="text"
										name="user_code"
										value={userFormData.user_code}
										onChange={handleUserFormDataChange}
										isInvalid={!!errors.user_code}
									/>
									<Form.Control.Feedback type="invalid">{errors.user_code}</Form.Control.Feedback>
								</Col>
								<Col md={6}>
									<Form.Control
										placeholder="Enter email*"
										type="email"
										name="email"
										value={userFormData.email}
										onChange={handleUserFormDataChange}
										isInvalid={!!errors.email}
									/>
									<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
								</Col>
								<Col md={6}>
									<Form.Control
										placeholder="Enter mobile number*"
										type="tel"
										name="mobile"
										value={userFormData.mobile}
										onChange={handleUserFormDataChange}
										isInvalid={!!errors.mobile}
									/>
									<Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
								</Col>
								<Col md={6}>
									<Form.Control placeholder="Enter Password" type="text" name="password" value={userFormData.password} onChange={handleUserFormDataChange} />
								</Col>
								<Col md={6}>
									<Form.Control placeholder="Enter address" type="text" name="address" value={userFormData.address} onChange={handleUserFormDataChange} />
								</Col>
								<Col md={6}>
									<Form.Control placeholder="Enter city" type="text" name="city" value={userFormData.city} onChange={handleUserFormDataChange} />
								</Col>
								<Col md={6}>
									<Form.Control placeholder="Enter state" type="text" name="state" value={userFormData.state} onChange={handleUserFormDataChange} />
								</Col>
								<Col md={6}>
									<Form.Control placeholder="Enter pin" type="text" name="pin" value={userFormData.pin} onChange={handleUserFormDataChange} />
								</Col>
								<Col md={6}>
									<Form.Select name="type" value={userFormData.type} onChange={handleUserFormDataChange}>
										<option value="">Select type</option>
										<option value="Admin">Admin</option>
										<option value="User">User</option>
									</Form.Select>
								</Col>
								<Col md={6}>
									<Form.Check
										type="switch"
										id="disable"
										name="disable"
										label="Disable User"
										onChange={(event) => setuserFormData({ ...userFormData, disable: event.target.checked })}
										checked={userFormData.disable}
									/>
								</Col>
								<Col md={12}>
									<div style={{ borderTop: "1px solid #f1f3f5", paddingTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
										<Button size="sm" variant="none" className="cancelBtn" onClick={() => setShowUserListData(false)}>
											Cancel
										</Button>
										<Button size="sm" variant="none" className="commonBtn" type="button" onClick={handleSubmitUserForm}>
											{isEditUser ? "Update" : "Add"}
										</Button>
									</div>
								</Col>
							</Row>
						</Form>
					</Container>
				</Modal.Body>
			</Modal>

			{/* Pick Customer Modal */}
			<Modal show={showCustomerData} size="xl" className="modalwrapper">
				<Modal.Body className="bg-light pt-3 modalbrowsegrid">
					<PickAccessoriesGrid
						url={"/api/v0/web/pick_customer_in_customer_group"}
						columns={CustomerColumnGrid}
						close={setShowCustomerData}
						data={handlePickDataCustomer}
						id="customer_id"
						pickId={pickCustomerId}
						selectType={true}
						pickModalTitle="Customer List"
						resize={false}
					/>
				</Modal.Body>
			</Modal>
		<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
		</MainLayout>
	);
}

export default AddCustomerLog;
