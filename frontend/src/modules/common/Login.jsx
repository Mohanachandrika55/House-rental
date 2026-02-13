import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import { Container, Nav } from 'react-bootstrap';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { message } from 'antd';
import { motion } from "framer-motion";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      return alert("Please fill all fields");
    }

    axios.post('http://localhost:8001/api/user/login', data)
      .then((res) => {
        if (res.data.success) {
          message.success(res.data.message);

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          const user = res.data.user;

          switch (user.type) {
            case "Admin":
              navigate("/adminhome");
              break;
            case "Renter":
              navigate("/renterhome");
              break;
            case "Owner":
              if (user.granted === 'ungranted') {
                message.error('Account not confirmed by admin');
              } else {
                navigate("/ownerhome");
              }
              break;
            default:
              navigate("/login");
          }
        } else {
          message.error(res.data.message);
        }
      })
      .catch(() => alert("Login failed"));
  };

  return (
    <div className="login-page">

      <Navbar expand="lg" className="nav-modern">
        <Container fluid>
          <Navbar.Brand>
            <h2>RentEase</h2>
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse>
            <Nav>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container
        component="main"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card"
        >
          <Box display="flex" flexDirection="column" alignItems="center">

            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5" mt={2}>
              Sign In
            </Typography>

            <Box component="form" onSubmit={handleSubmit} mt={2}>

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={data.email}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                margin="normal"
              />

              <Box mt={2} textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  className="modern-btn"
                  style={{ width: "200px" }}
                >
                  Sign In
                </Button>
              </Box>

              <Grid container mt={2}>
                <Grid item xs={12}>
                  forgot password?
                  <Link style={{ color: "red" }} to="/forgotpassword">
                    {" Click here"}
                  </Link>
                </Grid>

                <Grid item xs={12}>
                  Have an account?
                  <Link style={{ color: "blue" }} to="/register">
                    {" Sign Up"}
                  </Link>
                </Grid>
              </Grid>

            </Box>
          </Box>
        </motion.div>
      </Container>

    </div>
  );
};

export default Login;
