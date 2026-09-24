import { Badge, Button, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";

import MainLayout from "../../components/MainLayout";
import { TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Toast from "../../components/Toast";
import { userService } from "../../../service/service";
import { useDispatch, useSelector } from "react-redux";
import { toggleSpinnerAndDisableButton } from "../../Redux/Modals";

export default function AddFrequencyOfService() {

    const location = useLocation();
    const navigate = useNavigate();
    const RowData = location.state;
    const previewMode = RowData?.type === "preview";
    const dispatch = useDispatch();
    const spinnerButton = useSelector((state) => state.toggleSpinnerAndDisableButton.show);
    const [toast, setToast] = useState({ show: false, type: "success", message: "" });
    const showToast = (type, message) => setToast({ show: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
    const [checkListTable, setCheckListTable] = useState([]);
    const [currentEdit, setCurrentEdit] = useState(null);
    const [tasks, setTasks] = useState([{ name: "", frequency: "" }]);
    const [formData, setFormData] = useState({
        area: "",
        type: "",
    });
    const [errors, setErrors] = useState({});

    const handleChangeFormData = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };
    const insertForm = async () => {
        dispatch(toggleSpinnerAndDisableButton(true));
        try {
            const insertData = {
                ...formData,
                items: checkListTable,
            }
            const response = await userService.post(
                '/api/v0/web/insert_or_update_checklist_area_and_items',
                insertData
            );
            if (response.status === 200) {
                if (response.data.status === 400) {
                    alert('Found Duplicate Entries');
                    return;
                } else {
                    setTimeout(() => {
                        navigate('/facility/frequency-service');
                    }, 1200);
                    setFormData({ area: "", type: "" });
                    setCheckListTable([])
                }
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            dispatch(toggleSpinnerAndDisableButton(false));
        }
    };
    const handleEdit = async () => {
        try {
            const response = await userService.post(
                '/api/v0/web/preview_checklist_area',
                {
                    area_id: RowData.id,
                }
            );
            if (response?.data?.data?.length) {
                const value = response.data.data[0];
                let updatedFormData = { ...formData };
                for (let key in value) {
                    if (updatedFormData.hasOwnProperty(key)) {
                        updatedFormData[key] = value[key];
                    }
                }
                updatedFormData.p_action = 'update';
                const items = value.items || [];
                setCheckListTable(items);
                setFormData(updatedFormData);
            } else {
                console.error('No data found in response:', response?.data?.message);
            }

        } catch (err) {
            console.error('Error while fetching Guard data:', err);
        }
    };
    useEffect(() => {
        if (RowData?.id) {
            handleEdit();
        }
    }, [RowData?.id]);

    const handleTaskChange = (index, value) => {
        const updated = [...tasks];
        updated[index].name = value;
        setTasks(updated);
    };

    const handleSelect = (index, period) => {
        const updated = [...tasks];
        updated[index].frequency = period;
        setTasks(updated);
    };
    const handleAddRow = () => {
        setTasks([...tasks, { name: "", frequency: "" }]);
    };

    const handleRemoveRow = (index) => {
        if (tasks.length === 1) return;
        const updated = tasks.filter((_, i) => i !== index);
        setTasks(updated);
    };
    return (
        <>
            <MainLayout
                isShowing={false}
                pageName="Admin"
            // hasAddButton={true}
            //   hasAddButton={isUserRight?.can_insert}
            // branchDropdown={true}
            >
                <Container>
                    <Row className="bg-white ">
                        <Col md={3} className="mt-5 ">
                            <TextField
                                disabled={RowData?.type === 'preview'}
                                size="small"
                                label="Area Name"
                                variant="outlined"
                                fullWidth
                                name="area"
                                value={formData.area}
                                onChange={handleChangeFormData}
                                error={!!errors.area}
                                helperText={errors.area}
                                required
                            />
                        </Col>
                        <Col md={3} className="mt-5 mb-3">
                            <TextField
                                disabled={RowData?.type === 'preview'}
                                size="small"
                                label="Type"
                                variant="outlined"
                                fullWidth
                                name="type"
                                value={formData.type}
                                onChange={handleChangeFormData}
                                error={!!errors.type}
                                helperText={errors.type}
                                required
                            />
                        </Col>

                    </Row>
                    <Row className='mt-4'>
                        <Col className="mt-4">
                            <h4>Frequency of Service</h4>
                            <Table striped bordered hover responsive className=" text-center">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Daily</th>
                                        <th>Weekly</th>
                                        <th>Monthly</th>
                                        <th>Quarterly</th>
                                        <th>Semi Anually</th>
                                        <th>Anually</th>
                                        <th>Action</th>
                                    </tr>

                                </thead>
                                <tbody>

                                    {tasks.map((task, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Form.Control
                                                    type="text"
                                                    size="sm"
                                                    value={task.name}
                                                    placeholder="Enter task name"
                                                    onChange={(e) => handleTaskChange(index, e.target.value)}
                                                />
                                            </td>
                                            {["Daily", "Weekly", "Monthly", "Quarterly", "Semi Anually", "Anually"].map((period) => (
                                                <td key={period}>
                                                    <Form.Check
                                                        type="radio"
                                                        name={`task-${index}`}
                                                        checked={task.frequency === period}
                                                        onChange={() => handleSelect(index, period)}
                                                    />
                                                </td>
                                            ))}
                                            <td>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={handleAddRow}
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveRow(index)}
                                                >
                                                    -
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </Table>
                            <Col className=''>
                                {RowData?.type !== "preview" && (
                                    <Col className='d-flex align-items-center gap-2 mt-4'>
                                        <Button
                                            size="sm"
                                            variant="none"
                                            type="button"
                                            className="commonBtn"
                                            onClick={insertForm}
                                            disabled={spinnerButton}
                                        >
                                            {spinnerButton ? <Spinner animation="border" variant="light" size="sm" /> : 'Submit'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="none"
                                            type="button"
                                            className="cancelBtn"
                                            onClick={() => navigate('/facility/frequency-service')}
                                        >
                                            Cancel
                                        </Button>
                                    </Col>
                                )}

                            </Col>
                        </Col>

                    </Row>
                </Container>

                <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
            </MainLayout>
        </>
    );
}