import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";

function PaginationCustom({ totalRecord, paramPage, getParam }) {
	const [param, setparam] = useState({
		page_number: 1,
		page_size: 25,
		sort_column: "",
		sort_order: "no",
	});
	function setupPagination() {
		return Math.ceil(totalRecord / param.page_size);
	}

	// useEffect(() => {
	//   setparam(getParam);
	// }, [getParam]);

	return (
		<div className="paginationwrapper">
			<div className="d-flex align-items-center gap-2">
				<label>Row per page: </label>
				<select
					value={param.page_size}
					onChange={(event) => {
						if (parseInt(event.target.value) > 0) {
							const obj = { ...param };
							obj.page_size = parseInt(event.target.value);
							setparam(obj);
							paramPage(obj);
						}
					}}
					style={{ width: "auto" }}
				>
					<option value="25">25</option>
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="200">200</option>
				</select>
			</div>
			<div className="d-flex align-items-center gap-2">
				<label>Go to page: </label>
				<input
					type="number"
					defaultValue={param.page_number}
					onChange={(event) => {
						if (parseInt(event.target.value) > 0) {
							const obj = { ...param };
							obj.page_number = parseInt(event.target.value);
							setparam(obj);
							paramPage(obj);
						}
					}}
					style={{ width: "50px" }}
				/>
			</div>
			<div className="pages d-flex align-items-center gap-2">
				<Stack spacing={2}>
					<Pagination
						count={setupPagination()}
						color="primary"
						page={param.page_number}
						onChange={(event, value) => {
							const obj = { ...param };
							obj.page_number = value;
							setparam(obj);
							paramPage(obj);
						}}
					/>
				</Stack>
			</div>
		</div>
	);
}

export default PaginationCustom;
