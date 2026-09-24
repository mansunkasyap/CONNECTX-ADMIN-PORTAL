import { FaCheck } from "react-icons/fa";

export default function SuccessMessage({ hidden }) {
  return (
    <div className={`successmessagebox ${hidden ? "show" : ""} bg-success`}>
      <div className="icon">
        <FaCheck />
      </div>
      <div className="box">
        <h6>Success </h6>
      </div>
    </div>
  );
}
