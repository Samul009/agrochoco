-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-11-2025 a las 02:42:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `agrochoco`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `fecha_creacion`) VALUES
(1, 'Frutas', 'Frutas frescas y de temporada', '2025-11-15 01:00:10'),
(2, 'Verduras', 'Verduras y hortalizas', '2025-11-15 01:00:10'),
(3, 'Tubérculos', 'Tubérculos como papa, yuca, ñame', '2025-11-15 01:00:10'),
(4, 'Cereales', 'Cereales como maíz, arroz, trigo', '2025-11-15 01:00:10'),
(5, 'Legumbres', 'Legumbres como fríjol, lenteja, garbanzo', '2025-11-15 01:00:10'),
(6, 'Lácteos', 'Productos lácteos y derivados', '2025-11-15 01:00:10'),
(7, 'Cárnicos', 'Carnes y productos cárnicos', '2025-11-15 01:00:10'),
(8, 'Otros', 'Otros productos agrícolas', '2025-11-15 01:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedades`
--

CREATE TABLE `novedades` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `imagen` varchar(500) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `novedades`
--

INSERT INTO `novedades` (`id`, `titulo`, `descripcion`, `imagen`, `usuario_id`, `fecha_creacion`) VALUES
(1, 'Nueva temporada de cacao', 'Inicia la nueva temporada de cosecha de cacao premium en la región del Chocó', NULL, 1, '2025-11-04 19:40:20'),
(2, 'Precios actualizados', 'Se han actualizado los precios de todos los productos según el mercado actual', NULL, 4, '2025-11-04 19:40:20'),
(3, 'Capacitación para productores', 'Próxima capacitación sobre técnicas de cultivo sostenible el 15 de diciembre', NULL, 4, '2025-11-04 19:40:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `novedad_lecturas`
--

CREATE TABLE `novedad_lecturas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `novedad_id` int(11) NOT NULL,
  `fecha_lectura` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productores_productos`
--

CREATE TABLE `productores_productos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `area_cultivada` decimal(10,2) DEFAULT NULL,
  `produccion_actual` decimal(10,2) DEFAULT NULL,
  `fecha_inicio_produccion` date DEFAULT NULL,
  `estado_produccion` enum('Activo','Inactivo','Pausado') DEFAULT 'Activo',
  `notas` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productores_productos`
--

INSERT INTO `productores_productos` (`id`, `usuario_id`, `producto_id`, `area_cultivada`, `produccion_actual`, `fecha_inicio_produccion`, `estado_produccion`, `notas`, `fecha_registro`) VALUES
(1, 2, 1, 5.50, 2.30, NULL, 'Activo', NULL, '2025-11-04 19:40:20'),
(2, 2, 2, 3.00, 8.50, NULL, 'Activo', NULL, '2025-11-04 19:40:20'),
(3, 5, 1, 4.00, 2.00, '0000-00-00', 'Activo', NULL, '2025-11-15 01:21:14');

--
-- Disparadores `productores_productos`
--
DELIMITER $$
CREATE TRIGGER `actualizar_rol_productor` AFTER INSERT ON `productores_productos` FOR EACH ROW BEGIN
  DECLARE productor_rol_id INT;
  
  -- Obtener el ID del rol 'Productor'
  SELECT id INTO productor_rol_id FROM roles WHERE nombre = 'Productor' LIMIT 1;
  
  -- Solo actualizar si el estado es 'Activo' y el usuario no tiene un rol especial
  IF NEW.estado_produccion = 'Activo' AND productor_rol_id IS NOT NULL THEN
    UPDATE `usuarios` 
    SET `rol_id` = productor_rol_id
    WHERE `id` = NEW.usuario_id 
      AND `rol_id` IS NULL;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Disponible',
  `ubicacion_cosecha` text DEFAULT NULL,
  `temporada_cosecha` varchar(100) DEFAULT NULL,
  `metodo_cosecha` text DEFAULT NULL,
  `produccion_toneladas` varchar(50) DEFAULT NULL,
  `precio_libra` decimal(10,2) DEFAULT 0.00,
  `precio_bulto` decimal(10,2) DEFAULT 0.00,
  `precio_camion` decimal(10,2) DEFAULT 0.00,
  `nuevo` tinyint(1) DEFAULT 0,
  `disponible` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `categoria_id`, `descripcion`, `imagen`, `estado`, `ubicacion_cosecha`, `temporada_cosecha`, `metodo_cosecha`, `produccion_toneladas`, `precio_libra`, `precio_bulto`, `precio_camion`, `nuevo`, `disponible`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Cacao Premium', 1, 'Cacao de alta calidad cultivado en las montañas de Chocó', '🍫', 'Disponible', NULL, NULL, NULL, NULL, 2500.00, 125000.00, 2500000.00, 1, 1, '2025-11-04 19:40:20', '2025-11-15 01:00:10'),
(2, 'Plátano Verde', 1, 'Plátano verde fresco para exportación', '🍌', 'Disponible', NULL, NULL, NULL, NULL, 800.00, 40000.00, 800000.00, 0, 1, '2025-11-04 19:40:20', '2025-11-15 01:00:10'),
(3, 'Yuca Blanca', 3, 'Yuca blanca de excelente calidad', '🥔', 'Disponible', NULL, NULL, NULL, NULL, 1200.00, 60000.00, 1200000.00, 0, 1, '2025-11-04 19:40:20', '2025-11-15 01:00:10'),
(4, 'Maíz Amarillo', 4, 'Maíz amarillo para consumo y procesamiento', '🌽', 'Disponible', NULL, NULL, NULL, NULL, 1800.00, 90000.00, 1800000.00, 1, 1, '2025-11-04 19:40:20', '2025-11-15 01:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_vistas`
--

CREATE TABLE `producto_vistas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `fecha_vista` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `fecha_creacion`) VALUES
(1, 'Administrador', 'Usuario con acceso completo al sistema. Puede gestionar usuarios, productos, novedades y ver métricas.', '2025-11-15 01:00:10'),
(2, 'Encargado de Novedades', 'Usuario encargado de crear y administrar novedades del sistema.', '2025-11-15 01:00:10'),
(3, 'Productor', 'Usuario que produce productos agrícolas y puede agregar productos al sistema.', '2025-11-15 01:00:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `rol_id` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `clave`, `telefono`, `direccion`, `rol_id`, `fecha_registro`) VALUES
(1, 'Administrador', 'admin@agrochoco.com', '$2b$10$MBiMx2SV6bon7HIsAfg2Ueq/SCPp5gliU1mrCpFDTJGhMNyvlNr4a', NULL, NULL, 1, '2025-11-04 19:40:19'),
(2, 'Juan Pérez', 'juan@email.com', '$2b$10$guX.m2BkCrLhynh3Q13Vs.h1.ssHwaJ42klSwWLI.XgMnAhEDq73e', NULL, NULL, 3, '2025-11-04 19:40:19'),
(3, 'María García', 'maria@email.com', '$2b$10$guX.m2BkCrLhynh3Q13Vs.h1.ssHwaJ42klSwWLI.XgMnAhEDq73e', NULL, NULL, NULL, '2025-11-04 19:40:19'),
(4, 'Carlos Editor', 'carlos@email.com', '$2b$10$guX.m2BkCrLhynh3Q13Vs.h1.ssHwaJ42klSwWLI.XgMnAhEDq73e', NULL, NULL, 2, '2025-11-04 19:40:19'),
(5, 'sa', 'sa@gmail.com', '$2b$10$9.3Rrq3OvKG956Y1nqikYepmwaJLeueCHAm.HRpD3jcOBuaRJPt2C', '12', 'sa', 3, '2025-11-15 01:12:33');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_novedades_usuario` (`usuario_id`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

--
-- Indices de la tabla `novedad_lecturas`
--
ALTER TABLE `novedad_lecturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_novedad` (`novedad_id`),
  ADD KEY `idx_fecha` (`fecha_lectura`);

--
-- Indices de la tabla `productores_productos`
--
ALTER TABLE `productores_productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario_producto` (`usuario_id`,`producto_id`),
  ADD KEY `fk_pp_usuario` (`usuario_id`),
  ADD KEY `fk_pp_producto` (`producto_id`),
  ADD KEY `idx_estado_produccion` (`estado_produccion`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria_id` (`categoria_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `producto_vistas`
--
ALTER TABLE `producto_vistas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_producto` (`producto_id`),
  ADD KEY `idx_fecha` (`fecha_vista`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_rol_id` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `novedades`
--
ALTER TABLE `novedades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `novedad_lecturas`
--
ALTER TABLE `novedad_lecturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productores_productos`
--
ALTER TABLE `productores_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `producto_vistas`
--
ALTER TABLE `producto_vistas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `novedades`
--
ALTER TABLE `novedades`
  ADD CONSTRAINT `fk_novedades_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `novedad_lecturas`
--
ALTER TABLE `novedad_lecturas`
  ADD CONSTRAINT `novedad_lecturas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `novedad_lecturas_ibfk_2` FOREIGN KEY (`novedad_id`) REFERENCES `novedades` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productores_productos`
--
ALTER TABLE `productores_productos`
  ADD CONSTRAINT `fk_pp_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pp_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `producto_vistas`
--
ALTER TABLE `producto_vistas`
  ADD CONSTRAINT `producto_vistas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_vistas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
