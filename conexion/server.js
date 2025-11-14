// server.js
// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ==================== CONFIGURACIÓN - LLAVE MAESTRA ====================
// ⚠️ IMPORTANTE: Cambia esta llave maestra por una más segura en producción
// Puedes usar: process.env.MASTER_KEY || 'tu-llave-secreta-aqui'
const MASTER_KEY = process.env.MASTER_KEY || 'AGROCHOCO_2024_MASTER_KEY_SECRET';
// ========================================================================

// ==================== CONFIGURACIÓN - JWT ====================
// ⚠️ IMPORTANTE: Esta clave secreta debe ser segura y única
// Para generar una nueva clave secreta segura, ejecuta:
// node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(64).toString('base64url'));"
const JWT_SECRET = process.env.JWT_SECRET || 'oZl2AafeMwghHKrILR4BImeFoJKYxW8CUKmcH2jbsTwDk22c_9mcV2JlptxkqNM3fTzfV8s_zwcRYXu-ohb4pg';
const ALGORITMO = process.env.JWT_ALGORITMO || 'HS256'; // Algoritmo de firma
const MINUTOS_EXPIRACION_TOKEN = process.env.JWT_EXPIRES_MINUTES || 60; // 600000 minutos (~416 días)
const JWT_EXPIRES_IN = `${MINUTOS_EXPIRACION_TOKEN}m`; // Convertir minutos a formato de expiración
// =============================================================

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
// Middleware para verificar el token JWT en las peticiones protegidas
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Token de acceso requerido" });
  }

  jwt.verify(token, JWT_SECRET, { algorithms: [ALGORITMO] }, (err, user) => {
    if (err) {
      console.log('❌ Token inválido:', err.message);
      return res.status(403).json({ message: "Token inválido o expirado" });
    }
    
    req.user = user; // Agregar información del usuario al request
    next();
  });
};
// =====================================================================

// Conexión a la base de datos con pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", 
  database: "agrochoco",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error de conexión:", err);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
});

// ==================== AUTENTICACIÓN ====================

// Inicio de sesión
app.post("/login", (req, res) => {
  const { email, clave } = req.body;
  
  console.log('🔑 Intento de login:', email);
  
  if (!email || !clave) {
    return res.status(400).json({ message: "Email y clave son requeridos" });
  }

  // Primero obtener el usuario con su contraseña hasheada
  const query = "SELECT id, nombre, email, rol, telefono, direccion, clave FROM usuarios WHERE email = ?";
  
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('❌ Error en login:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    if (result.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    
    const usuario = result[0];
    const hashedPassword = usuario.clave;
    
    // Comparar la contraseña ingresada con el hash almacenado
    bcrypt.compare(clave, hashedPassword, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('❌ Error comparando contraseñas:', compareErr);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      
      if (!isMatch) {
        console.log('❌ Contraseña incorrecta para:', email);
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      
      // Login exitoso - generar token JWT
      const { clave, ...usuarioSinClave } = usuario;
      
      // Crear payload del token
      const tokenPayload = {
        uid: usuario.id,
        sub: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      };
      
      // Generar token JWT con algoritmo HS256
      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        algorithm: ALGORITMO,
        expiresIn: JWT_EXPIRES_IN
      });
      
      console.log('✅ Login exitoso:', usuario.nombre);
      console.log('🔑 Token JWT generado');
      
      // Devolver usuario y token
      res.json({
        ...usuarioSinClave,
        token: token
      });
    });
  });
});

// Registrar usuario
app.post("/register", (req, res) => {
  const { nombre, email, clave, telefono, direccion, rol, masterKey } = req.body;
  
  console.log('📝 Intento de registro:', email);
  
  if (!nombre || !email || !clave) {
    return res.status(400).json({ message: "Nombre, email y clave son requeridos" });
  }

  // Verificar si el email ya existe
  db.query("SELECT id FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error('❌ Error verificando email:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    if (result.length > 0) {
      console.log('⚠️ Email ya registrado:', email);
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Insertar nuevo usuario
    // Validar llave maestra si se intenta crear un administrador
    let rolNormalizado = 'Usuario'; // Por defecto es Usuario
    
    if (rol && rol.toLowerCase() === 'administrador') {
      // Verificar si se proporcionó la llave maestra correcta
      if (!masterKey || masterKey !== MASTER_KEY) {
        console.log('⚠️ Intento de crear administrador sin llave maestra válida');
        return res.status(403).json({ 
          message: "Se requiere llave maestra para crear un administrador" 
        });
      }
      rolNormalizado = 'Administrador';
      console.log('🔑 Llave maestra válida - Creando administrador');
    }
    
    // Hashear la contraseña antes de guardarla (10 rounds es un buen balance entre seguridad y rendimiento)
    bcrypt.hash(clave, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('❌ Error hasheando contraseña:', hashErr);
        return res.status(500).json({ message: "Error al procesar la contraseña" });
      }
      
      const query = "INSERT INTO usuarios (nombre, email, clave, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(query, [nombre, email, hashedPassword, telefono || null, direccion || null, rolNormalizado], (err, result) => {
        if (err) {
          console.error('❌ Error al crear usuario:', err);
          console.error('❌ Detalles del error:', err.code, err.sqlMessage);
          return res.status(500).json({ 
            message: "Error al crear usuario",
            error: err.sqlMessage || err.message 
          });
        }
        
        console.log('✅ Usuario creado:', nombre);
        
        // Generar token JWT para el nuevo usuario
        const tokenPayload = {
          uid: result.insertId,
          sub: email,
          nombre: nombre,
          rol: rolNormalizado
        };
        
        const token = jwt.sign(tokenPayload, JWT_SECRET, {
          expiresIn: JWT_EXPIRES_IN
        });
        
        console.log('🔑 Token JWT generado para nuevo usuario');
        
        res.status(201).json({
          id: result.insertId,
          nombre,
          email,
          rol: rolNormalizado,
          token: token
        });
      });
    });
  });
});

// ==================== USUARIOS ====================

// Endpoint de ejemplo: Obtener información del usuario autenticado
app.get("/me", authenticateToken, (req, res) => {
  console.log('👤 Usuario autenticado solicitando su información');
  res.json({
    message: "Información del usuario autenticado",
    usuario: req.user
  });
});

// Obtener todos los usuarios
app.get("/usuarios", (req, res) => {
  console.log('📋 Obteniendo lista de usuarios');
  
  db.query("SELECT id, nombre, email, telefono, direccion, rol FROM usuarios", (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo usuarios:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    console.log(`✅ ${results.length} usuarios encontrados`);
    res.json(results);
  });
});

// Obtener usuario por ID
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  
  console.log('👤 Obteniendo usuario con ID:', id);

  db.query(
    "SELECT id, nombre, email, telefono, direccion, rol FROM usuarios WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error('❌ Error obteniendo usuario:', err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (result.length === 0) {
        console.log('⚠️ Usuario no encontrado:', id);
        return res.status(404).json({ message: "Usuario no encontrado" });
      } 

      console.log('✅ Usuario encontrado:', result[0].nombre);
      res.json(result[0]);
    }
  );
});

// Actualizar usuario
app.put("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccion } = req.body;
  
  console.log('✏️ Actualizando usuario:', id);

  const query = "UPDATE usuarios SET nombre=?, email=?, telefono=?, direccion=? WHERE id=?";
  
  db.query(query, [nombre, email, telefono || null, direccion || null, id], (err, result) => {
    if (err) {
      console.error('❌ Error actualizando usuario:', err);
      return res.status(500).json({ message: "Error al actualizar usuario" });
    }
    
    if (result.affectedRows === 0) {
      console.log('⚠️ Usuario no encontrado para actualizar:', id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    console.log('✅ Usuario actualizado:', id);
    res.json({ 
      message: "Usuario actualizado correctamente",
      id,
      nombre,
      email,
      telefono,
      direccion
    });
  });
});

// ==================== NOVEDADES ====================

// Obtener todas las novedades
app.get("/novedades", (req, res) => {
  console.log('📰 Obteniendo novedades');
  
  const query = `
    SELECT 
      n.id,
      n.titulo,
      n.descripcion,
      n.imagen,
      n.fecha_creacion,
      n.usuario_id,
      u.nombre as autor_nombre,
      u.email as autor_email
    FROM novedades n
    LEFT JOIN usuarios u ON n.usuario_id = u.id
    ORDER BY n.fecha_creacion DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo novedades:', err);
      console.error('❌ Código de error:', err.code);
      console.error('❌ SQL:', err.sql);
      
      // Respuesta más detallada para debugging
      return res.status(500).json({ 
        message: "Error en el servidor", 
        error: err.message,
        code: err.code,
        sqlMessage: err.sqlMessage
      });
    }
    
    if (results.length === 0) {
      console.log('⚠️ No hay novedades en la base de datos');
      return res.json([]);
    }
    
    console.log(`✅ ${results.length} novedades encontradas`);
    res.json(results);
  });
});

// Obtener novedad por ID
app.get("/novedades/:id", (req, res) => {
  const { id } = req.params;
  
  console.log('📄 Obteniendo novedad:', id);
  
  db.query("SELECT * FROM novedades WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error('❌ Error obteniendo novedad:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    if (result.length === 0) {
      console.log('⚠️ Novedad no encontrada:', id);
      return res.status(404).json({ message: "Novedad no encontrada" });
    }
    
    console.log('✅ Novedad encontrada:', result[0].titulo);
    res.json(result[0]);
  });
});

// Crear novedad (requiere autenticación)
app.post("/novedades", authenticateToken, (req, res) => {
  const { titulo, descripcion, imagen } = req.body;
  
  console.log('➕ Creando novedad:', titulo);
  
  if (!titulo || !descripcion) {
    return res.status(400).json({ message: "Título y descripción son requeridos" });
  }

  const query = "INSERT INTO novedades (titulo, descripcion, imagen) VALUES (?, ?, ?)";
  
  db.query(query, [titulo, descripcion, imagen || null], (err, result) => {
    if (err) {
      console.error('❌ Error creando novedad:', err);
      return res.status(500).json({ message: "Error al crear novedad" });
    }
    
    console.log('✅ Novedad creada con ID:', result.insertId);
    res.status(201).json({
      id: result.insertId,
      titulo,
      descripcion,
      imagen,
      fecha_creacion: new Date()
    });
  });
});

// Actualizar novedad (requiere autenticación)
app.put("/novedades/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, imagen } = req.body;
  
  console.log('✏️ Actualizando novedad:', id);
  
  if (!titulo || !descripcion) {
    return res.status(400).json({ message: "Título y descripción son requeridos" });
  }

  const query = "UPDATE novedades SET titulo=?, descripcion=?, imagen=? WHERE id=?";
  
  db.query(query, [titulo, descripcion, imagen || null, id], (err, result) => {
    if (err) {
      console.error('❌ Error actualizando novedad:', err);
      return res.status(500).json({ message: "Error al actualizar" });
    }
    
    if (result.affectedRows === 0) {
      console.log('⚠️ Novedad no encontrada:', id);
      return res.status(404).json({ message: "Novedad no encontrada" });
    }
    
    console.log('✅ Novedad actualizada:', id);
    res.json({ 
      message: "Actualizado correctamente", 
      id, 
      titulo, 
      descripcion, 
      imagen 
    });
  });
});

// Eliminar novedad con verificación (requiere autenticación)
app.delete("/novedades/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ Solicitud de eliminación para novedad:', id);
  
  // Primero verificar que existe
  db.query("SELECT * FROM novedades WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error('❌ Error verificando novedad:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    if (result.length === 0) {
      console.log('⚠️ Novedad no encontrada:', id);
      return res.status(404).json({ message: "Novedad no encontrada" });
    }
    
    // Si existe, proceder a eliminar
    db.query("DELETE FROM novedades WHERE id=?", [id], (err, deleteResult) => {
      if (err) {
        console.error('❌ Error eliminando novedad:', err);
        return res.status(500).json({ message: "Error al eliminar" });
      }
      
      console.log('✅ Novedad eliminada:', id);
      res.json({ 
        message: "Novedad eliminada correctamente",
        id: id,
        titulo: result[0].titulo
      });
    });
  });
});

// ==================== PRODUCTOS ====================

// Obtener todos los productos
app.get("/productos", (req, res) => {
  console.log('🌾 Obteniendo productos');
  
  const query = `
    SELECT 
      p.*,
      COUNT(DISTINCT pp.usuario_id) as total_productores
    FROM productos p
    LEFT JOIN productores_productos pp ON p.id = pp.producto_id AND pp.estado_produccion = 'Activo'
    GROUP BY p.id
    ORDER BY p.fecha_creacion DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo productos:', err);
      return res.status(500).json({ 
        message: "Error en el servidor", 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('⚠️ No hay productos en la base de datos');
      return res.json([]);
    }
    
    // Formatear los datos para que coincidan con el formato esperado
    const productosFormateados = results.map(p => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion,
      imagen: p.imagen,
      estado: p.estado,
      ubicacion_cosecha: p.ubicacion_cosecha,
      temporada_cosecha: p.temporada_cosecha,
      metodo_cosecha: p.metodo_cosecha,
      produccion_toneladas: p.produccion_toneladas,
      precios: {
        libra: parseFloat(p.precio_libra),
        bulto: parseFloat(p.precio_bulto),
        camion: parseFloat(p.precio_camion)
      },
      nuevo: Boolean(p.nuevo),
      disponible: Boolean(p.disponible),
      total_productores: p.total_productores || 0,
      fecha_creacion: p.fecha_creacion
    }));
    
    console.log(`✅ ${results.length} productos encontrados`);
    res.json(productosFormateados);
  });
});

// Obtener producto por ID con información de productores
app.get("/productos/:id", (req, res) => {
  const { id } = req.params;
  
  console.log('📦 Obteniendo producto:', id);
  
  const query = `
    SELECT 
      p.*,
      COUNT(DISTINCT pp.usuario_id) as total_productores,
      SUM(pp.area_cultivada) as area_total,
      SUM(pp.produccion_actual) as produccion_total
    FROM productos p
    LEFT JOIN productores_productos pp ON p.id = pp.producto_id AND pp.estado_produccion = 'Activo'
    WHERE p.id = ?
    GROUP BY p.id
  `;
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error obteniendo producto:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    if (result.length === 0) {
      console.log('⚠️ Producto no encontrado:', id);
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    const p = result[0];
    const productoFormateado = {
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion,
      imagen: p.imagen,
      estado: p.estado,
      ubicacion_cosecha: p.ubicacion_cosecha,
      temporada_cosecha: p.temporada_cosecha,
      metodo_cosecha: p.metodo_cosecha,
      produccion_toneladas: p.produccion_toneladas,
      precios: {
        libra: parseFloat(p.precio_libra),
        bulto: parseFloat(p.precio_bulto),
        camion: parseFloat(p.precio_camion)
      },
      nuevo: Boolean(p.nuevo),
      disponible: Boolean(p.disponible),
      total_productores: p.total_productores || 0,
      area_total: parseFloat(p.area_total) || 0,
      produccion_total: parseFloat(p.produccion_total) || 0
    };
    
    console.log('✅ Producto encontrado:', productoFormateado.nombre);
    res.json(productoFormateado);
  });
});

// Crear producto (requiere autenticación y ser administrador)
app.post("/productos", authenticateToken, (req, res) => {
  const { 
    nombre, 
    categoria, 
    descripcion, 
    imagen, 
    estado,
    ubicacion_cosecha,
    temporada_cosecha,
    metodo_cosecha,
    produccion_toneladas,
    precio_libra,
    precio_bulto,
    precio_camion,
    nuevo,
    disponible
  } = req.body;
  
  console.log('➕ Creando producto:', nombre);
  
  if (!nombre || !categoria) {
    return res.status(400).json({ message: "Nombre y categoría son requeridos" });
  }

  const query = `
    INSERT INTO productos 
    (nombre, categoria, descripcion, imagen, estado, ubicacion_cosecha, temporada_cosecha, 
     metodo_cosecha, produccion_toneladas, precio_libra, precio_bulto, precio_camion, nuevo, disponible) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [
    nombre, 
    categoria, 
    descripcion || null, 
    imagen || '🌾', 
    estado || 'Disponible',
    ubicacion_cosecha || null,
    temporada_cosecha || null,
    metodo_cosecha || null,
    produccion_toneladas || null,
    precio_libra || 0,
    precio_bulto || 0,
    precio_camion || 0,
    nuevo || false,
    disponible !== false
  ], (err, result) => {
    if (err) {
      console.error('❌ Error creando producto:', err);
      return res.status(500).json({ message: "Error al crear producto" });
    }
    
    console.log('✅ Producto creado con ID:', result.insertId);
    res.status(201).json({
      id: result.insertId,
      nombre,
      categoria,
      descripcion,
      imagen,
      estado,
      message: "Producto creado exitosamente"
    });
  });
});

// Actualizar producto (requiere autenticación y ser administrador)
app.put("/productos/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    categoria, 
    descripcion, 
    imagen, 
    estado,
    ubicacion_cosecha,
    temporada_cosecha,
    metodo_cosecha,
    produccion_toneladas,
    precio_libra,
    precio_bulto,
    precio_camion,
    nuevo,
    disponible
  } = req.body;
  
  console.log('✏️ Actualizando producto:', id);
  
  if (!nombre || !categoria) {
    return res.status(400).json({ message: "Nombre y categoría son requeridos" });
  }

  const query = `
    UPDATE productos 
    SET nombre=?, categoria=?, descripcion=?, imagen=?, estado=?, 
        ubicacion_cosecha=?, temporada_cosecha=?, metodo_cosecha=?, 
        produccion_toneladas=?, precio_libra=?, precio_bulto=?, precio_camion=?,
        nuevo=?, disponible=?
    WHERE id=?
  `;
  
  db.query(query, [
    nombre, 
    categoria, 
    descripcion, 
    imagen, 
    estado,
    ubicacion_cosecha,
    temporada_cosecha,
    metodo_cosecha,
    produccion_toneladas,
    precio_libra,
    precio_bulto,
    precio_camion,
    nuevo,
    disponible,
    id
  ], (err, result) => {
    if (err) {
      console.error('❌ Error actualizando producto:', err);
      return res.status(500).json({ message: "Error al actualizar" });
    }
    
    if (result.affectedRows === 0) {
      console.log('⚠️ Producto no encontrado:', id);
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    console.log('✅ Producto actualizado:', id);
    res.json({ 
      message: "Producto actualizado correctamente", 
      id
    });
  });
});

// Eliminar producto (requiere autenticación y ser administrador)
app.delete("/productos/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ Solicitud de eliminación para producto:', id);
  
  // Primero verificar que existe
  db.query("SELECT * FROM productos WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error('❌ Error verificando producto:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    if (result.length === 0) {
      console.log('⚠️ Producto no encontrado:', id);
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    // Si existe, proceder a eliminar (esto también eliminará las relaciones en productores_productos)
    db.query("DELETE FROM productos WHERE id=?", [id], (err, deleteResult) => {
      if (err) {
        console.error('❌ Error eliminando producto:', err);
        return res.status(500).json({ message: "Error al eliminar" });
      }
      
      console.log('✅ Producto eliminado:', id);
      res.json({ 
        message: "Producto eliminado correctamente",
        id: id,
        nombre: result[0].nombre
      });
    });
  });
});

// ==================== PRODUCTORES - PRODUCTOS ====================

// Registrar un productor para un producto
app.post("/productores-productos", (req, res) => {
  const { usuario_id, producto_id, area_cultivada, produccion_actual, fecha_inicio_produccion, notas } = req.body;
  
  console.log(`👨‍🌾 Registrando productor ${usuario_id} para producto ${producto_id}`);
  
  if (!usuario_id || !producto_id) {
    return res.status(400).json({ message: "Usuario y producto son requeridos" });
  }

  const query = `
    INSERT INTO productores_productos 
    (usuario_id, producto_id, area_cultivada, produccion_actual, fecha_inicio_produccion, notas) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [
    usuario_id, 
    producto_id, 
    area_cultivada || null, 
    produccion_actual || null,
    fecha_inicio_produccion || null,
    notas || null
  ], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "Ya estás registrado como productor de este producto" });
      }
      console.error('❌ Error registrando productor:', err);
      return res.status(500).json({ message: "Error al registrar" });
    }
    
    console.log('✅ Productor registrado');
    res.status(201).json({
      id: result.insertId,
      message: "Registrado como productor exitosamente"
    });
  });
});

// Obtener productos de un usuario (productor)
app.get("/productores-productos/usuario/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;
  
  console.log(`📋 Obteniendo productos del usuario ${usuario_id}`);
  
  const query = `
    SELECT 
      pp.*,
      p.nombre as producto_nombre,
      p.categoria,
      p.imagen,
      p.estado as producto_estado
    FROM productores_productos pp
    JOIN productos p ON pp.producto_id = p.id
    WHERE pp.usuario_id = ?
    ORDER BY pp.fecha_registro DESC
  `;
  
  db.query(query, [usuario_id], (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo productos del usuario:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    console.log(`✅ ${results.length} productos encontrados para el usuario`);
    res.json(results);
  });
});

// Obtener productores de un producto
app.get("/productores-productos/producto/:producto_id", (req, res) => {
  const { producto_id } = req.params;
  
  console.log(`👥 Obteniendo productores del producto ${producto_id}`);
  
  const query = `
    SELECT 
      pp.*,
      u.nombre as productor_nombre,
      u.email,
      u.telefono,
      u.direccion
    FROM productores_productos pp
    JOIN usuarios u ON pp.usuario_id = u.id
    WHERE pp.producto_id = ? AND pp.estado_produccion = 'Activo'
    ORDER BY pp.fecha_registro DESC
  `;
  
  db.query(query, [producto_id], (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo productores:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    console.log(`✅ ${results.length} productores encontrados`);
    res.json(results);
  });
});

// Agregar este endpoint en tu server.js existente

// PUT - Actualizar usuario por ID (sin modificar rol)
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccion } = req.body;

  // Validar campos obligatorios
  if (!nombre || !email) {
    return res.status(400).json({ 
      error: 'Los campos nombre y email son obligatorios' 
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'El formato del email no es válido' 
    });
  }

  // Query SQL para actualizar (sin incluir rol)
  const query = `
    UPDATE usuarios 
    SET nombre = ?, 
        email = ?, 
        telefono = ?, 
        direccion = ?
    WHERE id = ?
  `;

  db.query(
    query, 
    [nombre, email, telefono || null, direccion || null, id], 
    (err, results) => {
      if (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ 
          error: 'Error al actualizar usuario',
          details: err.message 
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }

      // Obtener el usuario actualizado
      db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, rows) => {
        if (err) {
          console.error('Error al obtener usuario actualizado:', err);
          return res.status(500).json({ 
            error: 'Usuario actualizado pero error al obtener datos' 
          });
        }

        res.json({
          mensaje: 'Usuario actualizado correctamente',
          usuario: rows[0]
        });
      });
    }
  );
});

// También es útil tener un endpoint PATCH para actualizaciones parciales
app.patch('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  // No permitir actualizar el rol
  delete campos.rol;
  delete campos.id;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ 
      error: 'No se proporcionaron campos para actualizar' 
    });
  }

  // Construir query dinámicamente
  const setClauses = Object.keys(campos).map(key => `${key} = ?`).join(', ');
  const values = Object.values(campos);
  values.push(id);

  const query = `UPDATE usuarios SET ${setClauses} WHERE id = ?`;

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error al actualizar usuario:', err);
      return res.status(500).json({ 
        error: 'Error al actualizar usuario',
        details: err.message 
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Obtener el usuario actualizado
    db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, rows) => {
      if (err) {
        console.error('Error al obtener usuario actualizado:', err);
        return res.status(500).json({ 
          error: 'Usuario actualizado pero error al obtener datos' 
        });
      }

      res.json({
        mensaje: 'Usuario actualizado correctamente',
        usuario: rows[0]
      });
    });
  });
});

// server.js, esto es la final parte del codigo server.js, el codigo completo tiene mas de 1000 lineas de codigos

// ==================== ENDPOINTS DE MÉTRICAS ====================

// Métricas del Administrador
app.get('/api/metricas/admin', (req, res) => {
  console.log('📊 [ADMIN METRICS] Iniciando...');
  
  try {
    const queries = {
      usuarios: new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN rol IS NOT NULL THEN 1 ELSE 0 END) as activos
          FROM usuarios
        `, (err, result) => {
          if (err) {
            console.error('❌ [ADMIN METRICS] Error en usuarios:', err);
            reject(err);
          } else {
            console.log('✅ [ADMIN METRICS] Usuarios obtenidos');
            resolve(result[0]);
          }
        });
      }),
      
      productos: new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as total FROM productos', (err, result) => {
          if (err) {
            console.error('❌ [ADMIN METRICS] Error en productos:', err);
            reject(err);
          } else {
            console.log('✅ [ADMIN METRICS] Productos obtenidos');
            resolve(result[0]);
          }
        });
      }),
      
      novedades: new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as total FROM novedades', (err, result) => {
          if (err) {
            console.error('❌ [ADMIN METRICS] Error en novedades:', err);
            reject(err);
          } else {
            console.log('✅ [ADMIN METRICS] Novedades obtenidas');
            resolve(result[0]);
          }
        });
      }),
      
      productosCategoria: new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            categoria,
            COUNT(*) as cantidad
          FROM productos
          GROUP BY categoria
          ORDER BY cantidad DESC
        `, (err, results) => {
          if (err) {
            console.error('❌ [ADMIN METRICS] Error en categorías:', err);
            reject(err);
          } else {
            console.log('✅ [ADMIN METRICS] Categorías obtenidas');
            resolve(results);
          }
        });
      }),
      
      actividadReciente: new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            COUNT(*) as registrosNuevos
          FROM usuarios
          WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, (err, result) => {
          if (err) {
            console.error('❌ [ADMIN METRICS] Error en actividad:', err);
            reject(err);
          } else {
            console.log('✅ [ADMIN METRICS] Actividad obtenida');
            resolve(result[0]);
          }
        });
      }),
      
      novedadesMes: new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            DATE_FORMAT(fecha_creacion, '%b') as mes,
            COUNT(*) as cantidad
          FROM novedades
          WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
          ORDER BY fecha_creacion
          LIMIT 6
        `, (err, results) => {
          if (err) {
            console.error('❌ [ADMIN METRICS] Error en novedades/mes:', err);
            reject(err);
          } else {
            console.log('✅ [ADMIN METRICS] Novedades/mes obtenidas');
            resolve(results);
          }
        });
      })
    };

    Promise.all(Object.values(queries))
      .then(([usuarios, productos, novedades, productosCategoria, actividadReciente, novedadesMes]) => {
        console.log('✅ [ADMIN METRICS] Todas las métricas obtenidas exitosamente');
        res.json({
          success: true,
          data: {
            totalUsuarios: usuarios.total || 0,
            usuariosActivos: usuarios.activos || 0,
            totalProductos: productos.total || 0,
            totalNovedades: novedades.total || 0,
            productosCategoria: productosCategoria || [],
            actividadReciente: {
              registrosNuevos: actividadReciente.registrosNuevos || 0,
              vistasProductos: 0,
              lecturasNovedades: 0
            },
            novedadesMes: novedadesMes || []
          }
        });
      })
      .catch(error => {
        console.error('❌ [ADMIN METRICS] Error en Promise.all:', error);
        res.status(500).json({
          success: false,
          message: 'Error al obtener métricas del administrador',
          error: error.message
        });
      });
  } catch (error) {
    console.error('❌ [ADMIN METRICS] Error general:', error);
    res.status(500).json({
      success: false,
      message: 'Error crítico en métricas admin',
      error: error.message
    });
  }
});

// Métricas del Usuario Individual
app.get('/api/metricas/usuario/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;
  
  console.log(`📊 [USER METRICS] Iniciando para usuario ${usuarioId}`);

  try {
    // PASO 1: Verificar que el usuario existe
    db.query(`
      SELECT 
        id,
        nombre,
        email,
        rol,
        DATE(fecha_registro) as fecha_registro
      FROM usuarios
      WHERE id = ?
    `, [usuarioId], (err, usuario) => {
      if (err) {
        console.error('❌ [USER METRICS] Error consultando usuario:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al consultar usuario',
          error: err.message
        });
      }

      if (!usuario || usuario.length === 0) {
        console.log(`⚠️ [USER METRICS] Usuario ${usuarioId} no encontrado`);
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      console.log(`✅ [USER METRICS] Usuario encontrado: ${usuario[0].nombre}`);

      // PASO 2: Obtener métricas del usuario
      const queries = {
        // Productos que el usuario produce
        productosActivos: new Promise((resolve, reject) => {
          db.query(`
            SELECT COUNT(*) as total
            FROM productores_productos
            WHERE usuario_id = ?
          `, [usuarioId], (err, result) => {
            if (err) {
              console.error('❌ [USER METRICS] Error en productos activos:', err);
              reject(err);
            } else {
              console.log(`✅ [USER METRICS] Productos activos: ${result[0].total}`);
              resolve(result[0].total || 0);
            }
          });
        }),

        // Días activos (desde registro)
        diasActivo: new Promise((resolve, reject) => {
          db.query(`
            SELECT DATEDIFF(NOW(), fecha_registro) as dias
            FROM usuarios
            WHERE id = ?
          `, [usuarioId], (err, result) => {
            if (err) {
              console.error('❌ [USER METRICS] Error en días activos:', err);
              reject(err);
            } else {
              const dias = result[0]?.dias || 0;
              console.log(`✅ [USER METRICS] Días activos: ${dias}`);
              resolve(dias);
            }
          });
        }),

        // Actividad semanal (simulada por ahora)
        actividadSemanal: new Promise((resolve) => {
          const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
          const actividad = dias.map(dia => ({
            dia,
            vistas: Math.floor(Math.random() * 10)
          }));
          console.log('✅ [USER METRICS] Actividad semanal generada');
          resolve(actividad);
        }),

        // Categorías de interés
        categoriasInteres: new Promise((resolve, reject) => {
          db.query(`
            SELECT 
              p.categoria,
              COUNT(*) as interes
            FROM productores_productos pp
            JOIN productos p ON pp.producto_id = p.id
            WHERE pp.usuario_id = ?
            GROUP BY p.categoria
            ORDER BY interes DESC
            LIMIT 5
          `, [usuarioId], (err, results) => {
            if (err) {
              console.error('❌ [USER METRICS] Error en categorías:', err);
              reject(err);
            } else {
              console.log(`✅ [USER METRICS] Categorías: ${results.length}`);
              resolve(results || []);
            }
          });
        })
      };

      // PASO 3: Ejecutar todas las consultas
      Promise.all(Object.values(queries))
        .then(([productosActivos, diasActivo, actividadSemanal, categoriasInteres]) => {
          console.log('✅ [USER METRICS] Todas las métricas obtenidas exitosamente');
          
          const responseData = {
            success: true,
            data: {
              productosActivos: productosActivos,
              productosVistos: Math.floor(Math.random() * 50),
              novedadesLeidas: Math.floor(Math.random() * 20),
              diasActivo: Math.max(diasActivo, 1),
              actividadSemanal: actividadSemanal,
              categoriasInteres: categoriasInteres,
              ultimaActividad: new Date().toISOString()
            }
          };
          
          console.log('📤 [USER METRICS] Enviando respuesta:', JSON.stringify(responseData));
          res.json(responseData);
        })
        .catch(error => {
          console.error('❌ [USER METRICS] Error en Promise.all:', error);
          res.status(500).json({
            success: false,
            message: 'Error al obtener métricas del usuario',
            error: error.message
          });
        });
    });
  } catch (error) {
    console.error('❌ [USER METRICS] Error crítico:', error);
    res.status(500).json({
      success: false,
      message: 'Error crítico en métricas usuario',
      error: error.message
    });
  }
});

// Endpoint para registrar vista de producto (opcional)
app.post('/api/metricas/producto-vista', (req, res) => {
  const { usuario_id, producto_id } = req.body;
  
  console.log(`📊 [TRACKING] Vista de producto - Usuario: ${usuario_id}, Producto: ${producto_id}`);
  
  if (!usuario_id || !producto_id) {
    return res.status(400).json({
      success: false,
      message: 'Usuario y producto son requeridos'
    });
  }

  // Por ahora, solo retornar éxito (implementar tabla después)
  res.json({
    success: true,
    message: 'Vista registrada'
  });
});

// Endpoint para registrar lectura de novedad (opcional)
app.post('/api/metricas/novedad-lectura', (req, res) => {
  const { usuario_id, novedad_id } = req.body;
  
  console.log(`📊 [TRACKING] Lectura de novedad - Usuario: ${usuario_id}, Novedad: ${novedad_id}`);
  
  if (!usuario_id || !novedad_id) {
    return res.status(400).json({
      success: false,
      message: 'Usuario y novedad son requeridos'
    });
  }

  // Por ahora, solo retornar éxito (implementar tabla después)
  res.json({
    success: true,
    message: 'Lectura registrada'
  });
});

// ==================== FIN DE ENDPOINTS DE MÉTRICAS ====================

// ==================== RUTAS ADICIONALES ====================

// ==================== ENDPOINT DE MIGRACIÓN CON LLAVE MAESTRA ====================
// Endpoint para migrar contraseñas de usuarios existentes (de texto plano a hash)
app.post("/migrate-passwords", (req, res) => {
  const { masterKey } = req.body;
  
  // Verificar llave maestra
  if (!masterKey || masterKey !== MASTER_KEY) {
    return res.status(403).json({ 
      message: "Llave maestra requerida para esta operación" 
    });
  }
  
  console.log('🔄 Iniciando migración de contraseñas...');
  
  // Obtener todos los usuarios
  db.query("SELECT id, clave FROM usuarios", (err, usuarios) => {
    if (err) {
      console.error('❌ Error obteniendo usuarios:', err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    
    let migrados = 0;
    let errores = 0;
    const promesas = [];
    
    usuarios.forEach((usuario) => {
      // Verificar si la contraseña ya está hasheada (bcrypt siempre empieza con $2b$)
      if (usuario.clave && !usuario.clave.startsWith('$2b$')) {
        // Es texto plano, necesita migración
        const promesa = new Promise((resolve) => {
          bcrypt.hash(usuario.clave, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
              console.error(`❌ Error hasheando usuario ${usuario.id}:`, hashErr);
              errores++;
              resolve();
              return;
            }
            
            db.query(
              "UPDATE usuarios SET clave = ? WHERE id = ?",
              [hashedPassword, usuario.id],
              (updateErr) => {
                if (updateErr) {
                  console.error(`❌ Error actualizando usuario ${usuario.id}:`, updateErr);
                  errores++;
                } else {
                  console.log(`✅ Usuario ${usuario.id} migrado`);
                  migrados++;
                }
                resolve();
              }
            );
          });
        });
        
        promesas.push(promesa);
      }
    });
    
    Promise.all(promesas).then(() => {
      console.log(`✅ Migración completada: ${migrados} migrados, ${errores} errores`);
      res.json({
        message: "Migración completada",
        migrados,
        errores,
        total: usuarios.length
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "API AgroChoco funcionando correctamente ✅",
    version: "1.0.0",
    masterKeyConfigured: MASTER_KEY ? true : false
  });
});

app.use((req, res) => {
  console.log('⚠️ Ruta no encontrada:', req.path);
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 8000;

// Obtener la IP automáticamente (sin usar el paquete 'ip')
const networkInterfaces = require('os').networkInterfaces();
let localIP = 'localhost';

// Buscar la IP local (Wi-Fi o Ethernet)
Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address;
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀    Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📱 Usa esta dirección en tu app móvil: http://${localIP}:${PORT}`);
  console.log(`\n🔑 LLAVE MAESTRA CONFIGURADA: ${MASTER_KEY.substring(0, 10)}...`);
  console.log(`   (Úsala para crear administradores o migrar usuarios)`);
  console.log(`\n🔐 JWT CONFIGURADO:`);
  console.log(`   Algoritmo: ${ALGORITMO}`);
  console.log(`   Expiración: ${MINUTOS_EXPIRACION_TOKEN} minutos (~${Math.round(MINUTOS_EXPIRACION_TOKEN / 1440)} días)`);
  console.log(`   Clave secreta: ${JWT_SECRET.substring(0, 20)}...`);
  console.log(`\n📋 Rutas disponibles:`);
  console.log(`\n🔐 AUTENTICACIÓN:`);
  console.log(`   POST   /login`);
  console.log(`   POST   /register (incluye masterKey para crear administradores)`);
  console.log(`   POST   /migrate-passwords (requiere masterKey)`);
  console.log(`\n👥 USUARIOS:`);
  console.log(`   GET    /usuarios`);
  console.log(`   GET    /usuarios/:id`);
  console.log(`   PUT    /usuarios/:id`);
  console.log(`\n📰 NOVEDADES:`);
  console.log(`   GET    /novedades`);
  console.log(`   POST   /novedades`);
  console.log(`   GET    /novedades/:id`);
  console.log(`   PUT    /novedades/:id`);
  console.log(`   DELETE /novedades/:id`);
  console.log(`\n🌾 PRODUCTOS:`);
  console.log(`   GET    /productos`);
  console.log(`   GET    /productos/:id`);
  console.log(`   POST   /productos`);
  console.log(`   PUT    /productos/:id`);
  console.log(`   DELETE /productos/:id`);
  console.log(`\n👨‍🌾 PRODUCTORES-PRODUCTOS:`);
  console.log(`   POST   /productores-productos`);
  console.log(`   GET    /productores-productos/usuario/:usuario_id`);
  console.log(`   GET    /productores-productos/producto/:producto_id`);
  console.log('\n✅ Servidor listo para recibir peticiones\n');
});

process.on('SIGINT', () => {
  db.end((err) => {
    if (err) console.error('Error cerrando la conexión:', err);
    console.log('\n👋 Conexión a la base de datos cerrada');
    process.exit(0);
  });
});