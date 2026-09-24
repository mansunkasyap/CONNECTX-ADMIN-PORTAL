import { FormControl, TextField } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { Container } from "react-bootstrap";
import { CommonController } from "../components/CommonController";
import PaginationCustom from "../components/Paginations";
import { TableExportButton } from "./Common";
import { BiSearchAlt } from "react-icons/bi";
import { useEffect, useState } from "react";
export default function CommonDataGrid({
	// eslint-disable-next-line react/prop-types
	url, //api url
	// eslint-disable-next-line react/prop-types
	body, //api body request
	// eslint-disable-next-line react/prop-types
	columns, //column header
	// eslint-disable-next-line react/prop-types
	jsonUpd, //boolean
	// eslint-disable-next-line react/prop-types
	// browseData,
}) {
	const [sorting, setSorting] = useState([]);
	const [globalFilter, setGlobalFilter] = useState({
		p_search: "",
		// chk_all: false,
	});
	const [browseListData, setBrowseListData] = useState([]);
	// const [columnDraggable, setColumnDraggable] = useState(null);
	const [columnSizing, setColumnSizing] = useState({});
	const [visibleColumns, setVisibleColumns] = useState({});
	const [totalRecord, setTotalRecords] = useState(0);
	const [loading, setLoading] = useState(false);
	const [excelRecord, setexcel] = useState([]);
	const [params, setParams] = useState({
		page_number: 1,
		page_size: 25,
		sort_column: "",
		sort_order: "",
	});
	const getBrowseListData = async () => {
		setLoading(true);
		const obj = {
			...globalFilter,
			...body,
		};
		await CommonController.commonBrowseApiCallNew(url, obj, params)
			.then((data) => {
				if (data.valid) {
					setLoading(false);
					setBrowseListData(data.data);
					setTotalRecords(data.data[0]?.total_records || 0);
				} else {
					console.warn("Invalid response from API.");
					setLoading(false);
				}
			})
			.catch((error) => {
				console.error("Error fetching browse list data:", error);
				setLoading(false);
			});
	};

	function toTitleCase(key) {
		return key
			.toLowerCase()
			.split(/[_\s-]+/)
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");
	}
	const excelExcludeKeys = new Set([
		"guard_id", "location_id", "customer_id", "task_id", "type",
	]);
	function processArray(arr, parameterToRemove) {
		// Check if any row has nested asset objects (JSONB with checked property)
		let hasAssetBreakdown = false;
		for (const obj of arr) {
			for (const key in obj) {
				const val = obj[key];
				if (val && typeof val === "object" && !Array.isArray(val)) {
					for (const subKey in val) {
						const inner = val[subKey];
						if (inner && typeof inner === "object" && inner.hasOwnProperty("checked")) {
							hasAssetBreakdown = true;
							break;
						}
					}
				}
				if (hasAssetBreakdown) break;
			}
			if (hasAssetBreakdown) break;
		}

		if (hasAssetBreakdown) {
			// Group by location → separate sheet per location
			// Each sheet has that location's assets as column headers
			const sheets = {};
			arr.forEach((obj) => {
				const baseObj = {};
				let assetsObj = null;
				let locationName = "";
				for (const key in obj) {
					if (key === parameterToRemove) continue;
					if (excelExcludeKeys.has(key)) continue;
					const val = obj[key];
					if (key === "location_name") locationName = val || "Other";
					if (val && typeof val === "object" && !Array.isArray(val)) {
						const firstInner = Object.values(val)[0];
						if (firstInner && typeof firstInner === "object" && firstInner.hasOwnProperty("checked")) {
							assetsObj = val;
						} else {
							for (const subKey in val) {
								baseObj[toTitleCase(subKey)] = val[subKey];
							}
						}
					} else {
						baseObj[toTitleCase(key)] = val;
					}
				}
				if (!locationName) locationName = "Other";
				if (!sheets[locationName]) sheets[locationName] = { assetNames: new Set(), rows: [] };

				// Collect asset names for this location
				if (assetsObj) {
					Object.keys(assetsObj).forEach((n) => sheets[locationName].assetNames.add(n));
				}

				// Build row: base fields + each asset as Yes/No column
				const row = { ...baseObj };
				if (assetsObj) {
					const sortedAssets = [...sheets[locationName].assetNames].sort();
					sortedAssets.forEach((name) => {
						const info = assetsObj[name];
						if (info) {
							row[name] = info.checked ? "Yes" : "No";
						} else {
							row[name] = "No";
						}
					});
				}
				sheets[locationName].rows.push(row);
			});

			// Second pass: ensure all rows in each sheet have all asset columns
			for (const loc in sheets) {
				const sortedAssets = [...sheets[loc].assetNames].sort();
				sheets[loc].rows = sheets[loc].rows.map((row) => {
					const newRow = {};
					// Add base fields first (non-asset keys)
					for (const k in row) {
						if (!sortedAssets.includes(k)) newRow[k] = row[k];
					}
					// Add asset columns in order
					sortedAssets.forEach((name) => {
						newRow[name] = row[name] || "No";
					});
					return newRow;
				});
			}

			// Return multi-sheet format
			const finalSheets = {};
			for (const loc in sheets) {
				finalSheets[loc] = sheets[loc].rows;
			}
			return { _multiSheet: true, sheets: finalSheets };
		}

		// Default: flat conversion (no asset breakdown)
		return arr.map((obj) => {
			const newObj = {};
			for (const key in obj) {
				if (key === parameterToRemove) continue;
				if (excelExcludeKeys.has(key)) continue;
				newObj[toTitleCase(key)] = obj[key];
			}
			return newObj;
		});
	}
	const getDataExcel = async (total_record) => {
		const obj = {
			...globalFilter,
			...body,
		};

		const par = {
			page_number: 1,
			page_size: total_record,
		};
		await CommonController.commonBrowseApiCallNew(url, obj, par)
			.then((data) => {
				if (data.valid) {
					const processed = processArray(data.data, "total_records");
					setexcel(processed);
				}
			})
			.catch((error) => {
				console.error("Error fetching browse list data:", error);
			});
	};
	const debounce = (func, delay) => {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	};
	const handleSearch = debounce((e) => {
		setGlobalFilter((prevParams) => ({
			...prevParams,
			[e.target.name]: e.target.value,
		}));
	}, 500);
	const handleShortData = (short) => {
		if (short.length > 0) {
			setParams({
				...params,
				sort_column: short[0].field,
				sort_order: short[0].sort,
			});
		} else {
			setParams({
				...params,
				sort_column: "",
				sort_order: "",
			});
		}
	};
	useEffect(() => {
		getBrowseListData();
	}, [params, jsonUpd, globalFilter, body]);
	useEffect(() => {
		if (sorting.length > 0) {
			if (sorting[0].desc) {
				setParams({
					...params,
					sort_column: sorting[0].id,
					sort_order: "desc",
				});
			} else {
				setParams({ ...params, sort_column: sorting[0].id, sort_order: "asc" });
			}
		}
	}, [sorting]);

	return (
		<Container fluid className="p-0 cdgWrap">
			<style>{`
				.cdgWrap {
					--cdg-primary: #4b6cb7;
					--cdg-primary-dark: #182848;
					--cdg-text: #212b36;
					--cdg-muted: #637381;
					--cdg-border: #e4e7eb;
					--cdg-soft: #f4f6f8;
					--cdg-row-hover: #eef2ff;
					--cdg-stripe: #fafbfc;
				}
				.cdgWrap .cdgCard {
					background: #fff;
					border: 1px solid var(--cdg-border);
					border-radius: 14px;
					box-shadow: 0 4px 14px rgba(33, 43, 54, 0.06);
					overflow: hidden;
				}
				.cdgWrap .cdgToolbar {
					display: flex;
					align-items: center;
					justify-content: flex-start;
					gap: 12px;
					padding: 12px 16px;
					padding-right: 180px;
					border-bottom: 1px solid var(--cdg-border);
					background: linear-gradient(180deg, #ffffff, #fafbfc);
					min-height: 64px;
				}
				.cdgWrap .cdgSearch {
					position: relative;
					width: 320px;
					max-width: 100%;
					display: flex;
					align-items: center;
				}
				.cdgWrap .cdgSearch .MuiFormControl-root,
				.cdgWrap .cdgSearch .MuiTextField-root { width: 100%; margin: 0; }
				.cdgWrap .cdgSearch .MuiInputBase-root {
					height: 40px;
					border-radius: 10px;
					background: #fff;
					padding-left: 34px;
					font-size: 13px;
				}
				.cdgWrap .cdgSearch .MuiInputBase-input { padding: 8px 10px 8px 0 !important; }
				.cdgWrap .cdgSearch .MuiOutlinedInput-notchedOutline {
					border-color: var(--cdg-border);
				}
				.cdgWrap .cdgSearch .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline {
					border-color: var(--cdg-primary);
				}
				.cdgWrap .cdgSearch .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline {
					border-color: var(--cdg-primary);
					border-width: 1.5px;
				}
				.cdgWrap .cdgSearch svg.searchIcon {
					position: absolute;
					left: 12px;
					top: 50%;
					transform: translateY(-50%);
					color: var(--cdg-muted);
					font-size: 18px;
					z-index: 1;
					pointer-events: none;
				}
				.cdgWrap .cdgActions { display: flex; align-items: center; }
				.cdgWrap .cdgActions .exportbutton {
					margin: 0 !important;
					padding: 0 !important;
					display: flex;
					align-items: center;
				}
				.cdgWrap .cdgActions .exportbutton .btn {
					height: 40px;
					border-radius: 10px;
					font-weight: 600;
					font-size: 13px;
					padding: 0 16px;
					display: inline-flex;
					align-items: center;
					gap: 8px;
				}
				.cdgWrap .datagridtablewrapper {
					padding: 0;
				}
				.cdgWrap .datagridtablewrapper .MuiPaper-root {
					box-shadow: none !important;
					border-radius: 0 !important;
				}
				.cdgWrap .datagridtablewrapper .MuiTableHead-root th {
					background: linear-gradient(180deg, #f1f4f9, #e9edf3) !important;
					color: var(--cdg-text) !important;
					font-weight: 700 !important;
					font-size: 11.5px !important;
					text-transform: uppercase;
					letter-spacing: .4px;
					border-bottom: 2px solid var(--cdg-primary) !important;
				}
				.cdgWrap .datagridtablewrapper .MuiTableBody-root tr:nth-of-type(even) td {
					background: var(--cdg-stripe);
				}
				.cdgWrap .datagridtablewrapper .MuiTableBody-root tr:hover td {
					background: var(--cdg-row-hover) !important;
					transition: background .15s ease;
				}
				.cdgWrap .datagridtablewrapper .MuiTableBody-root td {
					color: var(--cdg-text);
					font-size: 12.5px;
				}
				.cdgWrap .cdgPaginationBar {
					border-top: 1px solid var(--cdg-border);
					padding: 10px 16px;
					background: #fcfcfd;
				}
			`}</style>
			<div className="cdgCard">
				<div className="cdgToolbar">
					<div className="cdgSearch">
						<BiSearchAlt className="searchIcon" />
						<FormControl size="small" variant="outlined" fullWidth>
							<TextField
								fullWidth
								id="filter_value"
								size="small"
								onChange={handleSearch}
								name="p_search"
								variant="outlined"
								autoComplete="off"
								placeholder="Search"
							/>
						</FormControl>
					</div>
					<div className="cdgActions">
						<TableExportButton
							excelData={excelRecord}
							handleExport={() => getDataExcel(totalRecord)}
							fileName={`connectx`}
						/>
					</div>
					<div className="cdgToolbarSpacer" />
				</div>
				<div className="datagridtablewrapper">
					<MaterialReactTable
						layoutMode="grid"
						enableResizing={true}
						columns={columns}
						data={browseListData}
						enableColumnActions={false}
						manualFiltering
						enableColumnFilterModes
						enablePagination={false}
						enableColumnFilters={false}
						enableGlobalFilter={false}
						enableSorting
						enableFullScreenToggle={false}
						enableColumnResizing
						enableHiding={true}
						onSortModelChange={(sort) => handleShortData(sort)}
						enableStickyHeader={true}
						manualSorting
						onSortingChange={setSorting}
						onColumnSizingChange={setColumnSizing}
						enableDensityToggle={false}
						initialState={{
							showColumnFilters: true,
							columnVisibility: visibleColumns,
							density: "compact",
							showGlobalFilter: true,
							columnPinning: {
								right: ["action"],
							},
						}}
						onColumnVisibilityChange={setVisibleColumns}
						state={{
							sorting,
							columnVisibility: visibleColumns,
							columnSizing: columnSizing,
							isLoading: loading,
						}}
						muiTablePaperProps={{
							elevation: 0,
							sx: { boxShadow: "none", borderRadius: 0 },
						}}
						muiTableHeadCellProps={{
							sx: {
								fontFamily:
									"Inter, -apple-system, 'Segoe UI', Roboto, sans-serif",
								fontSize: "11.5px",
								fontWeight: 700,
								letterSpacing: ".4px",
								textTransform: "uppercase",
								color: "#212b36",
								borderRight: "1px solid #e4e7eb",
								padding: "12px 10px",
							},
						}}
						muiTableBodyCellProps={{
							sx: {
								fontFamily:
									"Inter, -apple-system, 'Segoe UI', Roboto, sans-serif",
								fontSize: "12.5px",
								color: "#212b36",
								padding: "10px",
								borderRight: "1px solid #eef0f2",
								borderBottom: "1px solid #eef0f2",
								overflowWrap: "break-word",
								whiteSpace: "unset",
							},
						}}
						muiTableBodyRowProps={{
							sx: {
								"&:hover td": { backgroundColor: "#eef2ff !important" },
							},
						}}
						muiTableContainerProps={{
							sx: {
								height: `calc(100vh - 340px)`,
								paddingLeft: 0,
							},
						}}
					/>
				</div>
				<div className="cdgPaginationBar">
					<PaginationCustom
						getParam={params}
						totalRecord={totalRecord}
						paramPage={setParams}
					/>
				</div>
			</div>
		</Container>
	);
}
