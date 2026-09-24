import { Link } from "react-router-dom";
import { connectxLogo, login } from "../../utils/images";
import {
  Button,
  Col,
  Container,
  Row,
  Toast,
  ToastContainer,
  Form,
} from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { userService } from "../../../service/service";

const Login = () => {
  const inputref = useRef(null);
  // const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authparams, setAuthParams] = useState({
    id: null,
    otp: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  const handleGetOtp = async (e) => {
    e.preventDefault();
    if (!authparams.mobile_no.trim() || authparams.mobile_no.length !== 10) {
      alert("Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await userService.login("/api/v0/web/login", {
        mobile_no: authparams.mobile_no,
      });

      if (response.data.valid) {
        setIsSuccess(true);
        setShowOTP(true);
        setAuthParams((prev) => ({ ...prev, id: response.data.data.login_id }));
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (err) {
      console.error("Error in OTP request:", err);
      setErrorMessage("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const submitSign = async (e) => {
    e.preventDefault();
    if (!authparams.otp.trim()) {
      alert("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await userService.login("/api/v0/web/otp", authparams);

      if (response.data.valid) {
        localStorage.setItem("auth", JSON.stringify(response.data.data.token));
        window.location.reload();
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (err) {
      console.error("Error in OTP verification:", err);
      setErrorMessage("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (event) => {
    setAuthParams({
      ...authparams,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    if (inputref.current) {
      inputref.current.focus();
    }
  }, []);

  return (
    <Container fluid className="login-container">
      <Row className="align-items-center">
        <Col md={7} className="text-center p-5">
          <div className="topbar">
            <h2 className="mb-0">Welcome to</h2>
            <img src={connectxLogo} alt="connectX" className="logo" />
          </div>
          <img
            src={login}
            alt="Description Image"
            className="object-contain h-100 w-100 description-image"
          />
        </Col>
        <Col md={5}>
          <div className="d-flex align-items-center justify-content-start">
            <div className="form-container p-5 pb-4 rounded-4 shadow bg-light border">
              <h2 className="mb-4">{showOTP ? "OTP Verification" : "Login"}</h2>
              <Form onSubmit={showOTP ? submitSign : handleGetOtp}>
                <Row>
                  {!showOTP ? (
                    <Col md={12} className="mb-4">
                      <Form.Label>Enter mobile number</Form.Label>
                      <input
                        name="mobile_no"
                        type="number"
                        onChange={handleChange}
                        ref={inputref}
                        value={authparams.mobile_no}
                        className={`form-control ${
                          errorMessage && "border-danger"
                        }`}
                        maxLength={10}
                      />
                      {errorMessage && (
                        <Form.Text className="text-danger text-capitalize">
                          {errorMessage}
                        </Form.Text>
                      )}
                    </Col>
                  ) : (
                    <Col md={12} className="mb-4">
                      <label>Enter OTP</label>
                      <input
                        name="otp"
                        type="number"
                        onChange={handleChange}
                        value={authparams.otp}
                        ref={inputref}
                        className="form-control"
                      />
                      {errorMessage && (
                        <Form.Text className="text-danger text-capitalize">
                          {errorMessage}
                        </Form.Text>
                      )}
                    </Col>
                  )}
                  <Col md={12}>
                    <Button
                      variant="none"
                      type="submit"
                      className="submitbutton"
                      disabled={loading}
                    >
                      {loading
                        ? "Please wait.."
                        : showOTP
                          ? "Verify"
                          : "Continue"}
                    </Button>
                  </Col>
                  {/* <Col md={12} className="text-end mt-3">
										<Link to="">Forget Password?</Link>
									</Col> */}
                </Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
      <ToastContainer position="bottom-end" className="m-4">
        <Toast show={isSuccess} bg="success" animation={true}>
          <Toast.Body className="text-white">
            OTP Sent to your Mobile Number
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Login;
