// scripts/seed.js
import { sequelize } from '../src/config/db.js';
import Rol from '../src/models/rol.model.js';
import Usuario from '../src/models/usuario.model.js';
import Categoria from '../src/models/categoria.model.js';
import Producto from '../src/models/producto.model.js';
import logger from '../src/config/logger.js';
import { hashPassword } from '../src/utils/helpers.js';

const seedDatabase = async () => {
  try {
    // 🔹 Roles
    const rolesData = [
      { nombre: 'admin', descripcion: 'Administrador del sistema con acceso completo' },
      { nombre: 'cajero', descripcion: 'Cajero con permisos para realizar ventas' },
      { nombre: 'supervisor', descripcion: 'Supervisor con permisos de gestión y reportes' }
    ];

    for (const rol of rolesData) {
      await Rol.findOrCreate({ where: { nombre: rol.nombre }, defaults: rol });
    }

    // 🔹 Usuario admin
    const password = 'admin123';
    const password_hash = await hashPassword(password);
    const adminRol = await Rol.findOne({ where: { nombre: 'admin' } });

    await Usuario.findOrCreate({
      where: { email: 'admin@pos.com' },
      defaults: {
        nombre: 'Administrador',
        email: 'admin@pos.com',
        password_hash,
        rol_id: adminRol.id,
        activo: true
      }
    });

    // 🔹 Categorías
    const categoriasData = [
      { nombre: 'Electrónicos', descripcion: 'Dispositivos electrónicos y tecnología' },
      { nombre: 'Ropa', descripcion: 'Prendas de vestir para hombre, mujer y niños' },
      { nombre: 'Hogar', descripcion: 'Artículos para el hogar y decoración' },
      { nombre: 'Deportes', descripcion: 'Equipos y artículos deportivos' },
      { nombre: 'Juguetes', descripcion: 'Juguetes y juegos para todas las edades' },
      { nombre: 'Libros', descripcion: 'Libros y material de lectura' }
    ];

    for (const cat of categoriasData) {
      await Categoria.findOrCreate({ where: { nombre: cat.nombre }, defaults: cat });
    }

    // 🔹 Productos
    const productosData = [
      { nombre: 'Laptop HP Pavilion', descripcion: 'Laptop HP Pavilion 15.6" Intel Core i5, 8GB RAM, 512GB SSD', precio: 15999.99, stock: 15, categoria_id: 1 },
      { nombre: 'Smartphone Samsung Galaxy', descripcion: 'Smartphone Samsung Galaxy S23 128GB, 5G, Cámara 50MP', precio: 8999.50, stock: 25, categoria_id: 1 },
      { nombre: 'Camiseta Nike Dri-FIT', descripcion: 'Camiseta deportiva Nike tecnología Dri-FIT, talla M', precio: 599.99, stock: 50, categoria_id: 2 },
      { nombre: 'Silla Gamer RGB', descripcion: 'Silla gamer ergonómica con iluminación RGB ajustable', precio: 4599.00, stock: 8, categoria_id: 3 },
      { nombre: 'Pelota de Fútbol', descripcion: 'Pelota de fútbol profesional tamaño 5, material PVC', precio: 299.99, stock: 30, categoria_id: 4 },
      { nombre: 'Tablet Amazon Fire', descripcion: 'Tablet Amazon Fire HD 10, 32GB, pantalla 10.1"', precio: 2499.00, stock: 20, categoria_id: 1 },
      { nombre: 'Zapatos Running', descripcion: 'Zapatos para running, talla 28, color negro/rojo', precio: 1299.00, stock: 35, categoria_id: 2 },
      { nombre: 'Juego de Sala', descripcion: 'Juego de sala moderno, 3 plazas, color gris', precio: 12500.00, stock: 5, categoria_id: 3 },
      { nombre: 'Raqueta Tenis', descripcion: 'Raqueta de tenis profesional, grip G4, 275g', precio: 1899.00, stock: 12, categoria_id: 4 },
      { nombre: 'Libro Programación', descripcion: 'Libro "JavaScript Moderno", 450 páginas, edición 2024', precio: 450.00, stock: 40, categoria_id: 6 }
    ];

    for (const prod of productosData) {
      await Producto.findOrCreate({ where: { nombre: prod.nombre }, defaults: prod });
    }

    logger.info('✅ Seed ejecutado correctamente');
  } catch (error) {
    logger.error('❌ Error ejecutando seed:', error);
  }
};

export default seedDatabase;
