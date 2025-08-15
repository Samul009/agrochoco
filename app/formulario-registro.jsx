import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, TextInput, Button, useTheme, MD3DarkTheme, Provider as PaperProvider, Snackbar } from 'react-native-paper';
import usuariosData from '../usuarios.json';

export default function FormularioRegistro() {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [mensaje, setMensaje] = React.useState("");
  const [visible, setVisible] = React.useState(false);

  // Tema oscuro personalizado
  const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      background: '#121420',
      surface: '#1e1e2e',
      primary: '#bb86fc',
      text: '#ffffff',
      onSurface: '#ffffff',
      onBackground: '#ffffff',
      outline: '#64748b',
      onSurfaceVariant: '#9ca3af',
    },
  };

  const handleRegistro = () => {
    // Validar que no haya campos vacíos
    if (!nombre || !email || !password || !confirmPassword) {
      setMensaje("Por favor, complete todos los campos.");
      setVisible(true);
      return;
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden.");
      setVisible(true);
      return;
    }

    // Validar si el usuario ya existe
    const usuarioExistente = usuariosData.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (usuarioExistente) {
      setMensaje("El usuario ya está registrado.");
      setVisible(true);
      return;
    }

    // Si pasa las validaciones
    setMensaje("Usuario creado con éxito ✅");
    setVisible(true);

    // Lógica para guardar en o JSON
    console.log('Usuario creado:', { nombre, email, password });
  };

  return (
    <PaperProvider theme={customDarkTheme}>
      <ScrollView style={{ flex: 1, backgroundColor: customDarkTheme.colors.background }}>
        <View style={{ padding: 20 }}>
          <Text
            variant="headlineLarge"
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 30,
              marginTop: 40,
              color: customDarkTheme.colors.onBackground,
            }}
          >
            Registro
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
              width: '100%',
              alignSelf: 'center',
            }}
            labelStyle={{ fontSize: 18 }}
          >
            Registrarse
          </Button>
        </View>
      </ScrollView>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#1e1e2e' }}
      >
        {mensaje}
      </Snackbar>
    </PaperProvider>
  );
}
