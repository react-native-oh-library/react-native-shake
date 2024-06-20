import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import RNShakeModuleImpl from "./RNShakeModuleImpl"

export class ShakeTuboModule extends TurboModule implements TM.RNShake.Spec {
  public static readonly NAME = 'RNShake';

  constructor(ctx) {
    super(ctx);
    new RNShakeModuleImpl(ctx);
  }

  addListener(eventName: string): void {
  }

  removeListeners(count: number): void {
  }
}
