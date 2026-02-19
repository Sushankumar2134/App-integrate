import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ModuleListScreen} from '../../screens/modules/ModuleListScreen';
import {AddEditModuleScreen} from '../../screens/modules/AddEditModuleScreen';
import {ViewModuleScreen} from '../../screens/modules/ViewModuleScreen';
import DeletedModulesScreen from '../../screens/modules/DeletedModulesScreen';

const Stack = createStackNavigator();

const ModuleStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ModuleList" component={ModuleListScreen} />
      <Stack.Screen name="AddEditModule" component={AddEditModuleScreen} />
      <Stack.Screen name="ViewModule" component={ViewModuleScreen} />
      <Stack.Screen name="DeletedModules" component={DeletedModulesScreen} options={{title: 'Deleted Modules'}} />
    </Stack.Navigator>
  );
};

export default ModuleStack;
