/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { useMemo } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import {
	Badge,
	Button,
	Col,
	Form,
	Modal,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";
import config from "../../../service/config";

function TrainerClosureReport() {
	const [updateGrid, setupdateGrid] = useState(0);
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncDates, setSyncDates] = useState({
		from_date: moment().format("YYYY-MM-DD"),
		to_date: moment().format("YYYY-MM-DD"),
	});
	const [filters, setFilters] = useState({
		trainer_id: null,
		// from_date: moment().format("YYYY-MM-DD"),
		// to_date: moment().format("YYYY-MM-DD"),
	});

	const handleSearch = async () => {
		setIsSyncing(true);
		try {
			setFilters((prev) => ({
				...prev,
				from_date: syncDates.from_date,
				to_date: syncDates.to_date,
			}));
			setupdateGrid((prev) => prev + 1);
		} finally {
			setIsSyncing(false);
		}
	};

	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 120,
			},
			{
				accessorKey: "emp_code",
				header: "Employee Code",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "full_name",
				header: "Name",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "man_hours",
				header: "Man Hours",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "total_class_room",
				header: "Class Room",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "total_field_training",
				header: "Field Training",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "total_manpower",
				header: "Manpower",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "total_predeployment",
				header: "Pre-Deployment",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "total_records",
				header: "Total Records",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "total_security_trained",
				header: "Total Security Trained",
				enableColumnFilter: false,
				size: 220,
			},
			{
				accessorKey: "total_sites",
				header: "Total Sites",
				enableColumnFilter: false,
				size: 220,
			},
			{
				accessorKey: "total_skill_assessment",
				header: "Total Skill Assessment",
				enableColumnFilter: false,
				size: 220,
			},
			{
				accessorKey: "total_virtual_training",
				header: "Total Virtual Training",
				enableColumnFilter: false,
				size: 220,
			},
			{
				accessorKey: "report_date",
				header: "Report Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => (
					<span>{moment(row.original.report_date).format("DD/MM/YYYY")}</span>
				),
			},
		],
		[filters],
	);

	return (
		<MainLayout pageName="Trainer Closer Report" hasAddButton={false}>
			<div style={{ position: "relative" }}>
				{/* <div
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
						id="from_date"
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
						id="to_date"
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
						onClick={handleSearch}
						disabled={isSyncing}
						style={{ pointerEvents: "auto" }}
					>
						{isSyncing ? (
							<Spinner animation="border" size="sm" variant="dark" />
						) : (
							"Search"
						)}
					</Button>
				</div> */}
				<CommonDataGrid
					url={"/api/v0/web/trainer_closed_report"}
					columns={gridColumns}
					body={filters}
					jsonUpd={updateGrid}
				/>
			</div>
		</MainLayout>
	);
}

export default TrainerClosureReport;
