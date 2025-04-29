// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import DispositivoDetailScreen from '../screens/DispositivoDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import CrearIncidenciaScreen from '../screens/CrearIncidencia';
import DetalleIncidencia from '../screens/DetalleIncidencia';


export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  DispositivoDetail: { id: number };
  CrearIncidencia: undefined;
  DetalleIncidencia: { incidenciaId: number };

};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="DispositivoDetail" component={DispositivoDetailScreen} />
        <Stack.Screen name="CrearIncidencia" component={CrearIncidenciaScreen} />
        <Stack.Screen name="DetalleIncidencia" component={DetalleIncidencia} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}