import MainLayout from "../components/MainLayout";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { userService } from "../../service/service";
import Toast from "../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../Redux/Modals";

function AddBranch() {
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;
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

	const getDuplicateMessage = (message = "") => {
		const msg = message.toLowerCase();
		if (msg.includes("branch") || msg.includes("code"))
			return "A branch with this code already exists. Please use a different branch code.";
		if (msg.includes("gstin") || msg.includes("gst"))
			return "This GSTIN is already registered. Please check and re-enter.";
		if (msg.includes("pan"))
			return "This PAN is already registered. Please use a different PAN.";
		return "Duplicate entry detected. Please check the entered details.";
	};

	const [formData, setFormData] = useState({
		p_action: "insert",
		branch_code: "",
		address: "",
		city: "",
		state: "",
		country: "",
		gstin: "",
		pin: "",
		pan: "",
	});
	const [errors, setErrors] = useState({});

	const validateForm = () => {
		const newErrors = {};
		if (!formData.branch_code.trim())
			newErrors.branch_code = "Branch code is required.";
		if (!formData.address.trim()) newErrors.address = "Address is required.";
		if (!formData.city.trim()) newErrors.city = "City is required.";
		if (!formData.state.trim()) newErrors.state = "State is required.";
		if (!formData.pin || !/^\d{6}$/.test(formData.pin))
			newErrors.pin = "Valid 6-digit PIN code is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const insertForm = async () => {
		if (!validateForm()) {
			return;
		}
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/web_branch_manage",
				formData,
			);
			if (response.status === 200) {
				if (response.data.status === 400) {
					showToast("error", getDuplicateMessage(response.data.message || ""));
				} else {
					setFormData({
						p_action: "insert",
						branch_code: "",
						address: "",
						city: "",
						state: "",
						country: "",
						gstin: "",
						pin: "",
						pan: "",
					});
					showToast("success", "Branch saved successfully!");
					setTimeout(() => {
						navigate("/masters/branches");
					}, 1200);
				}
			} else {
				showToast("error", response.data.message || "Something went wrong.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	const handleChangeFormData = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_branch_preview",
				{
					branch_id: RowData.id,
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
			console.error("Error while fetching branch data:", err);
		}
	};

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		}
	}, [RowData?.id]);

	return (
		<MainLayout isShowing={false} pageName="Add Branch" hasAddButton={false}>
			<Container className="formwrapper mt-0" fluid>
				<Form>
					<Row>
						<Col md={12}>
							<Row>
								<Col md={3} className="mb-4 validate">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Branch Code"
										variant="outlined"
										fullWidth
										name="branch_code"
										value={formData.branch_code}
										onChange={handleChangeFormData}
										error={!!errors.branch_code}
										helperText={errors.branch_code}
										required
									/>
								</Col>
								<Col md={3} className="mb-4 validate">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Address"
										variant="outlined"
										fullWidth
										name="address"
										value={formData.address}
										onChange={handleChangeFormData}
										error={!!errors.address}
										helperText={errors.address}
										required
									/>
								</Col>
								<Col md={3} className="mb-4 validate">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="City"
										variant="outlined"
										fullWidth
										name="city"
										value={formData.city}
										onChange={handleChangeFormData}
										error={!!errors.city}
										helperText={errors.city}
										required
									/>
								</Col>
								<Col md={3} className="mb-4 validate">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="Pin"
										variant="outlined"
										fullWidth
										name="pin"
										value={formData.pin}
										onChange={(e) => {
											if (/^\d*$/.test(e.target.value)) handleChangeFormData(e);
										}}
										error={!!errors.pin}
										helperText={errors.pin}
										required
										inputProps={{ maxLength: 6, inputMode: "numeric" }}
									/>
								</Col>
								<Col md={3} className="mb-4 validate">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="State"
										variant="outlined"
										fullWidth
										name="state"
										value={formData.state}
										onChange={handleChangeFormData}
										error={!!errors.state}
										helperText={errors.state}
										required
									/>
								</Col>
								<Col md={3} className="mb-4">
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
								<Col md={3} className="mb-4">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="PAN"
										variant="outlined"
										fullWidth
										name="pan"
										value={formData.pan}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={3} className="mb-4">
									<TextField
										disabled={RowData?.type === "preview"}
										size="small"
										label="GSTIN"
										variant="outlined"
										fullWidth
										name="gstin"
										value={formData.gstin}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={12} className="d-flex align-items-center gap-2 mt-2">
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
										onClick={() => navigate("/masters/branches")}
									>
										Cancel
									</Button>
								</Col>
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

export default AddBranch;
