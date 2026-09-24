import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import DeleteModal from "../../components/DeleteModal";
import Toast from "../../components/Toast";
import { Badge } from "react-bootstrap";
import { BsPenFill, BsTrash3Fill } from "react-icons/bs";
import { FaEye } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import {
	hideModal,
	showModal,
	toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { userService } from "../../../service/service";
import moment from "moment";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";

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

export default function Assets() {
	const [updateGrid, setupdateGrid] = useState(0);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const deleteModalData = {
		id: deleteMessage?.asset_id,
		name: deleteMessage?.check_list_name,
	};
	async function handleDelete(id) {
		const obj = {
			asset_id: id,
		};
		try {
			const response = await userService.post(
				"/api/v0/web/delete_master_asset",
				obj,
			);
			if (response.data.valid) {
				showToast("success", "Saved successfully!");
				setFilters({
					...filters,
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
			console.error("error", err);
		}
		dispatch(hideModal());
	}
	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (getUser) {
			const moduleRights = getUser.find(
				(val) => val.module_name.toLowerCase() === url[1],
			);
			const transactionPath = url.slice(2).join("/");
			const finalModule = moduleRights?.rights.filter(
				(val) =>
					val.transaction_code.replace(/ /g, "-").toLowerCase() === transactionPath,
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

	const [filters, setFilters] = useState({
		refresh: "",
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

	const gridColumn = useMemo(() => [
		{
			accessorKey: "id",
			header: "S.No.",
			enableColumnFilter: false,
			Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
			size: 90,
		},
		{
			accessorKey: "check_list_name",
			header: "Task Name",
			enableColumnFilter: false,
			size: 280,
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
									value.customer_id,
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
					size: 350,
					Cell: ({ row }) => (
						<>
							<div>{row.original.company_name}</div>
						</>
					),
				},
			],
		},
		{
			accessorKey: "type",
			header: "Type",
			enableColumnFilter: false,
			size: 100,
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
			accessorKey: "date_of_expiry",
			header: "Date of Expiry",
			enableColumnFilter: false,
			size: 160,
			Cell: ({ row }) => {
				const createdAt = row.original.date_of_expiry;

				if (!createdAt) return "N/A";

				return <span>{moment(createdAt).format("DD/MM/YYYY")}</span>;
			},
		},
		{
			accessorKey: "date_of_inspection",
			header: "Date of Inspection",
			enableColumnFilter: false,
			size: 160,
			Cell: ({ row }) => {
				const createdAt = row.original.date_of_inspection;

				if (!createdAt) return "N/A";

				return <span>{moment(createdAt).format("DD/MM/YYYY")}</span>;
			},
		},
		{
			accessorKey: "updated_at",
			header: "Updated at",
			enableColumnFilter: false,
			size: 160,
			Cell: ({ row }) => {
				const createdAt = row.original.updated_at;

				if (!createdAt) return "N/A";

				return <span>{moment(createdAt).format("DD/MM/YYYY")}</span>;
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
	]);

	const handlePreview = (data) => {
		const obj = {
			...data,
		};
		obj.type = "preview";
		navigate("/facility/assets-/-services/add", {
			state: {
				id: obj.asset_id,
				type: "preview",
			},
		});
	};

	const handleEdit = (data) => {
		const obj = { ...data };
		navigate("/facility/assets-/-services/add", {
			state: {
				id: obj.asset_id,
				type: "edit",
			},
		});
	};
	return (
		<>
			<MainLayout
				isShowing={false}
				pageName={"Assets"}
				hasAddButton={true}
				// hasAddButton={isUserRight?.can_insert}
				branchDropdown={false}
				linkto={"/facility/assets-/-services/add"}
			>
				<CommonDataGrid
					url={"/api/v0/web/browse_master_assets"}
					columns={gridColumn}
					body={filters}
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
		</>
	);
}
