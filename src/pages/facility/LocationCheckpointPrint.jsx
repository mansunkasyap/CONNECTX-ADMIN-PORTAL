import { useEffect, useState } from "react";
import { userService } from "../../../service/service";
import { Button, Col, Container, Row } from "react-bootstrap";
import { MdLocationOn } from "react-icons/md";
import Gdxlogo from "../../assets/img/gdxlogo.png";
import Remotelogo from "../../assets/img/remotex.png";
import Connectlogo from "../../assets/img/connectx-logo.png";
import config from "../../../service/config";

function LocationCheckpointPrint() {
	const printPage = () => {
		window.print();
	};
	const [item, setFormData] = useState({});
	useEffect(() => {
		const fetchData = async () => {
			const id = parseInt(window.location.pathname.split("/").pop(), 10);
			try {
				const result = await userService.post(
					"/api/v0/web/preview_facility_location_checkpoint",
					{ location_id: id }
				);
				setFormData(result.data.data[0]);
			} catch (err) {
				console.error(err);
			}
		};
		fetchData();
	}, []);

	//
	return (
		<div className="w-100 checkpointprint bg-white text-center">
			<Container>
				<Row className="justify-content-center">
					<Col md={12}>
						<div className="qrcode_border">
							<div>
								{" "}
								<div className="d-flex justify-content-between align-items-center mb-5">
									<img src={Gdxlogo} className="logo" />
									<img src={Remotelogo} className="logo remotex" />
								</div>
								<p>
									<img src={Connectlogo} className="logo connect" />
								</p>
								<img
									src={config.QrCodeUrl + item.qrcode}
									alt="Generated QR Code"
									className="image"
								/>
								<p className="fs-1 fw-bold text-danger">{item.area}</p>
								<p className="mt-4 fs-4">
									<MdLocationOn /> {item.location_name}{" "}
								</p>
								<p className="fs-4">
									<span className="fw-bold fs-5">Company:</span>
									<br />
									{item.company_name}
								</p>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
			<Button onClick={printPage} size="sm" className="printBtn mb-5">
				Print
			</Button>
		</div>
	);
}

export default LocationCheckpointPrint;
