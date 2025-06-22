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
import ClaudeStorageScreen from './ClaudeStorageScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main app screens (after sign in)
const MainAppNavigator = () => {
  return (
    <Drawer.Navigator 
      drawerContent={props => <SideBar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
        }
      }}
    >
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Improvement" component={ImprovementScreen} />
      <Drawer.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Drawer.Screen name="Insights" component={InsightsScreen} />
      <Drawer.Screen name="ClaudeStorage" component={ClaudeStorageScreen} />
    </Drawer.Navigator>
  );
};

// Root navigator with sign in flow
const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="MainApp" 
        component={MainAppNavigator} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}