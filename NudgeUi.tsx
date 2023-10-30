import {ReactElement} from 'react';

interface BuildContext {
  // Define the required properties and methods for BuildContext here
  // You might need to replace this with the actual interface in your project
}

interface NudgeUi {
  id: string;
  token: string | null;
  type: string;
  ui: ReactElement;

  copyWith({id, token}: {id: string; token: string | null}): NudgeUi;

  trigger(params: {
    context: BuildContext;
    userStatId: string;
    position?: string;
  }): Promise<ReactElement>;

  getCallBack(callback: (data: any) => void): void;
}

export default NudgeUi;
