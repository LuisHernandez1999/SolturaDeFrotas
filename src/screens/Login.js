"use client"

import React, { useState, useEffect, useRef } from "react"
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
  BackHandler,
  ActivityIndicator,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"
// Importando o serviço de autenticação
import { loginUser } from "../api/login"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const scale = SCREEN_WIDTH / 375

const normalize = (size) => {
  const newSize = size * scale
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
}

// Componente de mensagem de sucesso animada
const SuccessMessage = ({ visible, message, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()

      // Configurar para esconder após 2 segundos
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) onHide()
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.successContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.successIconContainer}>
        <Text style={styles.successIcon}>✓</Text>
      </View>
      <Text style={styles.successText}>{message}</Text>
    </Animated.View>
  )
}

// Componente de mensagem de erro animada
const ErrorToast = ({ visible, message, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()

      // Configurar para esconder após 3 segundos
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) onHide()
        })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.errorToastContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>✕</Text>
      </View>
      <Text style={styles.errorToastText}>{message}</Text>
    </Animated.View>
  )
}

const ProfessionalLogo = ({ screenHeight }) => {
  const logoSize = screenHeight * 0.12
  const fontSize = screenHeight * 0.04

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
    <View style={[logoStyles.container, { marginBottom: screenHeight * 0.03 }]}>
      <View style={[logoStyles.outerCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
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
          <Text style={[logoStyles.logoText, { fontSize: fontSize }]}>LG</Text>
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
      <View style={logoStyles.nameContainer}>
        <Text style={[logoStyles.companyName, { fontSize: normalize(24) }]}>LIMPA GYN</Text>
        <View style={logoStyles.taglineContainer}>
          <View style={logoStyles.taglineLine} />
          <Text style={[logoStyles.taglineText, { fontSize: normalize(10) }]}>SOLTURA DE FROTAS</Text>
          <View style={logoStyles.taglineLine} />
        </View>
      </View>
    </View>
  )
}
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
    marginTop: 15,
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
    marginTop: 8,
  },
  taglineLine: {
    width: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  taglineText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    letterSpacing: 1.5,
    marginHorizontal: 8,
  },
})

// Adicione esta função no arquivo de navegação principal (App.js ou onde você configura as rotas)
export function getLoginScreenOptions() {
  return {
    headerShown: false,
    header: () => null,
  }
}

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorToastMessage, setErrorToastMessage] = useState("")
  const { width, height } = useWindowDimensions()
  const isSmallDevice = height < 700

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
      }

      return () => {
        // Restaurar configurações padrão ao sair da tela, se necessário
      }
    }, [navigation]),
  )

  const navigateToRegister = () => {
    navigation.navigate("Cadastro") // Rota ajustada
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true
    })

    return () => backHandler.remove()
  }, [])

  // Limpar erros quando o usuário começa a digitar
  useEffect(() => {
    if (name) setNameError("")
    if (generalError) setGeneralError("")
  }, [name])

  useEffect(() => {
    if (password) setPasswordError("")
    if (generalError) setGeneralError("")
  }, [password])

  const handleLogin = async () => {
    // Resetar mensagens de erro
    setNameError("")
    setPasswordError("")
    setGeneralError("")
    setShowErrorToast(false)

    // Validar inputs
    if (!name.trim()) {
      setNameError("Por favor, digite seu nome")
      return
    }

    if (!password.trim()) {
      setPasswordError("Por favor, digite sua senha")
      return
    }

    // Iniciar processo de login
    setIsLoading(true)

    try {
      // Chamar o serviço de login
      const result = await loginUser(name, password)

      if (result.success) {
        // Login bem-sucedido - mostrar mensagem de sucesso
        setShowSuccess(true)

        // Limpar os campos após login bem-sucedido
        setName("")
        setPassword("")

        // Aguardar a animação da mensagem de sucesso antes de navegar
        setTimeout(() => {
          try {
            navigation.navigate("Formulario")
            console.log("Navigation to Formulario succeeded")
          } catch (error) {
            console.log("Navigation failed:", error)
            setErrorToastMessage("Não foi possível navegar para o formulário. Tente novamente.")
            setShowErrorToast(true)
          }
        }, 1500) // Tempo suficiente para ver a mensagem de sucesso
      } else {
        // Login falhou - tratar os diferentes tipos de erro
        console.log("Login falhou:", result)

        if (result.field === "name") {
          setNameError(result.erro)
        } else if (result.field === "password") {
          setPasswordError(result.erro)
        } else if (result.isNetworkError) {
          setErrorToastMessage(result.erro)
          setShowErrorToast(true)
        } else {
          setGeneralError(result.erro || "Ocorreu um erro ao fazer login. Tente novamente.")
        }
      }
    } catch (error) {
      console.error("Erro inesperado durante o login:", error)
      setErrorToastMessage("Ocorreu um erro inesperado. Tente novamente mais tarde.")
      setShowErrorToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeAreaContainer, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Mensagem de sucesso animada */}
      <SuccessMessage
        visible={showSuccess}
        message="Login realizado com sucesso!"
        onHide={() => setShowSuccess(false)}
      />

      {/* Toast de erro animado */}
      <ErrorToast visible={showErrorToast} message={errorToastMessage} onHide={() => setShowErrorToast(false)} />

      <View style={styles.backgroundGradient}>
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: height * 0.05,
                paddingBottom: height * 0.05,
                paddingHorizontal: width * 0.05,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Profissional */}
            <ProfessionalLogo screenHeight={height} />

            <View
              style={[
                styles.formContainer,
                {
                  width: width > 500 ? 450 : width * 0.9,
                  marginTop: isSmallDevice ? height * 0.02 : height * 0.04,
                },
              ]}
            >
              {/* Cabeçalho verde com título branco */}
              <View style={styles.formHeader}>
                <Text style={styles.formHeaderText}>Login</Text>
              </View>

              <View style={styles.formContent}>
                {/* Mensagem de erro geral */}
                {generalError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{generalError}</Text>
                  </View>
                ) : null}

                <View style={[styles.inputWrapper, { marginBottom: height * 0.02 }]}>
                  <Text style={[styles.inputLabel, { fontSize: normalize(14) }]}>Nome</Text>
                  <View style={[styles.inputContainer, { height: height * 0.07 }, nameError ? styles.inputError : {}]}>
                    <TextInput
                      style={[styles.input, { fontSize: normalize(16) }]}
                      placeholder="Seu nome"
                      placeholderTextColor="#999"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                </View>

                <View style={[styles.inputWrapper, { marginBottom: height * 0.01 }]}>
                  <Text style={[styles.inputLabel, { fontSize: normalize(14) }]}>Senha</Text>
                  <View
                    style={[styles.inputContainer, { height: height * 0.07 }, passwordError ? styles.inputError : {}]}
                  >
                    <TextInput
                      style={[styles.input, { fontSize: normalize(16) }]}
                      placeholder="Sua senha"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      {/* Ícone de olho modificado */}
                      <Text style={styles.eyeIconText}>{showPassword ? "🔓" : "🔒"}</Text>
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity style={[styles.forgotPassword, { marginBottom: height * 0.03 }]}>
                  <Text style={[styles.forgotPasswordText, { fontSize: normalize(14) }]}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, { height: height * 0.07 }]}
                  activeOpacity={0.8}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={[styles.loginButtonText, { fontSize: normalize(16) }]}>ENTRAR</Text>
                  )}
                </TouchableOpacity>

                <View style={[styles.divider, { marginVertical: height * 0.02 }]}>
                  <View style={styles.dividerLine} />
                  <Text style={[styles.dividerText, { fontSize: normalize(14) }]}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={[styles.registerButton, { height: height * 0.07 }]}
                  activeOpacity={0.8}
                  onPress={navigateToRegister}
                  disabled={isLoading}
                >
                  <Text style={[styles.registerButtonText, { fontSize: normalize(16) }]}>CRIAR CONTA</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!isSmallDevice && (
              <View style={[styles.footer, { marginTop: height * 0.03 }]}>
                <Text style={[styles.footerText, { fontSize: normalize(12) }]}>
                  © 2025 Limpa Gyn • Todos os direitos reservados
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
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#8BC34A",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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
  inputLabel: {
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#ffffff", // Mantido branco para contraste
    paddingHorizontal: 15,
  },
  inputError: {
    borderColor: "#FF5252",
    backgroundColor: "#FFF8F8",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
    backgroundColor: "rgba(139, 195, 74, 0.1)", // Fundo verde claro para o ícone
    borderRadius: 20,
    marginLeft: 5,
  },
  eyeIconText: {
    fontSize: normalize(16),
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 5,
  },
  forgotPasswordText: {
    color: "#8BC34A",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#8BC34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 10,
  },
  registerButton: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#8BC34A",
  },
  registerButtonText: {
    color: "#8BC34A",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: normalize(12),
    marginTop: 4,
    marginLeft: 2,
  },
  // Estilos para a mensagem de sucesso
  successContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 1000,
  },
  successIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  successIcon: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "bold",
  },
  successText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  // Estilos para o toast de erro
  errorToastContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    right: 20,
    backgroundColor: "#F44336",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 1000,
  },
  errorIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  errorIcon: {
    color: "#F44336",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorToastText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
})

