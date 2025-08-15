import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, List, Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import usuariosData from '../usuarios.json';

// Tema oscuro personalizado
const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121420',
    surface: '#1e1e2e',
    primary: '#bb86fc', 
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    text: '#ffffff', 
    outline: '#64748b',
    onSurfaceVariant: '#9ca3af',
  },
};

export default function ListaUsuarios() {
  const [filtro, setFiltro] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const router = useRouter();

  // Se extraen los colores directamente del tema personalizado
  const { colors } = customDarkTheme;

  useEffect(() => {
    setUsuarios(usuariosData);
  }, []);

  const usuariosFiltrados = usuarios.filter(u =>
    (u?.nombre ?? '').toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    // Envuelve el componente con PaperProvider y aplica el tema
    <PaperProvider theme={customDarkTheme}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 20, paddingTop: 60 }}>
          <Text variant="headlineLarge" style={{ color: colors.text, fontWeight: 'bold', marginBottom: 20 }}>
            Lista de Usuarios
          </Text>

          <TextInput
            mode="outlined"
            label="Buscar usuario"
            value={filtro}
            onChangeText={setFiltro}
            style={{ marginBottom: 20, backgroundColor: colors.surface }}
            textColor={colors.text}
            placeholderTextColor={colors.onSurfaceVariant}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
          />

          <List.Section style={{ backgroundColor: colors.surface, borderRadius: 10 }}>
            {usuariosFiltrados.map((usuario, idx) => (
              <TouchableOpacity
                key={`${usuario.id}-${idx}`}
                onPress={() => {
                  console.log('Navegando a usuario ID:', usuario.id);
                  router.push(`/perfil-usuario/${usuario.id}`);
                }}
              >
                <List.Item
                  title={usuario.nombre}
                  description={usuario.correo}
                  left={props => <List.Icon {...props} icon="account" color={colors.primary} />}
                  right={props => <List.Icon {...props} icon="chevron-right" color={colors.text} />}
                  titleStyle={{ color: colors.text }}
                  descriptionStyle={{ color: colors.onSurfaceVariant }}
                />
              </TouchableOpacity>
            ))}
          </List.Section>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}