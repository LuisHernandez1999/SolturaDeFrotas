"use client" // Mantido como você pediu, mas não afeta o React Native

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
  BackHandler,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useNavigation, CommonActions } from "@react-navigation/native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const scale = SCREEN_WIDTH / 375

const normalize = (size) => {
  const newSize = size * scale
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
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

export default function LoginScreen() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { width, height } = useWindowDimensions()
  const isSmallDevice = height < 700

  const navigation = useNavigation()

  const navigateToRegister = () => {
    navigation.navigate("Cadastro") // Rota ajustada
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      return true
    })

    return () => backHandler.remove()
  }, [])

  const handleLogin = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Erro", "Por favor, digite seu nome")
      return
    }

    if (!password.trim()) {
      Alert.alert("Erro", "Por favor, digite sua senha")
      return
    }

    // Simulate login process
    setIsLoading(true)

    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false)

      // Navegação simplificada para "Formulario"
      try {
        navigation.navigate("Formulario")
        console.log("Navigation to Formulario succeeded")
      } catch (error) {
        console.log("Navigation failed:", error)
        Alert.alert("Erro de Navegação", "Não foi possível navegar para o formulário. Tente novamente.", [
          {
            text: "OK",
            onPress: () => console.log("Navigation failed"),
          },
        ])
      }

      // Reset form
      setName("")
      setPassword("")
    }, 1500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
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
                  padding: width * 0.06,
                  marginTop: isSmallDevice ? height * 0.02 : height * 0.04,
                },
              ]}
            >
              <Text style={[styles.welcomeText, { fontSize: normalize(22) }]}>Bem-vindo</Text>

              <View style={[styles.inputWrapper, { marginBottom: height * 0.02 }]}>
                <Text style={[styles.inputLabel, { fontSize: normalize(14) }]}>Nome</Text>
                <View style={[styles.inputContainer, { height: height * 0.07 }]}>
                  <TextInput
                    style={[styles.input, { fontSize: normalize(16) }]}
                    placeholder="Seu nome"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={[styles.inputWrapper, { marginBottom: height * 0.01 }]}>
                <Text style={[styles.inputLabel, { fontSize: normalize(14) }]}>Senha</Text>
                <View style={[styles.inputContainer, { height: height * 0.07 }]}>
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
                    <Text style={[styles.eyeIconText, { fontSize: normalize(18) }]}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: "white",
    borderRadius: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
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
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  eyeIconText: {},
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
})