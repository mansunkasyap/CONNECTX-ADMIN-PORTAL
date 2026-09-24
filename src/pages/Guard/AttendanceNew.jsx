


import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../components/MainLayout";
import { Button, Col, Form, Row, Tabs, Tab, Table, Spinner, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import moment from "moment";
import { isValid } from "date-fns";
import ExcelJS from "exceljs";
import { userService } from "../../../service/service";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import TimeRange from "../../components/TimeRange";
import Toast from "../../components/Toast";
import { toggleSpinnerAndDisableButton } from "../../Redux/Modals";

const BRANCH_DROPDOWN_URL = "/api/v0/web/web_branch_dropdown";
// Now backed by senior's web_customer_dropdown_v2 postgres function,
// filtered by the currently selected branch's name.
const SITE_DROPDOWN_URL = "/api/v0/web/web_site_dropdown";

const ATTENDANCE_NEW_URL = "/api/v0/web/web_guard_attendance_new";

// Infinite scroll chunk size - how many extra rows render each time you
// scroll near the bottom of the table.
const CHUNK_SIZE = 20;

// Shared column label map - used by BOTH the on-screen table and the
// Excel export, so headers always match exactly in both places.
const COLUMN_LABELS = {
  branch_name: "Branch Name",
  emp_code: "Reg No",
  full_name: "Full Name",
  company_name: "Client",
  location: "Site Name",
  attendance_date: "Date",
  checkin: "Check In",
  checkout: "Check Out",
  working_hours: "Working Hours",
  selfie_path: "Selfie",

  customer_id: "Customer Id",
  customer_name: "Customer Name",
  guard_name: "Guard Name",
  guard_id: "Guard Id",
  check_type: "Check Type",
  check_time: "Check Time",
  created_at: "Created At",
  latitude: "Latitude",
  longitude: "Longitude",
  branch_code: "Branch Code",
  site_name: "Site Name",
  site_code: "Site Code",
  employee_name: "Employee Name",
  employee_code: "Employee Code",
  status: "Status",
  remarks: "Remarks",
  date: "Date",
  from_date: "From Date",
  to_date: "To Date",
  total_attendance: "Total Attendance",
  present_days: "Present Days",
  absent_days: "Absent Days",
  late_days: "Late Days",
  overtime_hours: "Overtime Hours",
  total_working_days: "Total Working Days",
  total_working_hours: "Total Working Hours",
};

// Converts any value to Proper Case text, same rule used in the on-screen table
const toProperCase = (val) =>
  String(val ?? "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

// Detects raw ISO timestamps like "2026-06-14T18:30:00.000Z" coming straight
// from the database, and formats them cleanly instead of showing raw text.
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const formatCellValue = (col, val) => {
  if (val === null || val === undefined || val === "") return "-";

  if (ISO_DATETIME_REGEX.test(String(val))) {
    const isDateOnlyColumn = col.toLowerCase().includes("date");
    return moment(val).format(
      isDateOnlyColumn ? "DD-MMM-YYYY" : "DD-MMM-YYYY hh:mm A"
    );
  }

  // Employee/Registration codes should stay fully uppercase, not Proper Case
  if (col === "emp_code") {
    return String(val).toUpperCase();
  }

  return toProperCase(val);
};

// ---- Searchable dropdown (type to filter a long list, no extra API calls) ----
function SearchableSelect({
  options,
  idKey,
  labelKey,
  selectedId,
  onSelect,
  placeholder,
  disabled,
  isInvalid,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((o) => String(o[idKey]) === String(selectedId))?.[labelKey] ||
    "";

  const filtered = options.filter((o) =>
    String(o[labelKey] ?? "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <Form.Control
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={open ? query : selectedLabel}
        isInvalid={!!isInvalid}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        autoComplete="off"
      />
      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            zIndex: 2000,
            background: "#fff",
            border: "1px solid #ced4da",
            borderRadius: 6,
            width: "100%",
            maxHeight: 240,
            overflowY: "auto",
            marginTop: 2,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-muted" style={{ fontSize: "0.9rem" }}>
              No match found
            </div>
          )}
          {filtered.map((o) => (
            <div
              key={o[idKey]}
              className="px-3 py-2"
              style={{ cursor: "pointer", fontSize: "0.9rem" }}
              onMouseDown={() => {
                onSelect(o);
                setOpen(false);
                setQuery("");
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f6fb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {o[labelKey]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Simple client-side searchable table with infinite scroll ----
function GenericResultTable({ rows, searchText }) {
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const scrollContainerRef = useRef(null);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const lower = searchText.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(lower)
      )
    );
  }, [rows, searchText]);

  // Reset visible chunk whenever the underlying data or search changes
  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [rows, searchText]);

  console.log("First Row Data:", rows[0]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // When user scrolls within ~80px of the bottom, load the next chunk
    if (scrollHeight - (scrollTop + clientHeight) < 80) {
      setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, filteredRows.length));
    }
  };

  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "600",
          color: "#6c757d",
          borderRadius: "8px",
        }}
      >
        No Records To Display
      </div>
    );
  }

  if (filteredRows.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "600",
          color: "#6c757d",
          borderRadius: "8px",
        }}
      >
        No Matching Records
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  const pageRows = filteredRows.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRows.length;

  return (
    <div>
      <style>{`
        .selfie-hover-zoom {
          transition: transform 0.25s ease;
          cursor: pointer;
        }
        .selfie-hover-zoom:hover {
          transform: scale(4);
          position: relative;
          z-index: 2000;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
      `}</style>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "65vh",
          border: "1px solid #dee2e6",
        }}
      >
        <Table bordered hover size="sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    backgroundColor: "#d05356",
                    color: "#fff",
                    textAlign: "center",
                    verticalAlign: "middle",
                    fontWeight: "600",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                  }}
                >
                  {COLUMN_LABELS[col] || col.replace(/_/g, " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageRows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "10px 16px",
                      minWidth: "180px",
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                    }}
                  >
                    {col === "selfie_path" ? (
                      row[col] ? (
                        <img
                          src={row[col]}
                          alt="Selfie"
                          className="selfie-hover-zoom"
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                          }}
                        />
                      ) : (
                        "-"
                      )
                    ) : (
                      formatCellValue(col, row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>

        {hasMore && (
          <div className="text-center text-muted py-2" style={{ fontSize: "0.85rem" }}>
            Scroll down to load more...
          </div>
        )}
      </div>

      {/* ---- Status line (replaces old Prev/Next pagination) ---- */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
          Showing {pageRows.length} of {filteredRows.length} entries
        </span>
      </div>
    </div>
  );
}

function AttendanceNew() {
  const dispatch = useDispatch();
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );

  const [filterType, setFilterType] = useState("site");

  const [branchOptions, setBranchOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);

  const [branchId, setBranchId] = useState("");
  const [siteId, setSiteId] = useState("");

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [loadingResults, setLoadingResults] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance_summary");
  const [tableSearch, setTableSearch] = useState("");
  const [searchErrors, setSearchErrors] = useState({});
  const [results, setResults] = useState({
    attendance_summary: [],
    raw_attendance: [],
    employee_summary: [],
  });

  // ---- Regularize Attendance (Mark Attendance) modal state ----
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
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceFormData, setAttendanceFormData] = useState(initialAttendanceValues);
  const [guardReloadKey, setGuardReloadKey] = useState(0);
  const [attendanceErrors, setAttendanceErrors] = useState({});
  const [attendanceToast, setAttendanceToast] = useState({ show: false, type: "success", message: "" });
  const showAttendanceToast = (type, message) => setAttendanceToast({ show: true, type, message });
  const hideAttendanceToast = () => setAttendanceToast((prev) => ({ ...prev, show: false }));

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await userService.post(BRANCH_DROPDOWN_URL, {});
        setBranchOptions(response?.data?.data ?? []);
      } catch (err) {
        console.error("Error fetching branch list:", err);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Site list depends on the selected Branch's name (web_customer_dropdown_v2)
  useEffect(() => {
    if (!branchId) {
      setSiteOptions([]);
      return;
    }
    const selectedBranch = branchOptions.find(
      (b) => String(b.branch_id) === String(branchId)
    );
    // NOTE: using branch_code as branch_name - confirm exact field with senior
    const branchName = selectedBranch?.branch_code;
    if (!branchName) return;

    const fetchSites = async () => {
      setLoadingSites(true);
      try {
        const response = await userService.post(SITE_DROPDOWN_URL, {
          p_search: null,
          branch_name: branchName,
          p_limit: 100000,
        });
        setSiteOptions(response?.data?.data ?? []);
      } catch (err) {
        console.error("Error fetching site list:", err);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, [branchId, branchOptions]);

const handleFilterTypeChange = (type) => {
    setFilterType(type);

    if (type === "branch") {
      setSiteId("");
    } else {
      setBranchId("");
    }

    // Clear any leftover validation errors from before switching
    setSearchErrors({});

    // Clear filters
    setFromDate(null);
    setToDate(null);
    // Clear search box
    setTableSearch("");

    // Clear grid data
    setResults({
      attendance_summary: [],
      raw_attendance: [],
      employee_summary: [],
    });
  };

  const handleSearch = async () => {
    const newErrors = {};
    if (!fromDate) newErrors.fromDate = true;
    if (!toDate) newErrors.toDate = true;
    if (filterType === "branch" && !branchId) newErrors.branchId = true;
    if (filterType === "site" && !siteId) newErrors.siteId = true;
    setSearchErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Branch mode needs branch NAME (e.g. "Delhi"), Site mode needs customer_id
    const selectedBranch = branchOptions.find(
      (b) => String(b.branch_id) === String(branchId)
    );
    const branchName = selectedBranch?.branch_code; // TODO confirm exact field with senior

    setLoadingResults(true);
    try {
      const payload =
        filterType === "branch"
          ? {
            from_date: moment(fromDate).format("YYYY-MM-DD HH:mm:ss"),
            to_date: moment(toDate).format("YYYY-MM-DD HH:mm:ss"),
            filter_type: "branch",
            branch_name: branchName,
          }
          : {
            from_date: moment(fromDate).format("YYYY-MM-DD HH:mm:ss"),
            to_date: moment(toDate).format("YYYY-MM-DD HH:mm:ss"),
            filter_type: "site",
            customer_id: siteId,
          };

      const response = await userService.post(ATTENDANCE_NEW_URL, payload);
      const data = response?.data?.data ?? {};
      setResults({
        attendance_summary: data.attendance_summary ?? [],
        raw_attendance: data.raw_attendance ?? [],
        employee_summary: data.employee_summary ?? [],
      });
    } catch (err) {
      console.error("Error fetching attendance summary:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleReset = () => {
    setFilterType("branch");
    setBranchId("");
    setSiteId("");
    setFromDate(null);
    setToDate(null);
    setTableSearch("");
    setSearchErrors({});
    setResults({ attendance_summary: [], raw_attendance: [], employee_summary: [] });
  };

  // ---- Builds one styled worksheet (proper-case data + maroon/white header) ----
  const buildSheet = (workbook, sheetName, rows) => {
    if (!rows || rows.length === 0) return;

    const sheet = workbook.addWorksheet(sheetName);
    const columns = Object.keys(rows[0]);

    sheet.columns = columns.map((col) => ({
      header:
        COLUMN_LABELS[col] ||
        col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      key: col,
      width: 22,
    }));

    rows.forEach((row) => {
      const formattedRow = {};
      columns.forEach((col) => {
        formattedRow[col] = formatCellValue(col, row[col]);
      });
      sheet.addRow(formattedRow);
    });

    // Style header row - same maroon bg + white bold text as the on-screen table
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD05356" },
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  };

  // ---- Export current data to a 3-sheet styled Excel file ----
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();

    buildSheet(workbook, "Attendance Summary", results.attendance_summary);
    buildSheet(workbook, "Raw Attendance", results.raw_attendance);
    buildSheet(workbook, "Employee Summary", results.employee_summary);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${moment().format("YYYYMMDD_HHmmss")}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ==========================================================
  // Regularize Attendance (Mark Attendance) modal - same logic
  // as the old Attendance.jsx page, submitting to the same
  // web_guard_check_log API.
  // ==========================================================
  const validateAttendanceForm = () => {
    const newErrors = {};
    if (!attendanceFormData.customer_id) newErrors.customer_id = "Customer is required.";
    if (!attendanceFormData.guard_id) newErrors.guard_id = "Guard is required.";
    if (!attendanceFormData.check_type) newErrors.check_type = "Check type is required.";
    if (!attendanceFormData.attendance_Date) newErrors.attendance_Date = "Attendance date is required.";
    if (!attendanceFormData.check_time) newErrors.check_time = "Check time is required.";
    if (!attendanceFormData.reason) newErrors.reason = "Reason is required.";
    setAttendanceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseAttendanceModal = () => {
    setAttendanceFormData(initialAttendanceValues);
    setGuardReloadKey(0);
    setAttendanceErrors({});
    setShowAttendanceModal(false);
  };

  const handleCheckTimeChange = (field, value) => {
    if (field === "check_time") {
      if (!value || !isValid(new Date(value))) {
        console.error("Invalid time value");
        return;
      }
      setAttendanceFormData((prev) => ({
        ...prev,
        check_time: new Date(value),
      }));
      if (attendanceErrors.check_time) setAttendanceErrors((prev) => ({ ...prev, check_time: "" }));
    }
  };

  const handleAttendanceSelectChange = (e) => {
    const { name, value } = e.target;
    setAttendanceFormData((prev) => ({ ...prev, [name]: value }));
    if (attendanceErrors[name]) setAttendanceErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAttendanceDateChange = (field, date) => {
    if (!date) return;
    const formattedDate = moment(date).startOf("day").toDate();
    setAttendanceFormData((prev) => ({ ...prev, [field]: formattedDate }));
    if (attendanceErrors[field]) setAttendanceErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const insertAttendanceForm = async () => {
    if (!validateAttendanceForm()) return;

    let combinedDateTime = null;
    if (attendanceFormData.attendance_Date && attendanceFormData.check_time) {
      const datePart = moment(attendanceFormData.attendance_Date).format("YYYY-MM-DD");
      const timePart = moment(attendanceFormData.check_time).format("HH:mm:ss");
      combinedDateTime = `${datePart} ${timePart}`;
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
        showAttendanceToast("success", "Attendance marked successfully!");
        handleCloseAttendanceModal();
      } else {
        showAttendanceToast("error", response.data.message || "Failed to mark attendance.");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      showAttendanceToast("error", "An error occurred while marking attendance.");
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };

  return (
    <MainLayout pageName="Attendance" hasAddButton={false}>
      <div
        style={{
          background: "#f4f6fb",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 20,
        }}
      >
    <Row className="align-items-start gy-3 w-100 mx-0">
          <Col xs={12} sm="auto" className="pe-4">
            <Form.Label className="d-block fw-bold mb-2">
              Select Branch / Site
            </Form.Label>
            <Form.Check
              inline
              type="radio"
              id="filter-branch"
              name="filterType"
              label="Branch"
              checked={filterType === "branch"}
              onChange={() => handleFilterTypeChange("branch")}
            />
            <Form.Check
              inline
              type="radio"
              id="filter-site"
              name="filterType"
              label="Site"
              checked={filterType === "site"}
              onChange={() => handleFilterTypeChange("site")}
            />
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Form.Label className="fw-bold">Search Branch</Form.Label>
            <SearchableSelect
              options={branchOptions}
              idKey="branch_id"
              labelKey="branch_code"
              selectedId={branchId}
              disabled={loadingBranches}
              isInvalid={searchErrors.branchId}
              placeholder={loadingBranches ? "Loading..." : "Select Branch"}
              onSelect={(b) => {
                setBranchId(b.branch_id);
                setSiteId("");
                if (searchErrors.branchId) setSearchErrors((prev) => ({ ...prev, branchId: "" }));
              }}
            />
          </Col>

          {/* Site dropdown - widened so longer site/company names are readable */}
          {filterType === "site" && (
            <Col xs={12} sm={8} md={4}>
              <Form.Label className="fw-bold">Search Site</Form.Label>
              <SearchableSelect
                options={siteOptions}
                idKey="customer_id"
                labelKey="company_name"
                selectedId={siteId}
                disabled={loadingSites || !branchId}
                isInvalid={searchErrors.siteId}
                placeholder={
                  !branchId
                    ? "Select Branch first"
                    : loadingSites
                      ? "Loading..."
                      : "Select Site"
                }
                onSelect={(s) => {
                  setSiteId(s.customer_id);
                  if (searchErrors.siteId) setSearchErrors((prev) => ({ ...prev, siteId: "" }));
                }}
              />
            </Col>
          )}

          <Col xs={12} sm={6} md>
            <Form.Label className="fw-bold">From Date</Form.Label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                setFromDate(date);
                if (searchErrors.fromDate) setSearchErrors((prev) => ({ ...prev, fromDate: "" }));
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              className={`form-control w-100${searchErrors.fromDate ? " is-invalid" : ""}`}
              maxDate={new Date()}
              placeholderText="Select Date"
              withPortal
              portalId="attendance-new-datepicker-portal"
            />
          </Col>

          <Col xs={12} sm={6} md>
            <Form.Label className="fw-bold">To Date</Form.Label>
            <DatePicker
              selected={toDate}
              onChange={(date) => {
                setToDate(date);
                if (searchErrors.toDate) setSearchErrors((prev) => ({ ...prev, toDate: "" }));
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              className={`form-control w-100${searchErrors.toDate ? " is-invalid" : ""}`}
              maxDate={new Date()}
              placeholderText="Select Date"
              withPortal
              portalId="attendance-new-datepicker-portal"
            />
          </Col>
        </Row>

        {/* ---- Regularize Attendance (left) + Search/Export (right), same row, below Branch/Site + Date fields ---- */}
        <Row className="mt-3">
          <Col className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Button
              size="sm"
              variant="none"
              className="commonBtn d-flex align-items-center gap-2"
              onClick={() => setShowAttendanceModal(true)}
            >
              + Attendance Regularize
            </Button>

            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="none"
                className="commonBtn d-flex align-items-center gap-2"
                onClick={handleSearch}
                disabled={loadingResults}
              >
                {loadingResults ? <Spinner animation="border" size="sm" /> : "Search"}
              </Button>
              <Button
                size="sm"
                className="commonBtn d-flex align-items-center justify-content-center"
                onClick={handleExport}
                style={{
                  backgroundColor: "#198754",
                  borderColor: "#198754",
                }}
              >
                Export
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* ---- Tabs row + table search box ---- */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <Tabs
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key)}
          className="mb-0"
        >
          <Tab eventKey="attendance_summary" title="Attendance Summary" />
          <Tab eventKey="employee_summary" title="Employee Summary" />
          <Tab eventKey="raw_attendance" title="Raw Attendance" />
        </Tabs>

        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Search"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            style={{
              width: "350px",
              height: "44px",
              fontSize: "15px",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>

      {activeTab === "attendance_summary" && (
        <GenericResultTable rows={results.attendance_summary} searchText={tableSearch} />
      )}
      {activeTab === "raw_attendance" && (
        <GenericResultTable rows={results.raw_attendance} searchText={tableSearch} />
      )}
      {activeTab === "employee_summary" && (
        <GenericResultTable rows={results.employee_summary} searchText={tableSearch} />
      )}

      {/* ==========================================================
          Regularize Attendance Modal - same fields/flow as the old
          Attendance.jsx "Mark Attendance" popup, unchanged logic.
      ========================================================== */}
    
      <Modal size="lg" show={showAttendanceModal} onHide={handleCloseAttendanceModal}>
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
                          setAttendanceFormData({
                            ...initialAttendanceValues,
                            customer_id: val.customer_id,
                            company_name: val.company_name,
                          });
                          setGuardReloadKey((prev) => prev + 1);
                          if (attendanceErrors.customer_id) setAttendanceErrors((prev) => ({ ...prev, customer_id: "" }));
                        }}
                        valueInput={attendanceFormData.company_name}
                        objLevel={"company_name"}
                        labelName={"Customer *"}
                        error={!!attendanceErrors.customer_id}
                        helperText={attendanceErrors.customer_id}
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
                            setAttendanceFormData((prev) => ({
                              ...prev,
                              guard_id: val.guard_id,
                              full_name: val.full_name,
                              emp_code: val.emp_code,
                            }));
                            if (attendanceErrors.guard_id) setAttendanceErrors((prev) => ({ ...prev, guard_id: "" }));
                          }}
                          valueInput={attendanceFormData.full_name}
                          objLevel={"full_name"}
                          body={{ customer_id: attendanceFormData.customer_id }}
                          labelName={"Guard Name *"}
                          error={!!attendanceErrors.guard_id}
                          helperText={attendanceErrors.guard_id}
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
                        onChange={handleAttendanceSelectChange}
                        isInvalid={!!attendanceErrors.check_type}
                      >
                        <option value="">Select Check Type</option>
                        <option value="CHECK_IN">Check In</option>
                        <option value="CHECK_OUT">Check Out</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {attendanceErrors.check_type}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reason *</Form.Label>
                      <Form.Select
                        name="reason"
                        value={attendanceFormData.reason}
                        onChange={handleAttendanceSelectChange}
                        isInvalid={!!attendanceErrors.reason}
                      >
                        <option value="">Select Reason</option>
                        <option value="Network Issue">Network Issue</option>
                        <option value="Miss Punch">Miss Punch</option>
                        <option value="OD">OD</option>
                        <option value="Any Other">Any Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {attendanceErrors.reason}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="d-flex flex-column mb-3">
                    <Form.Label>Attendance Date *</Form.Label>
                    <DatePicker
                      selected={attendanceFormData.attendance_Date}
                      onChange={(date) => handleAttendanceDateChange("attendance_Date", date)}
                      dateFormat="dd/MM/yyyy"
                      className={`formdatepicker${attendanceErrors.attendance_Date ? " is-invalid" : ""}`}
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      withPortal
                      portalId="attendance-new-datepicker-portal"
                    />
                    {attendanceErrors.attendance_Date && (
                      <div style={{ color: "#dc3545", fontSize: "0.875em", marginTop: "0.25rem" }}>
                        {attendanceErrors.attendance_Date}
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
                        onChange={(time) => handleCheckTimeChange("check_time", time)}
                      />
                      {attendanceErrors.check_time && (
                        <div style={{ color: "#dc3545", fontSize: "0.875em", marginTop: "0.25rem" }}>
                          {attendanceErrors.check_time}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  {/* <Col md={12} className="d-flex justify-content-end gap-2 mt-2"> */}
                  <Col md={12} className="d-flex justify-content-start gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="none"
                      type="button"
                      className="commonBtn"
                      onClick={insertAttendanceForm}
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
                      onClick={handleCloseAttendanceModal}
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
      <Toast
        show={attendanceToast.show}
        type={attendanceToast.type}
        message={attendanceToast.message}
        onClose={hideAttendanceToast}
      />
    </MainLayout>
  );
}

export default AttendanceNew;