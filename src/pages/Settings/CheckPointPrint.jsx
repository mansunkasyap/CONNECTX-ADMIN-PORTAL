import { useEffect, useState } from 'react';
import { userService } from '../../../service/service';
import { Button, Col, Container, Row } from 'react-bootstrap';
// import { connectxLogo, GdxLogoImage, RemoteXLogo } from '../../utils/images';
import { MdLocationOn } from 'react-icons/md';
import Gdxlogo from '../../assets/img/gdxlogo.png';
import Remotelogo from '../../assets/img/remotex.png';
import Connectlogo from '../../assets/img/connectx-logo.png';
import config from '../../../service/config';

function CheckPointPrint({ formValues }) {
  const printPage = () => {
    window.print();
  };
  const [item, setFormData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      const id = parseInt(window.location.pathname.split('/').pop(), 10);
      try {
        const result = await userService.post(
          '/api/v0/web/web_checkpoint_print',
          { p_checkpoint_id: id }
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
                {' '}
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <img src={Gdxlogo} className="logo" />
                  <img src={Remotelogo} className="logo remotex" />
                </div>
                <p>
                  <img src={Connectlogo} className="logo connect" />
                </p>
                {/* <h2 className='text-center text-uppercase fw-bold'>Remote X</h2> */}
                <img
                  src={config.QrCodeUrl + item.qrcode}
                  alt="Generated QR Code"
                  className="image"
                />
                <p className="fs-1 fw-bold text-danger">{item.area}</p>
                <p className="mt-4 fs-4">
                  <MdLocationOn /> {item.company_name}{' '}
                  {/* {item.area ? `, ${item.area}` : ''} */}
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* <div style={{ marginTop: '20px', fontSize: '18px', textAlign: 'center' }}>
        <p><strong>Checkpoint Code:</strong> {item.checkpoint_code || "N/A"}</p>
        <p><strong>Customer Name:</strong> {item.customer_name || "N/A"}</p>
        <p><strong>Qrcode:</strong> {item.qrcode || "N/A"}</p>
        <p><strong>Scan Interval:</strong> {item.scan_interval || "N/A"}</p>
        <p><strong>Allowed Time:</strong> {item.allowed_delay || "N/A"}</p>

      </div> */}
      <Button onClick={printPage} size="sm" className="printBtn">
        Print
      </Button>
    </div>
  );
}

export default CheckPointPrint;
