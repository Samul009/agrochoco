import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Chip, Portal, Modal, Text, Button, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const SmartSearchChip = ({ 
  screenType = "novedades", // "novedades", "productos", "rutas"
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
          filters: {
            categoria: {
              title: "Categoría",
              options: ["Cultivos", "Ganadería", "Tecnología", "Mercados", "Clima", "Políticas"]
            },
            fecha: {
              title: "Fecha",
              options: ["Hoy", "Esta semana", "Este mes", "Últimos 3 meses"]
            },
            relevancia: {
              title: "Relevancia",
              options: ["Alta", "Media", "Baja"]
            },
            region: {
              title: "Región",
              options: ["Mi región", "Nacional", "Internacional"]
            }
          }
        };
      
      case "productos":
        return {
          title: "Filtrar Productos",
          icon: "leaf",
          filters: {
            categoria: {
              title: "Categoría",
              options: ["Cereales", "Legumbres", "Frutas", "Verduras", "Lácteos", "Cárnicos"]
            },
            precio: {
              title: "Rango de Precio",
              options: ["$ - $$$", "$$ - $$$$", "$$$ - $$$$$", "Solo ofertas"]
            },
            disponibilidad: {
              title: "Disponibilidad",
              options: ["Disponible ahora", "Próximamente", "Bajo pedido"]
            },
            origen: {
              title: "Origen",
              options: ["Local", "Regional", "Nacional", "Importado"]
            },
            calidad: {
              title: "Calidad",
              options: ["Premium", "Estándar", "Orgánico", "Certificado"]
            }
          }
        };
      
      case "rutas":
        return {
          title: "Filtrar Rutas",
          icon: "car",
          filters: {
            tipoTransporte: {
              title: "Tipo de Transporte",
              options: ["Terrestre", "Marítimo", "Aéreo", "Mixto"]
            },
            distancia: {
              title: "Distancia",
              options: ["0-50 km", "50-200 km", "200-500 km", "+500 km"]
            },
            costo: {
              title: "Rango de Costo",
              options: ["Económico", "Medio", "Premium"]
            },
            tiempo: {
              title: "Tiempo de Entrega",
              options: ["Mismo día", "1-3 días", "3-7 días", "+7 días"]
            },
            destino: {
              title: "Destino",
              options: ["Mercados locales", "Centrales mayoristas", "Exportación", "Retail"]
            }
          }
        };
      
      default:
        return { title: "Filtros", icon: "filter", filters: {} };
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

  // Aplicar filtros
  const applyFilters = () => {
    onFiltersApply(tempFilters);
    setModalVisible(false);
  };

  // Limpiar filtros
  const clearAllFilters = () => {
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
            activeCount > 0 && styles.filterChipActive
          ]}
          textStyle={activeCount > 0 && styles.filterChipTextActive}
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
          <ScrollView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{config.title}</Text>
              <Button onPress={closeModal} textColor="#666">
                Cancelar
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* Filtros */}
            {Object.entries(config.filters).map(([filterKey, filterConfig]) => (
              <View key={filterKey} style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>{filterConfig.title}</Text>
                <View style={styles.chipsContainer}>
                  {filterConfig.options.map((option) => {
                    const isSelected = (tempFilters[filterKey] || []).includes(option);
                    return (
                      <Chip
                        key={option}
                        onPress={() => handleFilterToggle(filterKey, option)}
                        style={[
                          styles.optionChip,
                          isSelected && styles.optionChipSelected
                        ]}
                        textStyle={isSelected && styles.optionChipTextSelected}
                        mode={isSelected ? "flat" : "outlined"}
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
              >
                Limpiar todo
              </Button>
              <Button
                mode="contained"
                onPress={applyFilters}
                style={styles.applyButton}
                buttonColor="#2e7d32"
              >
                Aplicar filtros
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: "white",
    borderColor: "#2e7d32",
  },
  filterChipActive: {
    backgroundColor: "#2e7d32",
  },
  filterChipTextActive: {
    color: "white",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2e7d32",
  },
  divider: {
    marginVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    marginBottom: 8,
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  optionChipSelected: {
    backgroundColor: "#e8f5e8",
    borderColor: "#2e7d32",
  },
  optionChipTextSelected: {
    color: "#2e7d32",
    fontWeight: "500",
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