import { TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import sensor from "@ohos.sensor";
import BusinessError from "@ohos.base"
import Logger from "./Logger"

export default class RNShakeModuleImpl {
  private context: TurboModuleContext | undefined = undefined;
  private MIN_TIME_BETWEEN_SAMPLES_NS = 20000000;
  // Number of nanoseconds to listen for and count shakes (nanoseconds)
  private SHAKING_WINDOW_NS = 3000000000;
  // Required force to constitute a rage shake. Need to multiply gravity by 1.33 because a rage
  // shake in one direction should have more force than just the magnitude of free fall.
  private REQUIRED_FORCE = 9.81 * 1.33;
  private GRAVITY_EARTH = 9.81;
  private SENSOR_DELAY_UI = 60000000;
  private mNumShakes: number = 0;
  private mLastTimestamp: number = -1;
  private mLastShakeTimestamp: number = 0;
  private mMinNumShakes: number = 1;
  private mAccelerationX: number = 0;
  private mAccelerationY: number = 0;
  private mAccelerationZ: number = 0;

  constructor(context: TurboModuleContext) {
    this.context = context;
    try {
      sensor.on(sensor.SensorId.ACCELEROMETER, (data: sensor.AccelerometerResponse) => {
        if (data.timestamp - this.mLastTimestamp < this.MIN_TIME_BETWEEN_SAMPLES_NS) {
          return;
        }
        const ax = data.x;
        const ay = data.y;
        const az = data.z - this.GRAVITY_EARTH;
        this.mLastTimestamp = data.timestamp;
        if (this.atLeastRequiredForce(ax) && ax * this.mAccelerationX <= 0) {
          this.recordShake(data.timestamp);
          this.mAccelerationX = ax;
        } else if (this.atLeastRequiredForce(ay) && ay * this.mAccelerationY <= 0) {
          this.recordShake(data.timestamp);
          this.mAccelerationY = ay;
        } else if (this.atLeastRequiredForce(az) && az * this.mAccelerationZ <= 0) {
          this.recordShake(data.timestamp);
          this.mAccelerationZ = az;
        }
        this.maybeDispatchShake(data.timestamp)
      }, {
        interval: this.SENSOR_DELAY_UI
      });
    } catch (error) {
      let e: BusinessError.BusinessError = error as BusinessError.BusinessError;
      Logger.error(`Failed to invoke on. Code: ${e.code}, message: ${e.message}`);
    }
  }

  maybeDispatchShake(currentTimestamp: number) {
    if (this.mNumShakes >= 8 * this.mMinNumShakes) {
      this.reset();
      // send event
      this.context.rnInstance.emitDeviceEvent("ShakeEvent", "")
    }
    if (currentTimestamp - this.mLastShakeTimestamp > this.SHAKING_WINDOW_NS) {
      this.reset();
    }
  }

  recordShake(timestamp: number) {
    this.mLastShakeTimestamp = timestamp;
    this.mNumShakes++;
  }

  atLeastRequiredForce(a: number): boolean {
    return Math.abs(a) > this.REQUIRED_FORCE;
  }

  reset() {
    this.mNumShakes = 0;
    this.mAccelerationX = 0;
    this.mAccelerationY = 0;
    this.mAccelerationZ = 0;
  }
}