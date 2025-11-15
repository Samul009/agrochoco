// SmartSearchChip.jsx filtros para las pantallas
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Chip, Portal, Modal, Text, Button, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const SmartSearchChip = ({ 
  screenType = "novedades", 
  onFiltersApply,
  activeFilters = {},
  onClearFilters
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState(activeFilters);

  // Configuración de filtros por pantalla
  const getFiltersConfig = () => {
    switch (screenType) {
      case "novedades":
        return {
          title: "Filtrar Novedades",
          icon: "newspaper",
          color: "#2e7d32",
          filters: {
            fecha: {
              title: "📅 Fecha de Publicación",
              options: ["Hoy", "Esta semana", "Este mes", "Últimos 3 meses"]
            },
            categoria: {
              title: "🏷️ Categoría",
              options: ["Cultivos", "Ganadería", "Tecnología", "Mercados", "Clima", "Políticas"]
            },
            relevancia: {
              title: "⭐ Relevancia",
              options: ["Alta", "Media", "Baja"]
            },
            region: {
              title: "🌍 Región",
              options: ["Mi región", "Nacional", "Internacional"]
            }
          }
        };
      
      case "productos":
        return {
          title: "Filtrar Productos",
          icon: "leaf",
          color: "#4caf50",
          filters: {
            categoria: {
              title: "🏷️ Categoría",
              options: ["Cereales", "Legumbres", "Frutas", "Verduras", "Lácteos", "Cárnicos"]
            },
            precio: {
              title: "💰 Rango de Precio",
              options: ["Bajo (< $50.000)", "Medio ($50k - $150k)", "Alto (> $150.000)", "Solo ofertas"]
            },
            disponibilidad: {
              title: "📦 Disponibilidad",
              options: ["Disponible ahora", "Próximamente", "Bajo pedido"]
            },
            origen: {
              title: "📍 Origen",
              options: ["Local", "Regional", "Nacional", "Importado"]
            },
            calidad: {
              title: "✨ Calidad",
              options: ["Premium", "Estándar", "Orgánico", "Certificado"]
            }
          }
        };
      
      case "rutas":
        return {
          title: "Filtrar Rutas",
          icon: "map-marker-path",
          color: "#66bb6a",
          filters: {
            tipoTransporte: {
              title: "🚛 Tipo de Transporte",
              options: ["Terrestre", "Marítimo", "Aéreo", "Mixto"]
            },
            distancia: {
              title: "📏 Distancia",
              options: ["0-50 km", "50-200 km", "200-500 km", "+500 km"]
            },
            costo: {
              title: "💵 Rango de Costo",
              options: ["Económico", "Medio", "Premium"]
            },
            tiempo: {
              title: "⏱️ Tiempo de Entrega",
              options: ["Mismo día", "1-3 días", "3-7 días", "+7 días"]
            },
            destino: {
              title: "🎯 Tipo de Destino",
              options: ["Mercados locales", "Centrales mayoristas", "Exportación", "Retail"]
            }
          }
        };
      
      default:
        return { title: "Filtros", icon: "filter", color: "#2e7d32", filters: {} };
    }
  };

  const config = getFiltersConfig();

  // Contar filtros activos
  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).filter(value => value && value.length > 0).length;
  };

  // Manejar selección de filtro
  const handleFilterToggle = (filterKey, option) => {
    setTempFilters(prev => {
      const currentValues = prev[filterKey] || [];
      const isSelected = currentValues.includes(option);
      
      return {
        ...prev,
        [filterKey]: isSelected 
          ? currentValues.filter(item => item !== option)
          : [...currentValues, option]
      };
    });
  };

  // Verificar si una opción está seleccionada
  const isOptionSelected = (filterKey, option) => {
    return (tempFilters[filterKey] || []).includes(option);
  };

  // Aplicar filtros
  const applyFilters = () => {
    console.log('✅ Aplicando filtros:', tempFilters);
    onFiltersApply(tempFilters);
    setModalVisible(false);
  };

  // Limpiar filtros
  const clearAllFilters = () => {
    console.log('🧹 Limpiando todos los filtros');
    setTempFilters({});
    onClearFilters();
    setModalVisible(false);
  };

  // Cerrar modal sin aplicar
  const closeModal = () => {
    setTempFilters(activeFilters); // Restaurar filtros originales
    setModalVisible(false);
  };

  const activeCount = getActiveFiltersCount();

  return (
    <>
      {/* Chip principal */}
      <View style={styles.chipContainer}>
        <Chip
          icon={({ size, color }) => (
            <Ionicons name={config.icon} size={size} color={color} />
          )}
          onPress={() => setModalVisible(true)}
          style={[
            styles.filterChip,
            activeCount > 0 && { backgroundColor: config.color }
          ]}
          textStyle={[
            styles.filterChipText,
            activeCount > 0 && styles.filterChipTextActive
          ]}
          mode={activeCount > 0 ? "flat" : "outlined"}
        >
          Filtros {activeCount > 0 && `(${activeCount})`}
        </Chip>
      </View>

      {/* Modal de filtros */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name={config.icon} size={24} color={config.color} />
                <Text style={[styles.modalTitle, { color: config.color }]}>
                  {config.title}
                </Text>
              </View>
              <Button onPress={closeModal} textColor="#666">
                Cerrar
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* Filtros */}
            {Object.entries(config.filters).map(([filterKey, filterConfig]) => (
              <View key={filterKey} style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>{filterConfig.title}</Text>
                <View style={styles.chipsContainer}>
                  {filterConfig.options.map((option) => {
                    const isSelected = isOptionSelected(filterKey, option);
                    return (
                      <Chip
                        key={option}
                        onPress={() => handleFilterToggle(filterKey, option)}
                        style={[
                          styles.optionChip,
                          isSelected && { 
                            backgroundColor: config.color + '20',
                            borderColor: config.color
                          }
                        ]}
                        textStyle={[
                          styles.optionChipText,
                          isSelected && { 
                            color: config.color,
                            fontWeight: '600'
                          }
                        ]}
                        mode={isSelected ? "flat" : "outlined"}
                        selected={isSelected}
                      >
                        {option}
                      </Chip>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={clearAllFilters}
                style={styles.clearButton}
                textColor="#666"
                icon="close-circle-outline"
              >
                Limpiar todo
              </Button>
              <Button
                mode="contained"
                onPress={applyFilters}
                style={[styles.applyButton, { backgroundColor: config.color }]}
                icon="check-circle"
              >
                Aplicar filtros
              </Button>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#fff",
  },
  filterChipText: {
    color: "#fff",
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    maxHeight: "85%",
    elevation: 5,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  divider: {
    marginVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    marginBottom: 4,
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  optionChipText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderColor: "#ddd",
  },
  applyButton: {
    flex: 1,
  },
});

export default SmartSearchChip;