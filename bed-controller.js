const Particle = require('particle-api-js');
const particle = new Particle();

module.exports = {
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
  }
};