"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
  PixelRatio,
  useWindowDimensions,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { SolturaService } from "../api/soltura"

// Função para calcular tamanhos responsivos baseados no tipo de dispositivo
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

// Função para normalizar tamanhos de texto
const normalize = (size) => {
  const deviceType = getDeviceType()
  const { width: SCREEN_WIDTH } = Dimensions.get("window")

  // Ajuste de escala baseado no tipo de dispositivo
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

// Funções para calcular alturas de elementos baseadas no tamanho da tela
const getInputHeight = () => {
  const deviceType = getDeviceType()
  const { height } = Dimensions.get("window")

  switch (deviceType) {
    case "tablet":
      return height * 0.07
    case "largePhone":
      return height * 0.065
    case "mediumPhone":
      return height * 0.06
    case "smallPhone":
      return height * 0.055
    default:
      return height * 0.06
  }
}

// Aumentar a altura dos botões
const getButtonHeight = () => {
  const deviceType = getDeviceType()
  const { height } = Dimensions.get("window")

  switch (deviceType) {
    case "tablet":
      return height * 0.085
    case "largePhone":
      return height * 0.08
    case "mediumPhone":
      return height * 0.075
    case "smallPhone":
      return height * 0.07
    default:
      return height * 0.075
  }
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

// Componente TouchableArea para melhorar a resposta ao toque
const TouchableArea = ({ onPress, style, children, hitSlop = { top: 15, bottom: 15, left: 15, right: 15 } }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        style,
        {
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      hitSlop={hitSlop}
      android_ripple={{ color: "rgba(0, 0, 0, 0.1)", borderless: false }}
    >
      {children}
    </Pressable>
  )
}

// Ripple melhorado com resposta imediata ao toque
const Ripple = ({ style, onPress, children }) => {
  const [rippleVisible, setRippleVisible] = useState(false)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
  const rippleAnim = useRef(new Animated.Value(0)).current

  const handlePressIn = (event) => {
    const { locationX, locationY } = event.nativeEvent
    setRipplePosition({ x: locationX, y: locationY })
    setRippleVisible(true)
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 200, // Reduced for faster feedback
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()

    // Execute onPress immediately for better responsiveness
    if (onPress) onPress()
  }

  const handlePressOut = () => {
    Animated.timing(rippleAnim, {
      toValue: 0,
      duration: 150, // Reduced for faster feedback
      useNativeDriver: true,
    }).start(() => {
      setRippleVisible(false)
    })
  }

  const rippleSize = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  })

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  })

  return (
    <Pressable
      style={[styles.rippleContainer, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: "rgba(255, 255, 255, 0.3)", borderless: false }}
    >
      {children}
      {rippleVisible && (
        <Animated.View
          style={[
            styles.ripple,
            {
              left: ripplePosition.x - rippleSize._value / 2,
              top: ripplePosition.y - rippleSize._value / 2,
              width: rippleSize,
              height: rippleSize,
              borderRadius: rippleSize._value / 2,
              opacity: rippleOpacity,
            },
          ]}
        />
      )}
    </Pressable>
  )
}

// Contexto para controlar qual autocomplete está aberto
const ActiveAutocompleteContext = React.createContext(null)

// Provider para o contexto
const ActiveAutocompleteProvider = ({ children }) => {
  const [activeAutocomplete, setActiveAutocomplete] = useState(null)
  return (
    <ActiveAutocompleteContext.Provider value={{ activeAutocomplete, setActiveAutocomplete }}>
      {children}
    </ActiveAutocompleteContext.Provider>
  )
}

// Hook para usar o contexto
const useActiveAutocomplete = () => {
  const context = React.useContext(ActiveAutocompleteContext)
  if (!context) {
    // Fallback para quando o componente não está dentro do provider
    return { activeAutocomplete: null, setActiveAutocomplete: () => {} }
  }
  return context
}

// Autocomplete modificado para manter o dropdown aberto até o usuário selecionar um item
const Autocomplete = ({ data, value, onChangeText, onSelect, placeholder, label, error, zIndex = 1, id }) => {
  const [filteredData, setFilteredData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const { activeAutocomplete, setActiveAutocomplete } = useActiveAutocomplete()
  const dropdownAnim = useRef(new Animated.Value(0)).current
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const touchableRef = useRef(null)

  // Atualiza dados filtrados quando o valor muda
  useEffect(() => {
    if (value) {
      // FIX: Check if data is an array and filter only if it is
      if (Array.isArray(data)) {
        const filtered = data.filter(
          (item) => item && typeof item === "string" && item.toLowerCase().includes(value.toLowerCase()),
        )
        setFilteredData(filtered)

        // Mantenha o dropdown aberto se houver dados filtrados
        if (filtered.length > 0 && isFocused) {
          setShowDropdown(true)
          setActiveAutocomplete(id)
        }
      } else {
        setFilteredData([])
      }
    } else {
      setFilteredData([])
    }
  }, [value, data, isFocused])

  // Fecha o dropdown quando outro autocomplete é aberto
  useEffect(() => {
    if (activeAutocomplete !== id) {
      setShowDropdown(false)
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 100, // Reduced for faster response
        useNativeDriver: false,
      }).start()
    }
  }, [activeAutocomplete, id])

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || value ? 1 : 0,
      duration: 100, // Reduced for faster response
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, value, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 100, // Reduced for faster response
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showDropdown && filteredData.length > 0 ? 1 : 0,
      duration: 100, // Reduced for faster response
      useNativeDriver: false,
    }).start()
  }, [showDropdown, filteredData])

  const handleTextChange = (text) => {
    onChangeText(text)
    if (text.length > 0) {
      setShowDropdown(true)
      setActiveAutocomplete(id)
    } else {
      setShowDropdown(false)
    }
  }

  const handleSelect = (item) => {
    onSelect(item)
    setShowDropdown(false)
    setActiveAutocomplete(null)
    // Blur the input after selection for better UX
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    // FIX: Check if value exists before checking its length
    if (value && value.length > 0 && filteredData.length > 0) {
      setShowDropdown(true)
      setActiveAutocomplete(id)
    }
  }

  const handleBlur = () => {
    // Não feche o dropdown imediatamente ao perder o foco
    // Isso permite que o usuário clique em um item do dropdown
    setIsFocused(false)
  }

  const forceFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      handleFocus()
    }
  }

  // Função para lidar com cliques fora do dropdown
  const handleOutsideClick = (e) => {
    // Implementação para web/mobile
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setShowDropdown(false)
    }
  }

  // Adiciona listener para cliques fora do dropdown
  useEffect(() => {
    if (Platform.OS === "web") {
      document.addEventListener("mousedown", handleOutsideClick)
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick)
      }
    }
  }, [])

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12], // Reduced placeholder text size
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#8BC34A"],
    }),
    backgroundColor: isFocused ? "white" : "transparent",
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  }

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ddd", "#8BC34A"],
  })

  const dropdownMaxHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  })

  const dropdownOpacity = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  // Renderização dos itens do dropdown sem usar FlatList
  const renderDropdownItems = () => {
    return filteredData.map((item, index) => (
      <Pressable
        key={index.toString()}
        style={({ pressed }) => [styles.dropdownItem, pressed ? { backgroundColor: "#f0f0f0" } : {}]}
        onPress={() => handleSelect(item)}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)" }}
      >
        <Text style={styles.dropdownItemText}>{item}</Text>
      </Pressable>
    ))
  }

  return (
    <View ref={containerRef} style={[styles.inputWrapper, { zIndex: showDropdown ? 100 : zIndex }]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      {/* Usando Pressable para resposta imediata ao toque */}
      <Pressable
        ref={touchableRef}
        style={{ width: "100%" }}
        onPress={forceFocus}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)", borderless: false }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Animated.View
          style={[
            styles.animatedInputContainer,
            {
              borderColor,
              height: inputHeight,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.animatedInput, { pointerEvents: "auto", fontSize: 16 }]} // Reduced font size
            placeholder={isFocused ? placeholder : ""}
            placeholderTextColor="#999"
            value={value}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {value && value.length > 0 && (
            <Pressable
              style={[styles.clearButton, { padding: 15 }]} // Larger touch target
              onPress={() => {
                onChangeText("")
                setShowDropdown(false)
                // Re-focus the input after clearing
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }, 10)
              }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </Pressable>
          )}
        </Animated.View>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Dropdown que permanece aberto até o usuário selecionar um item */}
      {showDropdown && filteredData.length > 0 && (
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              maxHeight: dropdownMaxHeight,
              opacity: dropdownOpacity,
            },
          ]}
        >
          <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
            {renderDropdownItems()}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  )
}

// ColetoresSelector reescrito para melhor resposta ao toque
const ColetoresSelector = ({ coletores, setColetores, availableColetores = [], maxColetores = 3, label, error }) => {
  const [coletor, setColetor] = useState("")
  const [filteredColetores, setFilteredColetores] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(coletores.length > 0 || coletor ? 1 : 0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const inputRef = useRef(null)
  const dropdownAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || coletores.length > 0 || coletor ? 1 : 0,
      duration: 100, // Reduced for faster response
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, coletores, coletor, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 100, // Reduced for faster response
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  useEffect(() => {
    if (coletor) {
      // FIX: Check if availableColetores is an array and filter only if it is
      if (Array.isArray(availableColetores)) {
        const filtered = availableColetores.filter(
          (item) =>
            item &&
            typeof item === "string" &&
            item.toLowerCase().includes(coletor.toLowerCase()) &&
            !coletores.includes(item),
        )
        setFilteredColetores(filtered)

        if (filtered.length > 0 && isFocused) {
          setShowDropdown(true)
        }
      } else {
        setFilteredColetores([])
      }
    } else {
      setFilteredColetores([])
      setShowDropdown(false)
    }
  }, [coletor, availableColetores, coletores])

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showDropdown && filteredColetores.length > 0 ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start()
  }, [showDropdown, filteredColetores])

  const addColetor = () => {
    if (coletor.trim() && coletores.length < maxColetores && !coletores.includes(coletor.trim())) {
      // Animação de escala ao adicionar
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      setColetores([...coletores, coletor.trim()])
      setColetor("")
      setShowDropdown(false)

      // Focus the input again after adding
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const selectColetor = (item) => {
    if (coletores.length < maxColetores && !coletores.includes(item)) {
      setColetores([...coletores, item])
      setColetor("")
      setShowDropdown(false)

      // Focus the input again after adding
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const removeColetor = (index) => {
    const newColetores = [...coletores]
    newColetores.splice(index, 1)
    setColetores(newColetores)
  }

  const forceFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      setIsFocused(true)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (coletor && coletor.length > 0 && filteredColetores.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12], // Reduced placeholder text size
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#8BC34A"],
    }),
    backgroundColor: isFocused ? "white" : "transparent",
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  }

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ddd", "#8BC34A"],
  })

  const dropdownMaxHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  })

  const dropdownOpacity = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  // Renderização dos itens do dropdown
  const renderDropdownItems = () => {
    return filteredColetores.map((item, index) => (
      <Pressable
        key={index.toString()}
        style={({ pressed }) => [styles.dropdownItem, pressed ? { backgroundColor: "#f0f0f0" } : {}]}
        onPress={() => selectColetor(item)}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)" }}
      >
        <Text style={styles.dropdownItemText}>{item}</Text>
      </Pressable>
    ))
  }

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      <Pressable
        style={{ width: "100%" }}
        onPress={forceFocus}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)", borderless: false }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Animated.View
          style={[
            styles.coletorInputContainer,
            {
              borderColor,
              height: inputHeight,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.animatedInput, { flex: 1, fontSize: 16 }]} // Reduced font size
            placeholder={isFocused ? "Nome do coletor" : ""}
            placeholderTextColor="#999"
            value={coletor}
            onChangeText={setColetor}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Pressable
            style={[
              styles.addButton,
              {
                opacity: coletores.length >= maxColetores ? 0.5 : 1,
                width: getResponsiveSize(40), // Increased size
                height: getResponsiveSize(40), // Increased size
                borderRadius: getResponsiveSize(20), // Increased size
                padding: 10, // Added padding for larger touch area
              },
            ]}
            onPress={addColetor}
            disabled={coletores.length >= maxColetores}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            android_ripple={{ color: "rgba(255, 255, 255, 0.3)", borderless: false }}
          >
            <Text style={[styles.addButtonText, { fontSize: normalize(20) }]}>+</Text>
          </Pressable>
        </Animated.View>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Dropdown para seleção de coletores */}
      {showDropdown && filteredColetores.length > 0 && (
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              maxHeight: dropdownMaxHeight,
              opacity: dropdownOpacity,
            },
          ]}
        >
          <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
            {renderDropdownItems()}
          </ScrollView>
        </Animated.View>
      )}

      <Animated.View style={[styles.coletoresList, { transform: [{ scale: scaleAnim }] }]}>
        {coletores.map((item, index) => (
          <View key={index} style={styles.coletorItem}>
            <Text style={styles.coletorName}>{item}</Text>
            <Pressable
              style={[
                styles.removeButton,
                {
                  width: getResponsiveSize(32), // Increased size
                  height: getResponsiveSize(32), // Increased size
                  borderRadius: getResponsiveSize(16), // Increased size
                  padding: 5, // Added padding for larger touch area
                },
              ]}
              onPress={() => removeColetor(index)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              android_ripple={{ color: "rgba(255, 255, 255, 0.3)", borderless: false }}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </Pressable>
          </View>
        ))}
      </Animated.View>

      <Text style={styles.coletoresCount}>
        {coletores.length}/{maxColetores} coletores
      </Text>
    </View>
  )
}

// CelularInput reescrito para melhor resposta ao toque
const CelularInput = ({ value, onChangeText, label, error }) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current
  const inputRef = useRef(null)

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || value ? 1 : 0,
      duration: 100, // Reduced for faster response
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, value, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 100, // Reduced for faster response
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  const formatCelular = (text) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, "")

    // Aplica a máscara (XX) XXXXX-XXXX
    let formatted = cleaned
    if (cleaned.length <= 2) {
      formatted = cleaned
    } else if (cleaned.length <= 7) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`
    } else if (cleaned.length <= 11) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`
    } else {
      // Limita a 11 dígitos (DDD + 9 dígitos)
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`
    }

    onChangeText(formatted)
  }

  const forceFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      setIsFocused(true)
    }
  }

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12], // Reduced placeholder text size
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#8BC34A"],
    }),
    backgroundColor: "white",
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  }

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ddd", "#8BC34A"],
  })

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      <Pressable
        style={{ width: "100%" }}
        onPress={forceFocus}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)", borderless: false }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Animated.View
          style={[
            styles.animatedInputContainer,
            {
              borderColor,
              height: inputHeight,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.animatedInput, { fontSize: 16 }]} // Reduced font size
            placeholder={isFocused ? "(XX) XXXXX-XXXX" : ""}
            placeholderTextColor="#999"
            value={value}
            onChangeText={formatCelular}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="phone-pad"
            maxLength={16}
          />
        </Animated.View>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

// DateTimeSelector reescrito para melhor resposta ao toque
const DateTimeSelector = ({ date, setDate, label, error }) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(date ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || date ? 1 : 0,
      duration: 100, // Reduced for faster response
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, date, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 100, // Reduced for faster response
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  const formatDateTime = (date) => {
    if (!date) return ""

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const currentDate = new Date(date || new Date())
      currentDate.setFullYear(selectedDate.getFullYear())
      currentDate.setMonth(selectedDate.getMonth())
      currentDate.setDate(selectedDate.getDate())
      setDate(currentDate)

      // Após selecionar a data, abre o seletor de hora
      setTimeout(() => {
        setShowTimePicker(true)
      }, 50) // Reduced from 100 for faster response
    }
  }

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      const currentDate = new Date(date || new Date())
      currentDate.setHours(selectedTime.getHours())
      currentDate.setMinutes(selectedTime.getMinutes())
      setDate(currentDate)
    }
  }

  const openDatePicker = () => {
    setIsFocused(true)
    setShowDatePicker(true)
  }

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12], // Reduced placeholder text size
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#8BC34A"],
    }),
    backgroundColor: "white",
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  }

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ddd", "#8BC34A"],
  })

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      <Pressable
        style={{ width: "100%" }}
        onPress={openDatePicker}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)", borderless: false }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Animated.View
          style={[
            styles.dateTimeContainer,
            {
              borderColor,
              height: inputHeight,
            },
          ]}
        >
          <Text
            style={[
              styles.dateTimeText,
              {
                color: date ? "#333" : "#999",
                fontSize: normalize(14), // Reduced font size
              },
            ]}
          >
            {date ? formatDateTime(date) : "Selecionar data e hora"}
          </Text>
          <View style={[styles.calendarIcon, { padding: 10 }]}>
            <Text style={styles.calendarIconText}>📅</Text>
          </View>
        </Animated.View>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showDatePicker && (
        <DateTimePicker value={date || new Date()} mode="date" display="default" onChange={onChangeDate} />
      )}

      {showTimePicker && (
        <DateTimePicker value={date || new Date()} mode="time" display="default" onChange={onChangeTime} />
      )}
    </View>
  )
}

// TimeSelector component for selecting only time
const TimeSelector = ({ time, setTime, label, error }) => {
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(time ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || time ? 1 : 0,
      duration: 100, // Reduced for faster response
      easing: Easing.bezier(0.4, 0.2, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, time, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 100, // Reduced for faster response
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  const formatTime = (time) => {
    if (!time) return ""

    const hours = String(time.getHours()).padStart(2, "0")
    const minutes = String(time.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
  }

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      setTime(selectedTime)
    }
  }

  const openTimePicker = () => {
    setIsFocused(true)
    setShowTimePicker(true)
  }

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12], // Reduced placeholder text size
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#8BC34A"],
    }),
    backgroundColor: "white",
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  }

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ddd", "#8BC34A"],
  })

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      <Pressable
        style={{ width: "100%" }}
        onPress={openTimePicker}
        android_ripple={{ color: "rgba(0, 0, 0, 0.05)", borderless: false }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Animated.View
          style={[
            styles.dateTimeContainer,
            {
              borderColor,
              height: inputHeight,
            },
          ]}
        >
          <Text
            style={[
              styles.dateTimeText,
              {
                color: time ? "#333" : "#999",
                fontSize: normalize(14), // Reduced font size
              },
            ]}
          >
            {time ? formatTime(time) : "Selecionar horário"}
          </Text>
          <View style={[styles.calendarIcon, { padding: 10 }]}>
            <Text style={styles.calendarIconText}>🕒</Text>
          </View>
        </Animated.View>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showTimePicker && (
        <DateTimePicker value={time || new Date()} mode="time" display="default" onChange={onChangeTime} />
      )}
    </View>
  )
}

// Modificar o SolturaInfoModal para não fechar automaticamente e adicionar mensagem de sucesso
const SolturaInfoModal = ({ visible, onClose, formData }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current
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
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose()
    })
  }

  if (!visible) return null

  const formatDateTime = (date) => {
    if (!date) return "N/A"

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const formatTime = (time) => {
    if (!time) return "N/A"

    const hours = String(time.getHours()).padStart(2, "0")
    const minutes = String(time.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
  }

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.successOverlay}>
        <Animated.View
          style={[
            styles.solturaInfoContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.solturaHeader}>
            <Text style={styles.solturaTitle}>Soltura de Frota</Text>
            <Text style={styles.solturaSuccessMessage}>Frota registrada com sucesso!</Text>
            <View style={styles.solturaHeaderUnderline} />
          </View>

          <View style={styles.solturaContent}>
            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Motorista:</Text>
              <Text style={styles.solturaValue}>{formData.motorista || "N/A"}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Prefixo:</Text>
              <Text style={styles.solturaValue}>{formData.prefixo || "N/A"}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Data/Hora:</Text>
              <Text style={styles.solturaValue}>{formatDateTime(formData.dataHora)}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Hora Entrega Chave:</Text>
              <Text style={styles.solturaValue}>{formatTime(formData.horaEntregaChave)}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Hora Saída Frota:</Text>
              <Text style={styles.solturaValue}>{formatTime(formData.horaSaidaFrota)}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Frequência:</Text>
              <Text style={styles.solturaValue}>{formData.frequencia || "N/A"}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Setor:</Text>
              <Text style={styles.solturaValue}>{formData.setor || "N/A"}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Coletores:</Text>
              <Text style={styles.solturaValue}>
                {formData.coletores && formData.coletores.length > 0 ? formData.coletores.join(", ") : "N/A"}
              </Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Celular:</Text>
              <Text style={styles.solturaValue}>{formData.celular || "N/A"}</Text>
            </View>

            <View style={styles.solturaRow}>
              <Text style={styles.solturaLabel}>Líder:</Text>
              <Text style={styles.solturaValue}>{formData.lider || "N/A"}</Text>
            </View>
          </View>

          <Pressable
            style={styles.solturaCloseButton}
            onPress={handleClose}
            android_ripple={{ color: "rgba(139, 195, 74, 0.2)", borderless: false }}
          >
            <Text style={styles.solturaCloseButtonText}>OK</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Componente principal do formulário
const Formulario = ({ navigation }) => {
  // Remove the header from React Navigation
  React.useEffect(() => {
    navigation?.setOptions?.({
      headerShown: false, // This will hide the header from React Navigation
    })
  }, [navigation])

  // Estados para os campos do formulário
  const [motorista, setMotorista] = useState("")
  const [prefixo, setPrefixo] = useState("")
  const [dataHora, setDataHora] = useState(new Date())
  const [frequencia, setFrequencia] = useState("")
  const [setor, setSetor] = useState("")
  const [coletores, setColetores] = useState([])
  const [celular, setCelular] = useState("")
  const [lider, setLider] = useState("")
  // Novos estados para os campos adicionados
  const [horaEntregaChave, setHoraEntregaChave] = useState(null)
  const [horaSaidaFrota, setHoraSaidaFrota] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSolturaInfo, setShowSolturaInfo] = useState(false)
  const [formData, setFormData] = useState({})
  const formScaleAnim = useRef(new Animated.Value(0.95)).current
  const formOpacityAnim = useRef(new Animated.Value(0)).current

  // Estados para dados da API
  const [motoristasData, setMotoristasData] = useState([])
  const [veiculosData, setVeiculosData] = useState([])
  const [coletoresData, setColetoresData] = useState([])
  const [frequenciasData, setFrequenciasData] = useState([])
  const [setoresData, setSetoresData] = useState([])
  const [lideresData, setLideresData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)

  const { width, height } = useWindowDimensions()
  const orientation = useOrientation()
  const isLandscape = orientation === "LANDSCAPE"
  const deviceType = getDeviceType()
  const isTablet = deviceType === "tablet"

  // Carregar dados da API usando as URLs específicas
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setLoadingError(null)

      try {
        console.log("Iniciando carregamento de dados...")

        // Buscar dados de diferentes endpoints em paralelo
        const [motoristasResponse, coletoresResponse, veiculosResponse, outrosDados] = await Promise.all([
          SolturaService.getMotoristas(),
          SolturaService.getColetores(),
          SolturaService.getVeiculos(),
          SolturaService.getOutrosDados(),
        ])

        // Extrair nomes dos motoristas
        const motoristasNomes = motoristasResponse.map((motorista) => motorista.nome)
        console.log("Nomes de motoristas processados:", motoristasNomes.length)
        setMotoristasData(motoristasNomes)

        // Extrair nomes dos coletores
        const coletoresNomes = coletoresResponse.map((coletor) => coletor.nome)
        console.log("Nomes de coletores processados:", coletoresNomes.length)
        setColetoresData(coletoresNomes)

        // Veículos já vêm como array de strings (placas)
        console.log("Placas de veículos processadas:", veiculosResponse.length)
        setVeiculosData(veiculosResponse)

        // Definir outros dados
        setFrequenciasData(outrosDados.frequencias)
        setSetoresData(outrosDados.setores)
        setLideresData(outrosDados.lideres)

        console.log("Carregamento de dados concluído com sucesso")
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setLoadingError("Falha ao carregar dados. Verifique sua conexão e tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    Animated.timing(formOpacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()

    Animated.spring(formScaleAnim, {
      toValue: 1,
      friction: 9,
      tension: 50,
      useNativeDriver: true,
    }).start()
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!motorista) newErrors.motorista = "Motorista é obrigatório"
    if (!prefixo) newErrors.prefixo = "Prefixo é obrigatório"
    if (!dataHora) newErrors.dataHora = "Data e hora são obrigatórios"
    if (!frequencia) newErrors.frequencia = "Frequência é obrigatória"
    if (!setor) newErrors.setor = "Setor é obrigatório"
    if (coletores.length === 0) newErrors.coletores = "Adicione pelo menos um coletor"

    if (!celular) {
      newErrors.celular = "Celular é obrigatório"
    } else if (celular.replace(/\D/g, "").length !== 11) {
      newErrors.celular = "Celular inválido"
    }

    if (!lider) newErrors.lider = "Líder é obrigatório"

    // Validação para os novos campos
    if (!horaEntregaChave) newErrors.horaEntregaChave = "Hora de entrega da chave é obrigatória"
    if (!horaSaidaFrota) newErrors.horaSaidaFrota = "Hora de saída da frota é obrigatória"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setMotorista("")
    setPrefixo("")
    setDataHora(new Date())
    setFrequencia("")
    setSetor("")
    setColetores([])
    setCelular("")
    setLider("")
    setHoraEntregaChave(null)
    setHoraSaidaFrota(null)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true)

      try {
        console.log("Enviando formulário...")

        // Preparar dados para envio
        const solturaData = {
          motorista: motorista,
          prefixo: prefixo,
          coletores: coletores,
          frequencia: frequencia,
          setor: setor,
          celular: celular,
          lider: lider,
          hora_entrega_chave: SolturaService.formatTimeForAPI(horaEntregaChave),
          hora_entrega_saida_frota: SolturaService.formatTimeForAPI(horaSaidaFrota),
        }

        // Enviar para a API
        const response = await SolturaService.criarSoltura(solturaData)
        console.log("Resposta do servidor após envio:", response)

        // Salvar os dados do formulário para exibir no modal
        setFormData({
          motorista,
          prefixo,
          dataHora,
          frequencia,
          setor,
          coletores,
          celular,
          lider,
          horaEntregaChave,
          horaSaidaFrota,
          ...response, // Adicionar dados da resposta da API
        })

        // Mostrar modal de sucesso
        setShowSolturaInfo(true)

        // Resetar formulário
        resetForm()
      } catch (error) {
        console.error("Erro ao enviar formulário:", error)
        Alert.alert("Erro", error.message || "Ocorreu um erro ao registrar a soltura. Tente novamente.", [
          { text: "OK" },
        ])
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const navigateToHistorico = () => {
    navigation?.navigate("FormularioHistorico")
  }

  // Renderizar tela de carregamento
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8BC34A" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    )
  }

  // Renderizar erro de carregamento
  if (loadingError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erro ao carregar</Text>
        <Text style={styles.errorMessage}>{loadingError}</Text>
        <Pressable style={styles.retryButton} onPress={() => navigation.replace("Formulario")}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const getFormLayout = () => {
    if (isTablet && isLandscape) {
      return (
        <View style={styles.twoColumnLayout}>
          <View style={styles.column}>
            <Autocomplete
              data={motoristasData}
              value={motorista}
              onChangeText={setMotorista}
              onSelect={setMotorista}
              placeholder="Selecione o motorista"
              label="Motorista"
              error={errors.motorista}
              zIndex={8}
              id="motorista"
            />

            <Autocomplete
              data={veiculosData}
              value={prefixo}
              onChangeText={setPrefixo}
              onSelect={setPrefixo}
              placeholder="Selecione o prefixo do veículo"
              label="Prefixo do Veículo"
              error={errors.prefixo}
              zIndex={7}
              id="prefixo"
            />

            <DateTimeSelector date={dataHora} setDate={setDataHora} label="Data e Hora" error={errors.dataHora} />

            <TimeSelector
              time={horaEntregaChave}
              setTime={setHoraEntregaChave}
              label="Hora de Entrega da Chave"
              error={errors.horaEntregaChave}
            />

            <Autocomplete
              data={frequenciasData}
              value={frequencia}
              onChangeText={setFrequencia}
              onSelect={setFrequencia}
              placeholder="Selecione a frequência"
              label="Frequência"
              error={errors.frequencia}
              zIndex={6}
              id="frequencia"
            />
          </View>

          <View style={styles.column}>
            <Autocomplete
              data={setoresData}
              value={setor}
              onChangeText={setSetor}
              onSelect={setSetor}
              placeholder="Selecione o setor"
              label="Setor"
              error={errors.setor}
              zIndex={8}
              id="setor"
            />

            <TimeSelector
              time={horaSaidaFrota}
              setTime={setHoraSaidaFrota}
              label="Hora de Saída da Frota"
              error={errors.horaSaidaFrota}
            />

            <ColetoresSelector
              coletores={coletores}
              setColetores={setColetores}
              availableColetores={coletoresData}
              maxColetores={3}
              label="Coletores (máx. 3)"
              error={errors.coletores}
            />

            <CelularInput value={celular} onChangeText={setCelular} label="Celular" error={errors.celular} />

            <Autocomplete
              data={lideresData}
              value={lider}
              onChangeText={setLider}
              onSelect={setLider}
              placeholder="Selecione o líder"
              label="Líder"
              error={errors.lider}
              zIndex={7}
              id="lider"
            />
          </View>
        </View>
      )
    }
    return (
      <>
        <Autocomplete
          data={motoristasData}
          value={motorista}
          onChangeText={setMotorista}
          onSelect={setMotorista}
          placeholder="Selecione o motorista"
          label="Motorista"
          error={errors.motorista}
          zIndex={8}
          id="motorista"
        />

        <Autocomplete
          data={veiculosData}
          value={prefixo}
          onChangeText={setPrefixo}
          onSelect={setPrefixo}
          placeholder="Selecione o prefixo do veículo"
          label="Prefixo do Veículo"
          error={errors.prefixo}
          zIndex={7}
          id="prefixo"
        />

        <DateTimeSelector date={dataHora} setDate={setDataHora} label="Data e Hora" error={errors.dataHora} />

        <TimeSelector
          time={horaEntregaChave}
          setTime={setHoraEntregaChave}
          label="Hora de Entrega da Chave"
          error={errors.horaEntregaChave}
        />

        <TimeSelector
          time={horaSaidaFrota}
          setTime={setHoraSaidaFrota}
          label="Hora de Saída da Frota"
          error={errors.horaSaidaFrota}
        />

        <Autocomplete
          data={frequenciasData}
          value={frequencia}
          onChangeText={setFrequencia}
          onSelect={setFrequencia}
          placeholder="Selecione a frequência"
          label="Frequência"
          error={errors.frequencia}
          zIndex={6}
          id="frequencia"
        />

        <Autocomplete
          data={setoresData}
          value={setor}
          onChangeText={setSetor}
          onSelect={setSetor}
          placeholder="Selecione o setor"
          label="Setor"
          error={errors.setor}
          zIndex={5}
          id="setor"
        />

        <ColetoresSelector
          coletores={coletores}
          setColetores={setColetores}
          availableColetores={coletoresData}
          maxColetores={3}
          label="Coletores (máx. 3)"
          error={errors.coletores}
        />

        <CelularInput value={celular} onChangeText={setCelular} label="Celular" error={errors.celular} />

        <Autocomplete
          data={lideresData}
          value={lider}
          onChangeText={setLider}
          onSelect={setLider}
          placeholder="Selecione o líder"
          label="Líder"
          error={errors.lider}
          zIndex={4}
          id="lider"
        />
      </>
    )
  }

  // Função para calcular a largura do formulário com base no tamanho da tela e orientação
  const getFormWidth = () => {
    if (isTablet) {
      return isLandscape ? width * 0.9 : width * 0.8
    }

    return isLandscape ? width * 0.8 : width * 0.9
  }

  // Função para calcular o padding do formulário com base no tipo de dispositivo
  const getFormPadding = () => {
    const deviceType = getDeviceType()
    switch (deviceType) {
      case "tablet":
        return 35
      case "largePhone":
        return 30
      case "mediumPhone":
        return 25
      case "smallPhone":
        return 20
      default:
        return 25
    }
  }

  return (
    <ActiveAutocompleteProvider>
      <SafeAreaView style={styles.safeAreaContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <View style={styles.backgroundContainer} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView
            style={styles.scrollViewStyle}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { fontSize: normalize(28) }]}>Soltura de Frotas</Text>
              <View style={styles.headerUnderline} />
            </View>

            <Animated.View
              style={[
                styles.formContainer,
                {
                  width: getFormWidth(),
                  maxWidth: 1000,
                  padding: getFormPadding(),
                  borderRadius: getResponsiveSize(20),
                  transform: [{ scale: formScaleAnim }],
                  opacity: formOpacityAnim,
                },
              ]}
            >
              {getFormLayout()}

              {/* Botão de Histórico de Soltura de Rotas - Estilo atualizado */}
              <TouchableArea
                style={[
                  styles.historicoButton,
                  {
                    height: getButtonHeight() * 1.2,
                    marginTop: getResponsiveSize(20),
                    marginBottom: getResponsiveSize(15),
                  },
                ]}
                onPress={navigateToHistorico}
              >
                <View style={styles.historicoButtonContent}>
                  <Text style={[styles.historicoButtonText, { fontSize: normalize(18) }]}>
                    Histórico de Soltura de Frotas
                  </Text>
                </View>
              </TouchableArea>

              {/* Botão de envio */}
              <Ripple
                style={[
                  styles.submitButton,
                  {
                    height: getButtonHeight() * 1.2,
                    marginTop: getResponsiveSize(10),
                  },
                ]}
                onPress={handleSubmit}
              >
                <View style={styles.submitButtonBackground}>
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="large" />
                  ) : (
                    <Text style={[styles.submitButtonText, { fontSize: normalize(18) }]}>Enviar</Text>
                  )}
                </View>
              </Ripple>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Componente para exibir as informações de soltura */}
        <SolturaInfoModal visible={showSolturaInfo} onClose={() => setShowSolturaInfo(false)} formData={formData} />
      </SafeAreaView>
    </ActiveAutocompleteProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 0, // Removed dynamic padding
  },
  backgroundContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewStyle: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 30, // Added padding at the bottom to avoid flickering
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 20, // Added to compensate for header removal
    marginBottom: 25,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#8BC34A",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
  },
  headerUnderline: {
    height: 3,
    width: 60,
    backgroundColor: "#8BC34A",
    marginTop: 8,
    borderRadius: 1.5,
  },
  formContainer: {
    backgroundColor: "white",
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    elevation: 5,
  },
  twoColumnLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
  inputWrapper: {
    marginBottom: 20,
    width: "100%",
    position: "relative",
  },
  animatedInputWrapper: {
    marginBottom: 20,
    width: "100%",
    position: "relative",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontWeight: "600",
    color: "#555",
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  animatedInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  animatedInput: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 16, // Reduced font size
    fontWeight: "500",
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 20,
    color: "#999",
    fontWeight: "bold",
  },
  dropdownContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
    marginTop: 5,
    borderRadius: 15,
    overflow: "hidden",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)",
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    maxHeight: 200,
    elevation: 5,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16, // Reduced font size
    fontWeight: "500",
  },
  calendarIcon: {
    padding: 5,
  },
  calendarIconText: {
    fontSize: 16,
  },
  coletoresContainer: {
    width: "100%",
  },
  coletorInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },
  addButton: {
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.25)",
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  coletoresList: {
    marginTop: 15,
  },
  coletorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
    elevation: 2,
  },
  coletorName: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.25)",
    elevation: 3,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  coletoresCount: {
    color: "#777",
    marginTop: 5,
    textAlign: "right",
    fontSize: 12,
  },
  submitButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 5,
  },
  submitButtonBackground: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // Estilos para o botão de histórico - ATUALIZADO
  historicoButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25, // Bordas mais arredondadas
    width: "100%",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#8BC34A",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
    elevation: 3,
  },
  historicoButtonContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "white", // Fundo branco
    justifyContent: "center",
    alignItems: "center",
  },
  historicoButtonText: {
    color: "#8BC34A", // Texto verde
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  rippleContainer: {
    overflow: "hidden",
    position: "relative",
  },
  ripple: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  successIcon: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  successCloseButton: {
    backgroundColor: "#8BC34A",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  successCloseButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Estilos para o modal de informações de soltura
  solturaInfoContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  solturaHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  solturaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8BC34A",
    marginBottom: 5,
  },
  solturaHeaderUnderline: {
    height: 2,
    width: 50,
    backgroundColor: "#8BC34A",
    borderRadius: 1,
  },
  solturaContent: {
    marginBottom: 20,
  },
  solturaRow: {
    flexDirection: "row",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  solturaLabel: {
    width: "35%",
    fontWeight: "bold",
    color: "#555",
    fontSize: 14,
  },
  solturaValue: {
    flex: 1,
    color: "#333",
    fontSize: 14,
  },
  solturaCloseButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#8BC34A",
  },
  solturaCloseButtonText: {
    color: "#8BC34A",
    fontWeight: "bold",
    fontSize: 16,
  },
  solturaSuccessMessage: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 5,
    marginBottom: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  // Estilos para telas de carregamento e erro
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8BC34A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default Formulario

