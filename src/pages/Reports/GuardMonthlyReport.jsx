/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";

function GuardMonthlyReport() {
	const [updateGrid, setupdateGrid] = useState(0);
	const [filters, setFilters] = useState({
		company: "",
		customer_id: null,
	});

	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		setFilters((prev) => ({
			...prev,
			[filterKey]: value || "",
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
				size: 80,
			},
			{
				accessorKey: "emp_code",
				header: "ID Number",
				enableColumnFilter: false,
				size: 130,
			},
			{
				accessorKey: "full_name",
				header: "Name",
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "father_name",
				header: "Father Name",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "designation",
				header: "Category",
				enableColumnFilter: false,
				size: 140,
			},
			{
				accessorKey: "mobile",
				header: "Mobile",
				enableColumnFilter: false,
				size: 140,
			},
			{
				id: "site_name_group",
				Header: () => (
					<div className="tabletopheader">
						<AutoCompletedDropdown
							url={"/api/v0/web/web_customer_dropdown"}
							handleDataChange={(value) =>
								handleFilterChange(
									"company",
									value?.company_name,
									"customer_id",
									value?.customer_id
								)
							}
							valueInput={filters.company}
							objLevel={"company_name"}
						/>
					</div>
				),
				columns: [
					{
						accessorKey: "customer_name",
						header: "Site Name",
						enableColumnFilter: false,
						minSize: 280,
						Cell: ({ row }) => {
							const code = row.original.customer_code || "";
							const name = row.original.customer_name || "";
							return code ? `${code} - ${name}` : name;
						},
					},
				],
			},
			{
				accessorKey: "total_trainings",
				header: "Total Training Attended",
				enableColumnFilter: false,
				size: 180,
			},
			{
				accessorKey: "total_training_hrs",
				header: "Total Man Hours",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "class_room_training",
				header: "Class Room",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "field_training",
				header: "Field",
				enableColumnFilter: false,
				size: 90,
			},
			// {
			// 	accessorKey: "virtual_training",
			// 	header: "Virtual",
			// 	enableColumnFilter: false,
			// 	size: 100,
			// },
			{
				accessorKey: "total_questions",
				header: "Maximum Marks",
				enableColumnFilter: false,
				size: 140,
			},
			{
				accessorKey: "correct_answers",
				header: "Marks Obtained",
				enableColumnFilter: false,
				size: 150,
			},
			{
				accessorKey: "wrong_answers",
				header: "Wrong",
				enableColumnFilter: false,
				size: 100,
			},
			{
				accessorKey: "score_pct",
				header: "Score %",
				enableColumnFilter: false,
				size: 110,
				Cell: ({ row }) => `${row.original.score_pct ?? 0}%`,
			},
			{
				accessorKey: "grade",
				header: "Grade",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "last_training_date",
				header: "Last Training Date",
				enableColumnFilter: false,
				size: 160,
			},
			{
				accessorKey: "remarks",
				header: "Remarks",
				enableColumnFilter: false,
				size: 180,
			},
		],
		[filters]
	);

	return (
		<MainLayout pageName="Guard Monthly Report" hasAddButton={false}>
			<CommonDataGrid
				url={"/api/v0/web/guard_monthly_report"}
				columns={gridColumns}
				body={filters}
				jsonUpd={updateGrid}
			/>
		</MainLayout>
	);
}

export default GuardMonthlyReport;
