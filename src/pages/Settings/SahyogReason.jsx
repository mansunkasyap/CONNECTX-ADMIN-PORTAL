import { useMemo, useState } from "react";
import moment from "moment";
import { Badge, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { TextField , IconButton, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import {
	hideModal,
	showModal,
	toggleForm,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { BsEyeFill, BsPenFill, BsTrash3Fill } from "react-icons/bs";
import DeleteModal from "../../components/DeleteModal";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { userService } from "../../../service/service";
import ModalComponent from "../../components/ModalComponent";
import Toast from "../../components/Toast";


function RowActionMenu({ row, onEdit, onPreview, onDelete, onRemarks, canEdit, canView, canDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenUpward(window.innerHeight - rect.bottom < 160);
    setAnchorEl(e.currentTarget);
  };
  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MdMoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: openUpward ? "top" : "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: openUpward ? "bottom" : "top", horizontal: "right" }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 120, borderRadius: 2 } } }}
      >
        {canEdit && <MenuItem onClick={() => { onEdit(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><MdOutlineEdit size={16} /> Edit</MenuItem>}
        {canView && <MenuItem onClick={() => { onPreview(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><FaEye size={14} /> View</MenuItem>}
        {onRemarks && <MenuItem onClick={() => { onRemarks(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><BsChatLeftDotsFill size={14} /> Remarks</MenuItem>}
        {canDelete && <MenuItem onClick={() => { onDelete(row); handleClose(); }} sx={{ gap: 1, fontSize: 14, color: "error.main" }}><BsTrash3Fill size={13} /> Delete</MenuItem>}
      </Menu>
    </>
  );
}

export default function SahyogReason() {
	const dispatch = useDispatch();
	const addButton = useSelector((state) => state.addFormButton.show);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show,
	);
	const [errors, setErrors] = useState({});
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [formTitle, setFormTitle] = useState("Add Sahyog Reason");

	const deleteMessage = useSelector((state) => state.removeModal.message);
	const deleteModalData = {
		id: deleteMessage?.reason_id,
	};

	const initialValues = {
		p_operation: "INSERT",
		reason_id: null,
		reason: "",
	};
	const validateForm = () => {
		const newErrors = {};
		if (!inputValues.reason) newErrors.reason = "Sahyog Reason is Required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const [inputValues, setinputValues] = useState(initialValues);

	const [body, setbody] = useState({
		refresh: "",
	});
	const [updateGrid, setupdateGrid] = useState(0);

	const handleClose = () => {
		setFormTitle("Add Sahyog Reason");
		setinputValues(initialValues);
		dispatch(toggleForm());
	};
	// start userRights
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
	}, [getUser, url]);
	//end UserRights
	const disableCategory = async (row) => {
		try {
			const updatedDisableValue = {
				is_disabled: !row.original.is_disabled,
				reason_id: row.original.reason_id,
				updated_by: row.original.updated_by,
			};

			const response = await userService.post(
				"/api/v0/web/web_sahyog_reason_disable",
				updatedDisableValue,
			);

			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setbody((prevState) => ({
					...prevState,
					refresh: prevState.refresh + 1,
				}));

				setTimeout(() => {
				}, 1600);
			} else {
				alert("Error updating category");
			}
		} catch (err) {
			console.error(err);
		}
	};

	async function handleDelete(id) {
		const obj = {
			reason_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_sahyog_reason_delete",
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
					setupdateGrid(updateGrid + 1);
				}, 1200);
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		}
		dispatch(hideModal());
	}

	const handleEdit = async (data) => {
		dispatch(toggleForm());
		setFormTitle("Edit Sahyog Reason");
		try {
			const response = await userService.post(
				"/api/v0/web/web_sahyog_reason_preview",
				{
					reason_id: data.original.reason_id,
					p_operation: "UPDATE",
				},
			);

			if (response.data.valid) {
				let value = response.data.data[0];
				let tempData = { ...inputValues };
				for (let key in inputValues) {
					if (value.hasOwnProperty(key)) {
						tempData[key] = value[key];
					}
				}
				setinputValues(tempData);
				tempData.p_operation = "UPDATE";
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const gridColumn = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "reason",
				header: "Sahyog Reason",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "is_disabled",
				header: "Disable",
				enableColumnFilter: false,
				size: 100,
				Cell: ({ row, renderedCellValue }) => {
					return (
						<div className="actionswitch">
							<Form.Check
								type="switch"
								size="sm"
								variant="danger"
								defaultChecked={renderedCellValue}
								onChange={() => ~row}
							/>
						</div>
					);
				},
			},
			{
				accessorKey: "created_by_name",
				header: "Created By",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "created_at",
				header: "Date(Time)",
				Cell: ({ renderedCellValue }) => {
					if (!renderedCellValue) return <span>-</span>;

					const date = moment(renderedCellValue);

					const isValidDate = date.isValid();
					const formattedDate = isValidDate ? date.format("DD-MM-YYYY") : "-";
					const formattedTime = isValidDate ? date.format("HH:mm A") : "-";

					return (
						<span>
							{formattedDate} ({formattedTime})
						</span>
					);
				},
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "updated_by_name",
				header: "Updated By",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "updated_at",
				header: "Date(Time)",
				Cell: ({ renderedCellValue }) => {
					if (!renderedCellValue) return <span>-</span>;

					const date = moment(renderedCellValue);

					const isValidDate = date.isValid();
					const formattedDate = isValidDate ? date.format("DD-MM-YYYY") : "-";
					const formattedTime = isValidDate ? date.format("HH:mm A") : "-";

					return (
						<span>
							{formattedDate} ({formattedTime})
						</span>
					);
				},
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "action",
				header: "Action",
				enableColumnFilter: false,
				size: 100,
				        Cell: ({ row }) => (
          <RowActionMenu
          row={row.original}
          onEdit={handleEdit}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
		],
		[isUserRight],
	);

	const handleChange = (event) => {
		setinputValues({
			...inputValues,
			[event.target.name]: event.target.value,
		});
	};

	const insertForm = async () => {
		//dispatch(toggleSpinnerAndDisableButton(true));
		if (!validateForm()) {
			// dispatch(toggleSpinnerAndDisableButton(false));
			return;
		}
		try {
			const response = await userService.post(
				"/api/v0/web/web_sahyog_reason_manage",
				inputValues,
			);
			if (response.status === 200) {
				if (response.data.status !== 400) {
					// alert(response.data.message || 'Found Duplicate Entries');
					dispatch(toggleSpinnerAndDisableButton(false));
					return;
				} else {
					setinputValues({
						p_operation: "INSERT",
						reason_id: null,
						reason: "",
					});
				}
			} else {
				// alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		} finally {
			dispatch(toggleForm());
			dispatch(toggleSpinnerAndDisableButton(false));
			showToast("success", "Saved successfully!");
			setupdateGrid(updateGrid + 1);
			setbody({
				...body,
				refresh: 2,
			});
			setTimeout(() => {
			}, 1200);
		}
	};
	const addFormJsx = (
		<Form>
			<Row>
				<Col md={12} className="mb-4 validate">
					<TextField
						size="small"
						fullWidth
						label={"Sahyog Reason"}
						name="reason"
						value={inputValues.reason}
						onChange={handleChange}
						error={!!errors.reason}
						helperText={errors.reason}
						required
					/>
				</Col>
				<Col md={12} className="d-flex justify-content-end gap-2">
					<Button
						size="sm"
						variant="none"
						className="canclebutton"
						onClick={handleClose}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						variant="none"
						type="button"
						className="savebutton"
						onClick={insertForm}
						disabled={spinnerButton}
					>
						{spinnerButton ? (
							<Spinner animation="border" variant="light" size="sm" />
						) : (
							"Submit"
						)}
					</Button>
				</Col>
			</Row>
		</Form>
	);

	return (
		<MainLayout
			isShowing={false}
			pageName={"Sahyog Reason"}
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			branchDropdown={false}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_sahyog_reason_browse"}
				columns={gridColumn}
				body={body}
				jsonUpd={updateGrid}
			/>
			<ModalComponent
				innerJsx={addFormJsx}
				modalTitle={formTitle}
				hidden={addButton}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
		</MainLayout>
	);
}
