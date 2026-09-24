import { useMemo, useState } from "react";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { Badge } from "react-bootstrap";
import { BsEyeFill, BsPenFill, BsTrash3Fill } from "react-icons/bs";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { userService } from "../../../service/service";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import DeleteModal from "../../components/DeleteModal";
import Toast from "../../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdOutlineEdit, MdMoreVert } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import moment from "moment";
import { IconButton, Menu, MenuItem } from "@mui/material";

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

function OPSManager() {
	const [updateGrid, setupdateGrid] = useState(0);
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const deleteModalData = {
		id: deleteMessage?.ops_manager_id,
		name: deleteMessage?.emp_code,
	};
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [filter, setFilter] = useState({
		refresh: "",
		branch_code: "",
		p_branch_id: null,
		branchcode: "",
		branchmanagercode: "",
	});
	// user rights code starts
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
	// userrights ocde ends
	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilter((prevFilters) => ({
			...prevFilters,
			[filterKey]: value || "",
			[filterKeyId]: id,
		}));
		setupdateGrid((prev) => prev + 1);
	};

	async function handleDelete(id) {
		const obj = {
			p_action: "DELETE",
			ops_manager_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/web_ops_manager_delete",
				obj,
			);

			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setFilter({
					...filter,
					refresh: 2,
				});
				setupdateGrid(updateGrid + 1);
			} else {
				alert(response.data.message);
			}
		} catch (err) {
			console.error("Error occurred while deleting:", err);
		} finally {
			dispatch(hideModal());
			dispatch(toggleSpinnerAndDisableButton(false));
			showToast("success", "Saved successfully!");
			setTimeout(() => {}, 3000);
		}
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
				size: 200,
			},
			{
				accessorKey: "email",
				header: "Email",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "mobile",
				header: "Mobile",
				enableColumnFilter: false,
				size: 150,
			},
			{
				id: "branch_code",
				Header: () => {
					return (
						<div className="tabletopheader">
							<AutoCompletedDropdown
								url={"/api/v0/web/web_branch_dropdown"}
								handleDataChange={(value) =>
									handleFilterChange(
										"branchcode",
										value?.branch_code,
										"p_branch_id",
										value.branch_id,
									)
								}
								valueInput={filter.branchcode}
								objLevel={"branch_code"}
							/>
						</div>
					);
				},
				columns: [
					{
						accessorKey: "branch_code",
						header: "Branch Code",
						width: 280,
						enableColumnFilter: false,
						minSize: 200,
					},
				],
			},
			{
				id: "branch_manager_code",
				Header: () => {
					return (
						<div className="tabletopheader">
							<AutoCompletedDropdown
								url={"/api/v0/web/web_branch_manager_dropdown"}
								handleDataChange={(value) =>
									handleFilterChange(
										"branchmanagercode",
										value?.emp_code,
										"p_branch_manager_id",
										value.user_id,
									)
								}
								valueInput={filter.branchmanagercode}
								objLevel={"emp_code"}
							/>
						</div>
					);
				},
				columns: [
					{
						accessorKey: "branch_manager_code",
						header: "Branch Manager",
						width: 280,
						enableColumnFilter: false,
						minSize: 230,
						Cell: ({ row }) => {
							const { branch_manager_code, branch_manager_name } = row.original;
							if (!branch_manager_code || !branch_manager_name) return;
							return (
								<span>
									<strong>{branch_manager_code}</strong> - {branch_manager_name}
								</span>
							);
						},
					},
				],
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
				Cell: ({ renderedCellValue }) => {
					if (!renderedCellValue) return <span>-</span>;
					const formattedDate = moment(renderedCellValue).isValid()
						? moment(renderedCellValue).format("DD-MM-YYYY")
						: "-";
					const formattedTime = moment(renderedCellValue).isValid()
						? moment(renderedCellValue).format("LT")
						: "-";
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
				header: "Updated by",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "updated_by_time",
				header: "Updated Date",
				Cell: ({ renderedCellValue }) => {
					if (!renderedCellValue) return <span>-</span>;
					const formattedDate = moment(renderedCellValue).isValid()
						? moment(renderedCellValue).format("DD-MM-YYYY")
						: "-";
					const formattedTime = moment(renderedCellValue).isValid()
						? moment(renderedCellValue).format("LT")
						: "-";
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
						onPreview={handlePreview}
						onDelete={(data) => dispatch(showModal(data))}
						canEdit={isUserRight?.can_edit}
						canView={isUserRight?.can_view}
						canDelete={isUserRight?.can_delete}
					/>
				),
			},
		],
		[filter, isUserRight],
	);
	const handlePreview = (data) => {
		const obj = {
			...data,
		};
		obj.type = "Preview";
		navigate("/users/ops-manager/add", {
			state: {
				id: obj.ops_manager_id,
				type: "preview",
			},
		});
	};

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "update";
		navigate("/users/ops-manager/add", {
			state: {
				id: obj.ops_manager_id,
				type: "edit",
			},
		});
	};

	return (
		<MainLayout
			isShowing={false}
			pageName="OPS Manager"
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			linkto={"/users/ops-manager/add"}
			// branchDropdown={true}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_ops_manager_browse"}
				columns={gridColumns}
				body={filter}
				jsonUpd={updateGrid}
			/>
			<DeleteModal removeId={handleDelete} data={deleteModalData} />
			<Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
		</MainLayout>
	);
}

export default OPSManager;
