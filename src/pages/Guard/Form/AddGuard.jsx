/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../../components/MainLayout";
import {
	Checkbox,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../../../service/service";
import DatePicker from "react-datepicker";
import { AutoCompletedDropdown } from "../../../components/AutoCompleteDropdown";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../../Redux/Modals";
import Toast from "../../../components/Toast";
import TimeRange from "../../../components/TimeRange";
import { format } from "date-fns";
import moment from "moment";
function AddGuard() {
	const location = useLocation();
	const navigate = useNavigate();
	//added start
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const dispatch = useDispatch();
	const [errors, setErrors] = useState({});
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	//added end
	const RowData = location.state;

	const [formData, setFormData] = useState({
		p_action: "INSERT",
		guard_id: 0,
		// p_emp_code: "",
		// p_full_name: "",
		designation_id: null,
		gender: "",
		marital_status: "",
		mobile: "",
		email: "",
		father_name: "",
		date_of_joining: new Date(),
		date_of_leaving: new Date(),
		date_of_birth: new Date(),
		date_of_entry: new Date(),
		date_of_approval: new Date(),
		bank_name: "",
		account_no: "",
		ifsc_code: "",
		pf_branch: "",
		pf_no: "",
		esi_branch: "",
		esi_no: "",
		pf_deduct: false,
		pt_deduct: false,
		esi_deduct: false,
		address: "",
		city: "",
		state: "",
		country: "",
		pin: "",
		p_address: "",
		p_city: "",
		p_state: "",
		p_country: "",
		uan_no: "",
		adhar_no: "",
		pan_no: "",
		p_pin: "",
		customer_id: 15,
		emp_status: null,
		sahyog_member: false,
		branch_manager_id: null,
		branch_manager: "",
		ops_manager_id: null,
		area_manager_id: null,
		area_manager_name: "",
		password: "",
		profile_pic: "",
		customer_code: "",
		company_name: "",
		full_name: "",
		designation: "",
		emp_code: "",
		branch_manager_name: "",
		ops_manager_name: "",
		facility_type: "",
		vertical: "",
		// shift_from: "",
		// shift_to: ""
	});
	const getDuplicateMessage = (message = "") => {
		const msg = message.toLowerCase();
		if (msg.includes("email")) return "This email address is already registered.";
		if (msg.includes("mobile") || msg.includes("phone")) return "This mobile number is already registered.";
		if (msg.includes("emp")) return "This employee code is already registered.";
		return "A record with these details already exists.";
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.emp_code)
			newErrors.emp_code = "Employee Code is required.";
		if (!formData.full_name)
			newErrors.full_name = "Name is required.";
		if (!formData.father_name)
			newErrors.father_name = "Father Name is required.";
		if (!formData.gender || formData.gender.length === 0)
			newErrors.gender = "Gender is required.";
		if (!/^\d{10}$/.test(formData.mobile))
			newErrors.mobile = "Enter a 10-digit mobile number.";
		const dropdownFields = [
			{ field: "designation", label: "Designation" },
			{ field: "customer_code", label: "Customer" },
			// { field: "branch_manager_name", label: "Branch Manager" },
			// { field: "area_manager_name", label: "Area Manager" },
		];
		dropdownFields.forEach(({ field, label }) => {
			const value = formData[field];
			if (!value || value.toString().trim() === "") {
				newErrors[field] = `${label} is required.`;
			}
		});
		if (!formData.vertical)
			newErrors.vertical = "Vertical is required.";
		if (formData.vertical === "Facility" && !formData.facility_type)
			newErrors.facility_type = "Facility Type is required.";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChangeFormData = (event) => {
		const { name, type, value, checked } = event.target;
		if (name === "p_mobile" && value.length > 10) return;

		const updatedData = {
			...formData,
			[name]: type === "checkbox" ? checked : value,
		};

		// Clear facility_type when vertical is changed to anything other than "Facility"
		if (name === "vertical" && value !== "Facility") {
			updatedData.facility_type = "";
		}

		setFormData(updatedData);
	};

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_guard_preview",
				{
					guard_id: RowData.id,
					p_action: "UPDATE",
				},
			);
			if (response.data.valid) {
				const value = response.data.data[0];
				let tempData = { ...formData };
				for (let key in tempData) {
					if (value.hasOwnProperty(key)) {
						tempData[key] = value[key];
					}
				}
				tempData.p_action = "UPDATE";
				setFormData(tempData);
			}
		} catch (err) {
			console.error("Error while fetching Guard data:", err);
		}
	};

	const insertForm = async () => {
		dispatch(toggleSpinnerAndDisableButton(true));
		if (!validateForm()) {
			dispatch(toggleSpinnerAndDisableButton(false));
			return;
		}
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_guard_manage",
				formData,
			);

			if (response.data.valid) {
				showToast("success", "Guard saved successfully!");
				setFormData({});
				// navigate('/guards/guards');
				//added start
				setTimeout(() => {
					navigate("/masters/guards");
				}, 1500);
			} else {
				showToast("error", getDuplicateMessage(response.data.message));
			}
			//added end
		} catch (err) {
			console.error("Error in insertForm:", err);
			showToast("error", getDuplicateMessage(err?.response?.data?.message));
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	// const handleDateChange = (field, date) => {
	//   setFormData({
	//     ...formData,
	//     [field]: date,
	//   });
	// };

	// const handleDateChange = (field, date) => {
	//   const utcDate = moment.utc(date).startOf('day').toDate();
	//   setFormData({
	//     ...formData,
	//     [field]: utcDate,
	//   });
	// };

	const handleDateChange = (field, date) => {
		if (!date) return;

		const formattedDate = moment.utc(date).startOf("day").toDate();

		setFormData({
			...formData,
			[field]: formattedDate,
		});
	};

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		} else {
			// alert('Guard ID Missing');
		}
	}, [RowData?.id]);

	const sectionLabel = (text) => (
		<p
			style={{
				margin: "0 0 14px 0",
				fontSize: 11,
				fontWeight: 600,
				letterSpacing: "0.07em",
				textTransform: "uppercase",
				color: "#64748b",
				paddingBottom: 8,
				borderBottom: "1px solid #f1f3f5",
			}}
		>
			{text}
		</p>
	);

	return (
		<MainLayout isShowing={false} pageName="Add Guard" hasAddButton={false}>
			{/* 3-zone card */}
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
				{/* Scrollable content */}
				<div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
					<Form>
						{/* ── Guard Details ── */}
						<div style={{ marginBottom: 24 }}>
							{sectionLabel("Guard Details")}
							<Row className="g-3">
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Employee Code"
										variant="outlined"
										fullWidth
										name="emp_code"
										value={formData.emp_code}
										onChange={handleChangeFormData}
										error={!!errors.emp_code}
										helperText={errors.emp_code}
										required
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Name"
										variant="outlined"
										fullWidth
										name="full_name"
										value={formData.full_name}
										onChange={handleChangeFormData}
										error={!!errors.full_name}
										helperText={errors.full_name}
										required
									/>
								</Col>
								<Col md={4}>
									<FormControl fullWidth variant="outlined" size="small">
										<InputLabel>
											Gender<span style={{ color: "red" }}>*</span>
										</InputLabel>
										<Select
											disabled={RowData?.type === "preview"}
											label="Gender"
											name="gender"
											value={formData.gender}
											onChange={handleChangeFormData}
											error={!!errors.gender}
											helperText={errors.gender}
											required
										>
											<MenuItem value="Male">Male</MenuItem>
											<MenuItem value="Female">Female</MenuItem>
										</Select>
									</FormControl>
								</Col>
								<Col md={4}>
									<FormControl fullWidth variant="outlined" size="small">
										<InputLabel>
											Marital Status<span style={{ color: "red" }}>*</span>
										</InputLabel>
										<Select
											disabled={RowData?.type === "preview"}
											label="Marital status"
											name="marital_status"
											value={formData.marital_status}
											onChange={handleChangeFormData}
											error={!!errors.marital_status}
											helperText={errors.marital_status}
											required
										>
											<MenuItem value="Single">Single</MenuItem>
											<MenuItem value="Married">Married</MenuItem>
										</Select>
									</FormControl>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_guard_designation_dropdown"}
										body={{ p_limit: 30 }}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												designation_id: val.designation_id,
												designation: val.designation,
											});
										}}
										valueInput={formData.designation}
										objLevel={"designation"}
										labelName={"Guard Designation *"}
										error={!!errors.designation}
										helperText={errors.designation}
										required
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Mobile"
										variant="outlined"
										fullWidth
										name="mobile"
										value={formData.mobile}
										onChange={handleChangeFormData}
										//added start
										error={!!errors.mobile}
										helperText={errors.mobile}
										required
										//added end//
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Email"
										variant="outlined"
										fullWidth
										name="email"
										value={formData.email}
										onChange={handleChangeFormData}
										error={!!errors.email}
										helperText={errors.email}
										required
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Father Name*"
										variant="outlined"
										fullWidth
										name="father_name"
										value={formData.father_name}
										onChange={handleChangeFormData}
										error={!!errors.father_name}
										helperText={errors.father_name}
										required
									/>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_customer_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												customer_id: val.customer_id,
												p_customer_id: val.customer_id,
												customer_code: val.customer_code,
												company_name: val.company_name,
											});
										}}
										valueInput={formData.company_name}
										objLevel={"company_name"}
										labelName={"Customer *"}
										error={!!errors.customer_code}
										helperText={errors.customer_code}
										required
									/>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_branch_manager_dropdown"}
										body={{ p_limit: 25, branch_id: formData.branch_id }}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												user_id: val.p_branch_manager_id,
												branch_manager_id: val.user_id,
												branch_manager_name: val.emp_code,
											});
										}}
										valueInput={formData.branch_manager_name}
										objLevel={"emp_code"}
										labelName={"Branch Manager *"}
										error={!!errors.branch_manager_name}
										helperText={errors.branch_manager_name}
										required
									/>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_ops_manager_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												ops_manager_id: val.ops_manager_id,
												ops_manager_name: val.emp_code,
												p_branch_id: val.branch_id,
											});
										}}
										valueInput={formData.ops_manager_name}
										objLevel={"emp_code"}
										labelName={"OPS Manager *"}
										error={!!errors.ops_manager_name}
										helperText={errors.ops_manager_name}
										required
									/>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_area_manager_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												// p_branch_manager_id: val.area_manager_id,
												area_manager_id: val.area_manager_id,
												area_manager_name: val.emp_code,
											});
										}}
										valueInput={formData.area_manager_name}
										objLevel={"emp_code"}
										labelName={"Area Manager *"}
										error={!!errors.area_manager_name}
										helperText={errors.area_manager_name}
										required
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Password"
										variant="outlined"
										fullWidth
										name="password"
										value={formData.password}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<FormControl fullWidth variant="outlined" size="small" error={!!errors.vertical}>
										<InputLabel>Vertical<span style={{ color: "red" }}>*</span></InputLabel>
										<Select
											disabled={RowData?.type === "preview"}
											name="vertical"
											value={formData.vertical}
											onChange={(e) => {
												handleChangeFormData(e);
												setErrors((prev) => ({ ...prev, vertical: "" }));
											}}
											label="Vertical*"
										>
											<MenuItem value="Facility">Facility</MenuItem>
											<MenuItem value="Security">Security</MenuItem>
										</Select>
										{errors.vertical && (
											<p style={{ color: "#d32f2f", fontSize: "0.75rem", margin: "3px 14px 0" }}>
												{errors.vertical}
											</p>
										)}
									</FormControl>
								</Col>
								{formData.vertical === "Facility" && (
									<Col md={4}>
										<FormControl fullWidth variant="outlined" size="small" error={!!errors.facility_type}>
											<InputLabel>Facility Type<span style={{ color: "red" }}>*</span></InputLabel>
											<Select
												disabled={RowData?.type === "preview"}
												name="facility_type"
												value={formData.facility_type}
												onChange={(e) => {
													handleChangeFormData(e);
													setErrors((prev) => ({ ...prev, facility_type: "" }));
												}}
												label="Facility Type*"
											>
												<MenuItem value="E&M">E&M</MenuItem>
												<MenuItem value="HK">HK</MenuItem>
											</Select>
											{errors.facility_type && (
												<p style={{ color: "#d32f2f", fontSize: "0.75rem", margin: "3px 14px 0" }}>
													{errors.facility_type}
												</p>
											)}
										</FormControl>
									</Col>
								)}
							</Row>
						</div>

						{/* ── Address ── */}
						<div style={{ marginBottom: 24 }}>
							{sectionLabel("Address")}
							<Row className="g-3">
								<Col md={6}>
									<p
										style={{
											fontSize: 12,
											color: "#94a3b8",
											fontWeight: 500,
											marginBottom: 10,
										}}
									>
										Current Address
									</p>
									<Row className="g-3">
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Address"
												variant="outlined"
												fullWidth
												name="address"
												value={formData.address}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="City"
												variant="outlined"
												fullWidth
												name="city"
												value={formData.city}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="State"
												variant="outlined"
												fullWidth
												name="state"
												value={formData.state}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Pin"
												variant="outlined"
												fullWidth
												name="pin"
												value={formData.pin}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Country"
												variant="outlined"
												fullWidth
												name="country"
												value={formData.country}
												onChange={handleChangeFormData}
											/>
										</Col>
									</Row>
								</Col>
								<Col md={6}>
									<p
										style={{
											fontSize: 12,
											color: "#94a3b8",
											fontWeight: 500,
											marginBottom: 10,
										}}
									>
										Permanent Address
									</p>
									<Row className="g-3">
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Permanent Address"
												variant="outlined"
												fullWidth
												name="p_address"
												value={formData.p_address}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Permanent City"
												variant="outlined"
												fullWidth
												name="p_city"
												value={formData.p_city}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Permanent State"
												variant="outlined"
												fullWidth
												name="p_state"
												value={formData.p_state}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="PIN"
												variant="outlined"
												fullWidth
												name="p_pin"
												value={formData.p_pin}
												onChange={handleChangeFormData}
											/>
										</Col>
										<Col md={6}>
											<TextField
												disabled={RowData?.type === "preview"}
												size="small"
												label="Permanent Country"
												variant="outlined"
												fullWidth
												name="p_country"
												value={formData.p_country}
												onChange={handleChangeFormData}
											/>
										</Col>
									</Row>
								</Col>
							</Row>
						</div>

						{/* ── Important Dates ── */}
						<div style={{ marginBottom: 24 }}>
							{sectionLabel("Important Dates")}
							<Row className="g-3">
								<Col md={3}>
									<div className="dateselect">
										<span>Date of Joining</span>
										<DatePicker
											disabled={RowData?.type === "preview"}
											selected={formData.date_of_joining}
											onChange={(date) =>
												handleDateChange("date_of_joining", date)
											}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
										/>
									</div>
								</Col>
								<Col md={3}>
									<div className="dateselect">
										<span>Date of Leaving</span>
										<DatePicker
											disabled={RowData?.type === "preview"}
											selected={formData.date_of_leaving}
											onChange={(date) =>
												handleDateChange("date_of_leaving", date)
											}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
										/>
									</div>
								</Col>
								<Col md={3}>
									<div className="dateselect">
										<span>Date of Birth</span>
										{/* <DatePicker
                        scrollableMonthYearDropdown
                        scrollableYearDropdown
                        disabled={RowData?.type === 'preview'}
                        selected={formData.date_of_birth}
                        onChange={(date) =>
                          handleDateChange('date_of_birth', date)
                        }
                        dateFormat="dd/MM/yyyy"
                        className="rounded-1 formdatepicker"
                        maxDate={new Date()}

                      /> */}
										<DatePicker
											disabled={false}
											selected={
												formData.date_of_birth
													? moment(formData.date_of_birth).toDate()
													: null
											} // Ensure it's a Date object
											onChange={(date) =>
												handleDateChange("date_of_birth", date)
											}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
											maxDate={new Date()}
										/>
									</div>
								</Col>
								<Col md={3}>
									<div className="dateselect">
										<span>Date of Entry</span>
										<DatePicker
											disabled={RowData?.type === "preview"}
											selected={formData.date_of_entry}
											onChange={(date) =>
												handleDateChange("date_of_entry", date)
											}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
										/>
									</div>
								</Col>
								<Col md={3}>
									<div className="dateselect">
										<span>Date of Approval</span>
										<DatePicker
											disabled={RowData?.type === "preview"}
											selected={formData.date_of_approval}
											onChange={(date) =>
												handleDateChange("date_of_approval", date)
											}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
										/>
									</div>
								</Col>
								{/* <Col md={4} className='mt-4'>
                    <TimeRange
                      label="Shift Start Time*"
                      value={
                        formData.shift_from
                          ? new Date(`1970-01-01T${formData.shift_from}`)
                          : null
                      }
                      onChange={(time) => handleChange('shift_from', time)}
                    />
                  </Col> */}
								{/* <Col md={4} className='mt-4'>
                    <TimeRange
                      label=" Shift End Time*"
                      value={
                        formData.shift_to
                          ? new Date(`1970-01-01T${formData.shift_to}`)
                          : null
                      }
                      onChange={(time) => handleChange('shift_to', time)}
                    />
                  </Col> */}
							</Row>
						</div>

						{/* ── Bank Details ── */}
						<div style={{ marginBottom: 24 }}>
							{sectionLabel("Bank Details")}
							<Row className="g-3">
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Bank Name"
										variant="outlined"
										fullWidth
										name="bank_name"
										value={formData.bank_name}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Account No."
										variant="outlined"
										fullWidth
										name="account_no"
										value={formData.account_no}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="IFSC Code"
										variant="outlined"
										fullWidth
										name="ifsc_code"
										value={formData.ifsc_code}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="PF Branch"
										variant="outlined"
										fullWidth
										name="pf_branch"
										value={formData.pf_branch}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="PF No."
										variant="outlined"
										fullWidth
										name="pf_no"
										value={formData.pf_no}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="ESI Branch"
										variant="outlined"
										fullWidth
										name="esi_branch"
										value={formData.esi_branch}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="ESI No."
										variant="outlined"
										fullWidth
										name="esi_no"
										value={formData.esi_no}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="UAN"
										variant="outlined"
										fullWidth
										name="uan_no"
										value={formData.uan_no}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Adhar No."
										variant="outlined"
										fullWidth
										name="adhar_no"
										value={formData.adhar_no}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="PAN No."
										variant="outlined"
										fullWidth
										name="pan_no"
										value={formData.pan_no}
										onChange={handleChangeFormData}
									/>
								</Col>
							</Row>
						</div>

						{/* ── Deductions ── */}
						<div style={{ marginBottom: 24 }}>
							{sectionLabel("Deductions & Membership")}
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: "4px 24px",
									padding: "10px 12px",
									border: "1px solid #e2e8f0",
									borderRadius: 6,
									background: "#f8fafc",
								}}
							>
								{[
									{ name: "pf_deduct", label: "PF Deducted" },
									{ name: "pt_deduct", label: "PT Deducted" },
									{ name: "esi_deduct", label: "ESI Deducted" },
									{ name: "sahyog_member", label: "Sahyog Member" },
								].map(({ name, label }) => (
									<div key={name} className="d-flex align-items-center gap-1">
										<Checkbox
											disabled={RowData?.type === "preview"}
											checked={formData[name]}
											onChange={handleChangeFormData}
											name={name}
											color="primary"
											size="small"
										/>
										<label
											style={{
												fontSize: 13,
												color: "#334155",
												marginBottom: 0,
											}}
										>
											{label}
										</label>
									</div>
								))}
							</div>
						</div>

						{/* ── Profile Picture ── */}
						<div style={{ marginBottom: 8 }}>
							{sectionLabel("Profile Picture")}
							<Form.Control
								disabled={RowData?.type === "preview"}
								size="md"
								type="file"
								name="profile_pic"
								onChange={(e) =>
									setFormData({
										...formData,
										profile_pic: e.target.files[0],
									})
								}
							/>
						</div>
					</Form>
				</div>

				{/* Sticky bottom bar */}
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
					{RowData?.type !== "preview" && (
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
					)}
					<Button
						size="sm"
						variant="none"
						type="button"
						className="cancelBtn"
						onClick={() => navigate("/masters/guards")}
					>
						Cancel
					</Button>
				</div>
			</div>
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
}

export default AddGuard;
