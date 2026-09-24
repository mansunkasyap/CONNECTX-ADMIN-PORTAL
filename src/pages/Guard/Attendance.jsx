/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import SelfieProfleImage from "../../components/SelfieProfleImage";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import Toast from "../../components/Toast";
import { toggleForm, toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import TimeRange from "../../components/TimeRange";
import { format, isValid } from "date-fns";
import { userService } from "../../../service/service";
import DatePicker from "react-datepicker";
import moment from "moment";

function Attendance() {
  const dispatch = useDispatch();
  const [updateGrid, setupdateGrid] = useState(0);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const [guardReloadKey, setGuardReloadKey] = useState(0);
  const [errors, setErrors] = useState({});
  const addButton = useSelector((state) => state.addFormButton.show);
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show,
  );

  const initialAttendanceValues = {
    customer_id: "",
    company_name: "",
    full_name: "",
    guard_id: "",
    check_type: "",
    check_time: "",
    selfie_path: null,
    latitude: null,
    longitude: null,
    reason: "",
  };

  const [attendanceFormData, setattendanceFormData] = useState(
    initialAttendanceValues,
  );

  const [filters, setFilters] = useState({
    r_customer: "",
    r_guard_name: "",
    customer_id: null,
    guard_id: null,
    company_name: "",
    company: "",
    branch: "",
    branch_id: null,
    r_branch_name: "",
    r_emp_code: "",
    full_name: "",
  });

  const handleFilterChange = (filterKey, value, filterKeyId, id) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value === "" ? null : value,
      [filterKeyId]: id,
    }));
    setupdateGrid((prev) => prev + 1);
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
        id: "company_name",
        Header: () => {
          return (
            <div className="tabletopheader" style={{ minWidth: 220, width: "100%" }}>
              <AutoCompletedDropdown
                url={"/api/v0/web/web_customer_dropdown"}
                handleDataChange={(value) =>
                  handleFilterChange(
                    "company",
                    value?.company_name ?? "",
                    "customer_id",
                    value?.customer_id ?? null,
                  )
                }
                valueInput={filters.company}
                objLevel={"company_name"}
                sx={{
                  "& .MuiInputBase-input": {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    fontSize: "0.8rem",
                  },
                  "& .MuiInputBase-root": {
                    paddingRight: "56px !important",
                  },
                }}
              />
            </div>
          );
        },
        columns: [
          {
            accessorKey: "r_customer",
            header: "Customer",
            enableColumnFilter: false,
            size: 300,
            Cell: ({ row }) => (
              <>
                <div>{row.original.r_customer}</div>
              </>
            ),
          },
        ],
      },
      {
        id: "r_emp_code",
        Header: () => {
          return (
            <div className="tabletopheader">
              {filters.company && (
                <AutoCompletedDropdown
                  url={"/api/v0/web/guard_list"}
                  handleDataChange={(value) =>
                    handleFilterChange(
                      "emp_code",
                      value?.emp_code,
                      "guard_id",
                      value.guard_id,
                    )
                  }
                  valueInput={filters.full_name}
                  objLevel={"full_name"}
                  body={{
                    customer_id: filters.customer_id,
                  }}
                />
              )}
            </div>
          );
        },
        columns: [
          {
            accessorKey: "r_emp_code",
            header: "Emp. Code",
            enableColumnFilter: false,
            size: 280,
            Cell: ({ row }) => (
              <>
                <div>{row.original.r_emp_code}</div>
              </>
            ),
          },
        ],
      },
      {
        accessorKey: "r_guard_name",
        header: "Guard Name",
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: "r_selfie_path",
        header: "Image",
        enableColumnFilter: false,
        size: 200,
        Cell: ({ row }) => (
          <SelfieProfleImage profileData={row.original.r_selfie_path} />
        ),
      },
      {
        accessorKey: "r_check_type",
        header: "Type",
        enableColumnFilter: false,
        size: 200,
      },
      {
        id: "r_branch_name",
        Header: () => {
          return (
            <div className="tabletopheader">
              <AutoCompletedDropdown
                url={"/api/v0/web/web_branch_dropdown"}
                handleDataChange={(value) =>
                  handleFilterChange(
                    "branch",
                    value?.branch_code,
                    "branch_id",
                    value.branch_id,
                  )
                }
                valueInput={filters.branch}
                objLevel={"branch_code"}
              />
            </div>
          );
        },
        columns: [
          {
            accessorKey: "r_branch_name",
            header: "Branch Name",
            width: 280,
            enableColumnFilter: false,
            minSize: 230,
          },
        ],
      },
      {
        accessorKey: "r_created_at",
        header: "Created at",
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: "r_check_time",
        header: "Check Time",
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: "latitude_longitude",
        header: "Location",
        enableColumnFilter: false,
        size: 120,
        Cell: ({ row }) => {
          const { r_latitude, r_longitude } = row.original;
          if (r_latitude && r_longitude) {
            const googleMapsUrl = `https://www.google.com/maps?q=${r_latitude},${r_longitude}`;

            return (
              <Link
                to={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaMapMarkerAlt
                  size={20}
                  className="text-primary cursor-pointer"
                />
              </Link>
            );
          }
          return null;
        },
      },
    ],
    [filters],
  );

  const validateForm = () => {
    const newErrors = {};
    if (!attendanceFormData.customer_id) newErrors.customer_id = "Customer is required.";
    if (!attendanceFormData.guard_id) newErrors.guard_id = "Guard is required.";
    if (!attendanceFormData.check_type) newErrors.check_type = "Check type is required.";
    if (!attendanceFormData.attendance_Date) newErrors.attendance_Date = "Attendance date is required.";
    if (!attendanceFormData.check_time) newErrors.check_time = "Check time is required.";
    if (!attendanceFormData.reason) newErrors.reason = "Reason is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setattendanceFormData(initialAttendanceValues);
    setGuardReloadKey(0);
    setErrors({});
    dispatch(toggleForm());
  };

  const handleChange = (field, value) => {
    if (field === "check_time") {
      if (!value || !isValid(new Date(value))) {
        console.error("Invalid time value");
        return;
      }
      setattendanceFormData((prev) => ({
        ...prev,
        check_time: new Date(value),
      }));
      if (errors.check_time) setErrors((prev) => ({ ...prev, check_time: "" }));
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setattendanceFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (field, date) => {
    if (!date) return;
    const formattedDate = moment.utc(date).startOf("day").toDate();
    setattendanceFormData({ ...attendanceFormData, [field]: formattedDate });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const insertForm = async () => {
    if (!validateForm()) return;

    let combinedDateTime = null;
    if (attendanceFormData.attendance_Date && attendanceFormData.check_time) {
      const datePart = moment(attendanceFormData.attendance_Date).format("YYYY-MM-DD");
      const timePart = moment(attendanceFormData.check_time).format("HH:mm:ss");
      combinedDateTime = `${datePart} ${timePart}`;
    } else if (attendanceFormData.check_time) {
      combinedDateTime = format(attendanceFormData.check_time, "yyyy-MM-dd HH:mm:ss");
    }

    dispatch(toggleSpinnerAndDisableButton(true));
    try {
      const dataToSend = {
        customer_id: attendanceFormData.customer_id,
        guard_id: attendanceFormData.guard_id,
        check_type: attendanceFormData.check_type,
        check_time: combinedDateTime,
        selfie_path: attendanceFormData.selfie_path,
        latitude: attendanceFormData.latitude,
        longitude: attendanceFormData.longitude,
        reason: attendanceFormData.reason,
      };

      const response = await userService.post("/api/v0/web/web_guard_check_log", dataToSend);

      if (response.data.valid) {
        showToast("success", "Attendance marked successfully!");
        setattendanceFormData(initialAttendanceValues);
        setGuardReloadKey(0);
        setErrors({});
        dispatch(toggleForm());
        setupdateGrid((prev) => prev + 1);
      } else {
        showToast("error", response.data.message || "Failed to mark attendance.");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      showToast("error", "An error occurred while marking attendance.");
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };

  return (
    <MainLayout pageName="Attendance" hasAddButton={isUserRight?.can_insert}>
      <CommonDataGrid
        url={"/api/v0/web/web_guard_attendance"}
        columns={gridColumns}
        body={filters}
        jsonUpd={updateGrid}
      />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
      <Modal size="xl" show={addButton} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Mark Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col xs={12}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <AutoCompletedDropdown
                        url={"/api/v0/web/web_customer_dropdown"}
                        handleDataChange={(val) => {
                          setattendanceFormData({
                            ...initialAttendanceValues,
                            customer_id: val.customer_id,
                            company_name: val.company_name,
                          });
                          setGuardReloadKey((prev) => prev + 1);
                          if (errors.customer_id) setErrors((prev) => ({ ...prev, customer_id: "" }));
                        }}
                        valueInput={attendanceFormData.company_name}
                        objLevel={"company_name"}
                        labelName={"Customer *"}
                        error={!!errors.customer_id}
                        helperText={errors.customer_id}
                      />
                    </Form.Group>
                  </Col>
                  {attendanceFormData.customer_id && (
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <AutoCompletedDropdown
                          key={guardReloadKey}
                          url={"/api/v0/web/guard_list"}
                          handleDataChange={(val) => {
                            setattendanceFormData((prev) => ({
                              ...prev,
                              guard_id: val.guard_id,
                              full_name: val.full_name,
                              emp_code: val.emp_code,
                            }));
                            if (errors.guard_id) setErrors((prev) => ({ ...prev, guard_id: "" }));
                          }}
                          valueInput={attendanceFormData.full_name}
                          objLevel={"full_name"}
                          body={{ customer_id: attendanceFormData.customer_id }}
                          labelName={"Guard Name *"}
                          error={!!errors.guard_id}
                          helperText={errors.guard_id}
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Check Type *</Form.Label>
                      <Form.Select
                        name="check_type"
                        value={attendanceFormData.check_type}
                        onChange={handleSelectChange}
                        isInvalid={!!errors.check_type}
                      >
                        <option value="">Select Check Type</option>
                        <option value="CHECK_IN">Check In</option>
                        <option value="CHECK_OUT">Check Out</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.check_type}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reason *</Form.Label>
                      <Form.Select
                        name="reason"
                        value={attendanceFormData.reason}
                        onChange={handleSelectChange}
                        isInvalid={!!errors.reason}
                      >
                        <option value="">Select Reason</option>
                        <option value="Network Issue">Network Issue</option>
                        <option value="Miss Punch">Miss Punch</option>
                        <option value="OD">OD</option>
                        <option value="Any Other">Any Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.reason}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="d-flex flex-column mb-3">
                    <Form.Label>Attendance Date *</Form.Label>
                    <DatePicker
                      selected={attendanceFormData.attendance_Date}
                      onChange={(date) => handleDateChange("attendance_Date", date)}
                      dateFormat="dd/MM/yyyy"
                      className={`formdatepicker${errors.attendance_Date ? " is-invalid" : ""}`}
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                    />
                    {errors.attendance_Date && (
                      <div style={{ color: "#dc3545", fontSize: "0.875em", marginTop: "0.25rem" }}>
                        {errors.attendance_Date}
                      </div>
                    )}
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Check Time *</Form.Label>
                      <TimeRange
                        value={
                          attendanceFormData.check_time instanceof Date
                            ? attendanceFormData.check_time
                            : null
                        }
                        onChange={(time) => handleChange("check_time", time)}
                      />
                      {errors.check_time && (
                        <div style={{ color: "#dc3545", fontSize: "0.875em", marginTop: "0.25rem" }}>
                          {errors.check_time}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="d-flex justify-content-end gap-2 mt-2">
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
                        "Submit"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="none"
                      className="cancelBtn"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
}

export default Attendance;
