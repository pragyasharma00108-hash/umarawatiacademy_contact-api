const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// POST API Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, contactNo, message, emailId } = req.body;

    // Validate required fields
    if (!name || !contactNo || !message || !emailId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create data object
    const contactData = {
      name,
      contactNo,
      message,
      emailId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    const docRef = await db.collection('contacts').add(contactData);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Contact saved successfully',
      id: docRef.id,
      data: contactData
    });

  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving contact',
      error: error.message
    });
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Contact API is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});