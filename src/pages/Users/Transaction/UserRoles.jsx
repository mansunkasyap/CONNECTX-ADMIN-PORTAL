/* eslint-disable no-unused-vars */
import { useCallback, useMemo, useState } from "react";
import { Badge, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import {
	hideModal,
	toggleForm,
	toggleSpinnerAndDisableButton,
} from "../../../Redux/Modals";
import { userService } from "../../../../service/service";
import DeleteModal from "../../../components/DeleteModal";
import Toast from "../../../components/Toast";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/MainLayout";
import CommonDataGrid from "../../../components/CommonDataGrid";
import { useDispatch, useSelector } from "react-redux";
import { TextField } from "@mui/material";
import { BsPenFill } from "react-icons/bs";

function UserRoles() {
	const dispatch = useDispatch();
	const [formTitle, setFormTitle] = useState("Add Role");
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const [updateGrid, setupdateGrid] = useState(0);
	const addButton = useSelector((state) => state.addFormButton.show);
	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (getUser) {
			const moduleRights = getUser.find(
				(val) => val.module_name.toLowerCase() === url[1],
			);
			const finalModule = moduleRights?.rights.filter(
				(val) =>
					val.transaction_code.replace(/ /g, "-").toLowerCase() === url[2],
			);
			return finalModule?.length > 0
				? finalModule[0]
				: {
						can_view: false,
						can_insert: false,
						can_edit: false,
						can_delete: false,
						can_print: false,
					};
		}
	}, [getUser]);

	const initialValues = {
		role_name: "",
		description: null,
		is_active: false,
	};

	const [inputValues, setinputValues] = useState(initialValues);
	const [errors, setErrors] = useState({});

	const [body, setbody] = useState({
		refresh: "",
	});
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const deleteModalData = {
		id: deleteMessage?.user_id,
		name: deleteMessage?.full_name,
	};

	const [disableValue, setdisableValue] = useState({
		role_id: "",
		status: false,
	});

	async function handleDelete(id) {
		const obj = {
			user_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_user_admin_delete",
				obj,
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setbody({
					...body,
					refresh: 2,
				});
				dispatch(toggleSpinnerAndDisableButton(false));
				setTimeout(() => {
				}, 1700);
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		}
		dispatch(hideModal());
	}

	const handleEdit = useCallback(
		async (data) => {
			dispatch(toggleForm());
			setFormTitle("Edit Role");
			try {
				const response = await userService.post(
					"/api/v0/web/web_user_roles_preview",
					{ role_id: data.original.role_id },
				);

				if (response.data.valid) {
					let value = response.data.data[0];
					let tempData = { ...inputValues };
					for (let key in inputValues) {
						if (value.hasOwnProperty(key)) {
							tempData[key] = value[key];
						}
					}
					tempData.p_action = "UPDATE";
					setinputValues(tempData);
				} else {
					alert(response.data.message);
				}
			} catch (err) {
				console.error(err);
			}
		},
		[dispatch, inputValues],
	);

	const disableCategory = async (row, status) => {
		console.log("======> ", row.original);
		console.log("Status: ", status);
		try {
			const updatedDisableValue = {
				...disableValue,
				role_id: row.original.role_id,
				status: status,
			};
			const response = await userService.post(
				"/api/v0/web/web_user_roles_update_status",
				updatedDisableValue,
			);

			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setbody({
					...body,
					refresh: 2,
				});
				setTimeout(() => {
				}, 1600);
			} else {
				alert("error");
			}
		} catch (err) {
			console.error(err);
		}
	};

	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
				size: 80,
			},
			{
				accessorKey: "role_name",
				header: "Role Name",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "description",
				header: "Description",
				enableColumnFilter: false,
				size: 240,
			},
			{
				accessorKey: "is_active",
				header: "Active",
				enableColumnFilter: false,
				size: 100,
				Cell: ({ row, renderedCellValue }) => {
					return (
						<div className="d-flex align-items-center gap-3">
							<div className="actionswitch">
								<Form.Check
									type="switch"
									size="lg"
									variant="danger"
									defaultChecked={renderedCellValue}
									onChange={(e) => disableCategory(row, e.target.checked)}
								/>
							</div>
						</div>
					);
				},
			},
		],
		[isUserRight],
	);

	const insertForm = async () => {
		if (!validateForm()) return;
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/web_user_roles_insert",
				inputValues,
			);
			if (response.data.valid) {
				setinputValues(initialValues);
				setErrors({});
				showToast("success", "Role saved successfully!");
				setupdateGrid(updateGrid + 1);
				setbody({ ...body, refresh: 2 });
				dispatch(toggleForm());
			} else {
				showToast("error", response.data.message || "Failed to save role.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred. Please try again.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!inputValues.role_name.trim()) newErrors.role_name = "Role name is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleClose = () => {
		setinputValues(initialValues);
		setErrors({});
		dispatch(toggleForm());
		setFormTitle("Add Role");
	};

	return (
		<MainLayout pageName="User Roles" hasAddButton={isUserRight?.can_insert}>
			<CommonDataGrid
				url={"/api/v0/web/web_user_roles_browse"}
				columns={gridColumns}
				body={body}
				jsonUpd={updateGrid}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
			<Modal size="lg" show={addButton} onHide={handleClose} centered className="modalwrapper">
				<Modal.Header className="border-0">
					<Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>{formTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row>
							<Col md={6} className="mb-3">
								<TextField
									size="small"
									fullWidth
									label="Role Name *"
									name="role_name"
									value={inputValues.role_name}
									placeholder="Enter role name"
									onChange={(e) => {
										setinputValues((prev) => ({ ...prev, role_name: e.target.value }));
										if (errors.role_name) setErrors((prev) => ({ ...prev, role_name: "" }));
									}}
									error={!!errors.role_name}
									helperText={errors.role_name}
								/>
							</Col>
							<Col md={6} className="mb-3">
								<TextField
									size="small"
									fullWidth
									label="Description"
									name="description"
									value={inputValues.description ?? ""}
									placeholder="Enter description"
									onChange={(e) =>
										setinputValues((prev) => ({ ...prev, description: e.target.value }))
									}
								/>
							</Col>
							<Col md={6} className="mb-3">
								<Form.Check
									type="switch"
									id="is_active"
									name="is_active"
									label="Is Active"
									onChange={(event) =>
										setinputValues({ ...inputValues, is_active: event.target.checked })
									}
									checked={inputValues.is_active}
								/>
							</Col>
							<Col md={12} className="d-flex justify-content-end gap-2 mt-3">
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
									className="cancelBtn"
									onClick={handleClose}
								>
									Cancel
								</Button>
							</Col>
						</Row>
					</Form>
				</Modal.Body>
			</Modal>
		</MainLayout>
	);
}

export default UserRoles;
