// header.jsx
import React, { useState } from "react";
import { View } from "react-native";
import { Appbar, Searchbar } from "react-native-paper";
import SmartSearchChip from "./SmartSearchChip";

export default function Header({ 
  title = "Novedades", 
  onSearch, 
  onMenuPress,
  screenType = "novedades",
  showFilters = true, 
  onFiltersApply,
  activeFilters = {},
  onClearFilters
}) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState("");

  // Determinar el tipo de pantalla basado en el título si no se especifica
  const getScreenType = () => {
    if (screenType !== "novedades") return screenType;
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes("producto")) return "productos";
    if (titleLower.includes("ruta")) return "rutas";
    return "novedades";
  };

  const currentScreenType = getScreenType();

  const handleSearchClose = () => {
    setSearchVisible(false);
    setQuery("");
    onSearch?.(""); // reset lista cuando cierro
  };

  const handleSearchChange = (text) => {
    setQuery(text);
    onSearch?.(text);
  };

  return (
    <>
      <Appbar.Header style={{ backgroundColor: "#2e7d32" }}>
        {!searchVisible ? (
          <>
            <Appbar.Action icon="menu" color="#fff" onPress={onMenuPress} />
            <Appbar.Content title={title} color="#fff" />
            <Appbar.Action
              icon="magnify"
              color="#fff"
              onPress={() => setSearchVisible(true)}
            />
          </>
        ) : (
          <Searchbar
            placeholder={`Buscar ${title.toLowerCase()}...`}
            value={query}
            onChangeText={handleSearchChange}
            autoFocus
            style={{
              flex: 1,
              marginHorizontal: 8,
              elevation: 0,
              backgroundColor: "white",
            }}
            icon="arrow-left"
            onIconPress={handleSearchClose}
          />
        )}
      </Appbar.Header>

      {/* Chip de filtros inteligente - solo se muestra cuando:
          1. No está la búsqueda activa
          2. showFilters es true
          3. Las funciones de filtro están definidas
      */}
      {!searchVisible && showFilters && onFiltersApply && (
        <View style={{ backgroundColor: "#2e7d32", paddingBottom: 8 }}>
          <SmartSearchChip
            screenType={currentScreenType}
            onFiltersApply={onFiltersApply}
            activeFilters={activeFilters}
            onClearFilters={onClearFilters}
          />
        </View>
      )}
    </>
  );
}