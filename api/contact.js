const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Serverless function handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST'
    });
  }

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
    return res.status(201).json({
      success: true,
      message: 'Contact saved successfully',
      id: docRef.id,
      data: contactData
    });

  } catch (error) {
    console.error('Error saving contact:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving contact',
      error: error.message
    });
  }
};