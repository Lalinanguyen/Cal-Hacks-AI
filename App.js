import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import SignInScreen from './SignInScreen';
import ProfileScreen from './ProfileScreen';
import ImprovementScreen from './ImprovementScreen';
import SideBar from './SideBar';
import LeaderboardScreen from './LeaderboardScreen';
import InsightsScreen from './InsightsScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Improvement" 
        component={ImprovementScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator 
        drawerContent={props => <SideBar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: '80%',
          }
        }}
      >
        <Drawer.Screen name="Main" component={MainStackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}