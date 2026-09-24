import { userService } from "../../service/service";

export const CommonController = {
	commonApiCallFilter,
	commonBrowseApiCallNew,
};
async function commonBrowseApiCallNew(url, body, params) {
	try {
		let apiEndpoint = `${url}?page_number=${params.page_number - 1}&page_size=${
			params.page_size
		}&sort_column=${params.sort_column}&sort_order=${params.sort_order}`;
		let response = await userService.post(apiEndpoint, body);
		if (response) {
			return response.data;
		} 
	} catch (error) {
		return error;
	}
}
async function commonApiCallFilter(url, body, type = "post") {
	try {
		let apiEndpoint = `${url}`;
		let response;
		if (type === "post") {
			response = await userService.post(apiEndpoint, body);
		} else {
			let queryString = Object.keys(body)
				.map((key) => key + "=" + body[key])
				.join("&");
			let _url = url + "?" + queryString;
			response = await userService.get(_url);
		}		
		if (response) {
			return response.data;
		} else {
			return null;
		}
	} catch (error) {
		console.error("error", error);
		return null;
	}
}
