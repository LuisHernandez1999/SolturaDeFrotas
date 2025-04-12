import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NavigationContainer } from "@react-navigation/native"

// Importando as telas
import BemVindo from "../screens/BemVindo"
import Login from "../screens/Login"
import Cadastro from "../screens/Cadastro"
import Menu from "../screens/Menu"
import Formulario from "../screens/Formulario"
import FormularioHistorico from "../screens/FormularioHistorico"

const Stack = createNativeStackNavigator()

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BemVindo">
        <Stack.Screen name="BemVindo" component={BemVindo} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false, title: "Login" }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: "Cadastro" }} />
        <Stack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
        <Stack.Screen name="Formulario" component={Formulario} options={{ title: "Formulário" }} />
        <Stack.Screen name="FormularioHistorico" component={FormularioHistorico} options={{ title: "Histórico" }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
