import { TurboModulesFactory, RNPackage, RNOHContext } from '@rnoh/react-native-openharmony/ts';
import type { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts'
import { ShakeTuboModule } from './ShakeTuboModule'

class ShakeTuboModuleFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === "RNShake") {
      return new ShakeTuboModule(this.ctx);
    }
    return null
  }

  hasTurboModule(name: string): boolean {
    return name === "RNShake"
  }
}

export class ShakePackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new ShakeTuboModuleFactory(ctx)
  }
}


