import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import moment from "moment";
import { Badge } from "react-bootstrap";
import { BsEyeFill, BsPenFill, BsTrash3Fill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import DeleteModal from "../../components/DeleteModal";
import { useDispatch, useSelector } from "react-redux";
import { userService } from "../../../service/service";
import { MdOutlineEdit, MdMoreVert } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";

function RowActionMenu({
	row,
	onEdit,
	onPreview,
	onDelete,
	onRemarks,
	canEdit,
	canView,
	canDelete,
}) {
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
				anchorOrigin={{
					vertical: openUpward ? "top" : "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: openUpward ? "bottom" : "top",
					horizontal: "right",
				}}
				slotProps={{
					paper: { elevation: 3, sx: { minWidth: 120, borderRadius: 2 } },
				}}
			>
				{canEdit && (
					<MenuItem
						onClick={() => {
							onEdit(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14 }}
					>
						<MdOutlineEdit size={16} /> Edit
					</MenuItem>
				)}
				{canView && (
					<MenuItem
						onClick={() => {
							onPreview(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14 }}
					>
						<FaEye size={14} /> View
					</MenuItem>
				)}
				{onRemarks && (
					<MenuItem
						onClick={() => {
							onRemarks(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14 }}
					>
						<BsChatLeftDotsFill size={14} /> Remarks
					</MenuItem>
				)}
				{canDelete && (
					<MenuItem
						onClick={() => {
							onDelete(row);
							handleClose();
						}}
						sx={{ gap: 1, fontSize: 14, color: "error.main" }}
					>
						<BsTrash3Fill size={13} /> Delete
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

function CustomerLog() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const [updateGrid, setupdateGrid] = useState(0);
	const [body, setbody] = useState({
		refresh: "",
	});
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const deleteModalData = {
		id: deleteMessage?.customer_id,
		name: deleteMessage?.full_name,
	};
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

	async function handleDelete(id) {
		const obj = {
			customer_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_master_customer_delete",
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
				Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "group_name",
				header: "Customer Group Name",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "created_by_name",
				header: "Created By",
				enableColumnFilter: false,
				size: 270,
			},
			{
				accessorKey: "created_by_time",
				header: "Created Date",
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
				size: 200,
			},

			{
				accessorKey: "updated_by_time",
				header: " Updated Date",
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

	// const handlePreview = (data) => {
	//   const obj = { ...data };
	//   navigate('/customers/customer-group/add', {
	//     state: {
	//       id: obj.customer_group_id,
	//       type: 'preview',
	//     },
	//   });
	// };

	const handleEdit = (data) => {
		const obj = { ...data };
		navigate("/customers/customer-group/add", {
			state: {
				id: obj.customer_group_id,
				type: "edit",
			},
		});
	};

	return (
		<MainLayout
			isShowing={false}
			pageName="Customer Group"
			hasAddButton={true}
			// hasAddButton={isUserRight?.can_insert}
			//
			linkto={"/customers/customer-group/add"}
			// branchDropdown={true}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_master_customer_group_browse"}
				columns={gridColumn}
				body={body}
				jsonUpd={updateGrid}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
}

export default CustomerLog;
