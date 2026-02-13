import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Box, Typography, Slider, Grid } from '@mui/material';
import axios from 'axios';

const PropertySearch = ({ onSearch, onFilter }) => {
  const [searchData, setSearchData] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 10000,
    propertyType: '',
    bedrooms: ''
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'room', label: 'Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'villa', label: 'Villa' }
  ];

  const bedroomOptions = [
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4+ Bedrooms' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (event, newValue) => {
    setSearchData(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };

  const handleSearch = () => {
    // Build query params
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.minPrice > 0) params.append('minPrice', searchData.minPrice);
    if (searchData.maxPrice < 10000) params.append('maxPrice', searchData.maxPrice);
    if (searchData.propertyType) params.append('propertyType', searchData.propertyType);
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms);

    onSearch(params.toString());
  };

  const handleReset = () => {
    setSearchData({
      location: '',
      minPrice: 0,
      maxPrice: 10000,
      propertyType: '',
      bedrooms: ''
    });
    onSearch('');
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Properties
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={searchData.location}
            onChange={handleInputChange}
            placeholder="Enter city, area, or address"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Property Type"
            name="propertyType"
            value={searchData.propertyType}
            onChange={handleInputChange}
          >
            <MenuItem value="">All Types</MenuItem>
            {propertyTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Bedrooms"
            name="bedrooms"
            value={searchData.bedrooms}
            onChange={handleInputChange}
          >
            <MenuItem value="">Any</MenuItem>
            {bedroomOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Price Range: ${searchData.minPrice} - ${searchData.maxPrice}
          </Typography>
          <Slider
            value={[searchData.minPrice, searchData.maxPrice]}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            step={100}
            marks={[
              { value: 0, label: '$0' },
              { value: 2500, label: '$2500' },
              { value: 5000, label: '$5000' },
              { value: 7500, label: '$7500' },
              { value: 10000, label: '$10000+' }
            ]}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              Search
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleReset}
              sx={{ minWidth: 120 }}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertySearch;
