import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import { Container, Nav } from "react-bootstrap";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import axios from "axios";
import { message } from "antd";
import "../common/register.css";

const Register = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password || !data.type)
      return alert("Please fill all fields");

    axios
      .post("http://localhost:8001/api/user/register", data)
      .then((res) => {
        if (res.data.success) {
          message.success(res.data.message);
          navigate("/login");
        } else {
          message.error(res.data.message);
        }
      })
      .catch(() => alert("Registration failed"));
  };

  return (
    <div className="register-page">
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
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="register-card">
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5" mt={2}>
              Sign Up
            </Typography>

            <Box component="form" onSubmit={handleSubmit} mt={2}>
              <TextField
                fullWidth
                label="Renter / Owner Name"
                name="name"
                value={data.name}
                onChange={handleChange}
                margin="normal"
              />

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

              <InputLabel>User Type</InputLabel>
              <Select
                fullWidth
                name="type"
                value={data.type}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="Renter">Renter</MenuItem>
                <MenuItem value="Owner">Owner</MenuItem>
              </Select>

              <Box mt={2} textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  className="modern-btn"
                  style={{ width: "200px" }}
                >
                  Sign Up
                </Button>
              </Box>

              <Grid container mt={2}>
                <Grid item>
                  Have an account?
                  <Link to="/login"> Sign In</Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </div>
      </Container>
    </div>
  );
};

export default Register;
