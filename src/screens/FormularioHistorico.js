"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native"
import { SolturaService } from "../api/visualizar"

// Reuse utility functions from formulario.tsx
const getDeviceType = () => {
  const { width, height } = Dimensions.get("window")
  const screenSize = Math.min(width, height)

  if (screenSize >= 768) return "tablet"
  if (screenSize >= 414) return "largePhone"
  if (screenSize >= 375) return "mediumPhone"
  return "smallPhone"
}

const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    Dimensions.get("window").width > Dimensions.get("window").height ? "LANDSCAPE" : "PORTRAIT",
  )

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setOrientation(window.width > window.height ? "LANDSCAPE" : "PORTRAIT")
    })

    return () => subscription?.remove()
  }, [])

  return orientation
}

const normalize = (size) => {
  const deviceType = getDeviceType()
  const { width: SCREEN_WIDTH } = Dimensions.get("window")

  let scaleFactor
  switch (deviceType) {
    case "tablet":
      scaleFactor = SCREEN_WIDTH / 768
      break
    case "largePhone":
      scaleFactor = SCREEN_WIDTH / 414
      break
    case "mediumPhone":
      scaleFactor = SCREEN_WIDTH / 375
      break
    case "smallPhone":
      scaleFactor = SCREEN_WIDTH / 320
      break
    default:
      scaleFactor = SCREEN_WIDTH / 375
  }

  const newSize = size * scaleFactor
  return Math.round(newSize)
}

const getResponsiveSize = (size) => {
  const deviceType = getDeviceType()
  const baseSize = size

  switch (deviceType) {
    case "tablet":
      return baseSize * 1.3
    case "largePhone":
      return baseSize * 1.1
    case "mediumPhone":
      return baseSize
    case "smallPhone":
      return baseSize * 0.85
    default:
      return baseSize
  }
}

// Filter Chip Component
const FilterChip = ({ label, selected, onPress }) => {
  return (
    <Pressable style={[styles.filterChip, selected && styles.filterChipSelected]} onPress={onPress}>
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
    </Pressable>
  )
}

// Determinar a cor do badge com base no tipo de serviço
const getBadgeColor = (tipoServico) => {
  switch (tipoServico) {
    case "Coleta":
      return "#4CAF50" // Verde
    case "Seletiva":
      return "#2196F3" // Azul
    case "Varrição":
    case "Varrição":
      return "#FF9800" // Laranja
    case "Remoção":
      return "#9C27B0" // Roxo
    case "Cata Treco":
      return "#795548" // Marrom
    default:
      return "#757575" // Cinza
  }
}

// Format date time helper
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Get equipe label helper
const getEquipeLabel = (equipe) => {
  switch (equipe) {
    case "matutino":
      return "Equipe 1 (Matutino)"
    case "vespertino":
      return "Equipe 2 (Vespertino)"
    case "noturno":
      return "Equipe 3 (Noturno)"
  }
}

// SolturaCard Component to display each soltura record
const SolturaCard = ({ item, onPress }) => {
  return (
    <Pressable style={styles.solturaCard} onPress={onPress}>
      <View style={styles.solturaCardHeader}>
        <View style={styles.solturaCardHeaderLeft}>
          <Text style={styles.solturaCardTitle}>{item.veiculo || "Sem veículo"}</Text>
          <Text style={styles.solturaCardSubtitle}>{item.motorista || "Sem motorista"}</Text>
        </View>
        <View style={styles.solturaCardHeaderRight}>
          <View
            style={[
              styles.solturaCardBadge,
              {
                backgroundColor: getBadgeColor(item.tipo_servico),
              },
            ]}
          >
            <Text style={styles.solturaCardBadgeText}>{item.tipo_servico || "N/A"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.solturaCardContent}>
        <View style={styles.solturaCardRow}>
          <Text style={styles.solturaCardLabel}>Data:</Text>
          <Text style={styles.solturaCardValue}>{formatDateTime(item.data_soltura)}</Text>
        </View>

        <View style={styles.solturaCardRow}>
          <Text style={styles.solturaCardLabel}>Turno:</Text>
          <Text style={styles.solturaCardValue}>{item.turno || "N/A"}</Text>
        </View>

        {item.garagem && (
          <View style={styles.solturaCardRow}>
            <Text style={styles.solturaCardLabel}>Garagem:</Text>
            <Text style={styles.solturaCardValue}>{item.garagem}</Text>
          </View>
        )}

        {item.setor && (
          <View style={styles.solturaCardRow}>
            <Text style={styles.solturaCardLabel}>Setor:</Text>
            <Text style={styles.solturaCardValue}>{item.setor}</Text>
          </View>
        )}
      </View>

      <View style={styles.viewMoreContainer}>
        <Text style={styles.viewMoreText}>Toque para ver detalhes</Text>
      </View>
    </Pressable>
  )
}

// Modal de detalhes da soltura
const SolturaDetailModal = ({ visible, item, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose()
    })
  }

  if (!visible || !item) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Detalhes da Soltura</Text>
              <View
                style={[
                  styles.modalBadge,
                  {
                    backgroundColor: getBadgeColor(item.tipo_servico),
                  },
                ]}
              >
                <Text style={styles.modalBadgeText}>{item.tipo_servico || "N/A"}</Text>
              </View>
            </View>
            <View style={styles.modalHeaderUnderline} />
          </View>

          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Informações Gerais</Text>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Veículo:</Text>
                <Text style={styles.modalValue}>{item.veiculo || "N/A"}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Motorista:</Text>
                <Text style={styles.modalValue}>{item.motorista || "N/A"}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Data:</Text>
                <Text style={styles.modalValue}>{formatDateTime(item.data_soltura)}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Turno:</Text>
                <Text style={styles.modalValue}>{item.turno || "N/A"}</Text>
              </View>

              {item.equipe && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Equipe:</Text>
                  <Text style={styles.modalValue}>{getEquipeLabel(item.equipe)}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Horários</Text>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Entrega Chave:</Text>
                <Text style={styles.modalValue}>{item.hora_entrega_chave || "N/A"}</Text>
              </View>

              {item.hora_saida_frota && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Saída Frota:</Text>
                  <Text style={styles.modalValue}>{item.hora_saida_frota}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Localização</Text>

              {item.garagem && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Garagem:</Text>
                  <Text style={styles.modalValue}>{item.garagem}</Text>
                </View>
              )}

              {item.setor && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Setor:</Text>
                  <Text style={styles.modalValue}>{item.setor}</Text>
                </View>
              )}

              {item.rotas && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Rota:</Text>
                  <Text style={styles.modalValue}>{item.rotas}</Text>
                </View>
              )}

              {item.frequencia && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Frequência:</Text>
                  <Text style={styles.modalValue}>{item.frequencia}</Text>
                </View>
              )}
            </View>

            {item.coletores && item.coletores.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Equipe</Text>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Coletores:</Text>
                  <Text style={styles.modalValue}>
                    {Array.isArray(item.coletores) ? item.coletores.join(", ") : item.coletores}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={handleClose}>
            <Text style={styles.modalCloseButtonText}>Fechar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Main Component
const FormularioHistorico = ({ navigation }) => {
  // Remove the header from React Navigation
  React.useEffect(() => {
    navigation?.setOptions?.({
      headerShown: false, // This will hide the header from React Navigation
    })
  }, [navigation])

  // State for filters
  const [tipoServico, setTipoServico] = useState("Todos")
  const [turno, setTurno] = useState("Todos")

  // State for data
  const [solturas, setSolturas] = useState([])
  const [filteredSolturas, setFilteredSolturas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // State for modal
  const [selectedSoltura, setSelectedSoltura] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(50)).current

  // Filter options
  const tiposServicoData = ["Todos", "Coleta", "Seletiva", "Varrição", "Remoção"]
  const turnosData = ["Todos", "Diurno", "Noturno"]

  // Get device dimensions
  const { width } = Dimensions.get("window")
  const orientation = useOrientation()
  const isLandscape = orientation === "LANDSCAPE"
  const deviceType = getDeviceType()
  const isTablet = deviceType === "tablet"

  // Load data on component mount
  useEffect(() => {
    fetchSolturas()
  }, [])

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters()
  }, [tipoServico, turno, solturas])

  // Animate component entry
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Fetch soltura data from API
  const fetchSolturas = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Usar a função getSolturas do SolturaService
      const response = await SolturaService.getSolturas()
      console.log("Solturas recebidas:", response)
      setSolturas(response)
      setFilteredSolturas(response)
    } catch (error) {
      console.error("Erro ao buscar solturas:", error)
      setError("Falha ao carregar histórico. Verifique sua conexão e tente novamente.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Apply filters to the data
  const applyFilters = () => {
    if (!solturas || solturas.length === 0) return

    let filtered = [...solturas]

    // Filter by tipo_servico
    if (tipoServico && tipoServico !== "Todos") {
      filtered = filtered.filter((item) => item.tipo_servico === tipoServico)
    }

    // Filter by turno
    if (turno && turno !== "Todos") {
      filtered = filtered.filter((item) => item.turno === turno)
    }

    setFilteredSolturas(filtered)
  }

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSolturas()
  }

  // Clear all filters
  const clearFilters = () => {
    setTipoServico("Todos")
    setTurno("Todos")
  }

  // Navigate back to form
  const navigateToForm = () => {
    navigation?.navigate("Formulario")
  }

  // Open modal with soltura details
  const openSolturaDetails = (item) => {
    setSelectedSoltura(item)
    setModalVisible(true)
  }

  // Close modal
  const closeModal = () => {
    setModalVisible(false)
    setSelectedSoltura(null)
  }

  // Calculate container width based on device
  const getContainerWidth = () => {
    if (isTablet) {
      return isLandscape ? width * 0.9 : width * 0.8
    }
    return isLandscape ? width * 0.8 : width * 0.9
  }

  // Render loading state
  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </SafeAreaView>
    )
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erro ao carregar</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchSolturas}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Soltura</Text>
        <View style={styles.headerUnderline} />
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            width: getContainerWidth(),
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <View style={styles.filtersContainer}>
          <View style={styles.filtersSectionHeader}>
            <Text style={styles.filtersSectionTitle}>Filtros</Text>
            <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersButtonText}>Limpar filtros</Text>
            </Pressable>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Tipo de Serviço</Text>
            <View style={styles.filterChipsVerticalContainer}>
              {tiposServicoData.map((option) => (
                <FilterChip
                  key={option}
                  label={option}
                  selected={tipoServico === option}
                  onPress={() => setTipoServico(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Turno</Text>
            <View style={styles.filterChipsContainer}>
              {turnosData.map((option) => (
                <FilterChip key={option} label={option} selected={turno === option} onPress={() => setTurno(option)} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Resultados</Text>
            <Text style={styles.resultsCount}>{filteredSolturas.length} registros encontrados</Text>
          </View>

          <FlatList
            data={filteredSolturas}
            renderItem={({ item }) => <SolturaCard item={item} onPress={() => openSolturaDetails(item)} />}
            keyExtractor={(item, index) => `soltura-${index}`}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>Nenhum registro encontrado</Text>
                <Text style={styles.emptyListSubtext}>Tente ajustar os filtros ou adicione novos registros</Text>
              </View>
            }
          />
        </View>

        <Pressable style={styles.backButton} onPress={navigateToForm}>
          <Text style={styles.backButtonText}>Voltar para Formulário</Text>
        </Pressable>
      </Animated.View>

      {/* Modal de detalhes da soltura */}
      <SolturaDetailModal visible={modalVisible} item={selectedSoltura} onClose={closeModal} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 25,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#2E7D32",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.05)",
    fontSize: 32,
    letterSpacing: 0.5,
  },
  headerUnderline: {
    height: 4,
    width: 80,
    backgroundColor: "#4CAF50",
    marginTop: 10,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  filtersContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
  },
  filtersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  filtersSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  clearFiltersButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  clearFiltersButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  filterSection: {
    marginBottom: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
    paddingLeft: 5,
  },
  filterChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 5,
  },
  filterChipsVerticalContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 5,
    justifyContent: "flex-start",
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterChipSelected: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4CAF50",
  },
  filterChipText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
  },
  resultsList: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyListSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  solturaCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  solturaCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingBottom: 12,
  },
  solturaCardHeaderLeft: {
    flex: 1,
  },
  solturaCardHeaderRight: {
    flexDirection: "row",
  },
  solturaCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  solturaCardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  solturaCardBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
  },
  solturaCardBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  solturaCardContent: {
    marginTop: 5,
  },
  solturaCardRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  solturaCardLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  solturaCardValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  viewMoreContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  viewMoreText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  backButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    width: "85%",
    maxWidth: 500,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  modalHeaderUnderline: {
    height: 3,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 1.5,
  },
  modalBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
  },
  modalBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalScrollView: {
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  modalLabel: {
    width: 120,
    fontSize: 15,
    fontWeight: "bold",
    color: "#555",
  },
  modalValue: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  modalCloseButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default FormularioHistorico
