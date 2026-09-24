import { useEffect, useState } from "react";
import { MdCheckCircle, MdClose, MdError } from "react-icons/md";

function Toast({ show, type = "success", message, onClose }) {
	const [exiting, setExiting] = useState(false);

	useEffect(() => {
		if (!show) {
			setExiting(false);
			return;
		}
		const exitTimer = setTimeout(() => setExiting(true), 2600);
		const closeTimer = setTimeout(() => onClose?.(), 3000);
		return () => {
			clearTimeout(exitTimer);
			clearTimeout(closeTimer);
		};
	}, [show]);

	const handleClose = () => {
		setExiting(true);
		setTimeout(() => onClose?.(), 300);
	};

	if (!show) return null;

	return (
		<div className={`cx-toast cx-toast--${type}${exiting ? " cx-toast--exit" : ""}`}>
			<span className="cx-toast__icon">
				{type === "success" ? <MdCheckCircle /> : <MdError />}
			</span>
			<span className="cx-toast__message">{message}</span>
			<button className="cx-toast__close" onClick={handleClose}>
				<MdClose />
			</button>
		</div>
	);
}

export default Toast;
