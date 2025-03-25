"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  PixelRatio,
  useWindowDimensions,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"

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

// Adicione esta função para criar efeitos de ripple nos botões
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
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start()
  }

  const handlePressOut = () => {
    Animated.timing(rippleAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
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
    <TouchableOpacity
      style={[styles.rippleContainer, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
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
    </TouchableOpacity>
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

// Modifique o componente Autocomplete para usar animações e efeitos visuais
const Autocomplete = ({ data, value, onChangeText, onSelect, placeholder, label, error, zIndex = 1, id }) => {
  const [filteredData, setFilteredData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const { activeAutocomplete, setActiveAutocomplete } = useActiveAutocomplete()
  const dropdownAnim = useRef(new Animated.Value(0)).current
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current

  // Atualiza dados filtrados quando o valor muda
  useEffect(() => {
    if (value) {
      const filtered = data.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      setFilteredData(filtered)
    } else {
      setFilteredData([])
    }
  }, [value, data])

  // Fecha o dropdown quando outro autocomplete é aberto
  useEffect(() => {
    if (activeAutocomplete !== id) {
      setShowDropdown(false)
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }
  }, [activeAutocomplete, id])

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, value, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showDropdown && filteredData.length > 0 ? 1 : 0,
      duration: 200,
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
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (value.length > 0) {
      setShowDropdown(true)
      setActiveAutocomplete(id)
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
      outputRange: [16, 12],
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

  return (
    <View style={[styles.inputWrapper, { zIndex: showDropdown ? 100 : zIndex }]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
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
          style={styles.animatedInput}
          placeholder={isFocused ? placeholder : ""}
          placeholderTextColor="#999"
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onChangeText("")
              setShowDropdown(false)
            }}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Animated.View
        style={[
          styles.dropdownContainer,
          {
            maxHeight: dropdownMaxHeight,
            opacity: dropdownOpacity,
            display: dropdownAnim._value === 0 ? "none" : "flex",
          },
        ]}
      >
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps="handled"
          style={styles.dropdown}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <Text style={styles.dropdownItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  )
}

const ColetoresSelector = ({ coletores, setColetores, maxColetores = 3, label, error }) => {
  const [coletor, setColetor] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(coletores.length > 0 || coletor ? 1 : 0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || coletores.length > 0 || coletor ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, coletores, coletor, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderColorAnim])

  const addColetor = () => {
    if (coletor.trim() && coletores.length < maxColetores) {
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
    }
  }

  const removeColetor = (index) => {
    const newColetores = [...coletores]
    newColetores.splice(index, 1)
    setColetores(newColetores)
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
      outputRange: [16, 12],
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

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
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
          style={styles.animatedInput}
          placeholder={isFocused ? "Nome do coletor" : ""}
          placeholderTextColor="#999"
          value={coletor}
          onChangeText={setColetor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              opacity: coletores.length >= maxColetores ? 0.5 : 1,
              width: getResponsiveSize(36),
              height: getResponsiveSize(36),
              borderRadius: getResponsiveSize(18),
            },
          ]}
          onPress={addColetor}
          disabled={coletores.length >= maxColetores}
          activeOpacity={0.7}
        >
          <Text style={[styles.addButtonText, { fontSize: normalize(20) }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Animated.View style={[styles.coletoresList, { transform: [{ scale: scaleAnim }] }]}>
        {coletores.map((item, index) => (
          <View key={index} style={styles.coletorItem}>
            <Text style={styles.coletorName}>{item}</Text>
            <TouchableOpacity
              style={[
                styles.removeButton,
                {
                  width: getResponsiveSize(28),
                  height: getResponsiveSize(28),
                  borderRadius: getResponsiveSize(14),
                },
              ]}
              onPress={() => removeColetor(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>

      <Text style={styles.coletoresCount}>
        {coletores.length}/{maxColetores} coletores
      </Text>
    </View>
  )
}

// Modifique o componente de Input para Celular com máscara
const CelularInput = ({ value, onChangeText, label, error }) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputHeight = getInputHeight()
  const borderColorAnim = useRef(new Animated.Value(0)).current
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, value, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
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

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
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

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
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
          style={styles.animatedInput}
          placeholder={isFocused ? "(XX) XXXXX-XXXX" : ""}
          placeholderTextColor="#999"
          value={value}
          onChangeText={formatCelular}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="phone-pad"
          maxLength={16} // (XX) XXXXX-XXXX = 16 caracteres
        />
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

// Modifique o componente de Seleção de Data e Hora
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
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [isFocused, date, labelPosition])

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
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
      }, 300)
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

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [inputHeight / 2 - 10, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
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
      <TouchableOpacity
        onPress={() => {
          setIsFocused(true)
          setShowDatePicker(true)
        }}
        activeOpacity={0.7}
        onPressOut={() => setIsFocused(false)}
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
                fontSize: normalize(16),
              },
            ]}
          >
            {date ? formatDateTime(date) : "Selecionar data e hora"}
          </Text>
          <View style={styles.calendarIcon}>
            <Text style={styles.calendarIconText}>📅</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
        />
      )}
    </View>
  )
}

// Componente de mensagem de sucesso
const SuccessMessage = ({ visible, onClose }) => {
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

      // Auto-fechar após 3 segundos
      const timer = setTimeout(() => {
        handleClose()
      }, 3000)

      return () => clearTimeout(timer)
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

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.successOverlay}>
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Sucesso!</Text>
          <Text style={styles.successText}>Formulário enviado com sucesso!</Text>
          <TouchableOpacity style={styles.successCloseButton} onPress={handleClose} activeOpacity={0.7}>
            <Text style={styles.successCloseButtonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Componente principal do formulário
const Formulario = () => {
  // Estados para os campos do formulário
  const [motorista, setMotorista] = useState("")
  const [prefixo, setPrefixo] = useState("")
  const [dataHora, setDataHora] = useState(new Date())
  const [frequencia, setFrequencia] = useState("")
  const [setor, setSetor] = useState("")
  const [coletores, setColetores] = useState([])
  const [celular, setCelular] = useState("")
  const [lider, setLider] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const formScaleAnim = useRef(new Animated.Value(0.95)).current
  const formOpacityAnim = useRef(new Animated.Value(0)).current

  // Navegação
  const navigation = useNavigation()

  // Animação de entrada do formulário
  useEffect(() => {
    Animated.parallel([
      Animated.timing(formScaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(formOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const motoristas = ["João Silva", "Maria Oliveira", "Pedro Santos", "Ana Costa", "Carlos Ferreira"]
  const prefixos = ["ABC-1234", "DEF-5678", "GHI-9012", "JKL-3456", "MNO-7890"]
  const frequencias = ["Diária", "Semanal", "Quinzenal", "Mensal"]
  const setores = ["Norte", "Sul", "Leste", "Oeste", "Centro"]
  const lideres = ["Roberto Alves", "Fernanda Lima", "Marcelo Souza", "Juliana Pereira"]
  const { width, height } = useWindowDimensions()
  const orientation = useOrientation()
  const isLandscape = orientation === "LANDSCAPE"
  const deviceType = getDeviceType()
  const isTablet = deviceType === "tablet"

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Função para limpar todos os campos do formulário
  const resetForm = () => {
    setMotorista("")
    setPrefixo("")
    setDataHora(new Date())
    setFrequencia("")
    setSetor("")
    setColetores([])
    setCelular("")
    setLider("")
    setErrors({})
  }

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true)

      // Simular envio para o servidor
      setTimeout(() => {
        setIsSubmitting(false)

        // Mostrar mensagem de sucesso
        setShowSuccess(true)

        // Registrar dados no console
        console.log({
          motorista,
          prefixo,
          dataHora,
          frequencia,
          setor,
          coletores,
          celular,
          lider,
        })
        resetForm()
      }, 1500)
    }
  }

  const navigateToHistorico = () => {
    navigation.navigate("FormularioHistorico")
  }

  const getFormLayout = () => {
    if (isTablet && isLandscape) {
      return (
        <View style={styles.twoColumnLayout}>
          <View style={styles.column}>
            <Autocomplete
              data={motoristas}
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
              data={prefixos}
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

            <Autocomplete
              data={frequencias}
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
              data={setores}
              value={setor}
              onChangeText={setSetor}
              onSelect={setSetor}
              placeholder="Selecione o setor"
              label="Setor"
              error={errors.setor}
              zIndex={8}
              id="setor"
            />

            <ColetoresSelector
              coletores={coletores}
              setColetores={setColetores}
              maxColetores={3}
              label="Coletores (máx. 3)"
              error={errors.coletores}
            />

            <CelularInput value={celular} onChangeText={setCelular} label="Celular" error={errors.celular} />

            <Autocomplete
              data={lideres}
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
          data={motoristas}
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
          data={prefixos}
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

        <Autocomplete
          data={frequencias}
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
          data={setores}
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
          maxColetores={3}
          label="Coletores (máx. 3)"
          error={errors.coletores}
        />

        <CelularInput value={celular} onChangeText={setCelular} label="Celular" error={errors.celular} />

        <Autocomplete
          data={lideres}
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
    switch (deviceType) {
      case "tablet":
        return 30
      case "largePhone":
        return 25
      case "mediumPhone":
        return 20
      case "smallPhone":
        return 15
      default:
        return 20
    }
  }

  return (
    <ActiveAutocompleteProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <View style={styles.backgroundContainer} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingVertical: getResponsiveSize(20) }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { fontSize: normalize(24) }]}>Formulário de Coleta</Text>
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

              {/* Botão de Histórico de Soltura de Rotas */}
              <Ripple
                style={[
                  styles.historicoButton,
                  {
                    height: getButtonHeight(),
                    marginTop: getResponsiveSize(20),
                    marginBottom: getResponsiveSize(15),
                  },
                ]}
                onPress={navigateToHistorico}
              >
                <View style={styles.buttonBackground}>
                  <Text style={[styles.historicoButtonText, { fontSize: normalize(16) }]}>
                    HISTÓRICO DE SOLTURA DE ROTAS
                  </Text>
                </View>
              </Ripple>

              {/* Botão de envio */}
              <Ripple
                style={[
                  styles.submitButton,
                  {
                    height: getButtonHeight(),
                    marginTop: getResponsiveSize(10),
                  },
                ]}
                onPress={handleSubmit}
              >
                <View style={styles.submitButtonBackground}>
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={[styles.submitButtonText, { fontSize: normalize(16) }]}>ENVIAR</Text>
                  )}
                </View>
              </Ripple>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Componente de mensagem de sucesso */}
        <SuccessMessage visible={showSuccess} onClose={() => setShowSuccess(false)} />
      </SafeAreaView>
    </ActiveAutocompleteProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Fundo branco conforme solicitado
  },
  backgroundContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#ffffff", // Fundo branco conforme solicitado
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#8BC34A", // Título verde claro conforme solicitado
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)", // Usando textShadow em vez de textShadowColor, etc.
  },
  headerUnderline: {
    height: 3,
    width: 60,
    backgroundColor: "#8BC34A", // Verde claro para combinar com o título
    marginTop: 8,
    borderRadius: 1.5,
  },
  formContainer: {
    backgroundColor: "white",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)", // Usando boxShadow em vez de shadowColor, etc.
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
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
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)", // Usando boxShadow em vez de shadowColor, etc.
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
    fontSize: 16,
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
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Usando boxShadow em vez de shadowColor, etc.
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    color: "#333",
    fontSize: 14,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)", // Usando boxShadow em vez de shadowColor, etc.
  },
  dateTimeText: {
    flex: 1,
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
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)", // Usando boxShadow em vez de shadowColor, etc.
  },
  addButton: {
    backgroundColor: "#8BC34A", // Verde claro para combinar com o tema
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.2)", // Usando boxShadow em vez de shadowColor, etc.
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)", // Usando boxShadow em vez de shadowColor, etc.
  },
  coletorName: {
    flex: 1,
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)", // Usando boxShadow em vez de shadowColor, etc.
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
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)", // Usando boxShadow em vez de shadowColor, etc.
  },
  submitButtonBackground: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8BC34A", // Verde claro para combinar com o tema
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // Estilos para o botão de histórico
  historicoButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    width: "100%",
    overflow: "hidden",
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)", // Usando boxShadow em vez de shadowColor, etc.
  },
  buttonBackground: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8BC34A", // Verde claro para combinar com o tema
    justifyContent: "center",
    alignItems: "center",
  },
  historicoButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  rippleContainer: {
    overflow: "hidden",
    position: "relative",
  },
  ripple: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  // Estilos para a mensagem de sucesso
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
})

export default Formulario

