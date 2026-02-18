import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import InstitutionListScreen from '../../screens/institution/InstitutionListScreen';
import AddEditInstitutionScreen from '../../screens/institution/AddEditInstitutionScreen';
import DeletedInstitutionScreen from '../../screens/institution/DeletedInstitutionScreen';
import ViewInstitutionScreen from '../../screens/institution/ViewInstitutionScreen';

const Stack = createStackNavigator();

const InstitutionStack: React.FC = () => {
  return (
    <Stack.Navigator>
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
      <Stack.Screen
        name="ViewInstitution"
        component={ViewInstitutionScreen}
        options={{
          title: 'Institution Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default InstitutionStack;
