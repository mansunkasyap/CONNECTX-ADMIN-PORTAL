/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../components/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { MdCheck } from "react-icons/md";
import {
	Autocomplete,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { userService } from "../../../service/service";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";

import { useDispatch, useSelector } from "react-redux";
import { toggleForm, toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import Toast from "../../components/Toast";
import config from "../../../service/config";
import { CommonController } from "../../components/CommonController";
import DatePicker from "react-datepicker";
import TimeRange from "../../components/TimeRange";
import { format } from "date-fns";
import { red } from "@mui/material/colors";

function Addschedule() {
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const getDuplicateMessage = (message = "") => {
		const msg = message.toLowerCase();
		if (msg.includes("schedule"))
			return "A schedule with these details already exists.";
		if (msg.includes("location"))
			return "A schedule at this location already exists.";
		return "Duplicate entry detected. Please check the entered details.";
	};

	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;
	const [branchList, setBranchList] = useState([]);
	const [branchIDS, setBranchIDS] = useState([]);
	const [body, setbody] = useState({
		refresh: "",
	});
	const [trainerList, setTrainerList] = useState([]);
	const [trainerIDS, setTrainerIDS] = useState([]);
	const [formData, setFormData] = useState({
		training_date: new Date(),
		location: "",
		training_type: "",
		trainer_ids: 1,
		category_id: null,
		customer_id: null,
		p_action: "INSERT",
		schedule_id: null,
		from_time: "",
		to_time: "",
		exam_id: null,
		created_by: 1,
		exam_no: "",
		company_name: "",
		emp_code: [],
		category_name: "",
	});
	const [errors, setErrors] = useState({});
	const validateForm = () => {
		const newErrors = {};
		if (!formData.location) newErrors.location = "Location is required.";
		if (!formData.training_type)
			newErrors.training_type = "Training type is required.";
		if (!formData.category_name)
			newErrors.category_name = "Training Subject is required.";
		if (!formData.company_name)
			newErrors.company_name = "Customer is required.";
		if (!formData.exam_no) newErrors.exam_no = "Exam No. is required.";
		if (!formData.from_time) newErrors.from_time = "Start time is required.";
		if (!formData.to_time) newErrors.to_time = "End time is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleClose = () => {
		// setFormTitle("Add Training Category");
		setFormData(formData);
		dispatch(toggleForm());
	};

	const insertForm = async () => {
		if (!validateForm()) {
			return;
		}
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/web_training_schedule_manage",
				formData,
			);
			if (response.status === 200 && response.data.status !== 400) {
				showToast("success", "Training Schedule saved successfully!");
				setTimeout(() => {
					navigate("/training/schedule");
				}, 1200);
			} else {
				showToast("error", getDuplicateMessage(response.data.message || ""));
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

		if (name === "p_mobile" && (!/^\d*$/.test(value) || value.length > 10)) {
			return;
		}

		setFormData({ ...formData, [name]: value });
		if (errors[name]) {
			setErrors({ ...errors, [name]: "" });
		}
	};

	const handleChange = (eventOrField, value) => {
		if (typeof eventOrField === "string") {
			let formattedValue = value;

			if (eventOrField === "from_time" || eventOrField === "to_time") {
				formattedValue = format(new Date(value), "HH:mm:ss");
			}

			setFormData((prev) => ({
				...prev,
				[eventOrField]: formattedValue,
			}));
		} else {
			const { name, value } = eventOrField.target;

			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	// const handleEdit = async () => {
	//   try {
	//     const response = await userService.post(
	//       '/api/v0/web/web_training_schedule_preview',
	//       {
	//         schedule_id: RowData.id,
	//       }
	//     );

	//     if (response.data.valid) {
	//       const value = response.data.data[0];
	//       let tempData = { ...formData };

	//       for (let key in tempData) {
	//         if (value.hasOwnProperty(key)) {
	//           tempData[key] = value[key];
	//         }
	//       }
	//       if (RowData?.type === 'Edit') {
	//         const selectedTrainers = response.data.selectedTrainers || [];

	//         const formattedTrainers = selectedTrainers.map((emp_code, index) => ({
	//           emp_code,
	//           user_id: index + 1,
	//         }));
	//         setTrainerIDS(formattedTrainers);
	//       }

	//       tempData.p_action = 'UPDATE';
	//       setFormData(tempData);
	//     }
	//   } catch (err) {
	//     console.error('Error while fetching Guard data:', err);
	//   }
	// };

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_training_schedule_preview",
				{ schedule_id: RowData.id },
			);

			if (response.data.valid) {
				const value = response.data.data[0];

				let tempData = { ...formData };
				for (let key in tempData) {
					if (value.hasOwnProperty(key)) {
						tempData[key] = value[key];
					}
				}

				const selectedTrainers = (value.trainers || []).map((t) => ({
					emp_code: t.emp_code,
					full_name: t.full_name,
					user_id: t.trainer_id,
				}));
				setTrainerIDS(selectedTrainers);
				tempData.trainer_ids = selectedTrainers.map((t) => t.user_id);
				tempData.p_action = "UPDATE";
				setFormData(tempData);
			}
		} catch (err) {
			console.error("Error while fetching Trainer data:", err);
		}
	};

	useEffect(() => {}, [trainerIDS]);

	useEffect(() => {
		if (RowData?.id) {
			handleEdit();
		} else {
			// setFormData((prev) => ({ ...prev, operation: "insert" }));
		}
	}, []);

	const dropDownTrainerList = async () => {
		try {
			const response = await CommonController.commonApiCallFilter(
				"/api/v0/web/web_user_trainer_dropdown",
				{ p_search: "", p_limit: 25 },
				"post",
				"node",
			);

			if (response.valid) {
				setTrainerList(response.data);
			} else {
				console.error("API returned invalid response", response);
			}
		} catch (err) {
			console.error("Error fetching trainer list:", err);
		}
	};

	useEffect(() => {
		// handleEdit();
		dropDownTrainerList("");
	}, []);

	const handlePdfUpload = async (files) => {
		const data = new FormData();
		data.append(`file_path`, files.target.files[0]);
		try {
			await userService
				.uploadImage("/api/v0/app/trainer", data)
				.then((result) => {
					if (result.data.valid) {
						setFormData({ ...formData, profile_pic: result.data.data.path });
					}
				})
				.catch((err) => {});
		} catch (err) {}
	};
	const handleRemoveAttachment = () => {
		setFormData({ ...formData, profile_pic: null });
	};
	const handleDateChange = (field, date) => {
		setFormData({
			...formData,
			[field]: date,
		});
	};
	const dropDownBranchList = async (search) => {
		const selectedBranchIDs = branchIDS.map((branch) => branch.branch_id);
		await CommonController.commonApiCallFilter(
			"/api/v0/web/web_branch_dropdown",
			{
				p_search: search,
				p_limit: 25,
				branch_ids: selectedBranchIDs,
			},
			"post",
			"node",
		).then((data) => {
			if (data.valid) {
				setBranchList(data.data);
			}
		});
	};

	useEffect(() => {
		handleEdit();
		dropDownBranchList("");
	}, []);

	return (
		<MainLayout
			isShowing={false}
			pageName="Training Schedule"
			hasAddButton={false}
		>
			<Container className="formwrapper mt-0" fluid>
				<Form>
					<Row>
						<Col md={12}>
							<Row>
								<Col md={4} className="mb-4">
									<div className="dateselect">
										<DatePicker
											selected={formData?.training_date}
											onChange={(date) =>
												handleDateChange("training_date", date)
											}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
										/>
									</div>
								</Col>
								<Col md={4} className="mb-4 validate">
									<TextField
										size="small"
										fullWidth
										label={"Location"}
										name="location"
										value={formData?.location}
										onChange={handleChange}
										error={!!errors.location}
										helperText={errors.location}
										required
									/>
								</Col>
								<Col md={4} className="mb-4 validate">
									<FormControl fullWidth error={!!errors.training_type}>
										<InputLabel size="small">
											Training Type<span style={{ color: "red" }}>*</span>
										</InputLabel>
										<Select
											value={formData?.training_type}
											label="Training Type*"
											onChange={(e) => {
												handleChangeFormData(e);
												if (errors.training_type)
													setErrors((prev) => ({ ...prev, training_type: "" }));
											}}
											size="small"
											name="training_type"
										>
											<MenuItem value="Class Room">Class Room</MenuItem>
											<MenuItem value="Field Trg.">Field Trg.</MenuItem>
										</Select>
										{errors.training_type && (
											<FormHelperText>{errors.training_type}</FormHelperText>
										)}
									</FormControl>
								</Col>
								<Col md={4} className="mb-4 validate">
									<Autocomplete
										multiple
										options={trainerList}
										getOptionLabel={(option) =>
											option.emp_code && option.user_id
												? `${option.emp_code} - ${option.full_name}`
												: ""
										}
										disableCloseOnSelect
										size="small"
										onChange={(e, value) => {
											setTrainerIDS(value);
											setFormData((prev) => ({
												...prev,
												trainer_ids: value.map((val) => val.user_id),
											}));
										}}
										value={trainerIDS}
										renderOption={(props, option, { selected }) => (
											<MenuItem
												key={option.full_name}
												value={option.emp_code}
												sx={{ justifyContent: "space-between" }}
												{...props}
											>
												{option.emp_code} - {option.full_name}
												{selected ? <MdCheck color="info" /> : null}
											</MenuItem>
										)}
										renderInput={(params) => (
											<TextField
												{...params}
												variant="outlined"
												label="Trainer*"
												error={!!errors.training_type}
												helperText={errors.training_type}
												required
											/>
										)}
									/>
								</Col>
								<Col md={4} className="mb-4 validate">
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_master_training_category_dropdown"}
										body={{
											p_limit: 25,
										}}
										handleDataChange={(val) => {
											setFormData((prev) => ({
												...prev,
												category_id: val?.category_id ?? null,
												category_name: val?.category_name ?? "",
											}));
											if (errors.category_name)
												setErrors((prev) => ({ ...prev, category_name: "" }));
										}}
										valueInput={formData?.category_name}
										objLevel={"category_name"}
										labelName={"Training Subject*"}
										error={!!errors.category_name}
										helperText={errors.category_name}
										required
									/>
								</Col>
								<Col md={4} className="mb-4">
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/web/web_customer_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(val) => {
											setFormData((prev) => ({
												...prev,
												customer_id: val?.customer_id ?? null,
												p_customer_id: val?.customer_id ?? null,
												customer_code: val?.customer_code ?? "",
												company_name: val?.company_name ?? "",
											}));
											if (errors.company_name)
												setErrors((prev) => ({ ...prev, company_name: "" }));
										}}
										valueInput={formData?.company_name}
										objLevel={"company_name"}
										labelName={"Customer*"}
										error={!!errors.company_name}
										helperText={errors.company_name}
										required
									/>
								</Col>
								<Col md={4} className="mb-4">
									<AutoCompletedDropdown
										disabled={RowData?.type === "preview"}
										url={"/api/v0/app/app_training_exam_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(val) => {
											setFormData((prev) => ({
												...prev,
												exam_id: val?.exam_id ?? null,
												exam_no: val?.exam_no ?? "",
											}));
											if (errors.exam_no)
												setErrors((prev) => ({ ...prev, exam_no: "" }));
										}}
										valueInput={formData?.exam_no}
										objLevel={"exam_no"}
										labelName={"Exam No.*"}
										error={!!errors.exam_no}
										helperText={errors.exam_no}
										required
									/>
								</Col>
								<Col md={4} className="mb-4">
									<div
										style={{
											border: errors.from_time
												? "1px solid #d32f2f"
												: "1px solid #c4c4c4",
											borderRadius: 6,
											padding: "6px 10px",
										}}
									>
										<TimeRange
											label="Start Time*"
											value={
												formData.from_time
													? new Date(`1970-01-01T${formData.from_time}`)
													: null
											}
											onChange={(time) => {
												handleChange("from_time", time);
												if (errors.from_time)
													setErrors((prev) => ({ ...prev, from_time: "" }));
											}}
										/>
									</div>
									{errors.from_time && (
										<p
											style={{
												color: "#d32f2f",
												fontSize: 11,
												margin: "3px 14px 0",
											}}
										>
											{errors.from_time}
										</p>
									)}
								</Col>

								<Col md={4} className="mb-4">
									<div
										style={{
											border: errors.to_time
												? "1px solid #d32f2f"
												: "1px solid #c4c4c4",
											borderRadius: 6,
											padding: "6px 10px",
										}}
									>
										<TimeRange
											label="End Time*"
											value={
												formData.to_time
													? new Date(`1970-01-01T${formData.to_time}`)
													: null
											}
											onChange={(time) => {
												handleChange("to_time", time);
												if (errors.to_time)
													setErrors((prev) => ({ ...prev, to_time: "" }));
											}}
										/>
									</div>
									{errors.to_time && (
										<p
											style={{
												color: "#d32f2f",
												fontSize: 11,
												margin: "3px 14px 0",
											}}
										>
											{errors.to_time}
										</p>
									)}
								</Col>
								<Col md={12} className="d-flex align-items-center gap-2">
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
										onClick={() => navigate("/training/schedule")}
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

export default Addschedule;
