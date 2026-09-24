import moment from "moment";
import { useEffect, useState } from "react";

export default function HeaderDateTime() {
	const [currentTime, setCurrentTime] = useState(moment().format("hh:mm:ss A"));

	useEffect(() => {
		const updateTime = () => {
			setCurrentTime(moment().format("hh:mm:ss A"));
		};
		const timerId = setInterval(updateTime, 1000);
		return () => {
			clearInterval(timerId);
		};
	}, []);

	return (
		<>
			<div className="datetime_wrapper">
				<div className="datelabel">{moment().format("dddd Do MMMM YYYY")}</div>
				<div className="text-center fw-bold text-danger fs-6">
					{currentTime}
				</div>
			</div>
		</>
	);
}
