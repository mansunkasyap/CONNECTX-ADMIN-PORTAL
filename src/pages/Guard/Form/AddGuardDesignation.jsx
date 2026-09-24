import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import MainLayout from '../../../components/MainLayout';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userService } from '../../../../service/service';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSpinnerAndDisableButton } from '../../../Redux/Modals';

function AddGuardDesignation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const spinnerButton = useSelector((state) => state.toggleSpinnerAndDisableButton.show);
  const [formData, setFormData] = useState({
    p_action: 'INSERT',
    p_designation_id: 1,
    designation: '',
  });
  const handleChangeFormData = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const insertForm = async () => {
    dispatch(toggleSpinnerAndDisableButton(true));
    const payload = {
      ...formData,
      designation_name: formData.designation,
    };

    try {
      const response = await userService.post(
        '/api/v0/web/web_master_guard_designation_manage',
        payload
      );
      if (response.status === 200 && response.data.status !== 400) {
        setFormData({
          p_action: 'INSERT',
          p_designation_id: 1,
          designation: '',
        });
        navigate('/guards/guard-designation');
      } else {
        alert(response.data.message || 'Found Duplicate Entries');
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };


  useEffect(() => {
    if (editMode) {
      setFormData({
        p_action: 'UPDATE',
        p_designation_id: existingData.designation_id,
        designation: existingData.designation, // map correctly
      });
    }
  }, [editMode, existingData]);


  return (
    <MainLayout pageName="Guard Designation" hasAddButton={false}>
      <Container className="formwrapper mt-0" fluid>
        <Form>
          <Row>
            <Col md={12}>
              <Row>
                <Col md={4} className="mb-4 validate">
                  <TextField
                    size="small"
                    label="Customer Code"
                    variant="outlined"
                    fullWidth
                    name="designation"
                    value={formData.designation}
                    onChange={handleChangeFormData}
                  />
                </Col>
                <Col md={12} className="d-flex align-items-center gap-2 mt-4">
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
                    onClick={() => navigate('/guards/guard-designation')}
                  >
                    Cancel
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

export default AddGuardDesignation;
