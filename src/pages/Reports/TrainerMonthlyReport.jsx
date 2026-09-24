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
import { Badge, Col, Modal, Row, Table } from "react-bootstrap";
import config from "../../../service/config";

function TrainerMonthlyReport() {
	const [updateGrid, setupdateGrid] = useState(0);
	// const [trainersData, setTrainerData] = useState([]);
	//const [showTrainer, setShowTrainer] = useState(false);
	const [filters, setFilters] = useState({
		r_customer: "",
		r_guard_name: "",
		customer_id: null,
		guard_id: null,
		company_name: "",
		company: "",
	});

	function handleViewTrainer(data) {
		setTrainerData(data.trainers);
		setShowTrainer(true);
	}

	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilters((prevFilters) => ({
			...prevFilters,
			[filterKey]: value === "" ? null : value,
			[filterKeyId]: id,
		}));
		setupdateGrid((prev) => prev + 1);
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
			//  {
			//   accessorKey: 'month',
			//   header: 'Month',
			//   enableColumnFilter: false,
			//   size: 80,
			// },
			{
				accessorKey: "full_name",
				header: "Name",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "total_sites",
				header: "No. Of Sites",
				enableColumnFilter: false,
				size: 130,
			},
			// {
			// 	accessorKey: "total_trainers_in_schedule",
			// 	header: "No. of Manpower",
			// 	enableColumnFilter: false,
			// 	size: 160,
			// },
			{
				accessorKey: "total_class_room_training",
				header: "Class Room",
				enableColumnFilter: false,
				size: 130,
			},
			{
				accessorKey: "total_field_training",
				header: "Field",
				enableColumnFilter: false,
				size: 80,
			},
			// {
			// 	accessorKey: "total_virtual_training",
			// 	header: "Virtual",
			// 	enableColumnFilter: false,
			// 	size: 100,
			// },
			{
				accessorKey: "total_security",
				header: "Total No. of Security",
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "man_hours",
				header: "Total Training Man Hours",
				enableColumnFilter: false,
				size: 220,
			},
			{
				accessorKey: "no._of_predeployment_training_Conducted",
				header: "No of Predeployment Training",
				enableColumnFilter: false,
				size: 250,
			},
			{
				accessorKey:
					"total_security_personnel_trained_on_predeployment_training",
				header: "Total Security Personnel",
				enableColumnFilter: false,
				size: 210,
			},
			{
				accessorKey: "no_of_skill_assessment",
				header: "No. of Skilled Assessment Test ",
				enableColumnFilter: false,
				size: 260,
			},
			{
				accessorKey: "remark",
				header: "Remark",
				enableColumnFilter: false,
				size: 120,
			},
		],
		[filters]
	);
	return (
		<MainLayout
			pageName="Trainer Monthly Report"
			hasAddButton={false}
			//   linkto={'/guards/guards/add'}
			// branchDropdown={true}
		>
			<CommonDataGrid
				url={"/api/v0/web/monthly_trainer_report"}
				columns={gridColumns}
				body={filters}
				// jsonUpd={updateGrid}
			/>
			{/* <DeleteModal removeId={handleDelete} data={deleteModalData} /> */}
			{/* <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} /> */}
		</MainLayout>
	);
}

export default TrainerMonthlyReport;
