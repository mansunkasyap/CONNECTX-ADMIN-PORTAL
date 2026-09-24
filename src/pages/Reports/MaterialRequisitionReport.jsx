/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import moment from "moment";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";

export default function MaterialRequisitionReport() {
	const [updateGrid, setUpdateGrid] = useState(0);

	const [filters, setFilters] = useState({
		material_name: "",
		company: "",
		customer_id: null,
		approve_qty: null,
		request_qty: null,
		location_name: "",
		location_id: null,
		remarks: "",
		updated_at: "",
	});

	const handleFilterChange = (filterKey, value, filterKeyId, id) => {
		const normalizedValue = value === "" || value === null ? null : value;
		setFilters((prevFilters) => ({
			...prevFilters,
			[filterKey]: normalizedValue,
			[filterKeyId]: id,
		}));
		setUpdateGrid((prev) => prev + 1);
	};
	const gridColumns = useMemo(() => {
		return [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 80,
			},

			{
				accessorKey: "material_name",
				header: "Material Name",
				enableColumnFilter: false,
				size: 150,
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
										value?.customer_id,
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
						accessorKey: "r_customer",
						header: "Customer",
						enableColumnFilter: false,
						size: 300,
						// eslint-disable-next-line react/prop-types
						Cell: ({ row }) => (
							<>
								<div>{row.original.company_name}</div>
							</>
						),
					},
				],
			},
			{
				id: "location_name",
				Header: () => {
					return (
						<div className="tabletopheader">
							{filters.customer_id && (
								<AutoCompletedDropdown
									url={"/api/v0/web/list_facility_location_checkpoint"}
									body={{ customer_id: filters.customer_id }}
									handleDataChange={(value) =>
										handleFilterChange(
											"location_name",
											value?.location_name,
											"location_id",
											value?.location_id,
										)
									}
									valueInput={filters.location_name}
									objLevel={"location_name"}
								/>
							)}
						</div>
					);
				},
				columns: [
					{
						accessorKey: "location_name",
						header: "Location",
						enableColumnFilter: false,
						size: 300,
						// eslint-disable-next-line react/prop-types
						Cell: ({ row }) => (
							<>
								<div>{row.original.location_name}</div>
							</>
						),
					},
				],
			},
			{
				accessorKey: "request_qty",
				header: "Request Qty",
				enableColumnFilter: false,
				size: 110,
			},
			{
				accessorKey: "approve_qty",
				header: "Approve Qty",
				enableColumnFilter: false,
				size: 120,
			},
			{
				accessorKey: "remarks",
				header: "Remarks",
				enableColumnFilter: false,
				size: 220,
			},
			{
				accessorKey: "created_at",
				header: "Created At",
				enableColumnFilter: false,
				size: 220,
				Cell: ({ row }) => (
					<span>
						{row.original.created_at} ({row.original.created_time})
					</span>
				),
			},
		];
	}, [filters]);
	return (
		<>
			<MainLayout pageName="Material Requisition Report" hasAddButton={false}>
				<CommonDataGrid
					url={"/api/v0/web/report_facility_material_request"}
					columns={gridColumns}
					body={filters}
					jsonUpd={updateGrid}
				/>
			</MainLayout>
		</>
	);
}
