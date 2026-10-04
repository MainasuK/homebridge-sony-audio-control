import { safeGet, safeSet } from './safe-handler.js';

class PowerService {
  constructor(serviceParams) {
    this.api = serviceParams.api;
    this.log = serviceParams.log;
    this.outputZone = serviceParams.outputZone;

    this.hapService = new serviceParams.Service.Switch(serviceParams.accessoryName, serviceParams.accessoryName);

    this.hapService
      .getCharacteristic(serviceParams.Characteristic.On)
      .onGet(safeGet(this.getPowerState.bind(this), () => false, this.log, "Sony receiver power"))
      .onSet(safeSet(this.setPowerState.bind(this), this.log, "Sony receiver power"));
  }

  async getPowerState() {
    try {
      const powerState = await this.api.getPowerState();

      this.log.debug("Speaker is currently %s", powerState ? "on" : "off");
      return powerState;
    } catch (error) {
      this.log.error("getPowerState() failed: %s", error.message);
      throw error;
    }
  }

  async setPowerState(newPowerState) {
    try {
      await this.api.setPowerState(newPowerState);

      this.log.debug("Set power to %s", newPowerState ? "on" : "off");
    } catch (error) {
      this.log.error("setPowerState() failed: %s", error.message);
      throw error;
    }
  }
}

export default PowerService;
