import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trackify-attachments',
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage: storage });

export default upload;
