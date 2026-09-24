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
import { useRef } from "react";
import { useEffect, useState } from "react";
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

const Employe = () => {
	const [listDepartment, setlistDepartment] = useState([]);
	const setemployeId = useRef(null);
	const [userRightList, setUserRightList] = useState([]);
	const [filteredArray, setFilteredArray] = useState([]);
	const [saving, setSaving] = useState(false);
	const [selectedRoleId, setSelectedRoleId] = useState(null);
	const [autocompleteKey, setAutocompleteKey] = useState(0);
	const [toast, setToast] = useState({
		show: false,
		type: "success",
		message: "",
	});
	const showToast = (type, message) => setToast({ show: true, type, message });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
	const getUserRightList = (id) => {
		userService
			.get(`/api/v0/web/web_user_rights_browse?role_id=${id}&global=false`)
			.then((data) => {
				setUserRightList(data.data.data);
				setFilteredArray(data.data.data);
			})
			.catch((err) => {
				// showErrorToast(err);
			});
	};
	const handelDepartment = (e, value) => {
		if (!value) {
			setSelectedRoleId(null);
			return;
		}
		getUserRightList(value.role_id);
		setemployeId.current = value.role_id;
		setSelectedRoleId(value.role_id);
	};
	// const onSearch = (e) => {
	//   if (e.code === 'Enter') {
	//     const items = filteredArray.filter(
	//       (x) => x.employee?.split(' ')[0].toLowerCase() === e.target.value
	//     );
	//     if (items.length > 0) {
	//       setFilteredArray(items);
	//     }
	//   }
	// };
	useEffect(() => {
		userService
			.post("/api/v0/web/web_user_roles_dropdown?search=")
			.then((data) => {
				setlistDepartment(data.data.data);
			})
			.catch((err) => {
				// showErrorToast(err);
			});
	}, []);
	// const onUserRightChange = (obj, key, checked) => {
	//   let selected = [...userRightList];
	//   let item = obj;
	//   item[key] = checked;
	//   let filteredIndex = userRightList.findIndex(
	//     (x) => x.transaction_id === obj.transaction_id
	//   );
	//   if (filteredIndex > -1) {
	//     selected[filteredIndex][key] = checked;
	//     setUserRightList(selected);
	//   } else {
	//     setUserRightList([...userRightList, item]);
	//   }
	// };

	const onUserRightChange = (obj, key, checked) => {
		let selected = [...userRightList];
		let item = obj;
		item[key] = checked;

		let filteredIndex = userRightList.findIndex(
			(x) => x.transaction_id === obj.transaction_id,
		);

		if (filteredIndex > -1) {
			selected[filteredIndex][key] = checked;
			setUserRightList(selected);
		} else {
			setUserRightList([...userRightList, item]);
		}
	};

	const onSave = () => {
		setSaving(true);
		const body = {
			role_id: setemployeId.current,
			json: userRightList,
		};
		userService
			.post("/api/v0/web/web_user_rights_manage", body)
			.then((data) => {
				if (data.status === 200) {
					showToast("success", "User rights updated successfully!");
					setUserRightList([]);
					setFilteredArray([]);
					setemployeId.current = null;
					setSelectedRoleId(null);
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
		<MainLayout pageName="User Roles" hasAddButton={false}>
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
				{/* Top bar — always visible */}
				<div
					style={{
						flexShrink: 0,
						padding: "16px 20px",
						borderBottom: "1px solid #f1f3f5",
						background: "#fff",
					}}
				>
					<div className="d-flex align-items-center gap-3">
						<div style={{ width: 280 }}>
							<Autocomplete
								key={autocompleteKey}
								size="small"
								options={listDepartment}
								getOptionLabel={(option) => option.role_name}
								onChange={handelDepartment}
								fullWidth
								renderInput={(params) => (
									<TextField
										{...params}
										label="User Roles"
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

				{/* Scrollable table — grows to fill space */}
				<div style={{ flex: 1, overflow: "hidden" }}>
					<TableContainer style={{ height: "100%", overflowY: "auto" }}>
						<Table stickyHeader size="small" aria-label="user rights table">
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
											Select a User Role to view permissions
										</TableCell>
									</TableRow>
								) : (
									filteredArray.map((menu, index) => (
										<TableRow
											key={index}
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
													onChange={(event) =>
														onUserRightChange(
															menu,
															"can_view",
															event.target.checked,
														)
													}
													color="primary"
													checked={menu.can_view === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(event) =>
														onUserRightChange(
															menu,
															"can_insert",
															event.target.checked,
														)
													}
													color="primary"
													checked={menu.can_insert === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(event) =>
														onUserRightChange(
															menu,
															"can_edit",
															event.target.checked,
														)
													}
													color="primary"
													checked={menu.can_edit === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(event) =>
														onUserRightChange(
															menu,
															"can_delete",
															event.target.checked,
														)
													}
													color="primary"
													checked={menu.can_delete === true}
												/>
											</TableCell>
											<TableCell align="center" style={{ padding: "2px 16px" }}>
												<Checkbox
													size="small"
													onChange={(event) =>
														onUserRightChange(
															menu,
															"can_print",
															event.target.checked,
														)
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

				{/* Bottom bar — always visible */}
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
						disabled={saving || !selectedRoleId}
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

export default Employe;
