/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../../components/MainLayout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { userService } from "../../../../service/service";
import { AutoCompletedDropdown } from "../../../components/AutoCompleteDropdown";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../../components/Toast";
import { toggleSpinnerAndDisableButton } from "../../../Redux/Modals";

function AddAreaManager() {
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;
	const [uploading, setUploading] = useState(false);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show
	);
	const dispatch = useDispatch();
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [errors, setErrors] = useState({});
	//! form Data states starts
	const [formData, setFormData] = useState({
		p_action: "INSERT",
		area_manager_id: null,
		ops_manager_id: null,
		emp_code: "",
		full_name: "",
		mobile: "",
		email: "",
		profile_pic: "",
		branch_id: null,
		branch_code: "",
		branch_manager_id: null,
		ops_manager_name: "",
		branch_manager_name: "",
		branch_manager_emp_code: "",
		ops_manager_code: "",
		type: "",
	});

	const getDuplicateMessage = (message = "") => {
		const msg = message.toLowerCase();
		if (msg.includes("email")) return "This email address is already registered.";
		if (msg.includes("mobile") || msg.includes("phone")) return "This mobile number is already registered.";
		if (msg.includes("emp")) return "This employee code is already registered.";
		return "A record with these details already exists.";
	};

	//! Form validation starts
	const validateForm = () => {
		const newErrors = {};
		if (!formData.emp_code) newErrors.emp_code = "Employee Code is required";
		if (!formData.full_name) newErrors.full_name = "Full Name is required";
		if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile))
			newErrors.mobile = "Valid 10-digit mobile number is required.";
		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (
			!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
		) {
			newErrors.email = "Enter a valid email address";
		}
		if (!formData.branch_id) newErrors.branch_id = "Branch is required";
		if (!formData.branch_manager_id) newErrors.branch_manager_id = "Branch Manager is required";
		if (!formData.ops_manager_id) newErrors.ops_manager_id = "OPS Manager is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};
	//! handle Changes function for input feilds
	const handleChangeFormData = (event) => {
		const { name, value } = event.target;
		if (name === "p_mobile" && value.length > 10) return;
		setFormData({ ...formData, [name]: value });
		setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
	};
	//! form insert api calling
	const insertForm = async () => {
		dispatch(toggleSpinnerAndDisableButton(true));

		if (!validateForm()) {
			dispatch(toggleSpinnerAndDisableButton(false));
			return;
		}

		const formDataWithIntegers = {
			...formData,
			ops_manager_id: +formData.ops_manager_id || null,
			branch_id: +formData.branch_id || 0,
		};

		try {
			const response = await userService.post(
				"/api/v0/web/web_area_manager_manage",
				formDataWithIntegers
			);

			if (response.status === 200) {
				if (response.data.status === 400 || response.data.success === false) {
					showToast("error", getDuplicateMessage(response.data.message));
				} else {
					showToast("success", "Saved successfully!");
					setFormData({
						p_action: "INSERT",
						area_manager_id: null,
						ops_manager_id: null,
						emp_code: "",
						full_name: "",
						mobile: "",
						email: "",
						profile_pic: "",
						branch_id: null,
					});
					setTimeout(() => {
						navigate("/users/area-manager");
					}, 1000);
				}
			} else {
				showToast("error", getDuplicateMessage(response.data.message));
			}
		} catch (err) {
			const errorMessage = err?.response?.data?.message;
			showToast("error", getDuplicateMessage(errorMessage));
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	//! image uplaod function
	const handlePdfUpload = async (files) => {
		const data = new FormData();
		data.append(`file`, files.target.files[0]);

		setUploading(true);
		try {
			const result = await userService.uploadImage(
				"/v0/image/upload?folderName=connectx/areaManager",
				data
			);
			if (result.data) {
				setFormData({ ...formData, profile_pic: result.data });
			}
		} catch (err) {
			console.error("Image upload failed:", err);
		} finally {
			setUploading(false);
		}
	};
	const handleRemoveAttachment = () => {
		setFormData({ ...formData, profile_pic: null });
	};

	//! handle Edit function starts
	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_area_manager_preview",
				{
					area_manager_id: RowData.id,
					p_action: "UPDATE",
				}
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

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		} else {
			// setFormData((prev) => ({ ...prev, operation: "insert" }));
		}
	}, [RowData?.id]);

	//! mainlayout starts from here now
	//test
	return (
		<MainLayout
			isShowing={false}
			pageName="Add Area Manager"
			hasAddButton={false}
		>
			<Container className="formwrapper mt-0 p-4 pt-5 pb-4" fluid>
				<Form>
					<Row>
						<Col md={12}>
							<Row>
								<Col md={4} className="mb-4 validate">
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
										label="Full Name*"
										variant="outlined"
										fullWidth
										name="full_name"
										value={formData.full_name}
										onChange={handleChangeFormData}
										error={!!errors.full_name}
										helperText={errors.full_name}
									/>
								</Col>
								<Col md={4}>
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Mobile*"
										variant="outlined"
										fullWidth
										name="mobile"
										value={formData.mobile}
										onChange={handleChangeFormData}
										error={!!errors.mobile}
										helperText={errors.mobile}
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
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_branch_dropdown"}
										body={{
											p_limit: 25,
										}}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												branch_id: val.branch_id,
												branch_code: val.branch_code,
											});
											setErrors((prev) => ({ ...prev, branch_id: "" }));
										}}
										valueInput={formData.branch_code}
										objLevel={"branch_code"}
										labelName={"Branch Name*"}
										error={!!errors.branch_id}
										helperText={errors.branch_id}
									/>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_branch_manager_dropdown"}
										body={{
											p_limit: 25,
											branch_id: formData.branch_id,
										}}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												user_id: val.branch_id,
												branch_manager_id: val.user_id,
												branch_manager_name: val.emp_code,
												branch_manager_emp_code: val.branch_manager_name,
											});
											setErrors((prev) => ({ ...prev, branch_manager_id: "" }));
										}}
										valueInput={formData.branch_manager_name}
										objLevel={"emp_code"}
										labelName={"Branch Manager*"}
										error={!!errors.branch_manager_id}
										helperText={errors.branch_manager_id}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_ops_manager_dropdown"}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												ops_manager_id: val.ops_manager_id,
												ops_manager_name: val.emp_code,
												ops_manager_code: val.ops_manager_name,
											});
											setErrors((prev) => ({ ...prev, ops_manager_id: "" }));
										}}
										body={{
											p_limit: 25,
											p_branch_manager_id: formData.p_branch_manager_id,
										}}
										valueInput={formData.ops_manager_name}
										objLevel={"emp_code"}
										labelName={"OPS Manager*"}
										error={!!errors.ops_manager_id}
										helperText={errors.ops_manager_id}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<FormControl fullWidth variant="outlined" size="small">
										<InputLabel>Facitlity Type</InputLabel>
										<Select
											disabled={RowData?.type === "preview"}
											name="type"
											value={formData.type}
											onChange={handleChangeFormData}
											label="Facitlity Type"
										>
											<MenuItem value="E&M">E&M</MenuItem>
											<MenuItem value="HK">HK</MenuItem>
										</Select>
									</FormControl>
								</Col>
								<Col md={4} className="mt-4">
									<Form.Control
										disabled={RowData?.type === "preview" || uploading}
										size="md"
										type="file"
										onChange={handlePdfUpload}
									/>
									{uploading && (
										<div className="mt-2">
											<Spinner animation="border" variant="primary" size="sm" />
											<span className="ms-2">Uploading...</span>
										</div>
									)}

									{formData.profile_pic && !uploading && (
										<div className="d-flex align-items-center gap-3 mt-3">
											<a
												href={`${formData.profile_pic}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-dark"
												style={{ fontSize: "13px" }}
											>
												{formData.profile_pic}
											</a>
											<span
												className="border pt-3 pb-3 p-2 lh-0 cursor-pointer"
												onClick={handleRemoveAttachment}
											>
												🗑
											</span>
										</div>
									)}
								</Col>
								<Col md={12} className="d-flex align-items-center gap-3 mt-4">
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
										onClick={() => navigate("/users/area-manager")}
									>
										Cancel
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
				</Form>
			</Container>
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
		</MainLayout>
	);
}

export default AddAreaManager;
