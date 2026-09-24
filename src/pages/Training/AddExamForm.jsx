/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import {
	Button,
	Col,
	Container,
	Form,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";
import MainLayout from "../../components/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { MdCheck } from "react-icons/md";
import {
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
import { CommonController } from "../../components/CommonController";
import DatePicker from "react-datepicker";
import ModalComponent from "../../components/ModalComponent";
import { FaTrash } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa6";
import { FaStopCircle } from "react-icons/fa";

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

function AddExamForm() {
	const addButton = useSelector((state) => state.addFormButton.show);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const RowData = location.state;

	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const getDuplicateMessage = (message = "") => {
		const msg = message.toLowerCase();
		if (msg.includes("exam") || msg.includes("exam_no"))
			return "An exam with this number already exists. Please use a different exam number.";
		return "Duplicate entry detected. Please check the entered details.";
	};

	const [branchList, setBranchList] = useState([]);
	const [branchIDS, setBranchIDS] = useState([]);
	const [body, setbody] = useState({ refresh: "" });
	const [recognition, setRecognition] = useState(null);
	const [language, setLanguage] = useState("en-IN");
	const [isListening, setIsListening] = useState(false);
	const [timeoutId, setTimeoutId] = useState(null);
	const [lastTranscript, setLastTranscript] = useState("");
	const [trainerList, setTrainerList] = useState([]);
	const [activeInput, setActiveInput] = useState(null);

	const [formData, setFormData] = useState({
		exam_id: null,
		date: new Date(),
		exam_no: "",
		category_id: null,
		completion_time: "",
		created_by: "",
		questions: [],
		category_name: "",
	});
	const [errors, setErrors] = useState({});
	const [modalErrors, setModalErrors] = useState({});

	const initialValues = {
		question_no: null,
		question: "",
		option_1: "",
		option_2: "",
		option_3: "",
		option_4: "",
		correct_answer: "",
	};
	const [examFormDetail, setexamFormDetail] = useState([]);
	const [inputValues, setinputValues] = useState(initialValues);

	const validateForm = () => {
		const newErrors = {};
		if (!formData.exam_no.trim()) newErrors.exam_no = "Exam No. is required.";
		if (!formData.category_name)
			newErrors.category_name = "Training Subject is required.";
		if (!formData.completion_time.trim())
			newErrors.completion_time = "Completion time is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateModal = () => {
		const newErrors = {};
		if (!inputValues.question_no)
			newErrors.question_no = "Question No. is required.";
		if (!inputValues.question.trim())
			newErrors.question = "Question is required.";
		if (!inputValues.option_1.trim())
			newErrors.option_1 = "Option 1 is required.";
		if (!inputValues.option_2.trim())
			newErrors.option_2 = "Option 2 is required.";
		if (!inputValues.option_3.trim())
			newErrors.option_3 = "Option 3 is required.";
		if (!inputValues.option_4.trim())
			newErrors.option_4 = "Option 4 is required.";
		if (!inputValues.correct_answer)
			newErrors.correct_answer = "Correct answer is required.";
		setModalErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	async function handleRemoveExam(qsId) {
		try {
			setexamFormDetail((prevState) =>
				prevState.filter((row) => row.question_no !== qsId),
			);
		} catch (err) {
			console.error("Error while deleting exam:", err);
		}
	}

	useEffect(() => {
		if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			const newRecognition = new SpeechRecognition();
			newRecognition.continuous = true;
			newRecognition.interimResults = false;
			newRecognition.lang = language;

			newRecognition.onresult = (event) => {
				let currentTranscript =
					event.results[event.results.length - 1][0].transcript.trim();
				if (currentTranscript !== lastTranscript && activeInput) {
					setinputValues((prev) => ({
						...prev,
						[activeInput]: prev[activeInput] + " " + currentTranscript,
					}));
					setLastTranscript(currentTranscript);
				}
				if (timeoutId) clearTimeout(timeoutId);
				const newTimeout = setTimeout(() => stopListening(), 3000);
				setTimeoutId(newTimeout);
			};

			newRecognition.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
				showToast("error", "Speech recognition error. Please try again.");
			};

			setRecognition(newRecognition);
		}
	}, [language, lastTranscript, activeInput]);

	const toggleListening = (event) => {
		event.preventDefault();
		if (isListening) stopListening();
		else startListening();
	};

	const startListening = () => {
		if (recognition) {
			recognition.lang = language;
			recognition.start();
			setIsListening(true);
		}
	};

	const stopListening = () => {
		if (recognition) {
			recognition.stop();
			setIsListening(false);
		}
		if (timeoutId) clearTimeout(timeoutId);
	};

	const handleClose = () => {
		setinputValues(initialValues);
		setModalErrors({});
		dispatch(toggleForm());
	};

	const submitQuestion = () => {
		if (!validateModal()) {
			return;
		}
		const arr = [...examFormDetail, inputValues];
		setexamFormDetail(arr);
		showToast("success", "Question added successfully!");
		setinputValues(initialValues);
		setModalErrors({});
		dispatch(toggleForm());
	};

	const insertForm = async () => {
		if (!validateForm()) {
			return;
		}
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const obj = { ...formData, questions: examFormDetail };
			const response = await userService.post(
				"/api/v0/web/web_training_exam_manage",
				obj,
			);
			if (response.status === 200 && response.data.status !== 400) {
				showToast("success", "Exam saved successfully!");
				setTimeout(() => navigate("/training/exam"), 1200);
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

	const handleEdit = async () => {
		try {
			const response = await userService.post(
				"/api/v0/web/web_training_exam_preview",
				{
					exam_id: RowData.id,
				},
			);
			if (response.data.valid) {
				const value = response.data.data[0];
				let tempData = { ...formData };
				for (let key in tempData) {
					if (value.hasOwnProperty(key)) tempData[key] = value[key];
				}
				tempData.date = value.date ? new Date(value.date) : null;
				setFormData(tempData);
				setexamFormDetail(value.questions || []);
			}
		} catch (err) {
			console.error("Error while fetching data:", err);
		}
	};

	const handleChangeFormData = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleChangeModal = (event) => {
		const { name, value } = event.target;
		setinputValues((prev) => ({ ...prev, [name]: value }));
		if (modalErrors[name]) setModalErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleDateChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const dropDownTrainerList = async () => {
		const selectedTrainerIDs = trainerList.map((trainer) => trainer.p_search);
		await CommonController.commonApiCallFilter(
			"/api/v0/web/web_user_trainer_dropdown",
			{ p_search: "", p_limit: 25, trainer_ids: selectedTrainerIDs },
			"post",
			"node",
		).then((data) => {
			if (data.valid) setTrainerList(data.data);
		});
	};

	const dropDownBranchList = async (search) => {
		const selectedBranchIDs = branchIDS.map((branch) => branch.branch_id);
		await CommonController.commonApiCallFilter(
			"/api/v0/web/web_branch_dropdown",
			{ p_search: search, p_limit: 25, branch_ids: selectedBranchIDs },
			"post",
			"node",
		).then((data) => {
			if (data.valid) setBranchList(data.data);
		});
	};

	useEffect(() => {
		if (RowData?.id) handleEdit();
	}, [RowData?.id]);

	useEffect(() => {
		dropDownTrainerList("");
		dropDownBranchList("");
	}, []);

	const isPreview = RowData?.type === "preview";

	const addFormJsx = (
		<Form>
			<Row>
				<Col md={12} className="mb-3">
					<FormControl fullWidth size="small">
						<InputLabel>Choose Language</InputLabel>
						<Select
							value={language}
							label="Choose Language"
							onChange={(e) => setLanguage(e.target.value)}
							size="small"
						>
							<MenuItem value="en-IN">English</MenuItem>
							<MenuItem value="hi-IN">Hindi</MenuItem>
						</Select>
					</FormControl>
				</Col>
				<Col md={6} className="mb-3">
					<TextField
						size="small"
						fullWidth
						label="Question No.*"
						name="question_no"
						inputProps={{ inputMode: "numeric" }}
						value={inputValues.question_no ?? ""}
						onChange={(e) => {
							const val = e.target.value;
							if (/^\d*$/.test(val)) {
								setinputValues((prev) => ({
									...prev,
									question_no: val === "" ? null : parseInt(val, 10),
								}));
								if (modalErrors.question_no)
									setModalErrors((prev) => ({ ...prev, question_no: "" }));
							}
						}}
						error={!!modalErrors.question_no}
						helperText={modalErrors.question_no}
						required
					/>
				</Col>
				<Col md={12} className="mb-3">
					<div className="micbox">
						<TextField
							size="small"
							fullWidth
							multiline
							rows={2}
							label="Question*"
							name="question"
							value={inputValues.question}
							onChange={handleChangeModal}
							onFocus={(e) => setActiveInput(e.target.name)}
							error={!!modalErrors.question}
							helperText={modalErrors.question}
							required
						/>
						<Button variant="none" onClick={toggleListening} className="micbtn">
							{isListening ? (
								<FaStopCircle color="#b02828" />
							) : (
								<FaMicrophone />
							)}
						</Button>
					</div>
				</Col>
				<Col md={6} className="mb-3">
					<TextField
						size="small"
						fullWidth
						label="Option 1*"
						name="option_1"
						value={inputValues.option_1}
						onChange={handleChangeModal}
						error={!!modalErrors.option_1}
						helperText={modalErrors.option_1}
						required
					/>
				</Col>
				<Col md={6} className="mb-3">
					<TextField
						size="small"
						fullWidth
						label="Option 2*"
						name="option_2"
						value={inputValues.option_2}
						onChange={handleChangeModal}
						error={!!modalErrors.option_2}
						helperText={modalErrors.option_2}
						required
					/>
				</Col>
				<Col md={6} className="mb-3">
					<TextField
						size="small"
						fullWidth
						label="Option 3*"
						name="option_3"
						value={inputValues.option_3}
						onChange={handleChangeModal}
						error={!!modalErrors.option_3}
						helperText={modalErrors.option_3}
						required
					/>
				</Col>
				<Col md={6} className="mb-3">
					<TextField
						size="small"
						fullWidth
						label="Option 4*"
						name="option_4"
						value={inputValues.option_4}
						onChange={handleChangeModal}
						error={!!modalErrors.option_4}
						helperText={modalErrors.option_4}
						required
					/>
				</Col>
				<Col md={12} className="mb-3">
					<FormControl
						fullWidth
						size="small"
						error={!!modalErrors.correct_answer}
					>
						<InputLabel>Correct Answer*</InputLabel>
						<Select
							value={inputValues.correct_answer}
							label="Correct Answer*"
							onChange={(e) => {
								setinputValues((prev) => ({
									...prev,
									correct_answer: e.target.value,
								}));
								if (modalErrors.correct_answer)
									setModalErrors((prev) => ({ ...prev, correct_answer: "" }));
							}}
							size="small"
							name="correct_answer"
						>
							<MenuItem value="Option 1">Option 1</MenuItem>
							<MenuItem value="Option 2">Option 2</MenuItem>
							<MenuItem value="Option 3">Option 3</MenuItem>
							<MenuItem value="Option 4">Option 4</MenuItem>
						</Select>
						{modalErrors.correct_answer && (
							<FormHelperText>{modalErrors.correct_answer}</FormHelperText>
						)}
					</FormControl>
				</Col>
				<Col md={12} className="d-flex justify-content-end gap-2">
					<Button
						size="sm"
						variant="none"
						className="commonBtn"
						onClick={submitQuestion}
					>
						Add Question
					</Button>
					<Button
						size="sm"
						variant="none"
						className="cancelBtn"
						onClick={handleClose}
					>
						Cancel
					</Button>
				</Col>
			</Row>
		</Form>
	);

	return (
		<MainLayout
			isShowing={false}
			pageName="Training Exam Form"
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
											disabled={isPreview}
											selected={formData.date}
											onChange={(date) => handleDateChange("date", date)}
											dateFormat="dd/MM/yyyy"
											className="rounded-1 formdatepicker"
										/>
									</div>
								</Col>
								<Col md={4} className="mb-4 validate">
									<TextField
										disabled={isPreview}
										size="small"
										fullWidth
										label="Exam No.*"
										name="exam_no"
										value={formData.exam_no}
										onChange={handleChangeFormData}
										error={!!errors.exam_no}
										helperText={errors.exam_no}
										required
									/>
								</Col>
								<Col md={4} className="mb-4">
									<AutoCompletedDropdown
										disabled={isPreview}
										url={"/api/v0/web/web_master_training_category_dropdown"}
										body={{ p_limit: 25 }}
										handleDataChange={(val) => {
											setFormData((prev) => ({
												...prev,
												category_id: val?.category_id ?? null,
												category_name: val?.category_name ?? "",
											}));
											if (errors.category_name)
												setErrors((prev) => ({ ...prev, category_name: "" }));
										}}
										valueInput={formData.category_name}
										objLevel={"category_name"}
										labelName={"Training Subject*"}
										error={!!errors.category_name}
										helperText={errors.category_name}
										required
									/>
								</Col>
								<Col md={4} className="mb-4 validate">
									<TextField
										disabled={isPreview}
										size="small"
										fullWidth
										label="Completion Time (minutes)*"
										name="completion_time"
										inputProps={{ inputMode: "numeric" }}
										value={formData.completion_time}
										onChange={(e) => {
											if (/^\d*$/.test(e.target.value)) handleChangeFormData(e);
										}}
										error={!!errors.completion_time}
										helperText={errors.completion_time}
										required
									/>
								</Col>
							</Row>

							{/* Questions table — AddCustomerLog style */}
							<div style={{ marginBottom: 20 }}>
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
										Questions
										{examFormDetail.length > 0 && (
											<span
												style={{
													marginLeft: 8,
													color: "#94a3b8",
													fontWeight: 400,
												}}
											>
												({examFormDetail.length})
											</span>
										)}
									</p>
									{!isPreview && (
										<button
											type="button"
											className="primary-btn btn-sm btn text-white"
											onClick={() => dispatch(toggleForm())}
										>
											+ Add Question
										</button>
									)}
								</div>
								<div
									style={{
										border: "1px solid #e2e8f0",
										borderRadius: 6,
										overflow: "auto",
									}}
								>
									<Table
										bordered={false}
										size="sm"
										style={{
											marginBottom: 0,
											verticalAlign: "middle",
											minWidth: 900,
										}}
									>
										<thead>
											<tr>
												<th style={{ ...thStyle, width: 60 }}>S.No.</th>
												<th style={{ ...thStyle, width: 70 }}>Q.No.</th>
												<th style={thStyle}>Question</th>
												<th style={thStyle}>Option 1</th>
												<th style={thStyle}>Option 2</th>
												<th style={thStyle}>Option 3</th>
												<th style={thStyle}>Option 4</th>
												<th style={thStyle}>Correct Answer</th>
												{!isPreview && (
													<th
														style={{
															...thStyle,
															width: 70,
															textAlign: "center",
														}}
													>
														Action
													</th>
												)}
											</tr>
										</thead>
										<tbody>
											{examFormDetail.length === 0 ? (
												<tr>
													<td
														colSpan={isPreview ? 8 : 9}
														style={{
															padding: "32px 0",
															textAlign: "center",
															color: "#94a3b8",
															fontSize: 13,
														}}
													>
														No questions added yet
													</td>
												</tr>
											) : (
												examFormDetail.map((item, index) => (
													<tr
														key={index}
														style={{
															backgroundColor:
																index % 2 === 0 ? "#fff" : "#f8fafc",
														}}
													>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{index + 1}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.question_no}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.question}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.option_1}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.option_2}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.option_3}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.option_4}
														</td>
														<td style={{ fontSize: 13, padding: "7px 12px" }}>
															{item.correct_answer}
														</td>
														{!isPreview && (
															<td
																style={{
																	textAlign: "center",
																	padding: "7px 12px",
																}}
															>
																<FaTrash
																	className="text-danger cursor-pointer"
																	style={{ cursor: "pointer" }}
																	onClick={() =>
																		handleRemoveExam(item.question_no)
																	}
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

							{/* Submit / Cancel always at bottom */}
							<Row>
								<Col md={12} className="d-flex align-items-center gap-2 mt-2">
									{!isPreview && (
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
										onClick={() => navigate("/training/exam")}
									>
										Cancel
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
				</Form>
			</Container>

			<ModalComponent
				innerJsx={addFormJsx}
				modalTitle="Add Question"
				hidden={addButton}
			/>
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
}

export default AddExamForm;
