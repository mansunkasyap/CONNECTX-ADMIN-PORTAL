import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import MainLayout from '../../../components/MainLayout';
import { TextField } from '@mui/material';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userService } from '../../../../service/service';
import { AutoCompletedDropdown } from '../../../components/AutoCompleteDropdown';

function AddCustomer() {
    const navigate = useNavigate();
    const RowData = location.state;
    const [formData, setFormData] = useState({
        p_action: 'INSERT',
        customer_id: 1,
        customer_code: '',
        company_name: '',
        display_name: '',
        address: '',
        city: '',
        pin: null,
        state: '',
        country: '',
        pan: '',
        gstin: '',
        customer_group_id: 11,
        contact_person: '',
        mobile: '',
        email: '',
        branch_id: null,
        branch: '',
    });

    const handleChangeFormData = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]:
                value === '' &&
                    [
                        'customer_id',
                        'pin',
                        'customer_group_id',
                        'branch_id',
                    ].includes(name)
                    ? null
                    : value,
        });
    };

    const insertForm = async () => {
        try {
            const response = await userService.post(
                '/api/v0/web/web_master_customer_manage',
                formData
            );

            if (response.data.valid) {
                // alert('Customer added successfully.');
                setFormData();
                navigate('/customers/customer');
            } else {
                alert(response.data.message || 'Found Duplicate Entries');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('An error occurred while submitting the form. Please try again.');
        }
    };


    const handleEdit = async () => {
        try {
            const response = await userService.post(
                '/api/v0/web/web_master_customer_preview',
                {
                    customer_id: RowData.id,
                    p_action: "UPDATE",
                }
            );

            if (response.data.valid) {
                const value = response.data.data[0];
                let tempData = { ...formData };

                for (let key in tempData) {
                    if (value.hasOwnProperty(key)) {
                        tempData[key] = value[key];
                    }
                }
                tempData.p_action = 'UPDATE';
                setFormData(tempData);
            }
        } catch (err) {
            console.error('Error while fetching data:', err);
        }
    };

    useEffect(() => {
        if (RowData?.id) {
            handleEdit();
        } else {
            // setFormData((prev) => ({ ...prev, operation: "insert" }));
        }
    }, [RowData?.id]);


    return (
        <MainLayout pageName="Customer" hasAddButton={false}>
            <Container className="formwrapper mt-0" fluid>
                <div className="d-flex justify-content-end w-100 mb-3">
                    <Link className="backlink" to="/customers/customer">
                        <MdOutlineKeyboardBackspace /> Go Back
                    </Link>
                </div>
                <Form>
                    <Row>
                        <Col md={12}>
                            <Row>
                                <Col md={4} className="mb-4">
                                    {/* Form fields */}
                                    <AutoCompletedDropdown
                                        labelName={'Branch Code'}
                                        url={'/api/v0/web/web_branch_dropdown'}
                                        handleDataChange={
                                            (value) =>
                                                setFormData({
                                                    ...formData,
                                                    p_branch_id: value.branch_id,
                                                    branch: value?.branch_code,
                                                })
                                            // handleFilterChange(
                                            //   'branch',
                                            //   value?.branch_code,
                                            //   'branch_id',
                                            //   value.branch_id
                                            // )
                                        }
                                        valueInput={formData.branch}
                                        objLevel={'branch_code'}
                                    />
                                </Col>
                                <Col md={4} className="mb-4">
                                    <TextField
                                        size="small"
                                        label="Customer Code"
                                        variant="outlined"
                                        fullWidth
                                        name="customer_code"
                                        value={formData.customer_code}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4}>
                                    <TextField
                                        size="small"
                                        label="Company Name"
                                        variant="outlined"
                                        fullWidth
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4}>
                                    <TextField
                                        size="small"
                                        label="Display Name"
                                        variant="outlined"
                                        fullWidth
                                        name="display_name"
                                        value={formData.display_name}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4}>
                                    <TextField
                                        size="small"
                                        label="Contact Person"
                                        variant="outlined"
                                        fullWidth
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4}>
                                    <TextField
                                        size="small"
                                        label="Mobile"
                                        variant="outlined"
                                        fullWidth
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className='mt-4'>
                                    <TextField
                                        size="small"
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChangeFormData}
                                        required
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="Address"
                                        variant="outlined"
                                        fullWidth
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="City"
                                        variant="outlined"
                                        fullWidth
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="Pin"
                                        variant="outlined"
                                        fullWidth
                                        name="pin"
                                        value={formData.pin}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="State"
                                        variant="outlined"
                                        fullWidth
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="Country"
                                        variant="outlined"
                                        fullWidth
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="Pan"
                                        variant="outlined"
                                        fullWidth
                                        name="pan"
                                        value={formData.pan}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={4} className="mt-4">
                                    <TextField
                                        size="small"
                                        label="GSTIN"
                                        variant="outlined"
                                        fullWidth
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChangeFormData}
                                    />
                                </Col>
                                <Col md={12}>
                                    <Button
                                        size="sm"
                                        variant="none"
                                        type="button"
                                        className="commonBtn mt-4"
                                        onClick={insertForm}
                                    >
                                        Submit
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </MainLayout>
    );
}

export default AddCustomer;
