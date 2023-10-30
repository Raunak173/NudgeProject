import React, {Component} from 'react';
import {View} from 'react-native';
import NudgeUi from './NudgeUi';
import {Nudge} from './NudgeCore';

interface NudgeProviderProps {
  children: React.ReactNode;
  nudgeInstance: Nudge;
  uiCallBack: (ui: NudgeUi[]) => void;
  log?: (message: string) => void;
  plugins: NudgeUi[];
}

class NudgeProvider extends Component<NudgeProviderProps> {
  static navigatorKey: any = React.createRef<any>();
  uiCallBack: (plugin: NudgeUi[]) => void;

  constructor(props: NudgeProviderProps) {
    super(props);
    this.trackcalled = this.trackcalled.bind(this);
    this.uiCallBack = props.uiCallBack;
    props.nudgeInstance.getCallBack(this.trackcalled);
  }

  async trackcalled(trackdata: Record<string, any>): Promise<void> {
    const {plugins, nudgeInstance, log} = this.props;

    const gameKeyUiMapper: Record<string, NudgeUi | undefined> = {};

    for (const plugin of plugins) {
      gameKeyUiMapper[plugin.type] = plugin;
    }

    for (const campaign of trackdata['campaigns']) {
      const plugin = gameKeyUiMapper[campaign['gameKey']];

      if (plugin) {
        console.log(plugin, 'PLUGIN OVER HERER');
        try {
          const nudgeUi = plugin.copyWith({
            id: campaign['gameSettingsId'],
            token: nudgeInstance.userToken,
          });
          console.log(nudgeUi.id, 'nudgeUi TOKEN OVER HERER');

          plugin.ui = await nudgeUi.trigger({
            context: NudgeProvider.navigatorKey.current?.context,
            userStatId: campaign['userStatId'],
            position: campaign['position'],
          });
          // this.forceUpdate();
          // this.uiCallBack(plugin.ui)
          console.log(nudgeUi.trigger, 'TRIGGER FUNCTION');
        } catch (error) {
          if (log) {
            console.log(error);
          }
          if (process.env.NODE_ENV === 'development') {
            console.error(error);
          }
        }
      } else {
        const errorMessage = `No plugin found for ${trackdata['gameKey']}, ignoring.`;
        if (log) {
          log(errorMessage);
        }
        if (process.env.NODE_ENV === 'development') {
          console.warn(errorMessage);
        }
      }
    }
    this.uiCallBack(plugins);
  }

  componentDidMount() {
    const {nudgeInstance} = this.props;
    nudgeInstance.getCallBack(this.trackcalled);
  }

  render() {
    return (
      <View>
        {/* Render your NudgeUi components here */}
        {this.props.children}
      </View>
    );
  }
}

export default NudgeProvider;
