import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import InstitutionListScreen from '../../screens/institution/InstitutionListScreen';
import AddEditInstitutionScreen from '../../screens/institution/AddEditInstitutionScreen';
import DeletedInstitutionScreen from '../../screens/institution/DeletedInstitutionScreen';

const Stack = createStackNavigator();

const InstitutionStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,

      }}>
      <Stack.Screen
        name="InstitutionList"
        component={InstitutionListScreen}
        options={{
          title: 'Institutions',
        }}
      />
      <Stack.Screen
        name="AddEditInstitution"
        component={AddEditInstitutionScreen}
        options={{
          title: 'Institution Details',
        }}
      />
      <Stack.Screen
        name="DeletedInstitution"
        component={DeletedInstitutionScreen}
        options={{
          title: 'Deleted Institutions',
        }}
      />
    </Stack.Navigator>
  );
};

export default InstitutionStack;
