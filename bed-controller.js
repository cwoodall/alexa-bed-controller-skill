const Particle = require('particle-api-js');
const particle = new Particle();

module.exports = {
  SwitchId: {
    HeadUp: 0,
    HeadDown: 1,
    FeetUp: 2, 
    FeetDown: 3,
    BedUp:4,  
    BedDown:5,
    MemoA:6,
    MemoB:7,
    Zero:8,   
    LED:9,
    Flashlight:10,
    Max:11
  },
  pressFor(deviceId, token, switchId, duration=250) {
    arg = {
      switch: switchId,
      duration: duration
    };

    return particle.callFunction({
      deviceId: deviceId,
      name: 'pressFor',
      argument: JSON.stringify(arg),
      auth: token
    }).then((result) => {
      return result.body.return_value >= 0;
    }).catch((error) => {
      return null;
    });
  },

  isPressing(deviceId, token) { 
    return particle.getVariable({ deviceId: deviceId, name: 'isPressing', auth: token });
  },

  release(deviceId, token) {
    return particle.callFunction({
      deviceId: deviceId,
      name: 'release',
      argument: "",
      auth: token
    }).then((result) => {
      return result.body.return_value >= 0;
    }).catch((error) => {
      return null;
    });
  },
};