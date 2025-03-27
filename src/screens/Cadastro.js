"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  PixelRatio,
  useWindowDimensions,
  Alert,
  BackHandler,
  ActivityIndicator,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { cadastrarUser } from "../api/cadastrar" // Import the API function

// Função para calcular tamanhos responsivos de forma mais precisa
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const scale = SCREEN_WIDTH / 375 // Base para iPhone 8

const normalize = (size) => {
  const newSize = size * scale

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }
  // Android precisa de um ajuste ligeiramente diferente
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
}

// Componente de Logo Profissional com tamanho adaptativo
const ProfessionalLogo = ({ screenHeight, screenWidth }) => {
  // Tamanho responsivo baseado na altura e largura da tela
  const logoSize = Math.min(screenHeight * 0.1, screenWidth * 0.2)
  const fontSize = logoSize * 0.35

  // Animação para o efeito de brilho
  const shimmerValue = new Animated.Value(0)

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-logoSize, logoSize],
  })

  return (
    <View style={[logoStyles.container, { marginBottom: screenHeight * 0.02 }]}>
      {/* Círculo externo */}
      <View style={[logoStyles.outerCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
        {/* Círculo interno */}
        <View
          style={[
            logoStyles.innerCircle,
            {
              width: logoSize * 0.85,
              height: logoSize * 0.85,
              borderRadius: logoSize * 0.425,
            },
          ]}
        >
          {/* Efeito de brilho */}
          <Animated.View
            style={[
              logoStyles.shimmer,
              {
                width: logoSize * 0.6,
                height: logoSize,
                transform: [{ translateX: shimmerTranslate }, { rotate: "45deg" }],
              },
            ]}
          />

          {/* Texto da logo */}
          <Text style={[logoStyles.logoText, { fontSize: fontSize }]}>LG</Text>

          {/* Ícone de folha estilizado */}
          <View style={[logoStyles.leafContainer, { top: logoSize * 0.15, right: logoSize * 0.2 }]}>
            <View
              style={[
                logoStyles.leaf,
                {
                  width: logoSize * 0.12,
                  height: logoSize * 0.18,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Nome da empresa */}
      <View style={logoStyles.nameContainer}>
        <Text style={[logoStyles.companyName, { fontSize: normalize(18) }]}>LIMPA GYN</Text>
        <View style={logoStyles.taglineContainer}>
          <View style={logoStyles.taglineLine} />
          <Text style={[logoStyles.taglineText, { fontSize: normalize(9) }]}>SOLTURA DE FROTA</Text>
          <View style={logoStyles.taglineLine} />
        </View>
      </View>
    </View>
  )
}

// Estilos específicos para a logo
const logoStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  outerCircle: {
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  innerCircle: {
    backgroundColor: "#7CB342",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  shimmer: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  logoText: {
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  leafContainer: {
    position: "absolute",
  },
  leaf: {
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#CDDC39",
    transform: [{ rotate: "45deg" }],
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  companyName: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "nowrap",
    justifyContent: "center",
    maxWidth: "100%",
  },
  taglineText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    letterSpacing: 1.5,
    marginHorizontal: 8,
    textAlign: "center",
    flexShrink: 1,
  },
  taglineLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    flex: 1,
  },
})

// Componente de barra de força de senha
const PasswordStrengthBar = ({ password }) => {
  // Calcular a força da senha
  const calculateStrength = (pass) => {
    if (!pass) return 0

    let strength = 0

    // Comprimento mínimo
    if (pass.length >= 6) strength += 1
    if (pass.length >= 8) strength += 1

    // Complexidade
    if (/[A-Z]/.test(pass)) strength += 1 // Maiúsculas
    if (/[0-9]/.test(pass)) strength += 1 // Números
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1 // Caracteres especiais

    return Math.min(strength, 5) // Máximo de 5
  }

  const strength = calculateStrength(password)
  const percentage = (strength / 5) * 100

  // Determinar a cor baseada na força
  const getColor = () => {
    if (strength <= 1) return "#FF5252" // Vermelho
    if (strength <= 2) return "#FFA000" // Laranja
    if (strength <= 3) return "#FFC107" // Amarelo
    if (strength <= 4) return "#AED581" // Verde claro
    return "#8BC34A" // Verde
  }

  // Determinar o texto baseado na força
  const getStrengthText = () => {
    if (!password) return ""
    if (strength <= 1) return "Muito fraca"
    if (strength <= 2) return "Fraca"
    if (strength <= 3) return "Média"
    if (strength <= 4) return "Boa"
    return "Forte"
  }

  return (
    <View style={styles.strengthBarContainer}>
      <View style={styles.strengthBarWrapper}>
        <View
          style={[
            styles.strengthBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>
      {password ? <Text style={[styles.strengthText, { color: getColor() }]}>{getStrengthText()}</Text> : null}
    </View>
  )
}

// Componente de campo de entrada personalizado com melhor responsividade
const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  error,
  autoCapitalize = "none",
  showPasswordStrength = false,
}) => {
  const { height, width } = useWindowDimensions()
  const [showPassword, setShowPassword] = useState(false)

  // Ajustar tamanho do input baseado na orientação da tela
  const inputHeight = height > width ? height * 0.065 : height * 0.08
  const fontSize = normalize(height > width ? 16 : 14)

  return (
    <View style={[styles.inputWrapper, { marginBottom: height * 0.015 }]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.inputLabel, { fontSize: normalize(14) }]}>{label}</Text>
        {error ? <Text style={[styles.errorText, { fontSize: normalize(12) }]}>{error}</Text> : null}
      </View>
      <View style={[styles.inputContainer, { height: inputHeight }, error ? styles.inputError : {}]}>
        <TextInput
          style={[styles.input, { fontSize: fontSize }]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeIconText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            <Text style={styles.eyeIconLabel}>{showPassword ? "Ocultar" : "Mostrar"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {showPasswordStrength && <PasswordStrengthBar password={value} />}
    </View>
  )
}

// Add a phone formatting function
const formatPhoneNumber = (text) => {
  // Remove all non-numeric characters
  const cleaned = text.replace(/\D/g, "")

  // Format the phone number
  let formatted = cleaned
  if (cleaned.length <= 2) {
    formatted = cleaned
  } else if (cleaned.length <= 6) {
    formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`
  } else if (cleaned.length <= 10) {
    formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`
  } else {
    formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`
  }

  return formatted
}

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Estados para validação
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
    api: "",
  })

  // Múltiplas abordagens para ocultar o cabeçalho
  useEffect(() => {
    // Método 1: Usando setOptions
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false,
        header: () => null,
        title: null,
      })
    }
  }, [navigation])

  // Método 2: Usando useFocusEffect para garantir que o cabeçalho seja ocultado quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      if (navigation && navigation.setOptions) {
        navigation.setOptions({
          headerShown: false,
          header: () => null,
          title: null,
        })
      }

      // Ocultar a barra de status ou torná-la transparente
      StatusBar.setBarStyle("light-content")
      if (Platform.OS === "android") {
        StatusBar.setTranslucent(true)
        StatusBar.setBackgroundColor("transparent")
        StatusBar.setHidden(false)
      }

      return () => {
        // Restaurar configurações padrão ao sair da tela, se necessário
      }
    }, [navigation]),
  )

  // Função para voltar à tela de login
  const goBackToLogin = () => {
    navigation.goBack()
  }

  // Usar dimensões da janela para responder a mudanças de orientação
  const { width, height } = useWindowDimensions()

  // Determinar se é um dispositivo pequeno
  const isSmallDevice = height < 700

  // Determinar se está em modo paisagem
  const isLandscape = width > height

  // Ajustar comportamento do botão voltar
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      goBackToLogin()
      return true
    })

    return () => backHandler.remove()
  }, [])

  // Função para validar o formulário
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: "",
      api: "",
    }

    // Validar nome
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório"
      isValid = false
    }

    // Validar celular
    if (!phone.trim()) {
      newErrors.phone = "Celular é obrigatório"
      isValid = false
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Celular inválido"
      isValid = false
    }

    // Validar senha
    if (!password) {
      newErrors.password = "Senha é obrigatória"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
      isValid = false
    }

    // Validar confirmação de senha
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
      isValid = false
    }

    // Validar termos
    if (!acceptTerms) {
      newErrors.terms = "Você deve aceitar os termos"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Função para lidar com o registro usando a API
  const handleRegister = async () => {
    if (validateForm()) {
      setIsLoading(true)

      // Resetar todos os erros
      setErrors({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: "",
        api: "",
      })

      try {
        // Limpar formatação do telefone antes de enviar para a API
        const cleanedPhone = phone.replace(/\D/g, "")

        // Chamar a API de cadastro
        const response = await cadastrarUser(name, cleanedPhone, password, confirmPassword)
        console.log("Resposta processada da API:", response)

        // Verificar se houve erro na resposta
        if (response.erro) {
          console.log("Erro detectado:", response.erro, "Campo:", response.field)

          // Verificar se é um erro específico de campo
          if (response.field === "both") {
            // Erro em ambos os campos
            setErrors((prev) => ({
              ...prev,
              name: "Este nome já está cadastrado",
              phone: "Este número já está cadastrado",
              api: "",
            }))

            Alert.alert("Erro de Cadastro", response.erro)
          } else if (response.field) {
            // Erro em um campo específico
            const newErrors = { ...errors }
            newErrors[response.field] = response.erro
            setErrors(newErrors)

            Alert.alert("Erro de Cadastro", response.erro)
          } else if (response.isNetworkError) {
            // Erro de rede
            setErrors((prev) => ({
              ...prev,
              api: response.erro,
            }))

            Alert.alert(
              "Erro de Conexão",
              "Não foi possível conectar ao servidor. Verifique sua conexão de internet ou se o servidor está online.",
            )
          } else {
            // Erro geral
            setErrors((prev) => ({
              ...prev,
              api: response.erro,
            }))

            Alert.alert("Erro", response.erro)
          }
          return // Sair da função se houver erro
        }

        // Verificar se há mensagem na resposta, mesmo que success seja true
        if (response.mensagem && typeof response.mensagem === "string") {
          const mensagemLower = response.mensagem.toLowerCase()

          // Se a mensagem parece ser um erro (contém palavras-chave de erro)
          if (
            mensagemLower.includes("existe") ||
            mensagemLower.includes("erro") ||
            mensagemLower.includes("inválido") ||
            mensagemLower.includes("invalido")
          ) {
            // Verificar se menciona nome e celular
            if (
              mensagemLower.includes("nome") &&
              (mensagemLower.includes("celular") || mensagemLower.includes("telefone"))
            ) {
              setErrors((prev) => ({
                ...prev,
                name: "Este nome já está cadastrado",
                phone: "Este número já está cadastrado",
                api: "",
              }))
            }
            // Verificar se menciona apenas celular
            else if (mensagemLower.includes("celular") || mensagemLower.includes("telefone")) {
              setErrors((prev) => ({
                ...prev,
                phone: response.mensagem,
                api: "",
              }))
            }
            // Verificar se menciona apenas nome
            else if (mensagemLower.includes("nome")) {
              setErrors((prev) => ({
                ...prev,
                name: response.mensagem,
                api: "",
              }))
            }
            // Erro genérico
            else {
              setErrors((prev) => ({
                ...prev,
                api: response.mensagem,
              }))
            }

            Alert.alert("Erro de Cadastro", response.mensagem)
            setIsLoading(false)
            return // Sair da função se a mensagem parece ser um erro
          }
        }

        // Se chegou aqui, é porque não há erros
        // Cadastro bem-sucedido
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
          {
            text: "OK",
            onPress: () => goBackToLogin(),
          },
        ])
      } catch (error) {
        console.error("Erro inesperado:", error)
        setErrors((prev) => ({
          ...prev,
          api: "Erro inesperado ao processar a requisição",
        }))
        Alert.alert("Erro", "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePhoneChange = (text) => {
    const formattedPhoneNumber = formatPhoneNumber(text)
    setPhone(formattedPhoneNumber)
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Fundo verde */}
      <View style={styles.backgroundGradient}>
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Profissional */}
            <ProfessionalLogo screenHeight={height} screenWidth={width} />

            <View
              style={[
                styles.formContainer,
                {
                  width: isLandscape ? width * 0.7 : width > 500 ? 450 : width * 0.9,
                  marginTop: isSmallDevice ? height * 0.02 : height * 0.04,
                },
              ]}
            >
              {/* Cabeçalho verde com título branco */}
              <View style={styles.formHeader}>
                <Text style={styles.formHeaderText}>Cadastro</Text>
              </View>

              <View style={styles.formContent}>
                {/* Erro da API */}
                {errors.api ? (
                  <View style={styles.apiErrorContainer}>
                    <Text style={styles.apiErrorText}>{errors.api}</Text>
                  </View>
                ) : null}

                {/* Campos do formulário */}
                <InputField
                  label="Nome Completo"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                  autoCapitalize="words"
                />

                <InputField
                  label="Celular"
                  placeholder="(XX) XXXXX-XXXX"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  error={errors.phone}
                />

                <InputField
                  label="Senha"
                  placeholder="Crie uma senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  error={errors.password}
                  showPasswordStrength={true}
                />

                <InputField
                  label="Confirmar Senha"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                  error={errors.confirmPassword}
                />

                {/* Checkbox de termos e condições */}
                <View
                  style={[
                    styles.termsContainer,
                    {
                      marginVertical: isSmallDevice ? height * 0.01 : height * 0.015,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setAcceptTerms(!acceptTerms)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={[styles.checkboxInner, acceptTerms ? styles.checkboxChecked : {}]}>
                      {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.termsTextContainer}>
                    <Text
                      style={[
                        styles.termsText,
                        {
                          fontSize: normalize(isSmallDevice ? 12 : 13),
                          lineHeight: normalize(isSmallDevice ? 16 : 18),
                        },
                      ]}
                    >
                      Eu aceito os <Text style={styles.termsLink}>Termos de Uso</Text> e{" "}
                      <Text style={styles.termsLink}>Política de Privacidade</Text>
                    </Text>
                    {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
                  </View>
                </View>

                {/* Botão de cadastro */}
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    {
                      height: isSmallDevice ? height * 0.06 : height * 0.065,
                      marginTop: isSmallDevice ? height * 0.01 : height * 0.02,
                    },
                    isLoading ? styles.disabledButton : {},
                  ]}
                  activeOpacity={0.8}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={[styles.registerButtonText, { fontSize: normalize(16) }]}>CADASTRAR</Text>
                  )}
                </TouchableOpacity>

                {/* Botão para voltar ao login */}
                <TouchableOpacity
                  style={[
                    styles.backButton,
                    {
                      marginTop: isSmallDevice ? height * 0.015 : height * 0.02,
                      padding: isSmallDevice ? 8 : 10,
                    },
                  ]}
                  onPress={goBackToLogin}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isLoading}
                >
                  <Text style={[styles.backButtonText, { fontSize: normalize(14) }]}>Já tem uma conta? Faça login</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!isSmallDevice && (
              <View style={[styles.footer, { marginTop: height * 0.02 }]}>
                <Text style={[styles.footerText, { fontSize: normalize(12) }]}>
                  © 2024 Limpa Gyn • Todos os direitos reservados
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#8BC34A", // Garante que a área segura tenha a mesma cor de fundo
    paddingTop: 0, // Remova o padding dinâmico
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#8BC34A", // Cor de fundo verde principal
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Overlay mais leve para o fundo verde
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 30 : 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: "#f5f5f5", // Cor de fundo alterada para cinza claro
    borderRadius: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden", // Para garantir que o cabeçalho verde respeite o border radius
  },
  // Cabeçalho verde
  formHeader: {
    backgroundColor: "#8BC34A", // Mesmo tom de verde do background
    paddingVertical: 20,
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  formHeaderText: {
    color: "white", // Texto branco
    fontSize: normalize(24),
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // Conteúdo do formulário
  formContent: {
    padding: 24,
  },
  inputWrapper: {
    width: "100%",
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
    paddingLeft: 2,
  },
  errorText: {
    color: "#e53935",
    fontSize: normalize(12),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
  },
  inputError: {
    borderColor: "#e53935",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  eyeIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 195, 74, 0.1)",
    borderRadius: 20,
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eyeIconText: {
    fontSize: normalize(16),
    marginRight: 4,
  },
  eyeIconLabel: {
    fontSize: normalize(12),
    color: "#8BC34A",
    fontWeight: "600",
  },
  strengthBarContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  strengthBarWrapper: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: normalize(12),
    marginTop: 4,
    alignSelf: "flex-end",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#8BC34A",
  },
  checkmark: {
    color: "white",
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: "#666",
  },
  termsLink: {
    color: "#8BC34A",
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#8BC34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
    opacity: 0.8,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#8BC34A",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  apiErrorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#e53935",
  },
  apiErrorText: {
    color: "#c62828",
    fontSize: normalize(14),
  },
})

