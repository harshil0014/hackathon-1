const multer = require('multer');
const path = require('path');
const fs = require('fs');

// base upload directory
const UPLOAD_BASE = path.join(__dirname, '..', '..', 'uploads', 'claims');

// ensure base directory exists
if (!fs.existsSync(UPLOAD_BASE)) {
  fs.mkdirSync(UPLOAD_BASE, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // temporary folder; claimId not known yet
    cb(null, UPLOAD_BASE);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error('Only PDF and image files are allowed'),
      false
    );
  } else {
    cb(null, true);
  }
};

const uploadProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = uploadProof;
