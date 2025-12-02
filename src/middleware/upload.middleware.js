import multer from "multer";
import path from "path";

// Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // asegúrate de que exista la carpeta uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

export default upload;
