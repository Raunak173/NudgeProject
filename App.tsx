import React from 'react';
import {View, Text} from 'react-native';
import NudgeProvider from './NudgeProvider';
import {Nudge} from './NudgeCore';

// Your app's main component
function App() {
  const nudgeInstance = new Nudge({apiKey: 'YOUR API KEY'});

  const uiCallBack = ui => {};

  const nudgeUiPlugins = [];

  return (
    <NudgeProvider
      nudgeInstance={nudgeInstance}
      uiCallBack={uiCallBack}
      plugins={nudgeUiPlugins}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>My App</Text>
      </View>
    </NudgeProvider>
  );
}

export default App;
