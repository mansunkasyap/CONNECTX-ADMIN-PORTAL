/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import MainLayout from '../../components/MainLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdCheck } from 'react-icons/md';
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { userService } from '../../../service/service';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSpinnerAndDisableButton } from '../../Redux/Modals';
import Toast from '../../components/Toast';
import config from '../../../service/config';
import { CommonController } from '../../components/CommonController';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';

function AddTrainers() {
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const RowData = location.state;
  const [branchList, setBranchList] = useState([]);
  const [branchIDS, setBranchIDS] = useState([]);

  const [formData, setFormData] = useState({
    p_action: 'INSERT',
    user_id: 1,
    type: 'User',
    emp_code: '',
    full_name: '',
    mobile: '',
    email: '',
    profile_pic: '',
    branch_ids: null,
    created_by: 1,
    updated_by: null,
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emp_code.trim())
      newErrors.emp_code = 'Employee code is required.';
    if (!formData.full_name.trim())
      newErrors.full_name = 'Full name is required.';
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = 'Valid 10-digit mobile number is required.';
    if (
      !formData.email.trim() ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    )
      newErrors.email = 'Valid email address is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const insertForm = async () => {
    dispatch(toggleSpinnerAndDisableButton(true));
    if (!validateForm()) {
      dispatch(toggleSpinnerAndDisableButton(false));
      return;
    }
    try {
      const response = await userService.post(
        '/api/v0/web/web_user_trainer_manage',
        formData
      );
      if (response.status === 200) {
        if (response.data.status === 400) {
          alert('Found Duplicate Entries');
          return;
        } else {
          showToast("success", "Saved successfully!");
          setFormData();
          dispatch(toggleSpinnerAndDisableButton(false));
          setTimeout(() => {
            navigate('/users/trainer');
          }, 1200);
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

  const handleChangeFormData = (event) => {
    const { name, value } = event.target;

    if (name === 'p_mobile' && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleEdit = async () => {
    try {
      const response = await userService.post(
        '/api/v0/web/web_user_trainer_preview',
        {
          user_id: RowData.id,
          p_action: 'UPDATE',
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

  const handlePdfUpload = async (files) => {
    const data = new FormData();
    data.append(`file`, files.target.files[0]);
    try {
      await userService
        .uploadImage('/v0/image/upload?folderName=connectx/trainer', data)
        .then((result) => {
          if (result.data) {
            setFormData({ ...formData, profile_pic: result.data });
          }
        })
        .catch((err) => { });
    } catch (err) { }
  };
  const handleRemoveAttachment = () => {
    setFormData({ ...formData, profile_pic: null });
  };

  // const dropDownBranchList = async (search) => {
  //   await CommonController.commonApiCallFilter(
  //     '/api/v0/web/web_branch_dropdown',
  //     { p_search: search, p_limit: 10 },
  //     'post',
  //     'node'
  //   ).then((data) => {  
  //     if (data.valid) {
  //       setBranchList(data.data);
  //     }
  //   });
  // };

  const dropDownBranchList = async (search) => {
    const selectedBranchIDs = branchIDS.map((branch) => branch.branch_id);

    await CommonController.commonApiCallFilter(
      '/api/v0/web/web_branch_dropdown',
      {
        p_search: search,
        p_limit: 10,
        branch_ids: selectedBranchIDs,
      },
      'post',
      'node'
    ).then((data) => {
      if (data.valid) {
        setBranchList(data.data);
      }
    });
  };

  useEffect(() => {
    handleEdit();
    dropDownBranchList('');
  }, []);

  return (
    <MainLayout isShowing={false} pageName="Add Trainers.." hasAddButton={false}>
      <Container className="formwrapper mt-0" fluid>
        <Form>
          <Row>
            <Col md={12}>
              <Row>
                <Col md={4} className="mb-4 validate">
                  <TextField
                    disabled={RowData?.type === 'preview'}
                    size="small"
                    label="Employee Code*"
                    variant="outlined"
                    fullWidth
                    name="emp_code"
                    value={formData?.emp_code}
                    onChange={handleChangeFormData}
                    error={!!errors.emp_code}
                    helperText={errors.emp_code}
                  />
                </Col>
                <Col md={4}>
                  <TextField
                    disabled={RowData?.type === 'preview'}
                    size="small"
                    label="Full Name*"
                    variant="outlined"
                    fullWidth
                    value={formData?.full_name}
                    name="full_name"
                    onChange={handleChangeFormData}
                    error={!!errors.pull_name}
                    helperText={errors.full_name}
                  />
                </Col>
                <Col md={4}>
                  <TextField
                    disabled={RowData?.type === 'preview'}
                    size="small"
                    label="Mobile*"
                    variant="outlined"
                    fullWidth
                    value={formData?.mobile}
                    name="mobile"
                    onChange={handleChangeFormData}
                    inputProps={{ maxLength: 10 }}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                  />
                </Col>
                <Col md={4}>
                  <TextField
                    disabled={RowData?.type === 'preview'}
                    size="small"
                    label="Email*"
                    variant="outlined"
                    fullWidth
                    value={formData?.email}
                    name="email"
                    onChange={handleChangeFormData}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    disabled={RowData?.type === 'preview'}
                    size="md"
                    type="file"
                    onChange={handlePdfUpload}
                  // disabled={RowData?.type === "Preview"}
                  />
                  {formData?.profile_pic && (
                    <div className="d-flex align-items-center gap-3 mt-3">
                      <a
                        href={`${formData?.profile_pic}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark"
                        style={{ fontSize: '13px' }}
                      >
                        {formData?.profile_pic}
                      </a>
                      <span
                        className="border pt-3 pb-3 p-2 lh-0 cursor-pointer"
                        onClick={handleRemoveAttachment}
                      >
                        x
                      </span>
                    </div>
                  )}
                </Col>
                <Col md={4} >
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      disabled={RowData?.type === 'preview'}
                      value={formData?.type}
                      label="Type*"
                      onChange={handleChangeFormData}
                      size="small"
                      name="type"
                    >
                      <MenuItem value="User">User</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Col>
           
                <Col xs={4} className="mb-2 mt-4">
                  {/* branch Name
                  <Autocomplete
                    multiple
                    options={branchList}
                    getOptionLabel={(option) => option.branch_code || ""}
                    disableCloseOnSelect
                    size="small"
                    onChange={(e, value) => {
                      if (value) {
                        const selectedBranches = value.map((val) => ({ ...val }));
                        const selectedBranchIDs = value.map((val) => val.branch_id);

                        setBranchIDS(selectedBranches);
                        setFormData((prev) => ({
                          ...prev,
                          branch_ids: selectedBranchIDs,
                        }));
                      }
                    }}


                    // onChange={(e, value) => {
                    //   if (value) {
                    //     const arraymap =
                    //       value.length > 0
                    //         ? value.map((val) => {
                    //           return {
                    //             ...val,
                    //           };
                    //         })
                    //         : [];
                    //     setBranchIDS(arraymap);

                    //   }
                    // }}
                    value={branchIDS}
                    renderOption={(props, option, { selected }) => (
                      <MenuItem
                        key={option.branch_id}
                        value={option.branch_code || ""}
                        sx={{ justifyContent: 'space-between' }}
                        {...props}
                      >
                        {option.branch_code || ""}
                        {selected ? <MdCheck color="info" /> : null}
                      </MenuItem>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder=""
                      />
                    )}
                  /> */}

                  <Autocomplete
                    multiple
                    options={branchList}
                    getOptionLabel={(option) => option.branch_code || ''}
                    disableCloseOnSelect
                    size="small"
                    onChange={(e, value) => {
                      if (value) {
                        const selectedBranches = value.map((val) => ({
                          ...val,
                        }));
                        const selectedBranchIDs = value.map(
                          (val) => val.branch_id
                        );
                        setBranchIDS(selectedBranches);
                        setFormData((prev) => ({
                          ...prev,
                          branch_ids: selectedBranchIDs,
                        }));
                      }
                    }}
                    value={branchIDS}
                    renderOption={(props, option, { selected }) => (
                      <MenuItem
                        key={option.branch_id}
                        value={option.branch_code || ''}
                        sx={{ justifyContent: 'space-between' }}
                        {...props}
                      >
                        {option.branch_code || ''}
                        {selected ? <MdCheck color="info" /> : null}
                      </MenuItem>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Branch Name*"
                      />
                    )}
                  />
                </Col>
                {RowData?.type !== 'preview' && (
                  <Col md={12} className="d-flex align-items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="none"
                      type="button"
                      className="commonBtn"
                      onClick={insertForm}
                      disabled={spinnerButton}
                    >
                      {spinnerButton ? (
                        <Spinner animation="border" variant="light" size="sm" />
                      ) : (
                        'Submit'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="none"
                      type="button"
                      className="cancelBtn"
                      onClick={() => navigate('/users/trainer')}
                    >
                      Cancel
                    </Button>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Form>
      </Container>
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}

export default AddTrainers;
