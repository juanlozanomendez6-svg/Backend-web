import ProductoImagen from "../models/productoImagen.model";

class ProductoImagenService {
  async getImagenesByProducto(productoId) {
    return await ProductoImagen.findAll({ where: { producto_id: productoId } });
  }

  async getImagen(id) {
    return await ProductoImagen.findByPk(id);
  }

  async createImagen(productoId, data) {
    return await ProductoImagen.create({ ...data, producto_id: productoId });
  }

  async updateImagen(id, data) {
    const imagen = await ProductoImagen.findByPk(id);
    if (!imagen) return null;
    return await imagen.update(data);
  }

  async deleteImagen(id) {
    const imagen = await ProductoImagen.findByPk(id);
    if (!imagen) return null;
    await imagen.destroy();
    return true;
  }
}

export default new ProductoImagenService();
