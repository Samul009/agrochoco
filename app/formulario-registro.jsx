import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, TextInput, Button, Snackbar, RadioButton } from 'react-native-paper';
import usuariosData from '../usuarios.json';

export default function FormularioRegistro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rol, setRol] = useState("Usuario"); // valor por defecto
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [visible, setVisible] = useState(false);

  const handleRegistro = () => {
    if (!nombre || !email || !telefono || !direccion || !password || !confirmPassword) {
      setMensaje("Por favor, complete todos los campos.");
      setVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden.");
      setVisible(true);
      return;
    }

    const usuarioExistente = usuariosData.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
    if (usuarioExistente) {
      setMensaje("El usuario ya está registrado.");
      setVisible(true);
      return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: usuariosData.length > 0 ? usuariosData[usuariosData.length - 1].id + 1 : 1,
      nombre,
      email,
      telefono,
      direccion,
      rol,
      clave: password,
    };

    // Simulación de guardado
    console.log("Usuario creado y guardado en usuarios.json:", nuevoUsuario);

    setMensaje("Usuario creado con éxito ✅");
    setVisible(true);

    // Limpiar campos
    setNombre("");
    setEmail("");
    setTelefono("");
    setDireccion("");
    setPassword("");
    setConfirmPassword("");
    setRol("Usuario");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 20 }}>
        <Text
          variant="headlineLarge"
          style={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 30,
            marginTop: 40,
            color: "#000",
          }}
        >
          Crear Cuenta
        </Text>

        <TextInput
          style={{ marginBottom: 15 }}
          mode="outlined"
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          style={{ marginBottom: 15 }}
          mode="outlined"
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={{ marginBottom: 15 }}
          mode="outlined"
          label="Teléfono"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        <TextInput
          style={{ marginBottom: 15 }}
          mode="outlined"
          label="Dirección"
          value={direccion}
          onChangeText={setDireccion}
        />

        <Text style={{ marginTop: 10, marginBottom: 5, fontWeight: "bold" }}>
          Seleccione Rol
        </Text>
        <RadioButton.Group onValueChange={setRol} value={rol}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <RadioButton value="Usuario" />
            <Text>Usuario</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <RadioButton value="Invitado" />
            <Text>Invitado</Text>
          </View>
        </RadioButton.Group>

        <TextInput
          style={{ marginBottom: 15, marginTop: 15 }}
          mode="outlined"
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={{ marginBottom: 30 }}
          mode="outlined"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleRegistro}
          style={{
            borderRadius: 10,
            paddingVertical: 8,
            width: "100%",
            alignSelf: "center",
          }}
          labelStyle={{ fontSize: 18 }}
        >
          Registrarse
        </Button>
      </View>

      {/* Snackbar */}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        {mensaje}
      </Snackbar>
    </ScrollView>
  );
}
