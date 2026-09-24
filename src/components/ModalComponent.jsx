import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { toggleForm } from "../Redux/Modals";

export default function ModalComponent({ innerJsx, modalTitle, hidden }) {
  const dispatch = useDispatch();
  const [small, setSmall] = useState(true);

  const handleHide = () => {
    if (hidden) dispatch(toggleForm());
  };

  // Force-clean stuck backdrop whenever modal closes
  useEffect(() => {
    if (!hidden) {
      const timer = setTimeout(() => {
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [hidden]);

  return (
    <Modal
      show={hidden}
      onHide={handleHide}
      centered
      className="modalwrapper"
      size={small ? "md" : "lg"}
    >
      <Modal.Header className="border-0">
        <Modal.Title>{modalTitle}</Modal.Title>
        <Button variant="none" onClick={() => setSmall((prev) => !prev)}>
          {small ? <AiOutlineFullscreen /> : <AiOutlineFullscreenExit />}
        </Button>
      </Modal.Header>
      <Modal.Body>{innerJsx}</Modal.Body>
    </Modal>
  );
}
