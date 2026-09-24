import { useMemo, useState, useEffect } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import moment from "moment";
import { Badge, Button, Col, Form, Row, Spinner } from "react-bootstrap";
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

function Customer() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const deleteMessage = useSelector((state) => state.removeModal.message);
	const [updateGrid, setupdateGrid] = useState(0);
	const [body, setbody] = useState({
		refresh: "",
		from_date: moment().format("YYYY-MM-DD"),
		to_date: moment().format("YYYY-MM-DD"),
	});

	const [filters, setFilters] = useState({
		from_date: moment().format("YYYY-MM-DD"),
		to_date: moment().format("YYYY-MM-DD"),
	});
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const [syncDates, setSyncDates] = useState({
		from_date: moment().format("YYYY-MM-DD"),
		to_date: moment().format("YYYY-MM-DD"),
	});
	const [isSyncing, setIsSyncing] = useState(false);

	const handleBulkReport = async () => {
		setIsSyncing(true);
		try {
			const response = await userService.get(
				`/api/v0/service/web_master_customer_bulk_upsert?from_date=${syncDates.from_date}&to_date=${syncDates.to_date}`,
			);
			if (response?.data?.valid || response?.status === 200) {
				setupdateGrid(updateGrid + 1);
			} else {
				// alert(response?.data?.message || "Failed to bulk upsert");
			}
		} catch (err) {
			console.error(err);
			//   alert("An error occurred during bulk upsert");
		} finally {
			setIsSyncing(false);
		}
	};
	const deleteModalData = {
		id: deleteMessage?.customer_id,
		name: deleteMessage?.full_name,
	};
	// user rights starts
	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (!getUser || !Array.isArray(getUser)) {
			return {
				can_view: false,
				can_insert: false,
				can_edit: false,
				can_delete: false,
				can_print: false,
			};
		}

		const moduleRights = getUser.find(
			(val) => val.module_name?.toLowerCase() === url[1],
		);

		const finalModule = moduleRights?.rights?.find(
			(val) =>
				val.transaction_code?.replace(/ /g, "-").toLowerCase() === url[2],
		);

		return (
			finalModule || {
				can_view: false,
				can_insert: false,
				can_edit: false,
				can_delete: false,
				can_print: false,
			}
		);
	}, [getUser, url]);
	// user rights ends
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
				accessorKey: "branch_code",
				header: "Branch Code",
				enableColumnFilter: false,
				size: 100,
			},
			{
				accessorKey: "customer_code",
				header: "Customer Code",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "customer_group_name",
				header: "Customer group Name",
				enableColumnFilter: false,
				size: 200,
			},

			{
				accessorKey: "company_name",
				header: "Company Name",
				enableColumnFilter: false,
				size: 300,
			},
			{
				accessorKey: "display_name",
				header: "Display Name",
				enableColumnFilter: false,
				size: 300,
			},
			{
				accessorKey: "contact_person",
				header: "Contact Person",
				enableColumnFilter: false,
				size: 180,
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
				accessorKey: "gstin",
				header: "GSTIN",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "created_by_name",
				header: "Created by",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "created_by_time",
				header: "Created Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ renderedCellValue, row }) => {
					return (
						<span>
							{moment(row.original.created_by_time).format("DD/MM/YYYY")}{" "}
						</span>
					);
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
				header: "Updated Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => {
					const date = row.original.updated_by_time;
					return (
						<span>{date ? moment(date).format("DD/MM/YYYY") : "N/A"}</span>
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
						onPreview={handlePreview}
						onDelete={(data) => dispatch(showModal(data))}
						canEdit={isUserRight?.can_edit}
						canView={isUserRight?.can_view}
						canDelete={isUserRight?.can_delete}
					/>
				),
			},
		],
		[isUserRight, body],
	);

	const handlePreview = (data) => {
		const obj = { ...data };
		obj.p_action = "UPDATE";
		navigate("/customers/customer/add", {
			state: {
				id: obj.customer_id,
				type: "preview",
			},
		});
	};

	const handleEdit = (data) => {
		const obj = { ...data };
		obj.p_action = "update";
		navigate("/customers/customer/add", {
			state: {
				id: obj.customer_id,
				type: "edit",
			},
		});
	};
	return (
		<MainLayout
			isShowing={false}
			pageName="Customer"
			// hasAddButton={true}
			hasAddButton={isUserRight?.can_insert}
			linkto={"/customers/customer/add"}
			// branchDropdown={true}
		>
			<div style={{ position: "relative" }}>
				<div
					style={{
						position: "absolute",
						top: 12,
						right: 185,
						zIndex: 5,
						display: "flex",
						alignItems: "center",
						gap: 6,
						pointerEvents: "none",
					}}
				>
					<Form.Control
						type="date"
						size="sm"
						value={syncDates.from_date}
						onChange={(e) =>
							setSyncDates((prev) => ({ ...prev, from_date: e.target.value }))
						}
						style={{ width: 130, fontSize: 13, pointerEvents: "auto" }}
					/>
					<span
						style={{
							fontSize: 12,
							color: "#64748b",
							fontWeight: 500,
							pointerEvents: "auto",
						}}
					>
						to
					</span>
					<Form.Control
						type="date"
						size="sm"
						value={syncDates.to_date}
						onChange={(e) =>
							setSyncDates((prev) => ({ ...prev, to_date: e.target.value }))
						}
						style={{ width: 130, fontSize: 13, pointerEvents: "auto" }}
					/>
					<Button
						size="sm"
						variant="none"
						className="commonBtn ms-1 p-0 pt-1 pb-1"
						onClick={handleBulkReport}
						disabled={isSyncing}
						style={{ pointerEvents: "auto" }}
					>
						{isSyncing ? (
							<Spinner animation="border" size="sm" variant="dark" />
						) : (
							"Search"
						)}
					</Button>
				</div>
				<CommonDataGrid
					url={"/api/v0/web/web_master_customer_browse"}
					columns={gridColumns}
					body={body}
					jsonUpd={updateGrid}
				/>
			</div>

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

export default Customer;
