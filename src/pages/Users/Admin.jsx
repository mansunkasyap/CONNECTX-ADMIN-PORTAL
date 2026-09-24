/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { BsTrash3Fill } from "react-icons/bs";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { useDispatch, useSelector } from "react-redux";
import { userService } from "../../../service/service";
import DeleteModal from "../../components/DeleteModal";
import Toast from "../../components/Toast";
import moment from "moment";
import { Navigate, useNavigate } from "react-router-dom";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { IconButton, Menu, MenuItem } from "@mui/material";

function RowActionMenu({
	row,
	onEdit,
	onPreview,
	onDelete,
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

function Admin() {
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const [updateGrid, setupdateGrid] = useState(0);
	const dispatch = useDispatch();
	const navigate = useNavigate();

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
		id: deleteMessage?.user_id,
		name: deleteMessage?.full_name,
	};
	// starts of user rights code
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
	//ends of user rights code
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
				accessorKey: "emp_code",
				header: "Employee Code",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "full_name",
				header: "Full Name",
				enableColumnFilter: false,
				size: 180,
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
				size: 240,
			},
			{
				accessorKey: "created_by_name",
				header: "Created by",
				enableColumnFilter: false,
				size: 150,
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
				accessorKey: "updated_by_name",
				header: "Updated by",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "updated_by_time",
				header: " Updated Date",
				enableColumnFilter: false,
				size: 190,
				Cell: ({ row }) => {
					const CheckIn = row.original.updated_by_time;
					if (!CheckIn) return "N/A";
					return <span>{moment(CheckIn).format("DD-MM-YYYY (hh:mm A)")}</span>;
				},
			},
			{
				accessorKey: "action",
				header: "Action",
				enableColumnFilter: false,
				size: 130,
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
		[],
	);

	const handlePreview = (data) => {
		const obj = { ...data };
		obj.p_action = "update";
		navigate("/users/admin/add", {
			state: {
				id: obj.user_id,
				type: "preview",
			},
		});
	};

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "update";
		navigate("/users/admin/add", {
			state: {
				id: obj.user_id,
				type: "edit",
			},
		});
	};

	return (
		<MainLayout
			isShowing={false}
			pageName="Admin"
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			linkto={"/users/admin/add"}
			// branchDropdown={true}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_user_admin_browse"}
				columns={gridColumns}
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

export default Admin;
