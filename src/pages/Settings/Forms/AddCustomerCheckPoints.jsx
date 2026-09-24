import {
  Button,
  Col,
  Form,
  //   Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import MainLayout from '../../../components/MainLayout';
import { TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userService } from '../../../../service/service';
import { AutoCompletedDropdown } from '../../../components/AutoCompleteDropdown';
import { useDispatch, useSelector } from 'react-redux';
import config from '../../../../service/config';
import {
  toggleForm,
  toggleSpinnerAndDisableButton,
} from '../../../Redux/Modals';
import { isValid, format } from 'date-fns';
import TimeRange from '../../../components/TimeRange';
import Toast from '../../../components/Toast';

function AddCustomerCheckPoints() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [guardList, setGuardList] = useState([]);
  const RowData = location.state;
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const [formData, setFormData] = useState({
    action: 'INSERT',
    checkpoint_id: null,
    checkpoint_code: '',
    qrcode: '',
    customer_id: null,
    scan_interval_day: 2,
    allowed_delay_day: 15,
    from_time_day: '',
    to_time_day: '',
    from_time_night: null,
    to_time_night: null,
    scan_interval_night: 0,
    allowed_delay_night: 0,
    company_name: '',
    customer_code: '',
    customer_name: '',
    // guard_ids: [],
    from_time_3: null,
    to_time_3: null,
    scan_interval_3: 0,
    allowed_delay_3: 0,
    area: '',
  });

  const handleChangeArea = (event) => {
    const { name, value } = event.target;
    setFormData((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };  

  // const handleChange = (field, value) => {
  //   if (typeof field === 'string') {
  //     let dateObj;

  //     if (typeof value === 'string' && value.includes(':')) {
  //       dateObj = new Date(`1970-01-01T${value}`);
  //     } else {
  //       dateObj = new Date(value);
  //     }

  //     if (!isValid(dateObj)) {
  //       console.error(`Invalid date for ${field}`);
  //       return;
  //     }

  //     const formattedValue = format(dateObj, 'HH:mm:ss');

  //     setFormData((prev) => {
  //       const updatedForm = {
  //         ...prev,
  //         [field]: formattedValue,
  //       };
  //       if (field === 'to_time_day' && !prev.from_time_3) {
  //         updatedForm.from_time_3 = formattedValue;
  //       }

  //       if (field === 'to_time_3' && !prev.from_time_night) {
  //         updatedForm.from_time_night = formattedValue;
  //       }

  //       return updatedForm;
  //     });
  //   } else {
  //     const { name, value } = field.target;

  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleChange = (field, value) => {
    if (typeof field === 'string') {
      let dateObj;

      if (typeof value === 'string' && value.includes(':')) {
        dateObj = new Date(`1970-01-01T${value}`);
      } else {
        dateObj = new Date(value);
      }

      if (!isValid(dateObj)) {
        console.error(`Invalid date for ${field}`);
        return;
      }

      const formattedValue = format(dateObj, 'HH:mm:ss');

      setFormData((prev) => {
        const updatedForm = {
          ...prev,
          [field]: formattedValue,
        };

        if (field === 'to_time_day') {
          updatedForm.from_time_night = formattedValue;
        }

        if (field === 'to_time_night') {
          updatedForm.from_time_3 = formattedValue;
        }

        return updatedForm;
      });
    } else {
      const { name, value } = field.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  // simple table conditon 
  const getDurationMinutes = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);
    let duration = (endTime - startTime) / (1000 * 60);
    if (duration < 0) duration += 24 * 60;

    return duration;
  };

  const isFullDayCompleted = () => {
    const { from_time_day, to_time_day, from_time_night, to_time_night } = formData;

    const dayDuration = getDurationMinutes(from_time_day, to_time_day);
    const nightDuration = getDurationMinutes(from_time_night, to_time_night);

    const totalMinutes = dayDuration + nightDuration;

    return totalMinutes >= 24 * 60;
  };




  const handleQrCodeChange = (event) => {
    const value = event.target.value;
    setFormData((prevValues) => ({
      ...prevValues,
      qrcode: value,
      checkpoint_code: value,
    }));
  };

  const insertForm = async () => {
    dispatch(toggleSpinnerAndDisableButton(true));

    try {
      const response = await userService.post(
        '/api/v0/web/web_checkpoint_manage',
        formData
      );
      if (response.data.valid) {
        showToast('success', 'Checkpoint saved successfully!');
        setFormData(formData);
        dispatch(toggleForm());
        setTimeout(() => {
          navigate('/customers/customer-check-points');
        }, 1500);
      } else {
        showToast('error', response.data.message || 'Found Duplicate Entries');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };
  const handleEdit = async () => {
    dispatch(toggleForm());
    try {
      const response = await userService.post(
        '/api/v0/web/web_checkpoint_print',
        {
          p_checkpoint_id: RowData.id,
          action: 'UPDATE',
        }
      );
      if (response.data.valid) {
        let value = response.data.data[0];
        let tempData = { ...formData };
        for (let key in formData) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            tempData[key] = value[key];
          }
        }
        setFormData(tempData);
        tempData.action = 'UPDATE';
      } else {
        showToast('error', response.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Something went wrong. Please try again.');
    }
  };
  useEffect(() => {
    if (RowData?.id) {
      handleEdit();
    } else {
      // setFormData((prev) => ({ ...prev, operation: "insert" }));
    }
  }, [RowData?.id]);

  useEffect(() => {
    if (formData.customer_id) {
      const filteredGuards = guardList.filter(
        (guard) => guard.customer_id === formData.customer_id
      );
      setGuardList(filteredGuards);
    }
  }, [formData.customer_id]);

  const thStyle = {
    backgroundColor: '#1e293b',
    color: '#fff',
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    padding: '10px 12px',
    borderColor: '#334155',
  };

  const sectionLabel = (text) => (
    <p
      style={{
        margin: '0 0 8px 0',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: '#64748b',
      }}
    >
      {text}
    </p>
  );

  return (
    <MainLayout
      isShowing={false}
      pageName="Add Customer Checkpoints"
      hasAddButton={false}
    >
      {/* 3-zone card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 130px)',
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #f1f3f5',
          boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* Top label bar */}
        <div
          style={{
            flexShrink: 0,
            padding: '14px 20px',
            borderBottom: '1px solid #f1f3f5',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >
            Customer Checkpoint Information
          </p>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <Form>
            {/* ── Basic fields ── */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <AutoCompletedDropdown
                  url={'/api/v0/web/web_customer_dropdown'}
                  body={{ p_limit: 10, reload: false }}
                  handleDataChange={(val) => {
                    setFormData((prevValues) => ({
                      ...prevValues,
                      customer_id: val.customer_id,
                      customer_code: val.customer_code,
                      company_name: val.company_name,
                    }));
                  }}
                  valueInput={formData.company_name}
                  objLevel={'company_name'}
                  labelName={'Customer'}
                />
              </Col>
              <Col md={4}>
                <TextField
                  size="small"
                  fullWidth
                  label={'QR Code Value'}
                  name="qrcode"
                  value={formData.qrcode}
                  onChange={handleQrCodeChange}
                />
              </Col>
              <Col md={4}>
                <TextField
                  size="small"
                  fullWidth
                  label={'Area'}
                  name="area"
                  value={formData.area}
                  onChange={handleChangeArea}
                />
              </Col>
              {formData.qrcode && (
                <Col md={12} className="d-flex flex-column align-items-center">
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                    }}
                  >
                    Generated QR Code
                  </p>
                  <img
                    src={config.QrCodeUrl + formData.qrcode}
                    alt="Generated QR Code"
                    width="140"
                    height="140"
                    className="border p-2 rounded-2"
                  />
                </Col>
              )}
            </Row>

            {/* ── Day Shift ── */}
            <div style={{ marginBottom: 24 }}>
              {sectionLabel('Day Shift')}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <Table bordered={false} size="sm" style={{ marginBottom: 0, verticalAlign: 'middle' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>From Time</th>
                      <th style={thStyle}>To Time</th>
                      <th style={thStyle}>Interval (min)</th>
                      <th style={thStyle}>Allowed Delay (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#fff' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <TimeRange
                          value={
                            formData.from_time_day
                              ? new Date(`1970-01-01T${formData.from_time_day}`)
                              : null
                          }
                          onChange={(time) => handleChange('from_time_day', time)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TimeRange
                          value={
                            formData.to_time_day
                              ? new Date(`1970-01-01T${formData.to_time_day}`)
                              : null
                          }
                          onChange={(time) => handleChange('to_time_day', time)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TextField
                          size="small"
                          fullWidth
                          name="scan_interval_day"
                          value={formData.scan_interval_day}
                          onChange={handleChange}
                          type="number"
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TextField
                          size="small"
                          fullWidth
                          name="allowed_delay_day"
                          value={formData.allowed_delay_day}
                          onChange={handleChange}
                          type="number"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>

            {/* ── Night Shift ── */}
            <div style={{ marginBottom: 24 }}>
              {sectionLabel('Night Shift')}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <Table bordered={false} size="sm" style={{ marginBottom: 0, verticalAlign: 'middle' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>From Time</th>
                      <th style={thStyle}>To Time</th>
                      <th style={thStyle}>Interval (min)</th>
                      <th style={thStyle}>Allowed Delay (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#fff' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <TimeRange
                          value={
                            formData.from_time_night
                              ? new Date(`1970-01-01T${formData.from_time_night}`)
                              : null
                          }
                          onChange={(time) => handleChange('from_time_night', time)}
                          // minTime={
                          //   formData.to_time_day
                          //     ? new Date(`1970-01-01T${formData.to_time_day}`)
                          //     : null
                          // }
                          disable={formData.to_time_day}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TimeRange
                          value={
                            formData.to_time_night
                              ? new Date(`1970-01-01T${formData.to_time_night}`)
                              : null
                          }
                          onChange={(time) => handleChange('to_time_night', time)}
                        // minTime={
                        //   formData.from_time_night
                        //     ? new Date(`1970-01-01T${formData.from_time_night}`)
                        //     : null
                        // }
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TextField
                          size="small"
                          fullWidth
                          name="scan_interval_night"
                          value={formData.scan_interval_night}
                          onChange={handleChange}
                          type="number"
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TextField
                          size="small"
                          fullWidth
                          name="allowed_delay_night"
                          value={formData.allowed_delay_night}
                          onChange={handleChange}
                          type="number"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>

            {/* {!isFullDayCompleted() && ( */}
            {/* ── Shift 3 ── */}
            <div style={{ marginBottom: 8 }}>
              {sectionLabel('Shift 3')}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <Table bordered={false} size="sm" style={{ marginBottom: 0, verticalAlign: 'middle' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>From Time</th>
                      <th style={thStyle}>To Time</th>
                      <th style={thStyle}>Interval (min)</th>
                      <th style={thStyle}>Allowed Delay (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#fff' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <TimeRange
                          value={
                            formData.from_time_3
                              ? new Date(`1970-01-01T${formData.from_time_3}`)
                              : null
                          }
                          onChange={(time) => {
                            handleChange('from_time_3', time);
                            if (!formData.to_time_3) {
                              const updatedToTime = new Date(time);
                              updatedToTime.setMinutes(
                                updatedToTime.getMinutes() + 30
                              );
                              handleChange(
                                'to_time_3',
                                updatedToTime.toISOString().substr(11, 5)
                              );
                            }
                          }}
                          disable={formData.from_time_night}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TimeRange
                          value={
                            formData.to_time_3
                              ? new Date(`1970-01-01T${formData.to_time_3}`)
                              : null
                          }
                          onChange={(time) => handleChange('to_time_3', time)}
                        // minTime={
                        //   formData.from_time_3
                        //     ? new Date(`1970-01-01T${formData.from_time_3}`)
                        //     : null
                        // }
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TextField
                          size="small"
                          fullWidth
                          name="scan_interval_3"
                          value={formData.scan_interval_3}
                          onChange={handleChange}
                          type="number"
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <TextField
                          size="small"
                          fullWidth
                          name="allowed_delay_3"
                          value={formData.allowed_delay_3}
                          onChange={handleChange}
                          type="number"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            {/* // )} */}
          </Form>
        </div>

        {/* Sticky bottom bar */}
        {RowData?.type !== 'preview' && (
          <div
            style={{
              flexShrink: 0,
              padding: '12px 20px',
              borderTop: '1px solid #f1f3f5',
              background: '#fff',
              display: 'flex',
              gap: 8,
            }}
          >
            <Button
              size="sm"
              variant="none"
              type="button"
              className="commonBtn"
              onClick={insertForm}
              disabled={spinnerButton}
            >
              {spinnerButton ? (
                <Spinner animation="border" variant="dark" size="sm" />
              ) : (
                'Submit'
              )}
            </Button>
            <Button
              size="sm"
              variant="none"
              type="button"
              className="cancelBtn"
              onClick={() => navigate('/customers/customer-check-points')}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}
export default AddCustomerCheckPoints;
