import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import MainLayout from '../../../components/MainLayout';
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
import { userService } from '../../../../service/service';
import { AutoCompletedDropdown } from '../../../components/AutoCompleteDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSpinnerAndDisableButton } from '../../../Redux/Modals';
import Toast from '../../../components/Toast';
import { CommonController } from '../../../components/CommonController';


function AddBranchManager() {
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
  const [uploading, setUploading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [branchIDS, setBranchIDS] = useState([]);


  const [formData, setFormData] = useState({
    p_action: 'insert',
    emp_code: '',
    full_name: '',
    mobile: '',
    email: '',
    profile_pic: '',
    branch_id: null,
    type: 'User',
    branch_code: '',
    role_name: '',
    role_id: null
  });
  const [errors, setErrors] = useState({});

  const getDuplicateMessage = (message = "") => {
    const msg = message.toLowerCase();
    if (msg.includes("email")) return "This email address is already registered.";
    if (msg.includes("mobile") || msg.includes("phone")) return "This mobile number is already registered.";
    if (msg.includes("emp")) return "This employee code is already registered.";
    return "A record with these details already exists.";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emp_code.trim()) newErrors.emp_code = "Employee code is required.";
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required.";
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Valid 10-digit mobile number is required.";
    if (!formData.branch_id) newErrors.branch_id = "Branch is required.";
    if (!formData.role_id) newErrors.role_id = "Role is required.";
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
        '/api/v0/web/web_user_branch_manage',
        formData
      );
      if (response.status === 200) {
        if (response.data.status === 400 || response.data.success === false) {
          showToast("error", getDuplicateMessage(response.data.message));
        } else {
          showToast("success", "Saved successfully!");
          setFormData({
            p_action: 'insert',
            emp_code: '',
            full_name: '',
            mobile: '',
            email: '',
            profile_pic: '',
            branch_id: null,
            type: 'User',
            branch_code: '',
            role_name: '',
            role_id: null,
          });
          setTimeout(() => {
            navigate('/users/branch-manager');
          }, 1200);
        }
      } else {
        showToast("error", getDuplicateMessage(response.data.message));
      }
    } catch (err) {
      console.error(err);
      showToast("error", getDuplicateMessage(err?.response?.data?.message));
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };

  const handleChangeFormData = (event) => {
    const { name, value } = event.target;
    if (name === 'mobile' && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEdit = async () => {
    try {
      const response = await userService.post(
        '/api/v0/web/web_user_branch_preview',
        {
          user_id: RowData.id,
          p_action: 'update',
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
        tempData.p_action = 'update';
        setFormData(tempData);
      }
    } catch (err) {
      console.error('Error while fetching Guard data:', err);
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

    setUploading(true);

    try {
      const result = await userService.uploadImage(
        '/v0/image/upload?folderName=connectx/branchUser',
        data
      );

      if (result.data) {
        setFormData({ ...formData, profile_pic: result.data });
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setFormData({ ...formData, profile_pic: null });
  };



  const dropDownBranchList = async (search) => {
    const selectedBranchIDs = branchIDS.map((branch) => branch.branch_id);

    await CommonController.commonApiCallFilter(
      '/api/v0/web/web_branch_dropdown',
      {
        p_search: search,
        p_limit: 25,
        branch_id: selectedBranchIDs,
      },
      'post',
      'node'
    ).then((data) => {
      console.error(data);
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
    <MainLayout
      isShowing={false}
      pageName="Add Branch Manager" hasAddButton={false}>
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
                    value={formData.emp_code}
                    onChange={handleChangeFormData}
                    error={!!errors.emp_code}
                    helperText={errors.emp_code}
                  />
                </Col>
                <Col md={4} className="mb-4 validate">
                  <TextField
                    disabled={RowData?.type === 'preview'}
                    size="small"
                    label="Full Name*"
                    variant="outlined"
                    fullWidth
                    value={formData.full_name}
                    name="full_name"
                    onChange={handleChangeFormData}
                    error={!!errors.full_name}
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
                    value={formData.mobile}
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
                    value={formData.email}
                    name="email"
                    onChange={handleChangeFormData}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    disabled={RowData?.type === 'preview' || uploading}
                    size="md"
                    type="file"
                    onChange={handlePdfUpload}
                  />
                  {uploading && (
                    <div className="mt-2">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <span className="ms-2">Uploading...</span>
                    </div>
                  )}

                  {formData.profile_pic && !uploading && (
                    <div className="d-flex align-items-center gap-3 mt-3">
                      <a
                        href={`${formData.profile_pic}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark"
                        style={{ fontSize: '13px' }}
                      >
                        {formData.profile_pic}
                      </a>
                      <span
                        className="border pt-3 pb-3 p-2 lh-0 cursor-pointer"
                        onClick={handleRemoveAttachment}
                      >🗑
                      </span>
                    </div>
                  )}
                </Col>
                <Col md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Type<span style={{ color: "red" }}>*</span></InputLabel>
                    <Select
                      disabled={RowData?.type === 'preview'}
                      value={formData.type}
                      label="Type"
                      onChange={handleChangeFormData}
                      size="small"
                      name="type"
                    >
                      <MenuItem value="User">User</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Col>
                <Col md={4} className="mt-4">
                  <AutoCompletedDropdown
                    disabled={RowData?.type === 'preview'}
                    url={'/api/v0/web/web_branch_dropdown'}
                    handleDataChange={(val) => {
                      setFormData({
                        ...formData,
                        branch_id: val.branch_id,
                        branch_code: val.branch_code,
                      });
                      setErrors((prev) => ({ ...prev, branch_id: '' }));
                    }}
                    valueInput={formData.branch_code}
                    objLevel={'branch_code'}
                    labelName={'Branch Name*'}
                    error={!!errors.branch_id}
                    helperText={errors.branch_id}
                  />
                  {/* //add branch name multiselect 
                  {/* <Autocomplete
                    multiple
                    options={branchList}
                    getOptionLabel={(option) => option.branch_code || ''}
                    disableCloseOnSelect
                    size="small"
                    onChange={(e, value) => {
                      if (value) {
                        // const selectedBranches = value.map((val) => ({
                        //   ...val,
                        // }));
                        const selectedBranchIDs = value.map(
                          (val) => val.branch_id
                        );                        
                        // setBranchIDS(value);
                        setFormData((prev) => ({
                          ...prev,
                          branch_id: value.map((val) => val.branch_id),
                          branch_code: value,
                        }));
                      }
                    }}
                    value={formData.branch_codes}
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
                        onChange={(e) => dropDownBranchList(e.target.value)}
                        variant="outlined"
                        label="Branch Name*"
                      />
                    )}
                  /> */}
                </Col>
                <Col md={4} className='mt-4'>
                  <AutoCompletedDropdown
                    disabled={RowData?.type === 'preview'}
                    url={'/api/v0/web/web_user_roles_dropdown'}
                    handleDataChange={(val) => {
                      setFormData({
                        ...formData,
                        role_id: val.role_id,
                        role_name: val.role_name,
                      });
                      setErrors((prev) => ({ ...prev, role_id: '' }));
                    }}
                    valueInput={formData.role_name}
                    objLevel={'role_name'}
                    labelName={'Roles*'}
                    error={!!errors.role_id}
                    helperText={errors.role_id}
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
                      onClick={() => navigate('/users/branch-manager')}
                    >
                      Cancel
                    </Button>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Form>
      </Container >
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout >
  );
}

export default AddBranchManager;
