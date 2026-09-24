/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Row, Col, Form, Carousel } from 'react-bootstrap';
import { userService } from '../../../service/service';
import Toast from '../../components/Toast';
import moment from 'moment';
import audio from '../../assets/sounds/emergency.mp3';
import { FaCheck } from 'react-icons/fa';
import config from '../../../service/config';
// import config from '../../../service/config';

function WbAlert() {
    const [showModal, setShowModal] = useState(false);
    const [wbData, setWbData] = useState(null);
    const [isMarked, setIsMarked] = useState(false);
    const audioRef = useRef(null);
    const [markWb, setMarkWb] = useState('');

    function handleOnChange(event, index) {
        const value = event.target.value;
        setMarkWb(value);
    }
    const fetchWbData = async () => {
        try {
            const response = await userService.post('/api/v0/web/browse_wb_alerts', {
                guard_id: null,
                p_search: '',
            });
            if (response.data.data.length > 0) {
                audioRef.current.play();
                setWbData(response.data.data);
                setShowModal(true);
            }
        } catch (err) {
            console.error('Error fetching Wb data:', err);
        }
    };

    useEffect(() => {
        setInterval(() => {
            fetchWbData();
        }, 30000);
    }, []);

    const handleMarkAsRead = async (data) => {
        try {
            const response = await userService.post(
                '/api/v0/web/web_guard_wb_alert_mark_read',
                { alert_id: data.alert_id, comments: markWb, updated_by_type: 'Admin' }
            );
            setMarkWb('');
            fetchWbData();
            setIsMarked(true);
            setTimeout(() => {
                setIsMarked(false);
            }, 2000);
        } catch (err) {
            console.err(err);
        }
    };

    return (
        <>
            <audio ref={audioRef} src={audio} />
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header className="bg-white" closeButton>
                    <Modal.Title className="text-dark fs-3">WB Alert⚠</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white text-white p-4">
                    <div className="soscontent">
                        {wbData ? (
                            wbData.map((item, index) => {
                                return (
                                    <Row key={item.alert_id}>
                                        <Col md={12} className="mb-3">
                                            <div className="bg-danger rounded-4 p-3">
                                                <Row>
                                                    <Col xs={4}>
                                                        <img
                                                            src={`${item?.guard_pic}`}
                                                            alt="Alert"
                                                            width={100}
                                                            height={100}
                                                        />
                                                    </Col>
                                                    <Col xs={6}>
                                                        <h5 className="text-white">
                                                            <span className="fs-6">Employee Code:</span>
                                                            <br /> {item.emp_code}
                                                        </h5>
                                                        <h5 className="text-white">
                                                            <span className="fs-6">Name:</span>
                                                            <br /> {item.guard_name}
                                                        </h5>
                                                        <h5 className="text-white">
                                                            <span className="fs-6">Phone:</span>
                                                            <br /> {item.guard_mobile}
                                                        </h5>
                                                        <h5 className="text-white">
                                                            <span className="fs-6">Email:</span>
                                                            <br /> {item.guard_email}
                                                        </h5>
                                                    </Col>
                                                    <Col
                                                        xs={2}
                                                        className="fw-bold text-end d-flex flex-column justify-content-between p-1"
                                                    >
                                                        <span>{index + 1}</span>
                                                        <span className="text-center lh-1 bg-light text-dark rounded-2">
                                                            <h5 className="m-0 mt-2">Time:</h5>
                                                            <h6>
                                                                {moment(item.alert_time).format('HH:mm')}
                                                            </h6>
                                                            <h6>
                                                                {moment(item.alert_time).format('DD-MM-YYYY')}
                                                            </h6>
                                                        </span>
                                                    </Col>
                                                    <hr className="mt-3" />
                                                    <Col md={12}>
                                                        <Row>
                                                            <Col xs={6}>
                                                                <h5>
                                                                    <u>Customer</u>
                                                                </h5>
                                                                <h5 className="text-white">
                                                                    <span className="fs-6">Customer Code:</span>
                                                                    <br /> {item.customer_code}
                                                                </h5>
                                                                <h5 className="text-white">
                                                                    <span className="fs-6">Company Name:</span>
                                                                    <br /> {item.company_name}
                                                                </h5>
                                                            </Col>
                                                            <Col xs={6}>
                                                                <span className="fs-6">Add Remarks</span>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    value={markWb}
                                                                    onChange={(e) => handleOnChange(e, index)}
                                                                    name="comments"
                                                                    style={{ height: '100px' }}
                                                                    className="mb-3"
                                                                />
                                                                <Button
                                                                    variant="dark"
                                                                    onClick={() => handleMarkAsRead(item)}
                                                                >
                                                                    <FaCheck /> Mark Read
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>
                                );
                            })
                        ) : (
                            <p>Loading Wb data...</p>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            <Toast show={isMarked} type="success" message="Saved successfully!" onClose={() => setIsMarked(false)} />
        </>
    );
}
//

export default WbAlert;
