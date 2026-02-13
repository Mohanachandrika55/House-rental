import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Carousel, 
  Badge, 
  Form,
  Alert,
  Spinner,
  Modal
} from 'react-bootstrap';
import { 
  LocationOn, 
  Home, 
  AttachMoney, 
  Phone, 
  Person,
  CalendarToday,
  Message
} from '@mui/icons-material';
import { message } from 'antd';
import Messaging from './Messaging';

const PropertyDetails = ({ userLoggedIn }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    fullName: '',
    phone: '',
    message: ''
  });
  const [ownerInfo, setOwnerInfo] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8001/api/user/getAllProperties`);
      const allProperties = response.data.data;
      const foundProperty = allProperties.find(p => p._id === id);
      
      if (foundProperty) {
        setProperty(foundProperty);
        // Create owner info object for messaging
        setOwnerInfo({
          _id: foundProperty.ownerId,
          name: foundProperty.ownerName || 'Property Owner',
          email: 'owner@example.com' // This would come from user data in a real app
        });
      } else {
        message.error('Property not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      message.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!userLoggedIn) {
      message.warning('Please login to book this property');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post(
        `http://localhost:8001/api/user/bookinghandle/${id}`,
        {
          userDetails: bookingDetails,
          status: 'pending',
          userId: user._id,
          ownerId: property.ownerId
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        message.success('Booking request sent successfully!');
        setShowBookingForm(false);
        setBookingDetails({ fullName: '', phone: '', message: '' });
      }
    } catch (error) {
      console.error('Booking error:', error);
      message.error('Failed to submit booking request');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading property details...</p>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Property not found or has been removed.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          {/* Image Gallery */}
          <Card className="mb-4">
            <Carousel>
              {property.propertyImage && property.propertyImage.length > 0 ? (
                property.propertyImage.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={`http://localhost:8001${image.path}`}
                      alt={`Property image ${index + 1}`}
                      className="d-block w-100"
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                  </Carousel.Item>
                ))
              ) : (
                <Carousel.Item>
                  <div 
                    className="d-block w-100 d-flex align-items-center justify-content-center bg-light"
                    style={{ height: '400px' }}
                  >
                    <p className="text-muted">No images available</p>
                  </div>
                </Carousel.Item>
              )}
            </Carousel>
          </Card>

          {/* Property Information */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title as="h2">{property.propertyType}</Card.Title>
              <div className="mb-3">
                <Badge bg="primary">{property.propertyAdType}</Badge>
              </div>
              
              <Row className="mb-4">
                <Col md={6}>
                  <p className="d-flex align-items-center">
                    <AttachMoney className="me-2" />
                    <strong>Price:</strong> ${property.propertyAmt}/month
                  </p>
                  <p className="d-flex align-items-center">
                    <LocationOn className="me-2" />
                    <strong>Location:</strong> {property.propertyAddress}
                  </p>
                  <p className="d-flex align-items-center">
                    <Home className="me-2" />
                    <strong>Type:</strong> {property.propertyType}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="d-flex align-items-center">
                    <Person className="me-2" />
                    <strong>Owner:</strong> {property.ownerName || 'N/A'}
                  </p>
                  <p className="d-flex align-items-center">
                    <Phone className="me-2" />
                    <strong>Contact:</strong> {property.ownerContact}
                  </p>
                  <p className="d-flex align-items-center">
                    <CalendarToday className="me-2" />
                    <strong>Availability:</strong> {property.isAvailable || 'Available'}
                  </p>
                </Col>
              </Row>

              {property.additionalInfo && (
                <div className="mb-4">
                  <h5>Additional Information</h5>
                  <p>{property.additionalInfo}</p>
                </div>
              )}

              {/* Booking Section */}
              {userLoggedIn ? (
                <div>
                  {!showBookingForm ? (
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={() => setShowBookingForm(true)}
                    >
                      Book This Property
                    </Button>
                  ) : (
                    <Card className="mt-3">
                      <Card.Body>
                        <h5>Book This Property</h5>
                        <Form onSubmit={handleBookingSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={bookingDetails.fullName}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={bookingDetails.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Message (Optional)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="message"
                              value={bookingDetails.message}
                              onChange={handleInputChange}
                              placeholder="Any additional information..."
                            />
                          </Form.Group>
                          <Button variant="primary" type="submit" className="me-2">
                            Submit Booking Request
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => setShowBookingForm(false)}
                          >
                            Cancel
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert variant="info">
                  Please <a href="/login">login</a> to book this property.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Contact Information Card */}
          <Card className="mb-4">
            <Card.Header as="h5">Contact Information</Card.Header>
            <Card.Body>
              <p><strong>Owner Name:</strong> {property.ownerName || 'N/A'}</p>
              <p><strong>Phone:</strong> {property.ownerContact}</p>
              <p><strong>Email:</strong> Contact owner for details</p>
              {userLoggedIn ? (
                <>
                  <Button 
                    variant="outline-primary" 
                    className="w-100 mb-2"
                    onClick={() => setShowMessaging(true)}
                  >
                    <Message size={16} className="me-2" />
                    Message Owner
                  </Button>
                  <Button variant="outline-secondary" className="w-100">
                    Call Owner
                  </Button>
                </>
              ) : (
                <Alert variant="info" className="mb-0">
                  Please <a href="/login">login</a> to contact owner.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <Card.Header as="h5">Quick Info</Card.Header>
            <Card.Body>
              <p><strong>Property ID:</strong> {property._id}</p>
              <p><strong>Listed Date:</strong> {new Date(property.createdAt || Date.now()).toLocaleDateString()}</p>
              <p><strong>Status:</strong> 
                <Badge bg={property.isAvailable === 'available' ? 'success' : 'warning'} className="ms-2">
                  {property.isAvailable || 'Available'}
                </Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Messaging Modal */}
      <Modal 
        show={showMessaging} 
        onHide={() => setShowMessaging(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Message Property Owner</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {ownerInfo && (
            <Messaging 
              currentUser={JSON.parse(localStorage.getItem('user'))}
              otherUser={ownerInfo}
              propertyId={id}
              onClose={() => setShowMessaging(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PropertyDetails;
