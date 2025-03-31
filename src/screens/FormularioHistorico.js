"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  PixelRatio,
  Platform,
  Modal,
  ScrollView,
  Animated,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native"
// Add useFocusEffect import
import { useNavigation, useFocusEffect } from "@react-navigation/native"

// Reutilizando as funções de responsividade do formulário
const getDeviceType = () => {
  const { width, height } = Dimensions.get("window")
  const screenSize = Math.min(width, height)

  if (screenSize >= 768) return "tablet"
  if (screenSize >= 414) return "largePhone"
  if (screenSize >= 375) return "mediumPhone"
  return "smallPhone"
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

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
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

const getButtonHeight = () => {
  const deviceType = getDeviceType()
  const { height } = Dimensions.get("window")

  switch (deviceType) {
    case "tablet":
      return height * 0.075
    case "largePhone":
      return height * 0.07
    case "mediumPhone":
      return height * 0.065
    case "smallPhone":
      return height * 0.06
    default:
      return height * 0.065
  }
}

// Função para obter padding responsivo
const getResponsivePadding = () => {
  const deviceType = getDeviceType()

  switch (deviceType) {
    case "tablet":
      return 24
    case "largePhone":
      return 20
    case "mediumPhone":
      return 16
    case "smallPhone":
      return 12
    default:
      return 16
  }
}

// Componente para o botão com efeito de ripple
const RippleButton = ({ onPress, style, textStyle, children, icon }) => {
  const [rippleAnim] = useState(new Animated.Value(0))
  const [rippleScale] = useState(new Animated.Value(0))

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.timing(rippleAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  })

  return (
    <TouchableOpacity
      style={[styles.rippleButton, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.rippleEffect,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
      <View style={styles.buttonContent}>
        {icon && <View style={styles.buttonIcon}>{icon}</View>}
        <Text style={[styles.buttonText, textStyle]}>{children}</Text>
      </View>
    </TouchableOpacity>
  )
}

// Modify the Autocomplete component to fix the issue with typing and selecting collaborators
const Autocomplete = ({ options, value, onChangeText, onSelect, placeholder, style, id }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // Generate a unique ID for this autocomplete instance if not provided
  const autocompleteId = useRef(id || `autocomplete-${Math.random().toString(36).substr(2, 9)}`).current

  // Simple filtered options - no state to avoid re-renders
  const getFilteredOptions = () => {
    if (value.trim() === "") {
      return options
    }
    return options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
  }

  const handleFocus = () => {
    setIsFocused(true)
    setShowDropdown(true)
  }

  const handleBlur = () => {
    // Longer delay to allow dropdown item selection
    setTimeout(() => {
      setIsFocused(false)
      setShowDropdown(false)
    }, 300)
  }

  const handleTextChange = (text) => {
    onChangeText(text)
    // Show dropdown when typing
    setShowDropdown(true)
  }

  const handleSelectItem = (item) => {
    onSelect(item)
    // Don't close dropdown immediately to prevent flickering
    setTimeout(() => {
      setShowDropdown(false)
      inputRef.current?.blur()
    }, 100)
  }

  // Get filtered options only when needed
  const filteredOptions = showDropdown ? getFilteredOptions() : []

  return (
    <View style={[styles.autocompleteContainer, style]}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        {value ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onChangeText("")
              inputRef.current?.focus()
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dropdownIconButton}
            onPress={() => {
              if (showDropdown) {
                setShowDropdown(false)
              } else {
                inputRef.current?.focus()
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && filteredOptions.length > 0 && (
        <View style={styles.dropdownList}>
          <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll} keyboardShouldPersistTaps="always">
            {filteredOptions.map((item, index) => (
              <TouchableOpacity
                key={`${autocompleteId}-${index}`}
                style={[styles.dropdownItem, { paddingVertical: 12 }]}
                onPress={() => handleSelectItem(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, item === value && styles.dropdownItemTextSelected]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

// Modify the RotaDetailModal component to fix the team modal
const RotaDetailModal = ({ isVisible, rota, onClose, onSave }) => {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.9))
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const isSmallScreen = screenWidth < 360
  const padding = getResponsivePadding()

  // Estados para os campos editáveis
  const [isEditing, setIsEditing] = useState(false)
  const [editedRota, setEditedRota] = useState(null)
  const [originalRota, setOriginalRota] = useState(null)
  const [autoObservacoes, setAutoObservacoes] = useState("")
  const [newColetor, setNewColetor] = useState("")

  // Lista de motoristas, veículos e coletores para os autocompletes
  const motoristas = ["João Silva", "Maria Oliveira", "Pedro Santos", "Ana Costa", "Carlos Ferreira"]
  const prefixos = ["ABC-1234", "DEF-5678", "GHI-9012", "JKL-3456", "MNO-7890"]
  const todosColetores = [
    "Pedro Santos",
    "Ana Costa",
    "João Silva",
    "Maria Oliveira",
    "Carlos Ferreira",
    "Roberto Alves",
    "Fernanda Lima",
    "Marcelo Souza",
    "Juliana Pereira",
  ]

  // Create z-index values for each section to prevent overlap
  const vehicleInfoZIndex = 50
  const teamZIndex = 40
  const contactZIndex = 30
  const observationsZIndex = 20

  // Inicializar os estados quando o modal é aberto
  useEffect(() => {
    if (rota && isVisible) {
      setEditedRota({ ...rota })
      setOriginalRota({ ...rota })
      setAutoObservacoes("")
      setIsEditing(false)
      setNewColetor("")
    }
  }, [rota, isVisible])

  // Atualizar observações automaticamente quando houver mudanças
  useEffect(() => {
    if (editedRota && originalRota) {
      const newObservacoes = []

      // Verificar mudança de motorista
      if (editedRota.motorista !== originalRota.motorista) {
        newObservacoes.push(`Alteração de motorista: ${originalRota.motorista} → ${editedRota.motorista}`)
      }

      // Verificar mudança de veículo (prefixo)
      if (editedRota.prefixo !== originalRota.prefixo) {
        newObservacoes.push(`Alteração de veículo: ${originalRota.prefixo} → ${editedRota.prefixo}`)
      }

      // Verificar mudanças nos coletores
      const originalColetoresSet = new Set(originalRota.coletores)
      const editedColetoresSet = new Set(editedRota.coletores)

      // Coletores removidos
      const removidos = originalRota.coletores.filter((c) => !editedColetoresSet.has(c))
      if (removidos.length > 0) {
        newObservacoes.push(`Coletor(es) removido(s): ${removidos.join(", ")}`)
      }

      // Coletores adicionados
      const adicionados = editedRota.coletores.filter((c) => !originalColetoresSet.has(c))
      if (adicionados.length > 0) {
        newObservacoes.push(`Coletor(es) adicionado(s): ${adicionados.join(", ")}`)
      }

      setAutoObservacoes(newObservacoes.join("\n"))
    }
  }, [editedRota, originalRota])

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [isVisible])

  if (!editedRota) return null

  // Calcular altura máxima do modal com base na altura da tela
  const maxModalHeight = screenHeight * 0.8

  // Modify the addColetor function to handle selection better
  const addColetor = (value) => {
    if ((value || newColetor) && !editedRota.coletores.includes(value || newColetor)) {
      setEditedRota({
        ...editedRota,
        coletores: [...editedRota.coletores, value || newColetor],
      })
      setNewColetor("")
    }
  }

  // Função para remover um coletor
  const removeColetor = (index) => {
    const newColetores = [...editedRota.coletores]
    newColetores.splice(index, 1)
    setEditedRota({
      ...editedRota,
      coletores: newColetores,
    })
  }

  // Função para salvar as alterações
  const handleSave = () => {
    // Validate required fields
    if (!editedRota.motorista || !editedRota.prefixo) {
      // Show alert or handle empty fields
      alert("Os campos Motorista e Prefixo são obrigatórios.")
      return
    }

    // Combinar observações existentes com as automáticas
    let finalObservacoes = editedRota.observacoes || ""

    if (autoObservacoes) {
      if (finalObservacoes) {
        finalObservacoes += "\n\n" + autoObservacoes
      } else {
        finalObservacoes = autoObservacoes
      }
    }

    const updatedRota = {
      ...editedRota,
      observacoes: finalObservacoes,
    }

    onSave(updatedRota)
    setIsEditing(false)
  }

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditedRota({ ...originalRota })
    setIsEditing(false)
  }

  // Calculate modal width based on screen size
  const modalWidth = screenWidth > 500 ? 500 : screenWidth * 0.92

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalKeyboardAvoid}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                width: modalWidth,
                maxHeight: maxModalHeight,
              },
            ]}
          >
            <View style={styles.modalHeaderGradient}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isSmallScreen && { fontSize: normalize(16) }]}>
                  {isEditing ? "Editar Rota" : "Detalhes da Rota"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={[styles.modalContent, { maxHeight: maxModalHeight * 0.7 }]}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={[styles.modalContentContainer, { padding: padding }]}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.modalSection, { zIndex: vehicleInfoZIndex }]}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data:</Text>
                  <Text style={styles.detailValue}>{editedRota.data}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hora:</Text>
                  <Text style={styles.detailValue}>{editedRota.hora}</Text>
                </View>
              </View>

              <View style={[styles.modalSection, { zIndex: vehicleInfoZIndex }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Informações do Veículo</Text>
                  {!isEditing && (
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Motorista:</Text>
                  {isEditing ? (
                    <Autocomplete
                      id="motorista-autocomplete"
                      options={motoristas}
                      value={editedRota.motorista}
                      onChangeText={(text) => setEditedRota({ ...editedRota, motorista: text })}
                      onSelect={(value) => setEditedRota({ ...editedRota, motorista: value })}
                      placeholder="Selecione o motorista"
                      style={styles.editAutocomplete}
                    />
                  ) : (
                    <Text style={styles.detailValue}>{editedRota.motorista}</Text>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prefixo:</Text>
                  {isEditing ? (
                    <Autocomplete
                      id="prefixo-autocomplete"
                      options={prefixos}
                      value={editedRota.prefixo}
                      onChangeText={(text) => setEditedRota({ ...editedRota, prefixo: text })}
                      onSelect={(value) => setEditedRota({ ...editedRota, prefixo: value })}
                      placeholder="Selecione o prefixo"
                      style={styles.editAutocomplete}
                    />
                  ) : (
                    <Text style={styles.detailValue}>{editedRota.prefixo}</Text>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Setor:</Text>
                  <Text style={styles.detailValue}>{editedRota.setor}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Frequência:</Text>
                  <Text style={styles.detailValue}>{editedRota.frequencia || "Diária"}</Text>
                </View>
              </View>

              <View style={[styles.modalSection, { zIndex: teamZIndex }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Equipe</Text>
                </View>

                {isEditing && (
                  <View style={styles.addColetorContainer}>
                    <Autocomplete
                      id="coletor-autocomplete"
                      options={todosColetores.filter((c) => !editedRota.coletores.includes(c))}
                      value={newColetor}
                      onChangeText={setNewColetor}
                      onSelect={(value) => {
                        addColetor(value)
                      }}
                      placeholder="Adicionar coletor"
                      style={styles.coletorAutocomplete}
                    />
                    <TouchableOpacity
                      style={styles.addColetorButton}
                      onPress={() => addColetor()}
                      disabled={!newColetor || editedRota.coletores.includes(newColetor)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <View style={styles.plusIcon}>
                        <View style={styles.plusHorizontal} />
                        <View style={styles.plusVertical} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.coletoresList}>
                  {editedRota.coletores.map((coletor, index) => (
                    <View key={index} style={styles.coletorItem}>
                      <Text style={styles.coletorText}>{coletor}</Text>
                      {isEditing && (
                        <TouchableOpacity style={styles.removeColetorButton} onPress={() => removeColetor(index)}>
                          <View style={styles.minusIcon}>
                            <View style={styles.minusHorizontal} />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.modalSection, { zIndex: contactZIndex }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Contato</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Celular:</Text>
                  <Text style={styles.detailValue}>{editedRota.celular || "(XX) XXXXX-XXXX"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Líder:</Text>
                  <Text style={styles.detailValue}>{editedRota.lider || "Não informado"}</Text>
                </View>
              </View>

              <View style={[styles.modalSection, { zIndex: observationsZIndex }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Observações</Text>
                </View>

                {isEditing ? (
                  <TextInput
                    style={styles.observacoesInput}
                    multiline
                    value={editedRota.observacoes}
                    onChangeText={(text) => setEditedRota({ ...editedRota, observacoes: text })}
                    placeholder="Adicione observações aqui"
                  />
                ) : (
                  <View style={styles.observacoesContainer}>
                    <Text style={styles.observacoesText}>
                      {editedRota.observacoes || "Nenhuma observação registrada"}
                    </Text>
                  </View>
                )}

                {isEditing && autoObservacoes && (
                  <View style={styles.autoObservacoesContainer}>
                    <Text style={styles.autoObservacoesTitle}>Alterações detectadas:</Text>
                    <Text style={styles.autoObservacoesText}>{autoObservacoes}</Text>
                    <Text style={styles.autoObservacoesNote}>
                      Estas alterações serão adicionadas automaticamente às observações ao salvar.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { padding: padding }]}>
              {isEditing ? (
                <View style={styles.editButtonsRow}>
                  <RippleButton
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    onPress={handleCancelEdit}
                  >
                    CANCELAR
                  </RippleButton>
                  <RippleButton style={styles.saveButton} textStyle={styles.saveButtonText} onPress={handleSave}>
                    SALVAR
                  </RippleButton>
                </View>
              ) : (
                <RippleButton style={styles.modalButton} textStyle={styles.modalButtonText} onPress={onClose}>
                  FECHAR
                </RippleButton>
              )}
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// Modify the HistoricoSoltura component to remove the native header and fix navigation
export default function HistoricoSoltura() {
  const navigation = useNavigation()
  const [selectedRota, setSelectedRota] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [rotasData, setRotasData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const isSmallScreen = screenWidth < 360
  const padding = getResponsivePadding()

  // Obter a data atual formatada
  const getCurrentDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Inicializar dados de exemplo
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true)

    setTimeout(() => {
      const currentDate = getCurrentDate()
      const initialData = [
        {
          id: "1",
          data: currentDate,
          hora: "08:30",
          motorista: "João Silva",
          prefixo: "ABC-1234",
          setor: "Norte",
          coletores: ["Pedro Santos", "Ana Costa"],
          frequencia: "Diária",
          celular: "(62) 98765-4321",
          lider: "Roberto Alves",
          observacoes: "Rota iniciada sem intercorrências",
        },
        {
          id: "2",
          data: currentDate,
          hora: "09:15",
          motorista: "Maria Oliveira",
          prefixo: "DEF-5678",
          setor: "Sul",
          coletores: ["Carlos Ferreira"],
          frequencia: "Semanal",
          celular: "(62) 91234-5678",
          lider: "Fernanda Lima",
          observacoes: "Atraso devido a congestionamento",
        },
        {
          id: "3",
          data: currentDate,
          hora: "10:45",
          motorista: "Pedro Santos",
          prefixo: "GHI-9012",
          setor: "Leste",
          coletores: ["Ana Costa", "João Silva", "Maria Oliveira"],
          frequencia: "Diária",
          celular: "(62) 99876-5432",
          lider: "Marcelo Souza",
          observacoes: "",
        },
        {
          id: "4",
          data: currentDate,
          hora: "11:30",
          motorista: "Ana Costa",
          prefixo: "JKL-3456",
          setor: "Oeste",
          coletores: ["Carlos Ferreira", "Pedro Santos"],
          frequencia: "Quinzenal",
          celular: "(62) 98888-7777",
          lider: "Juliana Pereira",
          observacoes: "Veículo precisou de manutenção durante o percurso",
        },
        {
          id: "5",
          data: currentDate,
          hora: "13:00",
          motorista: "Carlos Ferreira",
          prefixo: "MNO-7890",
          setor: "Centro",
          coletores: ["João Silva"],
          frequencia: "Diária",
          celular: "(62) 97777-8888",
          lider: "Roberto Alves",
          observacoes: "",
        },
      ]
      setRotasData(initialData)
      setIsLoading(false)
    }, 1500)
  }, [])

  const openModal = (rota) => {
    setSelectedRota(rota)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedRota(null)
  }

  // Função para salvar as alterações da rota
  const saveRotaChanges = (updatedRota) => {
    const updatedRotas = rotasData.map((rota) => (rota.id === updatedRota.id ? updatedRota : rota))
    setRotasData(updatedRotas)
    setModalVisible(false)
  }

  // Add useFocusEffect to remove the native header
  useFocusEffect(
    React.useCallback(() => {
      if (navigation && navigation.setOptions) {
        navigation.setOptions({
          headerShown: false,
          header: () => null,
          title: null,
        })
      }

      // Configure StatusBar correctly
      StatusBar.setBarStyle("dark-content")
      if (Platform.OS === "android") {
        StatusBar.setTranslucent(true)
        StatusBar.setBackgroundColor("transparent")
        StatusBar.setHidden(false)
      }

      return () => {
        // Restore default settings when leaving the screen, if needed
      }
    }, [navigation]),
  )

  // Fix the navigation function
  const navigateToFormulario = () => {
    navigation.navigate("Formulario")
  }

  // Renderização adaptativa para telas pequenas
  const getTableColumns = () => {
    if (isSmallScreen) {
      return [
        { key: "hora", title: "Hora", flex: 1 },
        { key: "motorista", title: "Motorista", flex: 2 },
        { key: "setor", title: "Setor", flex: 1 },
      ]
    }

    if (screenWidth < 500) {
      return [
        { key: "hora", title: "Hora", flex: 1 },
        { key: "motorista", title: "Motorista", flex: 2 },
        { key: "prefixo", title: "Prefixo", flex: 1.5 },
        { key: "setor", title: "Setor", flex: 1 },
      ]
    }

    return [
      { key: "hora", title: "Hora", flex: 1 },
      { key: "motorista", title: "Motorista", flex: 2 },
      { key: "prefixo", title: "Prefixo", flex: 1.5 },
      { key: "setor", title: "Setor", flex: 1 },
      { key: "frequencia", title: "Freq.", flex: 1 },
    ]
  }

  const renderTableHeader = () => {
    const columns = getTableColumns()

    return (
      <View style={styles.tableHeader}>
        {columns.map((column, index) => (
          <Text
            key={index}
            style={[
              styles.tableHeaderCell,
              {
                flex: column.flex,
                fontSize: normalize(isSmallScreen ? 12 : 14),
                paddingHorizontal: isSmallScreen ? 4 : 8,
              },
            ]}
          >
            {column.title}
          </Text>
        ))}
      </View>
    )
  }

  const renderTableRow = ({ item, index }) => {
    const isEven = index % 2 === 0
    const columns = getTableColumns()

    return (
      <TouchableOpacity
        style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
        onPress={() => openModal(item)}
        activeOpacity={0.7}
      >
        {columns.map((column, colIndex) => (
          <Text
            key={colIndex}
            style={[
              styles.tableCell,
              {
                flex: column.flex,
                fontSize: normalize(isSmallScreen ? 11 : 13),
                paddingHorizontal: isSmallScreen ? 4 : 8,
                ...(column.key === "setor" ? { fontWeight: "500", color: "#8BC34A" } : {}),
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item[column.key]}
          </Text>
        ))}
      </TouchableOpacity>
    )
  }

  // Calcular altura segura para o conteúdo
  const safeAreaPadding =
    Platform.OS === "ios" ? { paddingTop: 50, paddingBottom: 30 } : { paddingTop: 40, paddingBottom: 20 }

  // Render loading screen if data is still loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreenContainer}>
        <View style={styles.loadingScreenContent}>
          <ActivityIndicator size="large" color="#8BC34A" />
          <Text style={styles.loadingScreenText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: padding,
              ...safeAreaPadding,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigateToFormulario}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={[styles.backButtonText, isSmallScreen && { fontSize: normalize(22) }]}>←</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.headerTitle,
                {
                  fontSize: normalize(isSmallScreen ? 18 : 22),
                },
              ]}
            >
              Histórico de Soltura de Frota
            </Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Espaço vazio para equilibrar o cabeçalho */}
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={[styles.dateContainer, { paddingHorizontal: padding }]}>
        <Text style={[styles.dateText, isSmallScreen && { fontSize: normalize(12) }]}>Data: {getCurrentDate()}</Text>
      </View>

      <View
        style={[
          styles.content,
          {
            padding: padding,
            paddingBottom: Math.max(padding, 10), // Garantir padding mínimo na parte inferior
          },
        ]}
      >
        <View style={styles.tableContainer}>
          {renderTableHeader()}
          <FlatList
            data={rotasData}
            keyExtractor={(item) => item.id}
            renderItem={renderTableRow}
            contentContainerStyle={styles.tableContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={[styles.buttonContainer, { marginBottom: isSmallScreen ? 10 : 20 }]}>
          <RippleButton
            style={[
              styles.backToFormButton,
              {
                height: getButtonHeight(),
                marginTop: isSmallScreen ? 10 : 20,
              },
            ]}
            textStyle={[styles.backToFormButtonText, { fontSize: normalize(isSmallScreen ? 13 : 15) }]}
            onPress={navigateToFormulario}
          >
            VOLTAR PARA O FORMULÁRIO
          </RippleButton>
        </View>
      </View>

      <RotaDetailModal isVisible={modalVisible} rota={selectedRota} onClose={closeModal} onSave={saveRotaChanges} />
    </SafeAreaView>
  )
}

// Adicionar estilos para prevenir flickering e melhorar a interação com o modal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
  },
  titleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#8BC34A",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
  },
  titleUnderline: {
    height: 3,
    width: 60,
    backgroundColor: "#8BC34A",
    marginTop: 8,
    borderRadius: 1.5,
  },
  backButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: normalize(24),
    color: "#8BC34A",
    fontWeight: "bold",
  },
  dateContainer: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateText: {
    fontSize: normalize(14),
    color: "#666",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: "#555",
  },
  tableContent: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableRowEven: {
    backgroundColor: "#fff",
  },
  tableRowOdd: {
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    color: "#333",
  },
  buttonContainer: {
    marginTop: 10,
  },
  rippleButton: {
    overflow: "hidden",
    position: "relative",
    borderRadius: 12,
  },
  rippleEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  buttonIcon: {
    fontSize: normalize(18),
    marginRight: 8,
    color: "white",
  },
  buttonText: {
    fontWeight: "bold",
    letterSpacing: 1,
  },
  backToFormButton: {
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backToFormButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // Modal styles
  modalKeyboardAvoid: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeaderGradient: {
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#8BC34A",
  },
  closeButton: {
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: normalize(16),
    color: "#666",
    fontWeight: "bold",
  },
  modalContent: {
    flexGrow: 0,
    maxHeight: "70%", // Ensure modal content doesn't overflow
  },
  modalContentContainer: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
    position: "relative",
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: "600",
    color: "#8BC34A",
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: normalize(14),
    fontWeight: "bold",
    color: "#555",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: normalize(16),
    color: "#333",
  },
  coletoresList: {
    marginTop: 5,
    zIndex: 1,
  },
  coletorItem: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#8BC34A",
    flexDirection: "row",
    alignItems: "center",
  },
  coletorText: {
    fontSize: normalize(14),
    color: "#333",
    flex: 1,
  },
  observacoesContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#8BC34A",
  },
  observacoesText: {
    fontSize: normalize(14),
    color: "#333",
    lineHeight: normalize(20),
  },
  modalFooter: {
    padding: 15,
    paddingTop: 0,
  },
  modalButton: {
    backgroundColor: "#8BC34A",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    width: "100%",
    alignSelf: "center",
    marginTop: 5,
    marginBottom: 5,
    height: 45,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: normalize(14),
    letterSpacing: 0.5,
  },
  // Estilos para edição
  editButton: {
    backgroundColor: "#8BC34A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(12),
  },
  // Estilos para o autocomplete
  autocompleteContainer: {
    position: "relative",
    marginBottom: 10,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#666",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    height: 40,
  },
  inputContainerFocused: {
    borderColor: "#8BC34A",
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: normalize(14),
    color: "#333",
  },
  clearButton: {
    padding: 5,
    zIndex: 20,
  },
  clearButtonText: {
    fontSize: normalize(16),
    color: "#999",
    fontWeight: "bold",
  },
  dropdownIconButton: {
    padding: 5,
    zIndex: 20,
  },
  dropdownIcon: {
    fontSize: normalize(12),
    color: "#999",
  },
  dropdownList: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 200, // Increased height for better visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 999,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    zIndex: 1000,
  },
  dropdownItemText: {
    fontSize: normalize(14),
    color: "#333",
  },
  dropdownItemTextSelected: {
    color: "#8BC34A",
    fontWeight: "bold",
  },
  editAutocomplete: {
    marginTop: 5,
    zIndex: 100,
  },
  addColetorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    zIndex: 100,
    position: "relative",
  },
  coletorAutocomplete: {
    flex: 1,
    marginRight: 10,
    zIndex: 100,
  },
  addColetorButton: {
    backgroundColor: "#8BC34A",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 101, // Higher than autocomplete
  },
  // Plus icon styles
  plusIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  plusHorizontal: {
    width: 14,
    height: 2,
    backgroundColor: "white",
    position: "absolute",
  },
  plusVertical: {
    width: 2,
    height: 14,
    backgroundColor: "white",
    position: "absolute",
  },
  // Minus icon styles
  minusIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  minusHorizontal: {
    width: 12,
    height: 2,
    backgroundColor: "white",
    position: "absolute",
  },
  removeColetorButton: {
    backgroundColor: "#e53935",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    zIndex: 20,
  },
  observacoesInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: normalize(14),
    color: "#333",
  },
  autoObservacoesContainer: {
    marginTop: 15,
    backgroundColor: "#FFF9C4",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FBC02D",
  },
  autoObservacoesTitle: {
    fontWeight: "bold",
    fontSize: normalize(14),
    color: "#333",
    marginBottom: 5,
  },
  autoObservacoesText: {
    fontSize: normalize(14),
    color: "#333",
    marginBottom: 8,
  },
  autoObservacoesNote: {
    fontSize: normalize(12),
    color: "#666",
    fontStyle: "italic",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    height: 45,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: normalize(14),
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: "#8BC34A",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    width: "48%",
    height: 45,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: normalize(14),
    letterSpacing: 0.5,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  // Loading screen styles
  loadingScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingScreenContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingScreenText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})

