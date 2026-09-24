import { Button, Col, Modal, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { hideModal, toggleSpinnerAndDisableButton } from "../Redux/Modals";


export default function DeleteModal({ removeId, data }) {
  
  const dispatch = useDispatch();
  const deteleModal = useSelector((state) => state.removeModal.show);
  const spinnerbutton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );

  function handleConfirm() {
    dispatch(toggleSpinnerAndDisableButton(true));
    removeId(data.id);
  }

  return (
    <Modal
      show={deteleModal}
      onHide={() => dispatch(hideModal())}
      centered
      className="modalwrapper"
    >
      <Modal.Header className="border-0" closeButton>
        <Modal.Title>Are you sure you want to delete?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="fs-6">{data.name}</p>
        <Row>
          <Col md={12} className="d-flex justify-content-end gap-2">
            <Button
              size="sm"
              variant="none"
              className="canclebutton"
              onClick={() => dispatch(hideModal())}
            >
              Close
            </Button>
            <Button
              size="sm"
              variant="none"
              className="savebutton"
              onClick={handleConfirm}
              disabled={spinnerbutton}
            >
              {spinnerbutton ? (
                <Spinner animation="border" variant="light" size="sm" />
              ) : (
                "Confirm"
              )}
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}
