-- Base de datos AgroChoco - Versión compatible con MySQL 5.7+
-- Ejecutar paso a paso en phpMyAdmin

-- PASO 1: Crear la base de datos
CREATE DATABASE IF NOT EXISTS agrochoco;
USE agrochoco;

-- PASO 2: Crear tabla usuarios
CREATE TABLE usuarios (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  clave varchar(255) NOT NULL,
  telefono varchar(20) DEFAULT NULL,
  direccion text DEFAULT NULL,
  rol enum('admin','usuario','productor') DEFAULT 'usuario',
  fecha_registro timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- PASO 3: Crear tabla productos
CREATE TABLE productos (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  categoria varchar(50) NOT NULL,
  descripcion text DEFAULT NULL,
  imagen varchar(255) DEFAULT '🌾',
  estado varchar(20) DEFAULT 'Disponible',
  ubicacion_cosecha varchar(100) DEFAULT NULL,
  temporada_cosecha varchar(50) DEFAULT NULL,
  metodo_cosecha varchar(100) DEFAULT NULL,
  produccion_toneladas decimal(10,2) DEFAULT NULL,
  precio_libra decimal(10,2) DEFAULT 0.00,
  precio_bulto decimal(10,2) DEFAULT 0.00,
  precio_camion decimal(10,2) DEFAULT 0.00,
  nuevo boolean DEFAULT false,
  disponible boolean DEFAULT true,
  fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- PASO 4: Crear tabla novedades
CREATE TABLE novedades (
  id int(11) NOT NULL AUTO_INCREMENT,
  titulo varchar(200) NOT NULL,
  descripcion text NOT NULL,
  imagen varchar(255) DEFAULT NULL,
  usuario_id int(11) DEFAULT NULL,
  fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_novedades_usuario (usuario_id),
  CONSTRAINT fk_novedades_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
);

-- PASO 5: Crear tabla productores_productos
CREATE TABLE productores_productos (
  id int(11) NOT NULL AUTO_INCREMENT,
  usuario_id int(11) NOT NULL,
  producto_id int(11) NOT NULL,
  area_cultivada decimal(10,2) DEFAULT NULL,
  produccion_actual decimal(10,2) DEFAULT NULL,
  fecha_inicio_produccion date DEFAULT NULL,
  estado_produccion enum('Activo','Inactivo','Pausado') DEFAULT 'Activo',
  notas text DEFAULT NULL,
  fecha_registro timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_usuario_producto (usuario_id, producto_id),
  KEY fk_pp_usuario (usuario_id),
  KEY fk_pp_producto (producto_id),
  CONSTRAINT fk_pp_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_pp_producto FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE
);

-- PASO 6: Insertar datos de ejemplo - Usuarios
INSERT INTO usuarios (nombre, email, clave, rol) VALUES
('Administrador', 'admin@agrochoco.com', 'admin123', 'admin'),
('Juan Pérez', 'juan@email.com', '123456', 'productor'),
('María García', 'maria@email.com', '123456', 'usuario');

-- PASO 7: Insertar datos de ejemplo - Productos
INSERT INTO productos (nombre, categoria, descripcion, imagen, precio_libra, precio_bulto, precio_camion, nuevo, disponible) VALUES
('Cacao Premium', 'Cacao', 'Cacao de alta calidad cultivado en las montañas de Chocó', '🍫', 2500.00, 125000.00, 2500000.00, true, true),
('Plátano Verde', 'Plátano', 'Plátano verde fresco para exportación', '🍌', 800.00, 40000.00, 800000.00, false, true),
('Yuca Blanca', 'Tubérculos', 'Yuca blanca de excelente calidad', '🥔', 1200.00, 60000.00, 1200000.00, false, true),
('Maíz Amarillo', 'Cereales', 'Maíz amarillo para consumo y procesamiento', '🌽', 1800.00, 90000.00, 1800000.00, true, true);

-- PASO 8: Insertar datos de ejemplo - Novedades
INSERT INTO novedades (titulo, descripcion, usuario_id) VALUES
('Nueva temporada de cacao', 'Inicia la nueva temporada de cosecha de cacao premium en la región del Chocó', 1),
('Precios actualizados', 'Se han actualizado los precios de todos los productos según el mercado actual', 1),
('Capacitación para productores', 'Próxima capacitación sobre técnicas de cultivo sostenible el 15 de diciembre', 1);

-- PASO 9: Insertar datos de ejemplo - Relaciones productor-producto
INSERT INTO productores_productos (usuario_id, producto_id, area_cultivada, produccion_actual) VALUES
(2, 1, 5.5, 2.3),
(2, 2, 3.0, 8.5);