import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OrganizationListScreen from '../../screens/organization/OrganizationListScreen';
import AddEditOrganizationScreen from '../../screens/organization/AddEditOrganizationScreen';
import ViewOrganizationScreen from '../../screens/organization/ViewOrganizationScreen';

const Stack = createStackNavigator();

const OrganizationStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="OrganizationList"
        component={OrganizationListScreen}
        options={{title: 'Organizations'}}
      />
      <Stack.Screen
        name="AddEditOrganization"
        component={AddEditOrganizationScreen}
        options={{title: 'Organization Details'}}
      />
      <Stack.Screen
        name="ViewOrganization"
        component={ViewOrganizationScreen}
        options={{title: 'Organization Details'}}
      />
    </Stack.Navigator>
  );
};

export default OrganizationStack;
