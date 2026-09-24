import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../../components/MainLayout";
import { TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../../../service/service";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../../Redux/Modals";
import Toast from "../../../components/Toast";
import { AutoCompletedDropdown } from "../../../components/AutoCompleteDropdown";

function AddAdmin() {
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const [uploading, setUploading] = useState(false);
	const dispatch = useDispatch();
	const [errors, setErrors] = useState({});
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});

	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const getDuplicateMessage = (message = "") => {
		const msg = message.toLowerCase();
		if (msg.includes("email"))
			return "This email address is already registered.";
		if (msg.includes("mobile") || msg.includes("phone"))
			return "This mobile number is already registered.";
		return "A record with these details already exists.";
	};

	//! formData states start from here
	const [formData, setFormData] = useState({
		p_action: "insert",
		emp_code: "",
		full_name: "",
		mobile: "",
		email: "",
		profile_pic: "",
		role_id: "",
		role_name: "",
	});

	//! form validation function
	const validateForm = () => {
		const newErrors = {};
		if (!formData.emp_code) newErrors.emp_code = "Employee Code is required";
		if (!formData.full_name) newErrors.full_name = "Full Name is required";
		if (!/^\d{10}$/.test(formData.mobile))
			newErrors.mobile = "Enter a 10-digit mobile number";
		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (
			!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
		) {
			newErrors.email = "Enter a valid email address";
		}
		if (!formData.role_id) newErrors.role_name = "Role is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};
	// ! handle change function
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
		try {
			const response = await userService.post(
				"/api/v0/web/web_user_admin_manage",
				formData,
			);
			if (
				response.status === 200 &&
				response.data.valid !== false &&
				response.data.success !== false
			) {
				setFormData({
					p_action: "insert",
					emp_code: "",
					full_name: "",
					mobile: "",
					email: "",
					profile_pic: "",
					role_id: "",
					role_name: "",
				});
				showToast("success", "Admin created successfully!");
				setTimeout(() => navigate("/users/admin"), 3000);
			} else {
				showToast("error", getDuplicateMessage(response.data.message));
			}
		} catch (err) {
			showToast("error", "Something went wrong. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};
	//! handleEdit function starts
	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_user_admin_preview",
				{
					user_id: RowData.id,
					p_action: "update",
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
				tempData.p_action = "update";
				setFormData(tempData);
			} else {
				console.error("Error in response:", response.data.message);
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

	//! image upload function started
	const handlePdfUpload = async (files) => {
		const data = new FormData();
		data.append(`file`, files.target.files[0]);

		setUploading(true);

		try {
			const result = await userService.uploadImage(
				"/v0/image/upload?folderName=connectx/admin",
				data,
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

	//! mainlayout starts

	return (
		<MainLayout isShowing={false} pageName="Admin Entry" hasAddButton={false}>
			<Container className="formwrapper mt-0" fluid>
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
										type="number"
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
										url={"/api/v0/web/web_user_roles_dropdown"}
										handleDataChange={(val) => {
											setFormData({
												...formData,
												role_id: val.role_id,
												role_name: val.role_name,
											});
										}}
										valueInput={formData.role_name}
										objLevel={"role_name"}
										labelName={"Roles"}
										error={!!errors.role_name}
										helperText={errors.role_name}
										required
									/>
								</Col>
								<Col md={4}>
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
								{RowData?.type !== "preview" && (
									<Col md={12} className="d-flex align-items-center gap-2 mt-4">
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
											type="button"
											className="cancelBtn"
											onClick={() => navigate("/users/admin")}
										>
											Cancel
										</Button>
									</Col>
								)}
							</Row>
						</Col>
					</Row>
				</Form>
			</Container>
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
}

export default AddAdmin;
