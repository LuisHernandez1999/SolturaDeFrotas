"use client"

import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  PixelRatio,
  Platform,
} from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const scale = SCREEN_WIDTH / 375

const normalize = (size) => {
  const newSize = size * scale
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
}

// Premium Glass Morphism Effect Component
const GlassMorphism = ({ style, intensity = 0.12, borderIntensity = 0.25, scale = 1 }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scale,
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.bezier(0.445, 0.05, 0.55, 0.95),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 12000,
          easing: Easing.bezier(0.445, 0.05, 0.55, 0.95),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "3deg"],
  })

  return (
    <Animated.View
      style={[
        styles.glassMorphism,
        style,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { rotate }],
        },
      ]}
    >
      <View
        style={[
          styles.glassMorphismInner,
          {
            backgroundColor: `rgba(255, 255, 255, ${intensity})`,
            borderColor: `rgba(255, 255, 255, ${borderIntensity})`,
          },
        ]}
      />
    </Animated.View>
  )
}

// Luxury Light Beam Effect
const LightBeam = ({ style, delay = 0 }) => {
  const translateAnim = useRef(new Animated.Value(-200)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Delayed start
    setTimeout(() => {
      // Animate beam across screen
      Animated.loop(
        Animated.parallel([
          Animated.timing(translateAnim, {
            toValue: SCREEN_WIDTH + 200,
            duration: 4000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 1000,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 8000, // Long pause between beams
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start()
    }, delay)
  }, [])

  return (
    <Animated.View
      style={[
        styles.lightBeam,
        style,
        {
          opacity: opacityAnim,
          transform: [{ translateX: translateAnim }],
        },
      ]}
    />
  )
}

// Enhanced Floating Particles Component
const FloatingParticles = () => {
  // Create 30 particles with random positions and animations
  const [particles, setParticles] = useState(() => {
    return Array(30)
      .fill()
      .map((_, i) => ({
        id: i,
        size: Math.random() * 12 + 4,
        startX: Math.random() * SCREEN_WIDTH,
        startY: Math.random() * SCREEN_HEIGHT,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        duration: Math.random() * 15000 + 10000,
        // Add some variety to particle shapes
        isSquare: Math.random() > 0.7, // 30% chance of being square
        isTriangle: Math.random() > 0.9, // 10% chance of being triangle
      }))
  })

  useEffect(() => {
    particles.forEach((particle) => {
      const { translateX, translateY, opacity, scale, duration } = particle

      // Random movement
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: Math.random() * 150 - 75,
              duration: duration,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -150 - Math.random() * 150,
              duration: duration,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start()

      // Fade in and out with longer visible time
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: Math.random() * 0.6 + 0.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration - 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start()

      // Scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: Math.random() * 0.7 + 0.5,
            duration: duration / 2,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: Math.random() * 0.7 + 0.5,
            duration: duration / 2,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    })
  }, [particles])

  return (
    <View style={styles.particlesContainer}>
      {particles.map((particle) => {
        // Determine particle style based on shape
        const particleStyle = {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.isSquare ? particle.size * 0.2 : particle.isTriangle ? 0 : particle.size / 2,
          left: particle.startX,
          top: particle.startY,
          opacity: particle.opacity,
          transform: [
            { translateX: particle.translateX },
            { translateY: particle.translateY },
            { scale: particle.scale },
            // Add rotation for triangles
            ...(particle.isTriangle ? [{ rotate: "45deg" }] : []),
          ],
        }

        // Special style for triangles
        if (particle.isTriangle) {
          return (
            <Animated.View key={particle.id} style={[styles.triangleParticle, particleStyle]}>
              <View style={styles.triangleInner} />
            </Animated.View>
          )
        }

        return <Animated.View key={particle.id} style={[styles.particle, particleStyle]} />
      })}
    </View>
  )
}

// Premium Animated Logo Component
const AnimatedLogo = ({ size }) => {
  // Animation values
  const rotation = useRef(new Animated.Value(0)).current
  const innerRotation = useRef(new Animated.Value(0)).current
  const scaleValue = useRef(new Animated.Value(0.6)).current
  const opacity = useRef(new Animated.Value(0)).current
  const shimmerValue = useRef(new Animated.Value(0)).current
  const leafRotation = useRef(new Animated.Value(0)).current
  const leafScale = useRef(new Animated.Value(1)).current
  const pulseAnimation = useRef(new Animated.Value(1)).current
  const glowOpacity = useRef(new Animated.Value(0)).current
  const textY = useRef(new Animated.Value(20)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const ringScale = useRef(new Animated.Value(0.8)).current
  const ringOpacity = useRef(new Animated.Value(0)).current
  const outerRingScale = useRef(new Animated.Value(0.7)).current
  const outerRingOpacity = useRef(new Animated.Value(0)).current
  const accentScale = useRef(new Animated.Value(0)).current
  const accentOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textY, {
        toValue: 0,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(ringScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0.8,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(outerRingScale, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(outerRingOpacity, {
        toValue: 0.5,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(accentScale, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(accentOpacity, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous rotation animation - outer circle (slow)
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Continuous rotation animation - inner circle (faster, opposite direction)
    Animated.loop(
      Animated.timing(innerRotation, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Leaf animation - more complex movement
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leafRotation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(leafScale, {
            toValue: 1.1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(leafRotation, {
            toValue: 0,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(leafScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Shimmer animation - faster and more pronounced
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const innerSpin = innerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  })

  const leafSpin = leafRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "20deg"],
  })

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, size],
  })

  return (
    <View style={styles.logoContainer}>
      {/* Outer glow effect */}
      <Animated.View
        style={[
          styles.logoGlow,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size * 0.9,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Outer animated ring */}
      <Animated.View
        style={[
          styles.logoOuterRing,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            borderWidth: 1,
            opacity: outerRingOpacity,
            transform: [{ scale: outerRingScale }, { rotate: innerSpin }],
          },
        ]}
      />

      {/* Animated ring */}
      <Animated.View
        style={[
          styles.logoRing,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
            borderWidth: 1,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }, { rotate: spin }],
          },
        ]}
      />

      {/* Main logo circle */}
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate: spin }, { scale: pulseAnimation }],
            opacity,
          },
        ]}
      >
        {/* Inner circle with opposite rotation */}
        <Animated.View
          style={[
            styles.innerCircle,
            {
              width: size * 0.85,
              height: size * 0.85,
              borderRadius: size * 0.425,
              transform: [{ rotate: innerSpin }],
            },
          ]}
        >
          {/* Enhanced shimmer effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                width: size * 0.6,
                height: size,
                transform: [{ translateX: shimmerTranslate }, { rotate: "45deg" }],
              },
            ]}
          />

          {/* Logo text */}
          <Text style={[styles.logoText, { fontSize: size * 0.35 }]}>LG</Text>

          {/* Animated leaf with scale and rotation */}
          <Animated.View
            style={[
              styles.leafContainer,
              {
                top: size * 0.15,
                right: size * 0.2,
                transform: [{ rotate: leafSpin }, { scale: leafScale }],
              },
            ]}
          >
            <View
              style={[
                styles.leaf,
                {
                  width: size * 0.12,
                  height: size * 0.18,
                },
              ]}
            />
          </Animated.View>

          {/* Additional decorative elements */}
          <Animated.View
            style={[
              styles.logoAccent,
              {
                top: size * 0.15,
                left: size * 0.2,
                opacity: accentOpacity,
                transform: [{ scale: accentScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.logoAccent,
              {
                bottom: size * 0.15,
                left: size * 0.25,
                opacity: accentOpacity,
                transform: [{ scale: accentScale }],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>

      {/* App name with animation */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textY }, { scale: pulseAnimation }],
        }}
      >
        <Text style={styles.appName}>LIMPA GYN</Text>
        <View style={styles.taglineContainer}>
          <View style={styles.taglineLine} />
          <Text style={styles.taglineText}>VERSÃO 1.0</Text>
          <View style={styles.taglineLine} />
        </View>
      </Animated.View>
    </View>
  )
}

// Premium Background Animation Component
const AnimatedBackground = () => {
  const [dimensions, setDimensions] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  })

  // Create animated values for multiple layers
  const circle1 = useRef(new Animated.Value(0)).current
  const circle2 = useRef(new Animated.Value(0)).current
  const circle3 = useRef(new Animated.Value(0)).current
  const wave1 = useRef(new Animated.Value(0)).current
  const wave2 = useRef(new Animated.Value(0)).current
  const wave3 = useRef(new Animated.Value(0)).current
  const blurIntensity = useRef(new Animated.Value(0)).current
  const gradientPosition = useRef(new Animated.Value(0)).current

  // Update dimensions on orientation change
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      })
    }

    Dimensions.addEventListener("change", updateDimensions)

    return () => {
      // Clean up event listener
      if (Dimensions.removeEventListener) {
        Dimensions.removeEventListener("change", updateDimensions)
      }
    }
  }, [])

  useEffect(() => {
    // Animate blur intensity
    Animated.timing(blurIntensity, {
      toValue: 1,
      duration: 2000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false, // Opacity cannot use native driver
    }).start()

    // Animate gradient position
    Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1,
        duration: 15000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    ).start()

    // Animate circles with different durations and easing
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1, {
          toValue: 1,
          duration: 25000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(circle1, {
          toValue: 0,
          duration: 25000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2, {
          toValue: 1,
          duration: 30000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(circle2, {
          toValue: 0,
          duration: 30000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle3, {
          toValue: 1,
          duration: 35000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(circle3, {
          toValue: 0,
          duration: 35000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Animate waves
    Animated.loop(
      Animated.timing(wave1, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    Animated.loop(
      Animated.timing(wave2, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    Animated.loop(
      Animated.timing(wave3, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  const rotate1 = circle1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const rotate2 = circle2.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  })

  const rotate3 = circle3.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const translateX1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [-dimensions.width, 0],
  })

  const translateX2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [-dimensions.width, 0],
  })

  const translateX3 = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [-dimensions.width, 0],
  })

  const blurOpacity = blurIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  })

  const gradientTop = gradientPosition.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0%", "30%", "0%"],
  })

  return (
    <View style={styles.backgroundContainer}>
      {/* Animated gradient background */}
      <Animated.View
        style={[
          styles.gradientBackground,
          {
            top: gradientTop,
          },
        ]}
      />

      {/* Animated circles */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.circle1,
          {
            transform: [{ rotate: rotate1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.circle2,
          {
            transform: [{ rotate: rotate2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.circle3,
          {
            transform: [{ rotate: rotate3 }],
          },
        ]}
      />

      {/* Animated waves */}
      <View style={styles.wavesContainer}>
        <Animated.View style={[styles.wave, styles.wave1, { transform: [{ translateX: translateX1 }] }]} />
        <Animated.View style={[styles.wave, styles.wave2, { transform: [{ translateX: translateX2 }] }]} />
        <Animated.View style={[styles.wave, styles.wave3, { transform: [{ translateX: translateX3 }] }]} />
      </View>

      {/* Light beams */}
      <LightBeam style={{ top: "30%", transform: [{ rotate: "-20deg" }] }} delay={2000} />
      <LightBeam style={{ top: "60%", transform: [{ rotate: "15deg" }] }} delay={5000} />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Blur overlay - animated opacity */}
      <Animated.View style={[styles.blurOverlay, { opacity: blurOpacity }]} />

      {/* Glass morphism elements */}
      <GlassMorphism
        style={{ top: "15%", left: "10%", width: 120, height: 120, transform: [{ rotate: "15deg" }] }}
        intensity={0.08}
        borderIntensity={0.2}
      />
      <GlassMorphism
        style={{ bottom: "25%", right: "5%", width: 150, height: 150, transform: [{ rotate: "-10deg" }] }}
        intensity={0.1}
        borderIntensity={0.25}
        scale={1.05}
      />
      <GlassMorphism
        style={{ bottom: "10%", left: "15%", width: 100, height: 100, transform: [{ rotate: "30deg" }] }}
        intensity={0.12}
        borderIntensity={0.3}
        scale={1.1}
      />
      <GlassMorphism
        style={{ top: "40%", right: "15%", width: 80, height: 80, transform: [{ rotate: "-25deg" }] }}
        intensity={0.15}
        borderIntensity={0.35}
        scale={1.15}
      />
    </View>
  )
}

// Premium Button Component with Animation
const AnimatedButton = ({ label, style, textStyle, onPress, delay = 0, isOutlined = false }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const shimmerAnim = useRef(new Animated.Value(-100)).current
  const glowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    // Shimmer effect animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 200,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Glow effect animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  // Button press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[style]}
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={[textStyle]}>{label}</Text>

        {/* Add subtle highlight effect for non-outlined buttons */}
        {!isOutlined && <View style={styles.buttonHighlight} />}

        {/* Shimmer effect */}
        {!isOutlined && (
          <Animated.View
            style={[
              styles.buttonShimmer,
              {
                transform: [{ translateX: shimmerAnim }],
              },
            ]}
          />
        )}

        {/* Glow effect for outlined buttons */}
        {isOutlined && (
          <Animated.View
            style={[
              styles.buttonGlow,
              {
                opacity: glowAnim,
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

// Welcome Screen Component
const BemVindo = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Hide header
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false,
      })
    }

    // Set status bar
    StatusBar.setBarStyle("light-content")
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true)
      StatusBar.setBackgroundColor("transparent")
    }

    // Fade in the footer
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 1500,
      useNativeDriver: true,
    }).start()
  }, [navigation])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Premium Animated Background with Blur */}
      <AnimatedBackground />

      {/* Overlay with gradient */}
      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* Premium Logo */}
        <AnimatedLogo size={160} />

        {/* Premium Buttons */}
        <View style={styles.buttonsContainer}>
          <AnimatedButton
            label="LOGIN"
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
            onPress={() => navigation.navigate("Login")}
            delay={800}
          />

          <AnimatedButton
            label="CADASTRAR"
            style={styles.registerButton}
            textStyle={styles.registerButtonText}
            onPress={() => navigation.navigate("Cadastro")}
            delay={1000}
            isOutlined={true}
          />
        </View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerText}>© 2025 • Todos os direitos reservados</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8BC34A",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 1.5,
    backgroundColor: "#8BC34A",
    backgroundImage: "linear-gradient(180deg, #9CCC65 0%, #8BC34A 50%, #7CB342 100%)",
  },
  backgroundCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: 700,
    height: 700,
    backgroundColor: "rgba(156, 204, 101, 0.3)",
    top: -300,
    left: -150,
  },
  circle2: {
    width: 600,
    height: 600,
    backgroundColor: "rgba(139, 195, 74, 0.25)",
    bottom: -200,
    right: -150,
  },
  circle3: {
    width: 500,
    height: 500,
    backgroundColor: "rgba(124, 179, 66, 0.2)",
    bottom: 100,
    left: -200,
  },
  wavesContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    width: SCREEN_WIDTH * 2,
    height: 100,
    left: 0,
  },
  wave1: {
    bottom: "15%",
    height: 50,
    backgroundColor: "rgba(156, 204, 101, 0.15)",
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  wave2: {
    bottom: "5%",
    height: 70,
    backgroundColor: "rgba(124, 179, 66, 0.15)",
    borderTopLeftRadius: 800,
    borderTopRightRadius: 800,
  },
  wave3: {
    bottom: "25%",
    height: 40,
    backgroundColor: "rgba(205, 220, 57, 0.1)",
    borderTopLeftRadius: 1200,
    borderTopRightRadius: 1200,
  },
  lightBeam: {
    position: "absolute",
    width: 200,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  triangleParticle: {
    position: "absolute",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
  },
  triangleInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    transform: [{ rotate: "45deg" }],
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
  },
  glassMorphism: {
    position: "absolute",
    borderRadius: 20,
    overflow: "hidden",
  },
  glassMorphismInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    backgroundColor: "rgba(156, 204, 101, 0.3)",
    shadowColor: "#8BC34A",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  logoRing: {
    position: "absolute",
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  logoOuterRing: {
    position: "absolute",
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#fff",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  outerCircle: {
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginBottom: 25,
  },
  innerCircle: {
    backgroundColor: "#7CB342",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  shimmer: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  logoText: {
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  leafContainer: {
    position: "absolute",
  },
  leaf: {
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#CDDC39",
    transform: [{ rotate: "45deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoAccent: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  appName: {
    color: "white",
    fontSize: normalize(28),
    fontWeight: "bold",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  taglineText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: normalize(12),
    fontWeight: "600",
    letterSpacing: 1.5,
    marginHorizontal: 8,
  },
  buttonsContainer: {
    width: "80%",
    maxWidth: 300,
  },
  buttonContainer: {
    marginBottom: 16,
    overflow: "hidden",
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  buttonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  buttonShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ skewX: "-20deg" }],
  },
  buttonGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  loginButtonText: {
    color: "#8BC34A",
    fontSize: normalize(16),
    fontWeight: "bold",
    letterSpacing: 1,
  },
  registerButton: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    height: 56,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: normalize(12),
    textAlign: "center",
  },
})

export default BemVindo
