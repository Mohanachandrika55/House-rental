import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, Card, Modal, Carousel, Col, Form, InputGroup, Row } from 'react-bootstrap';
// import { Col, Form, Input, Row, message } from 'antd';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import PropertySearch from '../common/PropertySearch';

const AllPropertiesCards = ({ loggedIn }) => {
   const [index, setIndex] = useState(0);
   const [show, setShow] = useState(false);
   const [allProperties, setAllProperties] = useState([]);
   const [filterPropertyType, setPropertyType] = useState('');
   const [filterPropertyAdType, setPropertyAdType] = useState('');
   const [filterPropertyAddress, setPropertyAddress] = useState('');
   const [propertyOpen, setPropertyOpen] = useState(null)
   const [userDetails, setUserDetails] = useState({
      fullName: '',
      phone: 0,
   })

   const handleChange = (e) => {
      const { name, value } = e.target;
      setUserDetails({ ...userDetails, [name]: value });
   };

   const handleClose = () => setShow(false);

   const handleShow = (propertyId) => {
      setPropertyOpen(propertyId)
      setShow(true)
   };

   const getAllProperties = async (searchQuery = '') => {
      try {
         const url = searchQuery 
            ? `http://localhost:8001/api/user/getAllProperties?${searchQuery}`
            : 'http://localhost:8001/api/user/getAllProperties';
         const res = await axios.get(url);
         setAllProperties(res.data.data);
      } catch (error) {
         console.log(error);
      }
   };

   const handleBooking = async (status, propertyId, ownerId) => {
      try {
         await axios.post(`http://localhost:8001/api/user/bookinghandle/${propertyId}`, { userDetails, status, ownerId }, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`
            }
         })
            .then((res) => {
               if (res.data.success) {
                  message.success(res.data.message)
                  handleClose()
               }
               else {
                  message.error(res.data.message)
               }
            })
      } catch (error) {
         console.log(error);
      }
   }


   useEffect(() => {
      getAllProperties();
   }, []);



   const handleSelect = (selectedIndex) => {
      setIndex(selectedIndex);
   };

   const filteredProperties = allProperties
      .filter((property) => filterPropertyAddress === '' || property.propertyAddress.includes(filterPropertyAddress))
      .filter(
         (property) =>
            filterPropertyAdType === '' ||
            property.propertyAdType.toLowerCase().includes(filterPropertyAdType.toLowerCase())
      )
      .filter(
         (property) =>
            filterPropertyType === '' ||
            property.propertyType.toLowerCase().includes(filterPropertyType.toLowerCase())
      );

   return (
      <>
         <PropertySearch onSearch={getAllProperties} />
         <div className="d-flex column mt-5">
            {allProperties && allProperties.length > 0 ? (
               allProperties.map((property) => (
                  <Card border="dark" key={property._id} style={{ width: '18rem', marginLeft: 10 }}>
                     <Card.Body>
                        <Card.Title><img src={`http://localhost:8001${property.propertyImage[0].path}`} alt='photos' /></Card.Title>
                        <Card.Text>
                           <p style={{ fontWeight: 600 }} className='my-1'>Location:</p> {property.propertyAddress} <br />
                           <p style={{ fontWeight: 600 }} className='my-1'>Property Type:</p> {property.propertyType} <br />
                           <p style={{ fontWeight: 600 }} className='my-1'>Ad Type:</p> {property.propertyAdType} <br />
                           {!loggedIn ? (
                              <>
                              </>
                           ) : (
                              <>
                                 <p style={{ fontWeight: 600 }} className='my-1'>Owner Contact:</p> {property.ownerContact} <br />
                                 <p style={{ fontWeight: 600 }} className='my-1'>Availabilty:</p> {property.isAvailable} <br />
                                 <p style={{ fontWeight: 600 }} className='my-1'>Property Amount:</p> Rs.{property.propertyAmt}<br />
                              </>
                           )}
                        </Card.Text>
                        {
                           !loggedIn ? (<>
                              <p style={{ fontSize: 12, color: 'orange', marginTop: 20 }}>For more details, click on get info</p>
                              <Link to={'/login'}>
                                 <Button style={{ float: 'left' }} variant="outline-dark">
                                    Get Info
                                 </Button>
                              </Link></>
                           ) : (
                              <div>
                                 <p style={{ float: 'left', fontSize: 12, color: 'orange' }}>Get More Info of the Property</p>
                                 <Link to={`/property/${property._id}`}>
                                    <Button style={{ float: 'right' }} variant="outline-dark">
                                       View Details
                                    </Button>
                                 </Link>
                              </div>
                           )
                        }
                     </Card.Body>
                  </Card>
               ))
            ) : (
               <p>No Properties available at the moment.</p>
            )}
         </div>
      </>
   );
};

export default AllPropertiesCards;



