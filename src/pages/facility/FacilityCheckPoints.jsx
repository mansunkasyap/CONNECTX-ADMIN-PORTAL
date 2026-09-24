import { useMemo, useState } from "react";
import { Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import DeleteModal from "../../components/DeleteModal";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { userService } from "../../../service/service";
import { BsTrash3Fill } from "react-icons/bs";
import moment from "moment";
import { MdOutlineEdit , MdMoreVert } from "react-icons/md";
import Toast from "../../components/Toast";
import { FaPrint } from "react-icons/fa";
import config from "../../../service/config";
import { useNavigate } from "react-router-dom";


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

export default function FacilityCheckPoints() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [toast, setToast] = useState({ show: false, type: "success", message: "" });
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [updateGrid, setupdateGrid] = useState(0);
	const initialValues = {
		action: "INSERT",
		checkpoint_id: 85,
		checkpoint_code: "",
		qrcode: "",
		customer_id: null,
		scan_interval: 2,
		allowed_delay: 15,
		company_name: "",
		customer_code: "",
		area: "",
		customer_name: "",
	};

	const [formValues, setFormValues] = useState(initialValues);

	const deleteMessage = useSelector((state) => state.removeModal.message);

	const deleteModalData = {
		id: deleteMessage?.checkpoint_id,
		name: deleteMessage?.qrcode,
	};

	//starts of user rights
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
	// ends od user rights
	async function handleDelete(id) {
		const obj = {
			checkpoint_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_checkpoint_delete",
				obj
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setupdateGrid(Math.random());
				dispatch(toggleSpinnerAndDisableButton(false));
				setTimeout(() => {
					setupdateGrid(updateGrid + 1);
				}, 1700);
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error(err);
		}
		dispatch(hideModal());
	}

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
				accessorKey: "checkpoint_code",
				header: "Facility Checkpoint",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "company_name",
				header: "Company Name",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "qrcode",
				header: "Qr Code ",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "scan_interval",
				header: "Scan Interval (MINS.) ",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "allowed_delay",
				header: "Delay Time(MINS.)",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "area",
				header: "Area",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "created_by_name",
				header: "Created By",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "created_at",
				header: "Date",
				enableColumnFilter: false,
				size: 190,
				Cell: ({ row }) => {
					const CheckIn = row.original.created_at;
					if (!CheckIn) return "N/A";
					return <span>{moment(CheckIn).format("DD-MM-YYYY (hh:mm A)")}</span>;
				},
			},
			{
				accessorKey: "updated_by_name",
				header: "Updated By",
				enableColumnFilter: false,
				size: 200,
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
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
		],
		[]
	);

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "update";
		navigate("/facility/facility-check-points/add", {
			state: {
				id: obj.checkpoint_id,
				type: "edit",
			},
		});
	};

	return (
		<MainLayout
			isShowing={false}
			pageName={"Facility CheckPoints"}
			columns={gridColumn}
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			linkto={"/facility/facility-check-points/add"}
			branchDropdown={false}
		>
			<CommonDataGrid
				url={"/api/v0/web/browse_facility_location_checkpoint"}
				columns={gridColumn}
				body={{}}
				jsonUpd={updateGrid}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
		</MainLayout>
	);
}
