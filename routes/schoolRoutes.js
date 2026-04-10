const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /addSchool
router.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate that all fields are present and non-empty
  if (
    name === undefined || name === null || String(name).trim() === '' ||
    address === undefined || address === null || String(address).trim() === '' ||
    latitude === undefined || latitude === null ||
    longitude === undefined || longitude === null
  ) {
    return res.status(400).json({ error: 'All fields (name, address, latitude, longitude) are required and must be non-empty.' });
  }

  // Validate data types
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Latitude and longitude must be valid numbers.' });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
  }

  if (lon < -180 || lon > 180) {
    return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [String(name).trim(), String(address).trim(), lat, lon]
    );

    res.status(201).json({
      message: 'School added successfully.',
      schoolId: result.insertId,
    });
  } catch (err) {
    console.error('Error adding school:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /listSchools?latitude=xx&longitude=yy
router.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and longitude query parameters are required.' });
  }

  const userLat = Number(latitude);
  const userLon = Number(longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Latitude and longitude must be valid numbers.' });
  }

  try {
    const [schools] = await pool.query('SELECT * FROM schools');

    // Calculate distance using Haversine formula and sort
    const toRad = (deg) => (deg * Math.PI) / 180;

    const schoolsWithDistance = schools.map((school) => {
      const dLat = toRad(school.latitude - userLat);
      const dLon = toRad(school.longitude - userLon);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(userLat)) *
          Math.cos(toRad(school.latitude)) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c; // Earth's radius in km

      return { ...school, distance: parseFloat(distance.toFixed(2)) };
    });

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(schoolsWithDistance);
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// TEMP: delete all schools
router.delete('/clearSchools', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE schools');
    res.json({ message: 'All schools deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
