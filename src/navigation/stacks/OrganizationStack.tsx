import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OrganizationListScreen from '../../screens/organization/OrganizationListScreen';
import AddEditOrganizationScreen from '../../screens/organization/AddEditOrganizationScreen';
import ViewOrganizationScreen from '../../screens/organization/ViewOrganizationScreen';
import DeletedOrganizationScreen from '../../screens/organization/DeletedOrganizationScreen';

const Stack = createStackNavigator();

const OrganizationStack: React.FC = () => {
  return (
    <Stack.Navigator>
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
      <Stack.Screen
        name="DeletedOrganization"
        component={DeletedOrganizationScreen}
        options={{title: 'Deleted Organizations'}}
      />
    </Stack.Navigator>
  );
};

export default OrganizationStack;
