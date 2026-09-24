import {
	Button,
	Col,
	Container,
	Form,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";
import { TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../../service/service";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../service/config";
import { toggleForm, toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import MainLayout from "../../components/MainLayout";

function AddFacilityCheckpoints() {
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const [guardList, setGuardList] = useState([]);
	const RowData = location.state;
	const previewMode = RowData?.type === "preview";
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show
	);	

	const [formData, setFormData] = useState({
		action: "INSERT",
		customer_id: null,
		location_display_name: "",
		location_id: null,
		qrcode: "",
	});	

	const handleQrCodeChange = (event) => {
		const value = event.target.value;
		setFormData((prevValues) => ({
			...prevValues,
			qrcode: value,
			checkpoint_code: value,
		}));
	};

	const insertForm = async () => {
		dispatch(toggleSpinnerAndDisableButton(true));

		try {
			const response = await userService.post(
				"/api/v0/web/web_checkpoint_manage",
				formData
			);
			if (response.data.valid) {
				dispatch(toggleSpinnerAndDisableButton(false));
				setFormData(formData);
				dispatch(toggleForm());
				setTimeout(() => {
					navigate("/customers/customer-check-points");
				}, 1000);
			} else {
				alert(response.data.message || "Found Duplicate Entries");
				dispatch(toggleSpinnerAndDisableButton(false));
				return;
			}
		} catch (err) {
			console.error(err);
		}
	};
	const handleEdit = async () => {
		dispatch(toggleForm());
		try {
			const response = await userService.post(
				"/api/v0/web/web_checkpoint_print",
				{
					p_checkpoint_id: RowData.id,
					action: "UPDATE",
				}
			);
			if (response.data.valid) {
				let value = response.data.data[0];
				let tempData = { ...formData };
				for (let key in formData) {
					if (Object.prototype.hasOwnProperty.call(value, key)) {
						tempData[key] = value[key];
					}
				}
				setFormData(tempData);
				tempData.action = "UPDATE";
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		}
	};
	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		} else {
			// setFormData((prev) => ({ ...prev, operation: "insert" }));
		}
	}, [RowData?.id]);

	useEffect(() => {
		if (formData.customer_id) {
			const filteredGuards = guardList.filter(
				(guard) => guard.customer_id === formData.customer_id
			);
			setGuardList(filteredGuards);
		}
	}, [formData.customer_id]);

	return (
		<MainLayout
			isShowing={false}
			pageName="Facility Checkpoints"
			hasAddButton={false}
		>
			<Container className="formwrapper mt-0" fluid>
				<Form>
					<Row>
						<Col xs={10}>
							<Row>
								<Col md={4}>
									<div className="d-flex justify-content-between">
										<AutoCompletedDropdown
											url={"/api/v0/web/list_facility_location_checkpoint"}
											body={{ limit: 10 }}
											handleDataChange={(val) =>
												setFormData((prevValues) => ({
													...prevValues,
													location_id: val.location_id,
													location_display_name: val.location_display_name,
												}))
											}
											valueInput={formData.location_display_name}
											objLevel={"location_display_name"}
											labelName={"Location"}
											disabled={previewMode}
										/>
									</div>
								</Col>
								<Col md={4}>
									<TextField
										size="small"
										fullWidth
										label={"QR Code Value"}
										name="qrcode"
										value={formData.qrcode}
										onChange={handleQrCodeChange}
									/>
								</Col>
							</Row>
						</Col>
						{formData.qrcode && (
							<Col xs={2} className="text-center">
								<p className="fs-5 fw-bold text-center">Generated QR Code</p>
								<Col md={12}>
									<img
										src={config.QrCodeUrl + formData.qrcode}
										alt="Generated QR Code"
										width="140"
										height="140"
										className="border p-2 rounded-2 m-auto"
									/>
								</Col>
							</Col>
						)}

						<Col md={12} className="d-flex align-items-center gap-2 mt-4">
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
										<Spinner animation="border" variant="light" size="sm" />
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
								onClick={() => navigate("/facility/facility-check-points")}
							>
								Cancel
							</Button>
						</Col>
					</Row>
				</Form>
			</Container>
		</MainLayout>
	);
}
export default AddFacilityCheckpoints;
