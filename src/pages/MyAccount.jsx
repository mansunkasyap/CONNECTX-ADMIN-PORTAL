import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import { Col, Container, Row } from 'react-bootstrap';
import { userService } from '../../service/service';
import { UserImageProfile } from '../utils/images';
import config from '../../service/config';

function MyAccount() {
  const [userData, setUserData] = useState({});

  const handleProfile = async () => {
    try {
      const response = await userService.get('/api/v0/web/web_login_profile', {
        login_id: 207,
      });

      if (response.data.valid) {
        const value = response.data.data?.[0] || {};
        setUserData(value);
      } else {
        console.error('Error in response:', response.data.message);
      }
    } catch (err) {
      console.error('Error while fetching user data:', err);
    }
  };

  useEffect(() => {
    handleProfile();
  }, []);

  return (
    <MainLayout pageName="My Account" hasAddButton={false}>
      <Container className="accountPage bg-white p-3" fluid>
        <Row>
          <Col md={3}>
            <img
              src={userData?.profile_pic || UserImageProfile}
              alt="user"
              className="profile border"
            />
          </Col>
          <Col md={9}>
            <Row>
              <Col md={6}>
                <p>
                  <span className="label">Name</span>
                  <h4>{userData?.name}</h4>
                </p>
                <p>
                  <span className="label">Email</span>
                  <h4>{userData?.email}</h4>
                </p>
                <p>
                  <span className="label">Phone Number</span>
                  <h4>{userData?.mobile}</h4>
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <span className="label">Employee Code</span>
                  <h4>{userData?.emp_code}</h4>
                </p>
                <p>
                  <span className="label">Role</span>
                  <h4>{userData?.type}</h4>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
}

export default MyAccount;
