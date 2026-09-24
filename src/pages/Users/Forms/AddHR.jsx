import { Button, Col, Container, Form, Row } from "react-bootstrap";
import MainLayout from "../../../components/MainLayout";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

function AddHR() {
	const navigate = useNavigate();
	return (
		<MainLayout isShowing={false} pageName="Add HR" hasAddButton={false}>
			<Container className="formwrapper mt-0" fluid>
				<Form>
					<Row>
						<Col md={12}>
							<Row>
								<Col md={4} className="mb-4 validate">
									<TextField
										size="small"
										label="Employee Code*"
										variant="outlined"
										fullWidth
										name="emp_code"
										// onChange={}
									/>
								</Col>
								<Col md={4}>
									<TextField
										size="small"
										label="Full Name*"
										variant="outlined"
										fullWidth
										name="full_name"
										// onChange={}
									/>
								</Col>
								<Col md={4}>
									<TextField
										size="small"
										label="Mobile*"
										variant="outlined"
										fullWidth
										name="mobile"
										// onChange={}
									/>
								</Col>
								<Col md={4}>
									<TextField
										size="small"
										label="Email*"
										variant="outlined"
										fullWidth
										name="email"
										// onChange={}
									/>
								</Col>
								<Col md={4}>
									<TextField
										size="small"
										label="Address*"
										variant="outlined"
										fullWidth
										name="address"
										// onChange={}
									/>
								</Col>

								<Col md={4}>
									<Form.Control size="md" type="file" />
								</Col>
								<Col md={12} className="d-flex align-items-center gap-2 mt-4">
									<Button
										size="sm"
										variant="none"
										type="button"
										className="commonBtn"
									>
										Submit
									</Button>
									<Button
										size="sm"
										variant="none"
										type="button"
										className="cancelBtn"
										onClick={() => navigate('/users/hr')}
									>
										Cancel
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
				</Form>
			</Container>
		</MainLayout>
	);
}

export default AddHR;
