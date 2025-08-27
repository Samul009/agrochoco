import React, { useState } from "react";
import { View } from "react-native";
import { Appbar, Searchbar } from "react-native-paper";
import SmartSearchChip from "./SmartSearchChip";

export default function Header({ 
  title = "Novedades", 
  onSearch, 
  onMenuPress,
  screenType = "novedades", // nuevo prop para determinar el tipo de pantalla
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
            onChangeText={(text) => {
              setQuery(text);
              onSearch(text);
            }}
            autoFocus
            style={{
              flex: 1,
              marginHorizontal: 8,
              elevation: 0,
              backgroundColor: "white",
            }}
            icon="arrow-left"
            onIconPress={() => {
              setSearchVisible(false);
              setQuery("");
              onSearch(""); // reset lista cuando cierro
            }}
          />
        )}
      </Appbar.Header>

      {/* Chip de filtros inteligente - solo se muestra cuando no está la búsqueda activa */}
      {!searchVisible && (
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