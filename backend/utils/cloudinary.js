const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cost-store/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

const storageGuias = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cost-store/guias',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, quality: 'auto' }],
  },
});

const uploadProducto = multer({ storage });
const uploadGuia = multer({ storage: storageGuias });

module.exports = { cloudinary, uploadProducto, uploadGuia };
