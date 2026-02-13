import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar';
import { Container, Nav, Button } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import p1 from '../../images/p1.jpg'
import p2 from '../../images/p2.jpg'
import p3 from '../../images/p3.jpg'
import p4 from '../../images/p4.jpg'
import AllPropertiesCards from '../user/AllPropertiesCards';
import './home.css'

const Home = () => {
   const [index, setIndex] = useState(0);

   const handleSelect = (selectedIndex) => {
      setIndex(selectedIndex);
   };

   return (
      <>

         {/* Modern Navbar */}
         <Navbar expand="lg" className="nav-modern">
            <Container fluid>
               <Navbar.Brand><h2>RentEase</h2></Navbar.Brand>
               <Navbar.Toggle />
               <Navbar.Collapse>
                  <Nav className="ms-auto">
                     <Link to="/">Home</Link>
                     <Link to="/login">Login</Link>
                     <Link to="/register">Register</Link>
                  </Nav>
               </Navbar.Collapse>
            </Container>
         </Navbar>

         {/* Hero Carousel */}
         <div className='hero-section'>
            <Carousel activeIndex={index} onSelect={handleSelect} fade>

               {[p1, p2, p3, p4].map((img, i) => (
                  <Carousel.Item key={i}>
                     <div className="hero-image-wrapper">
                        <img src={img} alt={`slide-${i}`} />
                        <div className="hero-overlay">
                           <h1>Find Your Perfect Rental Home</h1>
                           <p>Modern living spaces for every lifestyle</p>

                           <div className="hero-buttons">
                              <Link to="/register">
                                 <Button className="primary-btn">
                                    Get Started
                                 </Button>
                              </Link>

                              <Link to="/login">
                                 <Button variant="outline-light">
                                    Sign In
                                 </Button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  </Carousel.Item>
               ))}

            </Carousel>
         </div>

         {/* Property Section */}
         <div className='property-section'>
            <div className='text-center'>
               <h1 className='section-title'>
                  Explore Available Properties
               </h1>

               <p className='owner-cta'>
                  Want to post your property?
                  <Link to='/register'>
                     <Button variant='outline-primary'>
                        Register as Owner
                     </Button>
                  </Link>
               </p>
            </div>

            <Container>
               <AllPropertiesCards />
            </Container>
         </div>

      </>
   )
}

export default Home
