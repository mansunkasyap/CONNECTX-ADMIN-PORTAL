import { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Badge, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { TextField , IconButton, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import {
  hideModal,
  showModal,
  toggleForm,
  toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { BsPenFill, BsTrash3Fill } from "react-icons/bs";
import DeleteModal from "../../components/DeleteModal";
import CommonDataGrid from "../../components/CommonDataGrid";
import MainLayout from "../../components/MainLayout";
import { userService } from "../../../service/service";
import Toast from "../../components/Toast";
import { AutoCompletedDropdown } from "../../components/AutoCompleteDropdown";
import config from "../../../service/config";
import { FaPrint } from "react-icons/fa6";


function RowActionMenu({ row, onEdit, onPreview, onDelete, onRemarks, canEdit, canView, canDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenUpward(window.innerHeight - rect.bottom < 160);
    setAnchorEl(e.currentTarget);
  };
  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MdMoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: openUpward ? "top" : "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: openUpward ? "bottom" : "top", horizontal: "right" }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 120, borderRadius: 2 } } }}
      >
        {canEdit && <MenuItem onClick={() => { onEdit(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><MdOutlineEdit size={16} /> Edit</MenuItem>}
        {canView && <MenuItem onClick={() => { onPreview(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><FaEye size={14} /> View</MenuItem>}
        {onRemarks && <MenuItem onClick={() => { onRemarks(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><BsChatLeftDotsFill size={14} /> Remarks</MenuItem>}
        {canDelete && <MenuItem onClick={() => { onDelete(row); handleClose(); }} sx={{ gap: 1, fontSize: 14, color: "error.main" }}><BsTrash3Fill size={13} /> Delete</MenuItem>}
      </Menu>
    </>
  );
}

export default function MaterialRequisition() {
  const dispatch = useDispatch();
  const getUser = useSelector((state) => state.getUserRight.data);
  const addButton = useSelector((state) => state.addFormButton.show);
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show,
  );
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const [formTitle, setFormTitle] = useState("Add Material");

  const deleteMessage = useSelector((state) => state.removeModal.message);
  const deleteModalData = {
    id: deleteMessage?.request_id,
    name: deleteMessage?.material_name,
  };

  const initialValues = {
    customer_id: "",
    location_id: "",
    material_name: "",
    quantity: "",
    unit: "",
  };

  const [inputValues, setinputValues] = useState(initialValues);
  const [customerData, setCustomerData] = useState({
    customer_id: "",
    company_name: "",
  });
  const [locationData, setLocationData] = useState({
    location_id: "",
    location_name: "",
  });
  const [shouldFetchLocation, setShouldFetchLocation] = useState(false);

  const [errors, setErrors] = useState({});
  const [body, setbody] = useState({
    refresh: "",
  });
  const [updateGrid, setupdateGrid] = useState(0);

  const handleClose = () => {
    setFormTitle("Add Material");
    setinputValues(initialValues);
    setCustomerData({ customer_id: "", company_name: "" });
    setLocationData({ location_id: "", location_name: "" });
    setShouldFetchLocation(false);
    setErrors({});
    dispatch(toggleForm());
  };

  // start userRights

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

  const handleEdit = useCallback(
    async (data) => {
      dispatch(toggleForm());
      setFormTitle("Edit Material");
      try {
        const response = await userService.post(
          "/api/v0/web/preview_facility_material_request",
          { request_id: data.original.request_id },
        );

        if (response.data.valid) {
          // let value = response.data.data[0];
          // let tempData = { ...inputValues };
          // for (let key in inputValues) {
          // 	if (value.hasOwnProperty(key)) {
          // 		tempData[key] = value[key];
          // 	}
          // }
          // tempData.p_action = "UPDATE";
          // setinputValues(tempData);

          // // Set customer data if available
          // setCustomerData({
          // 	customer_id: value.customer_id,
          // 	company_name: value.company_name || "",
          // });

          // // Set location data if available
          // if (value.location_id) {
          // 	setShouldFetchLocation(true);
          // 	setLocationData({
          // 		location_id: value.location_id,
          // 		location_name: value.location_name || "",
          // 	});
          // 	setinputValues((prev) => ({
          // 		...prev,
          // 		location_id: value.location_id,
          // 	}));
          // }

          let value = response.data.data[0];

          // 1. Store form values properly (including p_action and location_id)
          setinputValues({
            ...value,
            p_action: "UPDATE",
            // Ensure location_id is present for other inputs if needed
            location_id: value.location_id ?? "",
          });

          // 2. Set customer data first
          setCustomerData({
            customer_id: value.customer_id,
            company_name: value.company_name,
          });

          // 3. Enable dropdown loading/rendering. This ensures the
          //    Location dropdown is visible immediately after Customer data is set.
          setShouldFetchLocation(true);

          // 4. Set location auto-fill data (must be done after enabling fetch/render)
          // This sets the value that `valueInput` in the Location dropdown will display.
          setLocationData({
            location_id: value.location_id,
            location_name: value.location,
          });
        } else {
          showToast("error", response.data.message || "Failed to load data.");
        }
      } catch (err) {
        console.error(err);
        showToast("error", "An unexpected error occurred.");
      }
    },
    [dispatch, inputValues],
  );

  useEffect(() => {
    if (customerData.customer_id && inputValues.p_action === "UPDATE") {
      setShouldFetchLocation(true);
    }
  }, [customerData, inputValues.p_action]);

  const handlePrint = (data) => {
    const url = `${config.reactUrl}facility/location-print/${data}`;
    window.open(url, "_blank");
  };

  const gridColumn = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "S.No.",
        enableColumnFilter: false,
        Cell: ({ _, row }) => Number(row.id) + 1,
        size: 90,
      },
      {
        accessorKey: "location",
        header: "Location",
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: "company_name",
        header: "Company Name",
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: "material_name",
        header: "Material Name",
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        enableColumnFilter: false,
        size: 200,
        Cell: ({ row }) => (
          <span>
            {row.original.quantity} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created Date",
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          const createdAt = row.original.created_at;

          if (!createdAt) return "N/A";

          return (
            <span>
              {moment(createdAt).format("DD/MM/YYYY")} (
              {moment(createdAt).format("LT")})
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created Date",
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          const createdAt = row.original.created_at;

          if (!createdAt) return "N/A";

          return (
            <span>
              {moment(createdAt).format("DD/MM/YYYY")} (
              {moment(createdAt).format("LT")})
            </span>
          );
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        enableColumnFilter: false,
        size: 100,
                Cell: ({ row }) => (
          <RowActionMenu
          row={row.original}
          onEdit={handleEdit}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
    ],
    [isUserRight, dispatch, handleEdit],
  );

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setinputValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleQuantityChange = (event) => {
    const value = event.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setinputValues((prev) => ({ ...prev, quantity: value }));
      setErrors((prev) => ({ ...prev, quantity: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customerData.customer_id) newErrors.customer_id = "Customer is required.";
    if (!locationData.location_id) newErrors.location_id = "Location is required.";
    if (!inputValues.material_name.trim()) newErrors.material_name = "Material name is required.";
    if (!inputValues.quantity || parseFloat(inputValues.quantity) <= 0) newErrors.quantity = "A valid quantity is required.";
    if (!inputValues.unit) newErrors.unit = "Unit is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const insertForm = async () => {
    if (!validateForm()) {
      return;
    }

    dispatch(toggleSpinnerAndDisableButton(true));
    try {
      const payload = {
        request_id: 0,
        material_name: inputValues.material_name,
        location_id: locationData.location_id,
        location: locationData.location_name,
        quantity: parseFloat(inputValues.quantity),
        unit: inputValues.unit,
        customer_id: customerData.customer_id,
        entryFrom: "admin",
      };

      const response = await userService.post(
        "/api/v0/web/insert_or_update_facility_material_request",
        payload,
      );
      if (response.data.valid) {
        setinputValues(initialValues);
        setCustomerData({ customer_id: "", company_name: "" });
        setLocationData({ location_id: "", location_name: "" });
        setShouldFetchLocation(false);
        setErrors({});
        showToast("success", "Material saved successfully!");
        setupdateGrid(updateGrid + 1);
        setbody({ ...body, refresh: 2 });
        dispatch(toggleForm());
      } else {
        showToast("error", response.data.message || "Found duplicate entries.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An error occurred while submitting the form.");
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };

  async function handleDelete(id) {
    const obj = {
      request_id: id,
    };
    try {
      const response = await userService.post(
        "/api/v0/web/delete_facility_material_request",
        obj,
      );
      if (response.data.valid) {
        showToast("success", "Deleted successfully!");
        setbody({ ...body, refresh: 2 });
      } else {
        showToast("error", response.data.message || "Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An unexpected error occurred.");
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
      dispatch(hideModal());
    }
  }

  return (
    <MainLayout
      isShowing={false}
      pageName={"Material Requisition"}
      hasAddButton={isUserRight?.can_insert}
      branchDropdown={false}
    >
      <CommonDataGrid
        url={"/api/v0/web/browse_facility_material_request"}
        columns={gridColumn}
        body={body}
        jsonUpd={updateGrid}
      />
      <Modal size="lg" show={addButton} onHide={handleClose} centered className="modalwrapper">
        <Modal.Header className="border-0">
          <Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>{formTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <AutoCompletedDropdown
                  url={"/api/v0/web/web_customer_dropdown"}
                  body={{ p_limit: 10, reload: false }}
                  handleDataChange={(val) => {
                    setCustomerData({ customer_id: val.customer_id, company_name: val.company_name });
                    setLocationData({ location_id: "", location_name: "" });
                    setinputValues((prev) => ({ ...prev, customer_id: val.customer_id, location_id: "" }));
                    setShouldFetchLocation(true);
                    if (errors.customer_id) setErrors((prev) => ({ ...prev, customer_id: "" }));
                  }}
                  valueInput={customerData.company_name}
                  objLevel={"company_name"}
                  labelName={"Customer *"}
                  error={!!errors.customer_id}
                  helperText={errors.customer_id}
                />
              </Col>
              <Col md={6} className="mb-3">
                {(inputValues.p_action === "UPDATE" || shouldFetchLocation) && customerData.customer_id ? (
                  <AutoCompletedDropdown
                    url={"/api/v0/web/list_facility_location_checkpoint"}
                    body={{ limit: 100, customer_id: customerData.customer_id }}
                    handleDataChange={(val) => {
                      setLocationData({ location_id: val.location_id, location_name: val.location_name });
                      setinputValues((prev) => ({ ...prev, location_id: val.location_id }));
                      if (errors.location_id) setErrors((prev) => ({ ...prev, location_id: "" }));
                    }}
                    valueInput={locationData.location_name}
                    objLevel={"location_name"}
                    labelName={"Location *"}
                    error={!!errors.location_id}
                    helperText={errors.location_id}
                  />
                ) : (
                  <Form.Group>
                    <Form.Control size="md" placeholder="Select customer first" disabled />
                    {errors.location_id && (
                      <div style={{ color: "#dc3545", fontSize: "0.875em", marginTop: "0.25rem" }}>
                        {errors.location_id}
                      </div>
                    )}
                  </Form.Group>
                )}
              </Col>
              <Col md={12} className="mb-3">
                <TextField
                  size="small"
                  fullWidth
                  label="Material Name *"
                  name="material_name"
                  value={inputValues.material_name}
                  placeholder="Enter material name"
                  onChange={handleChange}
                  error={!!errors.material_name}
                  helperText={errors.material_name}
                />
              </Col>
              <Col md={6} className="mb-3">
                <TextField
                  size="small"
                  fullWidth
                  label="Quantity *"
                  name="quantity"
                  value={inputValues.quantity}
                  placeholder="Enter quantity"
                  onChange={handleQuantityChange}
                  inputProps={{ inputMode: "decimal", pattern: "[0-9]*[.]?[0-9]*" }}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  {/* <Form.Label style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Unit *</Form.Label> */}
                  <Form.Select
                    size="md"
                    name="unit"
                    value={inputValues.unit}
                    onChange={handleChange}
                    isInvalid={!!errors.unit}
                  >
                    <option value="">Select Unit</option>
                    <option value="Kilograms">Kilograms</option>
                    <option value="Litres">Litres</option>
                    <option value="Packets">Packets</option>
                    <option value="Bags">Bags</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Meters">Meters</option>
                    <option value="Numbers">Numbers</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.unit}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
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
          </Form>
        </Modal.Body>
      </Modal>
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}
