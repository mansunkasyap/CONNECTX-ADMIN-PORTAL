import { useState } from "react";
import avatar from "../assets/img/user.jpg";
import { Modal } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function SelfieProfileImage({ profileData }) {
	const [open, setOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const images = Array.isArray(profileData)
		? profileData
		: profileData
			? [profileData]
			: [avatar];

	const hasMultiple = images.length > 1;

	const handleOpen = () => {
		setCurrentIndex(0);
		setOpen(true);
	};

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	return (
		<>
			<div className="headerRightProfile">
				<div className="profilePicUpload" onClick={handleOpen}>
					<img
						src={images[0]}
						className="user_profile"
						alt="User Avatar"
						width={80}
						height={100}
						style={{
							cursor: "pointer",
							borderRadius: "10px",
							objectFit: "cover",
						}}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = avatar;
						}}
					/>
				</div>
			</div>

			<Modal show={open} onHide={() => setOpen(false)} centered size="md">
				<Modal.Header
					closeButton
					style={{ borderBottom: "1px solid #c0c0c0", backgroundColor: "#fff" }}
				>
					<Modal.Title style={{ color: "#333", fontSize: "1rem", fontWeight: 600 }}>
						Image Preview{hasMultiple ? ` (${currentIndex + 1} / ${images.length})` : ""}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ backgroundColor: "#fff", padding: "1.25rem", textAlign: "center" }}>
					<div style={{ position: "relative", display: "inline-block", width: "100%" }}>
						<img
							src={images[currentIndex]}
							alt={`Preview ${currentIndex + 1}`}
							style={{
								maxWidth: "100%",
								maxHeight: "70vh",
								borderRadius: "8px",
								objectFit: "contain",
							}}
							onError={(e) => {
								e.target.onerror = null;
								e.target.src = "https://placehold.co/400x300/cccccc/333333?text=Image+Not+Found";
							}}
						/>
						{hasMultiple && (
							<>
								<button
									onClick={handlePrev}
									style={{
										position: "absolute",
										left: 0,
										top: "50%",
										transform: "translateY(-50%)",
										background: "#d05356",
										border: "none",
										borderRadius: "50%",
										width: "36px",
										height: "36px",
										color: "#fff",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										zIndex: 1,
									}}
								>
									<FaChevronLeft size={14} />
								</button>
								<button
									onClick={handleNext}
									style={{
										position: "absolute",
										right: 0,
										top: "50%",
										transform: "translateY(-50%)",
										background: "#d05356",
										border: "none",
										borderRadius: "50%",
										width: "36px",
										height: "36px",
										color: "#fff",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										zIndex: 1,
									}}
								>
									<FaChevronRight size={14} />
								</button>
							</>
						)}
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}

export default SelfieProfileImage;
