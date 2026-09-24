import { Autocomplete, TextField } from "@mui/material";
import { memo, useEffect, useState } from "react";
import { CommonController } from "./CommonController";

const BaseAutoCompleteDropdown = ({
	id,
	labelName,
	valueInput,
	listData = [], // Ensure listData has a default value
	objLevel,
	disabled,
	handleDataChange,
	setSearchText,
	error,
	helperText,
	sx,
}) => (
	<Autocomplete
		size="small"
		id={id}
		options={listData}
		disabled={disabled}
		getOptionLabel={(option) => option?.[objLevel] || ""} // Safely access objLevel
		fullWidth
		value={valueInput ? { [objLevel]: valueInput } : null}
		onChange={(_, value) => {
			if (value) {
				handleDataChange(value);
			} else {
				handleDataChange({ [objLevel]: "" });
			}
		}}
		sx={sx}
		renderInput={(params) => (
			<TextField
				{...params}
				onChange={(e) => setSearchText && setSearchText(e.target.value)}
				label={labelName}
				variant="outlined"
				error={error}
				helperText={helperText}
			/>
		)}
	/>
);

export const AutoCompletedDropdown = memo(
	({
		url,
		handleDataChange,
		labelName,
		valueInput,
		objLevel,
		disabled,
		body = {},
		id,
		error,
		helperText,
		sx,
	}) => {
		const [listData, setListData] = useState([]);
		const [searchText, setSearchText] = useState("");
		const [debounceTimer, setDebounceTimer] = useState(null);

		const dropDownList = async (search, body) => {
			try {
				const response = await CommonController.commonApiCallFilter(
					url,
					{ p_search: search, ...body },
					"post",
					"node"
				);
				if (response?.valid) {
					setListData(response.data);
				}
			} catch (error) {
				console.error("Error fetching dropdown data:", error);
				setListData([]); // Fallback to an empty list
			}
		};

		useEffect(() => {
			if (debounceTimer) clearTimeout(debounceTimer);
			const timer = setTimeout(() => {
				dropDownList(searchText, body);
			}, 1000); // Debounce delay

			setDebounceTimer(timer);

			return () => clearTimeout(timer);
			dropDownList("", body);
		}, [searchText]);

		useEffect(() => {
			if (body.reload) dropDownList("", body); // Trigger API call when `body` changes
		}, [body]); // Add `body` as a dependency

		return (
			<BaseAutoCompleteDropdown
				id={id}
				labelName={labelName}
				valueInput={valueInput}
				listData={listData}
				objLevel={objLevel}
				disabled={disabled}
				handleDataChange={handleDataChange}
				setSearchText={setSearchText}
				error={error}
				helperText={helperText}
				sx={sx}
			/>
		);
	}
);

export const AutoCompleteDropdownWithoutUrl = memo(
	({
		labelName,
		valueInput,
		listData = [], // Ensure listData has a default value
		id,
		objLevel,
		disabled,
		handleDataChange,
	}) => (
		<BaseAutoCompleteDropdown
			id={id}
			labelName={labelName}
			valueInput={valueInput}
			listData={listData}
			objLevel={objLevel}
			disabled={disabled}
			handleDataChange={handleDataChange}
		/>
	)
);

export const AutoCompleteDropdownId = memo(
	({ url, body, handleDataChange, labelName, valueInput, objLevel }) => {
		const [listData, setListData] = useState([]);
		const [fieldValue, setFieldValue] = useState(null);

		const dropDownList = async () => {
			try {
				const data = await CommonController.commonApiCallFilter(
					url,
					body,
					"post",
					"node"
				);
				if (data.valid) {
					setListData(data.data);
					if (valueInput !== "") {
						const filterData = data.data.filter(
							(val) => val[objLevel] === valueInput
						);
						setFieldValue(filterData[0] || null); // Fallback to null if no match
					} else {
						const obj = Object.keys(data.data[0] || {}).reduce(
							(acc, key) => ({ ...acc, [key]: "" }),
							{}
						);
						setFieldValue(obj);
					}
				} else {
					setFieldValue({ [objLevel]: "" });
				}
			} catch (error) {
				console.error("Error fetching dropdown data:", error);
				setFieldValue({ [objLevel]: "" }); // Fallback to an empty object
			}
		};

		useEffect(() => {
			dropDownList(); // Trigger API call when `body` changes
		}, [body]); // Add `body` as a dependency

		return (
			<BaseAutoCompleteDropdown
				id={null}
				labelName={labelName}
				valueInput={fieldValue?.[objLevel]}
				listData={listData}
				objLevel={objLevel}
				disabled={false}
				handleDataChange={(value) => {
					handleDataChange(value);
					setFieldValue(value);
				}}
			/>
		);
	}
);
