import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import Formulario from '../screens/Formulario';
import FormularioHistorico from '../screens/FormularioHistorico';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastro' }} />
        <Stack.Screen name="Formulario" component={Formulario} options={{ title: 'Formulário' }} />
        <Stack.Screen name="FormularioHistorico" component={FormularioHistorico} options={{ title: 'Histórico' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;