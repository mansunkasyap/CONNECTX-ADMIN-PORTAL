import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../../components/MainLayout";
import { TextField } from "@mui/material";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../../../service/service";
import { AutoCompletedDropdown } from "../../../components/AutoCompleteDropdown";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../../Redux/Modals";

function AddCustomer() {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const RowData = location.state;
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		p_action: "INSERT",
		customer_id: null,
		customer_code: "",
		company_name: "",
		display_name: "",
		address: "",
		city: "",
		pin: null,
		group_name: "",
		state: "",
		country: "",
		pan: "",
		gstin: "",
		customer_group_id: null,
		contact_person: "",
		mobile: "",
		email: "",
		branch_id: null,
		branch: "",
		branch_code: "",
		latitude: "",
		longitude: "",
		range: "",
	});
	const validateForm = () => {
		const newErrors = {};
		if (!formData.customer_code?.trim())
			newErrors.customer_code = "Customer code is required.";
		if (!formData.company_name.trim())
			newErrors.company_name = "Company name is required.";
		if (!formData.display_name.trim())
			newErrors.display_name = "Display name is required.";
		if (!formData.address.trim()) newErrors.address = "Address is required.";
		if (!formData.city.trim()) newErrors.city = "City is required.";
		if (!formData.state.trim()) newErrors.state = "state is required.";
		if (!formData.country.trim()) newErrors.country = "Country is required.";
		if (!formData.pin || !/^\d{6}$/.test(formData.pin)) {
			newErrors.pin = "Valid 6-digit PIN code is required.";
		}

		if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile))
			newErrors.mobile = "Valid 10-digit mobile number is required.";
		if (
			!formData.email.trim() ||
			!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
		)
			newErrors.email = "Valid email address is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChangeFormData = (event) => {
		const { name, value } = event.target;
		setFormData({
			...formData,
			[name]:
				value === "" &&
				["customer_id", "pin", "customer_group_id", "branch_id"].includes(name)
					? null
					: value,
		});
	};

	const insertForm = async () => {
		// dispatch(toggleSpinnerAndDisableButton(true));
		if (!validateForm()) {
			return;
		}
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_customer_manage",
				formData,
			);

			if (response.data.valid) {
				// alert('Customer added successfully.');
				setFormData();
				navigate("/customers/customers");
			} else {
				alert(response.data.message || "Found Duplicate Entries");
			}
		} catch (err) {
			console.error("Error submitting form:", err);
			alert("An error occurred while submitting the form. Please try again.");
		}
	};

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_customer_preview",
				{
					customer_id: RowData.id,
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
			console.error("Error while fetching data:", err);
		}
	};

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		} else {
			// setFormData((prev) => ({ ...prev, operation: "insert" }));
		}
	}, [RowData?.id]);

	return (
		<MainLayout isShowing={false} pageName="Customer" hasAddButton={false}>
			<Container className="formwrapper mt-0 p-4" fluid>
				<Form>
					<Row>
						<Col md={12}>
							<Row>
								<Col md={4} className="mb-4">
									<AutoCompletedDropdown
										labelName={"Branch Code*"}
										url={"/api/v0/web/web_branch_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(value) =>
											setFormData({
												...formData,
												branch_id: value.branch_id,
												branch: value?.branch_code,
												branch_code: value?.branch_code,
											})
										}
										valueInput={formData.branch_code}
										objLevel={"branch_code"}
									/>
								</Col>
								<Col md={4} className="mb-4">
									<TextField
										size="small"
										label="Customer Code*"
										variant="outlined"
										fullWidth
										name="customer_code"
										value={formData.customer_code}
										onChange={handleChangeFormData}
										error={!!errors.customer_code}
										helperText={errors.customer_code}
										required
									/>
								</Col>
								<Col md={4}>
									<AutoCompletedDropdown
										labelName={"Customer Group Name*"}
										url={"/api/v0/web/web_customer_group_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(value) =>
											setFormData({
												...formData,
												customer_group_id: value.customer_group_id,
												group_name: value?.group_name,
											})
										}
										valueInput={formData.group_name}
										objLevel={"group_name"}
									/>
								</Col>
								<Col md={4} className="validate">
									<TextField
										size="small"
										label="Company Name*"
										variant="outlined"
										fullWidth
										name="company_name"
										value={formData.company_name}
										onChange={handleChangeFormData}
										error={!!errors.company_name}
										helperText={errors.company_name}
									/>
								</Col>

								<Col md={4} className="validate">
									<TextField
										size="small"
										label="Display Name*"
										variant="outlined"
										fullWidth
										name="display_name"
										value={formData.display_name}
										onChange={handleChangeFormData}
										error={!!errors.display_name}
										helperText={errors.display_name}
									/>
								</Col>
								<Col md={4}>
									<TextField
										size="small"
										label="Contact Person"
										variant="outlined"
										fullWidth
										name="contact_person"
										value={formData.contact_person}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4} className="mt-4 validate">
									<TextField
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
								<Col md={4} className="mt-4 validate">
									<TextField
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
								<Col md={4} className="mt-4 validate">
									<TextField
										size="small"
										label="Address*"
										variant="outlined"
										fullWidth
										name="address"
										value={formData.address}
										onChange={handleChangeFormData}
										error={!!errors.address}
										helperText={errors.address}
									/>
								</Col>
								<Col md={4} className="mt-4 validate">
									<TextField
										size="small"
										label="City*"
										variant="outlined"
										fullWidth
										name="city"
										value={formData.city}
										onChange={handleChangeFormData}
										error={!!errors.city}
										helperText={errors.city}
									/>
								</Col>
								<Col md={4} className="mt-4 validate">
									<TextField
										size="small"
										label="Pin*"
										variant="outlined"
										fullWidth
										name="pin"
										value={formData.pin}
										onChange={handleChangeFormData}
										error={!!errors.pin}
										helperText={errors.pin}
									/>
								</Col>
								<Col md={4} className="mt-4 validate">
									<TextField
										size="small"
										label="State*"
										variant="outlined"
										fullWidth
										name="state"
										value={formData.state}
										onChange={handleChangeFormData}
										error={!!errors.state}
										helperText={errors.state}
									/>
								</Col>
								<Col md={4} className="mt-4 validate">
									<TextField
										size="small"
										label="Country*"
										variant="outlined"
										fullWidth
										name="country"
										value={formData.country}
										onChange={handleChangeFormData}
										error={!!errors.country}
										helperText={errors.country}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<TextField
										size="small"
										label="Pan"
										variant="outlined"
										fullWidth
										name="pan"
										value={formData.pan}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<TextField
										size="small"
										label="GSTIN"
										variant="outlined"
										fullWidth
										name="gstin"
										value={formData.gstin}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<TextField
										size="small"
										label="Latitude"
										variant="outlined"
										fullWidth
										name="latitude"
										value={formData.latitude}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<TextField
										size="small"
										label="Longitude"
										variant="outlined"
										fullWidth
										name="longitude"
										value={formData.longitude}
										onChange={handleChangeFormData}
									/>
								</Col>
								<Col md={4} className="mt-4">
									<TextField
										size="small"
										label="Range (in Meters)"
										variant="outlined"
										fullWidth
										name="range"
										value={formData.range}
										onChange={handleChangeFormData}
										type="number"
									/>
								</Col>
								<Col md={12} className="d-flex gap-3 align-items-center  mt-5">
									<Button
										size="sm"
										variant="none"
										type="button"
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
										onClick={() => navigate("/customers/customers")}
									>
										Cancel
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
				</Form>
			</Container>
		</MainLayout>
	);
}

export default AddCustomer;
