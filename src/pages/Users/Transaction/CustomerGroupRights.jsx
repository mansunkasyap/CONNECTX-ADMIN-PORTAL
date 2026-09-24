import {
	Checkbox,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Autocomplete,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { userService } from "../../../../service/service";
import MainLayout from "../../../components/MainLayout";
import Toast from "../../../components/Toast";

const StyledTableCell = withStyles(() => ({
	head: {
		backgroundColor: "#1e293b",
		color: "#fff",
		fontWeight: 600,
		fontSize: 12,
		letterSpacing: "0.04em",
		textTransform: "uppercase",
		whiteSpace: "nowrap",
		padding: "10px 16px",
	},
	body: {
		fontSize: 13,
		padding: "6px 16px",
	},
}))(TableCell);

const CustomerGroupRights = () => {
	const [groupList, setGroupList] = useState([]);
	const groupIdRef = useRef(null);
	const [rightsList, setRightsList] = useState([]);
	const [filteredArray, setFilteredArray] = useState([]);
	const [saving, setSaving] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState(null);
	const [autocompleteKey, setAutocompleteKey] = useState(0);
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

	const loadRights = (customer_group_id) => {
		userService
			.get(
				`/api/v0/web/customer_group_rights_browse?customer_group_id=${customer_group_id}`,
			)
			.then((data) => {
				const rows = data?.data?.data || [];
				setRightsList(rows);
				setFilteredArray(rows);
			})
			.catch(() => {});
	};

	const handleGroupChange = (_, value) => {
		if (!value) {
			setSelectedGroupId(null);
			groupIdRef.current = null;
			setRightsList([]);
			setFilteredArray([]);
			return;
		}
		groupIdRef.current = value.customer_group_id;
		setSelectedGroupId(value.customer_group_id);
		loadRights(value.customer_group_id);
	};

	useEffect(() => {
		userService
			.post("/api/v0/web/web_customer_group_dropdown", { p_limit: 1000 })
			.then((data) => {
				setGroupList(data?.data?.data || []);
			})
			.catch(() => {});
	}, []);

	const onRightChange = (obj, key, checked) => {
		const next = [...rightsList];
		const idx = next.findIndex(
			(x) => x.transaction_id === obj.transaction_id,
		);
		if (idx > -1) {
			next[idx] = { ...next[idx], [key]: checked };
		} else {
			next.push({ ...obj, [key]: checked });
		}
		setRightsList(next);
		setFilteredArray(next);
	};

	const onSave = () => {
		if (!groupIdRef.current) return;
		setSaving(true);
		const body = {
			customer_group_id: groupIdRef.current,
			json: rightsList,
		};
		userService
			.post("/api/v0/web/customer_group_rights_manage", body)
			.then((data) => {
				if (data.status === 200) {
					showToast("success", "Customer group rights updated successfully!");
					setRightsList([]);
					setFilteredArray([]);
					groupIdRef.current = null;
					setSelectedGroupId(null);
					setAutocompleteKey((k) => k + 1);
				} else {
					showToast("error", "Something went wrong. Please try again.");
				}
			})
			.catch(() => {
				showToast("error", "Something went wrong. Please try again.");
			})
			.finally(() => {
				setSaving(false);
			});
	};

	return (
		<MainLayout pageName="Customer Group Rights" hasAddButton={false}>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "calc(100vh - 130px)",
					background: "#fff",
					borderRadius: 10,
					border: "1px solid #f1f3f5",
					boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						flexShrink: 0,
						padding: "16px 20px",
						borderBottom: "1px solid #f1f3f5",
						background: "#fff",
					}}
				>
					<div className="d-flex align-items-center gap-3">
						<div style={{ width: 320 }}>
							<Autocomplete
								key={autocompleteKey}
								size="small"
								options={groupList}
								getOptionLabel={(option) =>
									option.group_name || option.customer_group_name || ""
								}
								onChange={handleGroupChange}
								fullWidth
								renderInput={(params) => (
									<TextField
										{...params}
										label="Customer Group"
										variant="outlined"
									/>
								)}
							/>
						</div>
						{filteredArray.length > 0 && (
							<span style={{ fontSize: 12, color: "#94a3b8" }}>
								{filteredArray.length} permission
								{filteredArray.length !== 1 ? "s" : ""}
							</span>
						)}
					</div>
				</div>

				<div style={{ flex: 1, overflow: "hidden" }}>
					<TableContainer style={{ height: "100%", overflowY: "auto" }}>
						<Table stickyHeader size="small" aria-label="customer group rights table">
							<TableHead>
								<TableRow>
									<StyledTableCell style={{ minWidth: 200 }}>
										Transaction
									</StyledTableCell>
									<StyledTableCell style={{ minWidth: 150 }}>
										Module
									</StyledTableCell>
									<StyledTableCell align="center" style={{ minWidth: 70 }}>
										View
									</StyledTableCell>
									<StyledTableCell align="center" style={{ minWidth: 70 }}>
										New
									</StyledTableCell>
									<StyledTableCell align="center" style={{ minWidth: 70 }}>
										Edit
									</StyledTableCell>
									<StyledTableCell align="center" style={{ minWidth: 70 }}>
										Delete
									</StyledTableCell>
									<StyledTableCell align="center" style={{ minWidth: 70 }}>
										Print
									</StyledTableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredArray.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={7}
											align="center"
											style={{
												padding: "48px 0",
												color: "#94a3b8",
												fontSize: 14,
											}}
										>
											Select a Customer Group to view permissions
										</TableCell>
									</TableRow>
								) : (
									filteredArray.map((menu, index) => (
										<TableRow
											key={menu.transaction_id || index}
											sx={{
												backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc",
												"&:hover": { backgroundColor: "#f1f5f9" },
												"&:last-child td, &:last-child th": { border: 0 },
											}}
										>
											<StyledTableCell
												style={{
													fontWeight: 500,
													color: "#1e293b",
													textTransform: "none",
													letterSpacing: 0,
													fontSize: 13,
												}}
											>
												{menu.transaction_code}
											</StyledTableCell>
											<StyledTableCell
												style={{
													color: "#64748b",
													textTransform: "none",
													letterSpacing: 0,
													fontSize: 13,
												}}
											>
												{menu.module_name}
											</StyledTableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(e) =>
														onRightChange(menu, "can_view", e.target.checked)
													}
													color="primary"
													checked={menu.can_view === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(e) =>
														onRightChange(menu, "can_insert", e.target.checked)
													}
													color="primary"
													checked={menu.can_insert === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(e) =>
														onRightChange(menu, "can_edit", e.target.checked)
													}
													color="primary"
													checked={menu.can_edit === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(e) =>
														onRightChange(menu, "can_delete", e.target.checked)
													}
													color="primary"
													checked={menu.can_delete === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(e) =>
														onRightChange(menu, "can_print", e.target.checked)
													}
													color="primary"
													checked={menu.can_print === true}
												/>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</div>

				<div
					style={{
						flexShrink: 0,
						padding: "12px 20px",
						borderTop: "1px solid #f1f3f5",
						background: "#fff",
						display: "flex",
						justifyContent: "flex-end",
					}}
				>
					<Button
						size="sm"
						variant="none"
						type="button"
						className="commonBtn"
						onClick={onSave}
						disabled={saving || !selectedGroupId}
					>
						{saving ? (
							<Spinner animation="border" variant="dark" size="sm" />
						) : (
							"Update"
						)}
					</Button>
				</div>
			</div>
			<Toast
				show={toast.show}
				type={toast.type}
				message={toast.message}
				onClose={hideToast}
			/>
		</MainLayout>
	);
};

export default CustomerGroupRights;
