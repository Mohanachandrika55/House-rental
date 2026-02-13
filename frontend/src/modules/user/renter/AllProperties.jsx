import { message } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AllProperty = () => {
   const [allBookings, setAllBookings] = useState([]);
   const [propertyDetails, setPropertyDetails] = useState({});

   const getAllBookings = async () => {
      try {
         const response = await axios.get(`http://localhost:8001/api/user/getallbookings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
         });

         if (response.data.success) {
            setAllBookings(response.data.data);
            // Fetch property details for each booking
            fetchPropertyDetails(response.data.data);
         } else {
            message.error(response.data.message);
         }
      } catch (error) {
         console.log(error);
      }
   };

   const fetchPropertyDetails = async (bookings) => {
      const details = {};
      for (const booking of bookings) {
         try {
            const response = await axios.get('http://localhost:8001/api/user/getAllProperties');
            const allProperties = response.data.data;
            const property = allProperties.find(p => p._id === booking.propertyId);
            if (property) {
               details[booking.propertyId] = property;
            }
         } catch (error) {
            console.log('Error fetching property details:', error);
         }
      }
      setPropertyDetails(details);
   };

   useEffect(() => {
      getAllBookings();
   }, []);

   const getStatusBadge = (status) => {
      switch (status?.toLowerCase()) {
         case 'pending':
            return <Badge bg="warning">Pending</Badge>;
         case 'booked':
         case 'confirmed':
            return <Badge bg="success">Confirmed</Badge>;
         case 'cancelled':
            return <Badge bg="danger">Cancelled</Badge>;
         default:
            return <Badge bg="secondary">{status}</Badge>;
      }
   };

   return (
      <div>
         <h4 className="mb-4">Your Booking History</h4>
         {allBookings.length === 0 ? (
            <div className="text-center py-5">
               <p>You haven't made any bookings yet.</p>
               <Link to="/renterhome">
                  <Button variant="primary">Browse Properties</Button>
               </Link>
            </div>
         ) : (
            <TableContainer component={Paper}>
               <Table sx={{ minWidth: 650 }} aria-label="booking history table">
                  <TableHead>
                     <TableRow>
                        <TableCell>Booking ID</TableCell>
                        <TableCell>Property Details</TableCell>
                        <TableCell align="center">Your Name</TableCell>
                        <TableCell align="center">Phone</TableCell>
                        <TableCell align="center">Booking Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {allBookings.map((booking) => (
                        <TableRow
                           key={booking._id}
                           sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                           <TableCell component="th" scope="row">
                              {booking._id.slice(-8)}...
                           </TableCell>
                           <TableCell>
                              {propertyDetails[booking.propertyId] ? (
                                 <div>
                                    <strong>{propertyDetails[booking.propertyId].propertyType}</strong>
                                    <br />
                                    <small className="text-muted">
                                       {propertyDetails[booking.propertyId].propertyAddress}
                                    </small>
                                    <br />
                                    <strong>${propertyDetails[booking.propertyId].propertyAmt}/month</strong>
                                 </div>
                              ) : (
                                 <span className="text-muted">Property details loading...</span>
                              )}
                           </TableCell>
                           <TableCell align="center">{booking.userName}</TableCell>
                           <TableCell align="center">{booking.phone}</TableCell>
                           <TableCell align="center">
                              {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
                           </TableCell>
                           <TableCell align="center">
                              {getStatusBadge(booking.bookingStatus)}
                           </TableCell>
                           <TableCell align="center">
                              {propertyDetails[booking.propertyId] && (
                                 <Link to={`/property/${booking.propertyId}`}>
                                    <Button variant="outline-primary" size="sm">
                                       View Property
                                    </Button>
                                 </Link>
                              )}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </TableContainer>
         )}
      </div>
   );
};

export default AllProperty;

