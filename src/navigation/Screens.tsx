import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Articles, Components, Dashboard, Home, Profile, Register, Pro} from '../screens';
import {useScreenOptions, useTranslation} from '../hooks';
import InstitutionStack from './stacks/InstitutionStack';
import OrganizationStack from './stacks/OrganizationStack';
import ModuleStack from './stacks/ModuleStack';

const Stack = createStackNavigator();

export default () => {
  const {t} = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{title: 'Master Data'}}
      />

      <Stack.Screen
        name="Home"
        component={Home}
        options={{title: t('navigation.home')}}
      />

      <Stack.Screen
        name="Components"
        component={Components}
        options={screenOptions.components}
      />

      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{title: t('navigation.articles')}}
      />

      <Stack.Screen name="Pro" component={Pro} options={screenOptions.pro} />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Institution"
        component={InstitutionStack}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Organization"
        component={OrganizationStack}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Modules"
        component={ModuleStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
