import path from "path";
import fs from "fs";
import multer from "multer";
import ProductoImagen from "../services/productoImagen.service";

// ================= CONFIG MULTER =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(path.resolve(), "uploads");
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Solo se permiten archivos de imagen"));
    cb(null, true);
  },
});

// ================= LISTAR =================
export const listar = async (req, res, next) => {
  try {
    const { productoId } = req.params;
    const imagenes = await ProductoImagen.findAll({
      where: { producto_id: productoId },
    });

    // Construir URL completa
    const host = `${req.protocol}://${req.get("host")}`;
    const imagenesConUrl = imagenes.map((img) => ({
      id: img.id,
      url: `${host}/uploads/${img.url}`, // <-- aquí agregamos host y uploads
      descripcion: img.descripcion,
    }));

    res.json({ success: true, data: imagenesConUrl });
  } catch (error) {
    next(error);
  }
};

// ================= OBTENER =================
export const obtener = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imagen = await ProductoImagen.findByPk(id);
    if (!imagen)
      return res
        .status(404)
        .json({ success: false, message: "Imagen no encontrada" });

    const host = `${req.protocol}://${req.get("host")}`;
    imagen.url = `${host}/uploads/${imagen.url}`;

    res.json({ success: true, data: imagen });
  } catch (error) {
    next(error);
  }
};

// ================= CREAR =================
export const crear = async (req, res, next) => {
  try {
    const { productoId } = req.params;
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Archivo no encontrado" });

    const url = req.file.filename; // solo nombre
    const descripcion = req.body.descripcion || "";

    const nuevaImagen = await ProductoImagen.create({
      producto_id: productoId,
      url,
      descripcion,
    });

    const host = `${req.protocol}://${req.get("host")}`;
    nuevaImagen.url = `${host}/uploads/${nuevaImagen.url}`;

    res.status(201).json({ success: true, data: nuevaImagen });
  } catch (error) {
    next(error);
  }
};

// ================= ACTUALIZAR =================
export const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imagen = await ProductoImagen.findByPk(id);
    if (!imagen)
      return res
        .status(404)
        .json({ success: false, message: "Imagen no encontrada" });

    if (req.file) {
      const oldPath = path.join(path.resolve(), "uploads", imagen.url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      imagen.url = req.file.filename; // solo nombre
    }

    if (req.body.descripcion !== undefined)
      imagen.descripcion = req.body.descripcion;
    await imagen.save();

    const host = `${req.protocol}://${req.get("host")}`;
    imagen.url = `${host}/uploads/${imagen.url}`;

    res.json({ success: true, data: imagen });
  } catch (error) {
    next(error);
  }
};

// ================= ELIMINAR =================
export const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imagen = await ProductoImagen.findByPk(id);
    if (!imagen)
      return res
        .status(404)
        .json({ success: false, message: "Imagen no encontrada" });

    const filePath = path.join(path.resolve(), "uploads", imagen.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await imagen.destroy();
    res.json({ success: true, message: "Imagen eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
