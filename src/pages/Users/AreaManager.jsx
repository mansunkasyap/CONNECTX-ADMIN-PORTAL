import { useMemo, useState } from "react";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { Badge, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { BsTrash3Fill } from "react-icons/bs";
import moment from "moment";
import { userService } from "../../../service/service";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import DeleteModal from "../../components/DeleteModal";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineEdit , MdMoreVert } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { getDeleteErrorMessage } from "../../utils/deleteErrorHandler";
import { FormControl, InputLabel, MenuItem, Select , IconButton, Menu } from "@mui/material";


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

function AreaManager() {
	const spinnerButton = useSelector(
		(state) => state.toggleSpinnerAndDisableButton.show
	);
	const [updateGrid, setupdateGrid] = useState(0);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const [body, setbody] = useState({
		refresh: "",
	});
	const [showTypeModal, setShowTypeModal] = useState(false);
	const [areaManagerType, setareaManagerType] = useState(null);
	const [formData, setFormData] = useState({
		type: "",
	});
	const deleteModalData = {
		id: deleteMessage?.area_manager_id,
		name: deleteMessage?.emp_code,
	};
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	// user rights code starts
	const getUser = useSelector((state) => state.getUserRight.data);
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
	// eds of user rights
	async function handleDelete(id) {
		const obj = {
			p_action: "DELETE",
			area_manager_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_area_manager_delete",
				obj
			);

			if (response.data.valid) {
				showToast("success", "Deleted successfully!");
				setbody({ ...body, refresh: 2 });
				setupdateGrid(updateGrid + 1);
			} else {
				showToast("error", getDeleteErrorMessage(response.data, "Area Manager"));
			}
		} catch (err) {
			console.error("Error occurred while deleting:", err);
			showToast("error", getDeleteErrorMessage(err?.response?.data, "Area Manager"));
		} finally {
			dispatch(hideModal());
			dispatch(toggleSpinnerAndDisableButton(false));
		}
	}

	function handleTypeModal(rowData) {
		setareaManagerType(rowData);
		setFormData({
			type: rowData?.type || "",
		});
		setShowTypeModal(true);
	}

	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "emp_code",
				header: "Employee Code",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "branch_code",
				header: "Branch Code",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "branch_manager_code",
				header: "Branch Manager Code",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "branch_manager_name",
				header: "Branch Manager Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "ops_manager_name",
				header: "OPS Manager Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "type",
				header: "Type",
				enableColumnFilter: false,
				size: 180,
				Cell: ({ _, row }) => (
					<Badge
						bg="dark"
						className="cursor-pointer"
						onClick={() => handleTypeModal(row.original)}
					>
						{row.original.type ? row.original.type : `View`}
					</Badge>
				),
			},

			{
				accessorKey: "full_name",
				header: "Full Name",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "mobile",
				header: "Mobile",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "email",
				header: "Email",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "created_by_name",
				header: "Created by",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "created_by_time",
				header: "Date",
				enableColumnFilter: false,
				size: 190,
				Cell: ({ row }) => {
					const CheckIn = row.original.created_by_time;
					if (!CheckIn) return "N/A";
					return <span>{moment(CheckIn).format("DD-MM-YYYY (hh:mm A)")}</span>;
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
          onPreview={handlePreview}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canView={isUserRight?.can_view}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
		],
		[isUserRight]
	);

	const handlePreview = (data) => {
		const obj = {
			...data,
		};
		obj.type = "Preview";
		navigate("/users/area-manager/add", {
			state: {
				id: obj.area_manager_id,
				type: "preview",
			},
		});
	};

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "UPDATE";
		navigate("/users/area-manager/add", {
			state: {
				id: obj.area_manager_id,
				type: "edit",
			},
		});
	};

	async function handleSubmitType() {
		dispatch(toggleSpinnerAndDisableButton(true));
		try {
			const response = await userService.post(
				"/api/v0/web/update_area_manager_type",
				{ ...formData, area_manager_id: areaManagerType.area_manager_id }
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setTimeout(() => {
					dispatch(toggleSpinnerAndDisableButton(false));
					setShowTypeModal(false);
					setbody((prev) => ({ ...prev, refresh: Math.random() }));
				}, 1000);
			}
		} catch (err) {
			console.error(err);
		}
	}

	return (
		<MainLayout
			isShowing={false}
			pageName="Area Manager"
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			linkto={"/users/area-manager/add"}
			// branchDropdown={true}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_area_manager_browse"}
				columns={gridColumns}
				body={body}
				jsonUpd={updateGrid}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />

			<Modal show={showTypeModal} size="md" centered>
				<Modal.Header>
					<Modal.Title>Area Manager Type</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Row>
							<Col md={12} className="mb-4 validate">
								<FormControl fullWidth variant="outlined" size="small">
									<InputLabel>Type</InputLabel>
									<Select
										name="type"
										value={formData.type}
										onChange={(event) =>
											setFormData({ type: event.target.value })
										}
										label="Type"
									>
										<MenuItem value="E&M">E&M</MenuItem>
										<MenuItem value="HK">HK</MenuItem>
									</Select>
								</FormControl>
							</Col>
							<Col md={12} className="d-flex gap-3 align-items-center">
								<Button
									size="sm"
									variant="none"
									type="button"
									className="commonBtn"
									onClick={handleSubmitType}
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
									onClick={() => setShowTypeModal(false)}
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

export default AreaManager;
