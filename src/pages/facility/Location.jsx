import { useCallback, useMemo, useState } from "react";
import moment from "moment";
import { Badge, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { TextField , IconButton, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import {
	hideModal,
	showModal,
	toggleForm,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { BsPenFill, BsTrash3Fill } from "react-icons/bs";
import DeleteModal from "../../components/DeleteModal";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { userService } from "../../../service/service";
import Toast from "../../components/Toast";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import config from "../../../service/config";
import { FaPrint } from "react-icons/fa6";


function RowActionMenu({ row, onEdit, onPrint, onDelete, canEdit, canPrint, canDelete }) {
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
        {canPrint && <MenuItem onClick={() => { onPrint(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><FaPrint size={13} /> Print</MenuItem>}
        {canDelete && <MenuItem onClick={() => { onDelete(row); handleClose(); }} sx={{ gap: 1, fontSize: 14, color: "error.main" }}><BsTrash3Fill size={13} /> Delete</MenuItem>}
      </Menu>
    </>
  );
}

export default function Location() {
	const dispatch = useDispatch();
	const getUser = useSelector((state) => state.getUserRight.data);
	const addButton = useSelector((state) => state.addFormButton.show);
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show
	);
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [formTitle, setFormTitle] = useState("Add Location");

	const deleteMessage = useSelector((state) => state.removeModal.message);
	const deleteModalData = {
		id: deleteMessage?.location_id,
		name: deleteMessage?.location_name,
	};

	const initialValues = {
		company_name: "",
		customer_id: null,
		location_name: "",
		location_id: null,
		qrcode: "",
	};

	const [inputValues, setinputValues] = useState(initialValues);

	const [errors, setErrors] = useState({});
	const [body, setbody] = useState({
		refresh: "",
	});
	const [updateGrid, setupdateGrid] = useState(0);

	const handleClose = () => {
		setFormTitle("Add Location");
		setinputValues(initialValues);
		setErrors({});
		dispatch(toggleForm());
	};

	const handleQrCodeChange = (event) => {
		const value = event.target.value;
		setinputValues((prevValues) => ({
			...prevValues,
			qrcode: value,
			checkpoint_code: value,
		}));
		if (errors.qrcode) setErrors((prev) => ({ ...prev, qrcode: "" }));
	};

	const [filters, setFilters] = useState({
		r_customer: "",
		r_guard_name: "",
		customer_id: null,
		guard_id: null,
		company_name: "",
		company: "",
		branch: "",
		branch_id: null,
		r_branch_name: "",
	});

	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilters((prevFilters) => ({
			...prevFilters,
			[filterKey]: value === "" ? null : value,
			[filterKeyId]: id,
		}));
		setupdateGrid((prev) => prev + 1);
	};

	// start userRights

	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (getUser) {
			const moduleRights = getUser.find(
				(val) => val.module_name.toLowerCase() === url[1]
			);
			const finalModule = moduleRights?.rights.filter(
				(val) =>
					val.transaction_code.replace(/ /g, "-").toLowerCase() === url[2]
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

	const handleEdit = useCallback(
		async (data) => {
			dispatch(toggleForm());
			setFormTitle("Edit Location");
			try {
				const response = await userService.post(
					"/api/v0/web/preview_facility_location_checkpoint",
					{ location_id: data.location_id }
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
					showToast("error", response.data.message || "Failed to load data.");
				}
			} catch (err) {
				console.error(err);
				showToast("error", "An unexpected error occurred.");
			}
		},
		[dispatch, inputValues]
	);

	const handlePrint = (data) => {
		const url = `${config.reactUrl}facility/location-print/${data}`;
		window.open(url, "_blank");
	};

	const gridColumn = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ _, row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "location_name",
				header: "Location Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				id: "company_name",
				Header: () => {
					return (
						<div className="tabletopheader">
							<AutoCompletedDropdown
								url={"/api/v0/web/web_customer_dropdown"}
								handleDataChange={(value) =>
									handleFilterChange(
										"company",
										value?.company_name,
										"customer_id",
										value.customer_id
									)
								}
								valueInput={filters.company}
								objLevel={"company_name"}
							/>
						</div>
					);
				},
				columns: [
					{
						accessorKey: "company_name",
						header: "Customer",
						enableColumnFilter: false,
						size: 300,
						Cell: ({ row }) => (
							<>
								<div>{row.original.company_name}</div>
							</>
						),
					},
				],
			},
			{
				accessorKey: "created_at",
				header: "Created Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const createdAt = row.original.created_at;

					if (!createdAt) return "N/A";

					return (
						<span>
							{moment(createdAt).format("DD/MM/YYYY")} (
							{moment(createdAt).format("LT")})
						</span>
					);
				},
			},
			{
				accessorKey: "updated_at",
				header: "Updated Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const updatedAt = row.original.updated_at;

					if (!updatedAt) return "N/A";

					return (
						<span>
							{moment(updatedAt).format("DD/MM/YYYY")} (
							{moment(updatedAt).format("LT")})
						</span>
					);
				},
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
            onPrint={(data) => handlePrint(data.location_id)}
            onDelete={(data) => dispatch(showModal(data))}
            canEdit={isUserRight?.can_edit}
            canPrint={isUserRight?.can_print}
            canDelete={isUserRight?.can_delete}
          />
        ),
        },
		],
		[isUserRight, dispatch, filters, handleFilterChange]
	);

	const handleChange = useCallback((event) => {
		const { name, value } = event.target;
		setinputValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	}, []);

	const validateForm = () => {
		const newErrors = {};
		if (!inputValues.customer_id) newErrors.customer_id = "Customer is required.";
		if (!inputValues.location_name.trim()) newErrors.location_name = "Location name is required.";
		if (!inputValues.qrcode.trim()) newErrors.qrcode = "QR code value is required.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const insertForm = async () => {
		if (!validateForm()) return;
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/create_update_facility_location_checkpoint",
				inputValues
			);
			if (response.data.valid) {
				setinputValues(initialValues);
				setErrors({});
				showToast("success", "Location saved successfully!");
				setupdateGrid(updateGrid + 1);
				setbody({ ...body, refresh: 2 });
				dispatch(toggleForm());
			} else {
				showToast("error", response.data.message || "Found duplicate entries.");
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An error occurred while saving the location.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	};

	async function handleDelete(id) {
		try {
			const response = await userService.post(
				"/api/v0/web/delete_facility_location_checkpoint",
				{ location_id: id }
			);
			if (response.data.valid) {
				showToast("success", "Deleted successfully!");
				setupdateGrid((prev) => prev + 1);
			} else {
				const msg = response.data.message || "";
				const errorMessage = msg.includes("violates foreign key constraint")
					? "Location has been used in the module and cannot be deleted."
					: msg || "Failed to delete.";
				showToast("error", errorMessage);
			}
		} catch (err) {
			console.error(err);
			showToast("error", "An unexpected error occurred.");
		} finally {
			dispatch(toggleSpinnerAndDisableButton(false));
			dispatch(hideModal());
		}
	}

	return (
		<MainLayout
			isShowing={false}
			pageName={"Location"}
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			branchDropdown={false}
		>
			<CommonDataGrid
				url={"/api/v0/web/browse_facility_location_checkpoint"}
				columns={gridColumn}
				body={filters}
				jsonUpd={updateGrid}
			/>
			<Modal size="lg" show={addButton} onHide={handleClose} centered className="modalwrapper">
				<Modal.Header className="border-0">
					<Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>{formTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row>
							<Col md={6} className="mb-3">
								<AutoCompletedDropdown
									url={"/api/v0/web/web_customer_dropdown"}
									body={{ p_limit: 10, reload: false }}
									handleDataChange={(val) => {
										setinputValues((prevValues) => ({
											...prevValues,
											customer_id: val.customer_id,
											customer_code: val.customer_code,
											company_name: val.company_name,
										}));
										if (errors.customer_id) setErrors((prev) => ({ ...prev, customer_id: "" }));
									}}
									valueInput={inputValues.company_name}
									objLevel={"company_name"}
									labelName={"Customer *"}
									error={!!errors.customer_id}
									helperText={errors.customer_id}
									sx={{
										"& .MuiAutocomplete-clearIndicator": {
											visibility: "visible",
										},
									}}
								/>
							</Col>
							<Col md={6} className="mb-3">
								<TextField
									size="small"
									fullWidth
									label="Location Name *"
									name="location_name"
									value={inputValues.location_name}
									placeholder="Enter location name"
									onChange={(e) => {
										setinputValues((prev) => ({ ...prev, location_name: e.target.value }));
										if (errors.location_name) setErrors((prev) => ({ ...prev, location_name: "" }));
									}}
									error={!!errors.location_name}
									helperText={errors.location_name}
								/>
							</Col>
							<Col md={6} className="mb-3">
								<TextField
									size="small"
									fullWidth
									label="QR Code Value *"
									name="qrcode"
									value={inputValues.qrcode}
									onChange={handleQrCodeChange}
									error={!!errors.qrcode}
									helperText={errors.qrcode}
								/>
							</Col>
							{inputValues.qrcode && (
								<Col md={6} className="mb-3 text-center">
									<p className="fs-6 fw-bold text-center mb-1">Generated QR Code</p>
									<img
										src={config.QrCodeUrl + inputValues.qrcode}
										alt="Generated QR Code"
										width="140"
										height="140"
										className="border p-2 rounded-2 m-auto"
									/>
								</Col>
							)}
							<Col md={12} className="d-flex justify-content-end gap-2 mt-2">
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
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
		</MainLayout>
	);
}
