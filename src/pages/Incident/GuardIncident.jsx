import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import moment from "moment";
import { Badge, Modal } from "react-bootstrap";
import { BsPenFill } from "react-icons/bs";
import { FaImage, FaVideo, FaMapMarkerAlt } from "react-icons/fa";
import ReactAudioPlayer from "react-audio-player";
import "video.js/dist/video-js.css";
import config from "../../../service/config";
import { useSelector } from "react-redux";

function GuardIncident() {
	const [showModal, setShowModal] = useState(false);
	const [location, setLocation] = useState({ latitude: null, longitude: null });

	const [mediaModal, setMediaModal] = useState({
		show: false,
		type: null,
		src: "",
	});
	const [updateGrid, setupdateGrid] = useState(0);
	const [body, setbody] = useState({
		refresh: "",
	});

	const handleOpenMap = (latitude, longitude) => {
		setLocation({ latitude, longitude });
		setShowModal(true);
	};
	const handleCloseMap = () => {
		setShowModal(false);
		setLocation({ latitude: null, longitude: null });
	};

	const handleMediaModalOpen = (type, src) => {
		setMediaModal({ show: true, type, src });
	};

	const handleMediaModalClose = () => {
		setMediaModal({ show: false, type: null, src: "" });
	};

	// start userRights
	const getUser = useSelector((state) => state.getUserRight.data);
	const url = useMemo(() => window.location.pathname.split("/"), []);
	const isUserRight = useMemo(() => {
		if (getUser) {
			const moduleRights = getUser.find(
				(val) => val.module_name.toLowerCase() === url[1],
			);
			const finalModule = moduleRights?.rights.filter(
				(val) =>
					val.transaction_code.replace(/ /g, "-").toLowerCase() === url[2],
			);
			return finalModule?.length > 0
				? finalModule[0]
				: {
						can_view: false,
						can_insert: false,
						can_edit: false,
						can_delete: false,
						can_print: false,
					};
		}
	}, [getUser, url]);
	//end UserRights
	const gridColumns = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "S.No.",
				enableColumnFilter: false,
				Cell: ({ row }) => Number(row.id) + 1,
				size: 90,
			},
			{
				accessorKey: "customer_code",
				header: "Customer Code",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "company_name",
				header: "Customer Name",
				enableColumnFilter: false,
				size: 300,
			},
			{
				accessorKey: "address",
				header: "Address",
				enableColumnFilter: false,
				size: 300,
			},

			{
				accessorKey: "description",
				header: "Description",
				enableColumnFilter: false,
				size: 200,
			},
			{
				accessorKey: "audio_path",
				header: "Audio",
				enableColumnFilter: false,
				size: 200,
				Cell: ({ row }) =>
					row.original.audio_path ? (
						<ReactAudioPlayer src={`${row.original.audio_path}`} controls />
					) : null,
			},
			{
				accessorKey: "image_path",
				header: "Image",
				enableColumnFilter: false,
				size: 100,
				Cell: ({ row }) =>
					row.original.image_path ? (
						<FaImage
							size={20}
							className="text-primary cursor-pointer"
							onClick={() =>
								handleMediaModalOpen("image", `${row.original.image_path}`)
							}
						/>
					) : null,
			},
			{
				accessorKey: "video_path",
				header: "Video",
				enableColumnFilter: false,
				size: 200,
				Cell: ({ row }) =>
					row.original.video_path ? (
						<FaVideo
							size={20}
							className="text-primary cursor-pointer"
							onClick={() =>
								handleMediaModalOpen("video", `${row.original.video_path}`)
							}
						/>
					) : null,
			},
			{
				accessorKey: "location",
				header: "Location",
				enableColumnFilter: false,
				size: 150,
				Cell: ({ row }) => {
					const { latitude, longitude } = row.original;
					if (latitude && longitude) {
						return (
							<FaMapMarkerAlt
								size={20}
								className="text-primary cursor-pointer"
								onClick={() => handleOpenMap(latitude, longitude)}
							/>
						);
					}
					return null;
				},
			},
			{
				accessorKey: "incident_date",
				header: "Incident Date",
				enableColumnFilter: false,
				size: 160,
				Cell: ({ row }) => (
					<span>
						{moment(row.original.incident_date).format("DD/MM/YYYY")} (
						{moment(row.original.incident_date).format("LT")})
					</span>
				),
			},
			{
				accessorKey: "action",
				header: "Action",
				enableColumnFilter: false,
				size: 90,
				Cell: () => (
					<div className="d-flex align-items-center gap-1">
						{isUserRight?.can_edit && (
							<Badge bg="primary" className="cursor-pointer">
								<BsPenFill />
							</Badge>
						)}
					</div>
				),
			},
		],
		[],
	);
	return (
		<MainLayout
			pageName="Guard Incident"
			 hasAddButton={false}
			// hasAddButton={isUserRight?.can_insert}
			linkto={"add"}
		>
			<CommonDataGrid
				url={"/api/v0/web/web_guard_incident_browse"}
				columns={gridColumns}
				body={body}
				jsonUpd={updateGrid}
			/>

			{/* Location Modal */}
			<Modal show={showModal} onHide={handleCloseMap} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title>Location</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{location.latitude && location.longitude ? (
						<iframe
							title="Google Maps Location"
							width="100%"
							height="400"
							src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&hl=es;z=14&output=embed`}
							frameBorder="0"
							allowFullScreen
						></iframe>
					) : (
						<p>Loading location...</p>
					)}
				</Modal.Body>
			</Modal>

			{/* Media Modal */}
			<Modal
				show={mediaModal.show}
				onHide={handleMediaModalClose}
				size="lg"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>
						{mediaModal.type === "image" ? "Image" : "Video"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ padding: 0, maxHeight: "80vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
					{mediaModal.type === "image" ? (
						<img
							src={`${mediaModal.src}`}
							alt="image"
							style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }}
						/>
					) : mediaModal.type === "video" ? (
						<video
							controls
							style={{ maxWidth: "100%", maxHeight: "80vh", display: "block" }}
							src={mediaModal.src}
						>
							Your browser does not support the video tag.
						</video>
					) : null}
				</Modal.Body>
			</Modal>
		</MainLayout>
	);
}

export default GuardIncident;
