import { connectxLogo } from '../utils/images';
import { Link, useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
function PrivacyPolicy() {
  const history = useNavigate();
  return (
    <div className="inner_pages">
      <header>
        <Container className="d-flex justify-content-between align-items-center">
          <img src={connectxLogo} alt="connect x" className="logo" />
          <Link onClick={() => history(-1)}>
            <FaArrowLeft /> Go to panel
          </Link>
        </Container>
      </header>
      <Container className="pt-5 pb-5">
        <Row>
          <Col md={12}>
            <h1 className="mb-5">Privacy Policy</h1>
            <p>
              <strong>Effective Date:</strong> 1st December, 2024
            </p>
            <p>
              At <strong>ConnectX</strong>, we value your trust and are
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and safeguard your information when you use
              the <strong>ConnectX Application</strong> ("App"). By using the
              App, you agree to the terms outlined in this policy. If you do not
              agree, please refrain from using the App.
            </p>
            <h5>1. Information We Collect</h5>
            <p>
              We collect the following types of information to provide and
              improve the App’s functionality:
            </p>
            <p>
              <strong>a. Personal Information:</strong>
            </p>
            <ul>
              <li>
                Name, employee ID, contact information, and other details
                provided during registration.
              </li>
              <li>
                Payslip details and salary-related information for your access.
              </li>
            </ul>
            <p>
              <strong>b. Location Information:</strong>
            </p>
            <p>
              Real-time location data to enable features such as attendance
              tracking and patrol monitoring.
            </p>
            <p>
              <strong>c. Usage Data:</strong>
            </p>
            <ul>
              <li>
                Information about how you interact with the App, including login
                frequency, pages viewed, and actions performed.
              </li>
            </ul>
            <p>
              <strong>d. Device Information:</strong>
            </p>
            <ul>
              <li>
                Device model, operating system, unique device identifiers, and
                app version.
              </li>
            </ul>
            <p>
              <strong>e. Multimedia:</strong>
            </p>
            <ul>
              <li>
                Photos, voice recordings, or text provided when registering
                grievances or uploading other data.
              </li>
            </ul>
            <h5>2. How We Use Your Information</h5>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>
                <strong>To Provide Services:</strong> Ensure smooth operation of
                app features like payroll access, grievance handling, and
                training tracking.
              </li>
              <li>
                <strong>To Improve User Experience:</strong> Analyze usage data
                to enhance app performance and usability.
              </li>
              <li>
                <strong>For Communication:</strong> Send important updates,
                notifications, and training reminders.
              </li>
              <li>
                <strong>Security:</strong> Monitor usage patterns to detect and
                prevent unauthorized access or misuse.
              </li>
            </ul>
            <h5>3. Sharing Your Information</h5>
            <p>
              We do not sell or rent your personal information. However, we may
              share it in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>With Your Employer:</strong> To provide attendance,
                training, and grievance-related reports.
              </li>
              <li>
                <strong>With Service Providers:</strong> To facilitate email
                notifications, SMS alerts, or other third-party integrations
                (e.g., WhatsApp API, email API).
              </li>
              <li>
                <strong>As Required by Law:</strong> To comply with legal
                obligations or respond to valid legal processes.
              </li>
            </ul>
            <h5>4. Data Retention</h5>
            <p>
              We retain your information as long as necessary to fulfill the
              purposes outlined in this policy or as required by law. Once data
              is no longer needed, we securely delete it.
            </p>
            <h5>5. Data Security</h5>
            <p>
              We take appropriate measures to secure your information against
              unauthorized access, alteration, disclosure, or destruction,
              including encryption, secure servers, and regular security
              assessments.
            </p>
            <h5>6. Your Rights</h5>
            <p>You have the right to: </p>
            <ul>
              <li>Access, correct, or delete your personal information.</li>
              <li>Restrict or object to the processing of your data.</li>
              <li>
                Withdraw consent for location tracking (this may limit app
                functionality).
              </li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <Link to="mailto:info@connectx.co.in">info@connectx.co.in</Link> .
            </p>
            <h5>7. Third-Party Services</h5>
            <p>
              The App may integrate third-party services (e.g., WhatsApp, email,
              or push notifications). These services have their own privacy
              policies, and we encourage you to review them.
            </p>
            <h5>8. Children’s Privacy</h5>
            <p>
              The App is not intended for use by individuals under the age of
              18. We do not knowingly collect data from children.
            </p>
            <h5>9. Updates to This Privacy Policy</h5>
            <p>
              We may update this Privacy Policy periodically to reflect changes
              in the App or applicable laws. Notifications about changes will be
              provided within the App or sent via email. Please review this
              policy regularly.
            </p>
            <h5>10. Contact Us</h5>
            <p>
              If you have questions or concerns about this Privacy Policy or
              your data, please contact us at:
            </p>
            <p>
              Email:{' '}
              <Link to="mailto:info@connectx.co.in">info@connectx.co.in</Link>{' '}
              <br />
              Phone: <Link to="tel:+919266319619">+91 92663 19619</Link>
              <br />
              Address: 19-20, Jask Tower, 1st Floor, Sector 125, Noida - 201301,
              Uttar Pradesh, India.
            </p>
            <p>
              By using the ConnectX Application, you acknowledge that you have
              read and understood this Privacy Policy.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PrivacyPolicy;
