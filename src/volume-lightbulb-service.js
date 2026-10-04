import VolumeCharacteristics from './volume-characteristics.js';
import { safeGet, safeSet } from './safe-handler.js';

class VolumeLightbulbService {
  constructor(serviceParams, maxVolume) {
    this.api = serviceParams.api;
    this.log = serviceParams.log;
    this.outputZone = serviceParams.outputZone;
    this.lastChanges = serviceParams.lastChanges;
    this.maxVolume = maxVolume;

    this.hapService = new serviceParams.Service.Lightbulb(`${serviceParams.accessoryName} Volume`);

    const volumeCharacteristics = new VolumeCharacteristics();

    this.hapService
      .getCharacteristic(serviceParams.Characteristic.On)
      .onGet(safeGet(volumeCharacteristics.getMuteState.bind(this), () => false, this.log, "Volume mute"))
      .onSet(safeSet(volumeCharacteristics.setMuteState.bind(this), this.log, "Volume mute"));

    this.hapService
      .addCharacteristic(new serviceParams.Characteristic.Brightness())
      .onGet(safeGet(volumeCharacteristics.getVolume.bind(this), () => 0, this.log, "Volume level"))
      .onSet(safeSet(volumeCharacteristics.setVolume.bind(this), this.log, "Volume level"));
  }
}

export default VolumeLightbulbService;
