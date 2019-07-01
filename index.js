
const DEVICE_ID = 'emmett_bed_controller';
const BedController = require('./bed-controller');
const AlexaHelpers = require('./alexa-helpers.js')
const Logger = require('./logger.js');

exports.handler = async (request, context, callback) => {
  Logger.debug(`Handler request: ${JSON.stringify(request)}`);
  Logger.debug(`Handler context: ${JSON.stringify(context)}`);

  const response = await handleRequest(request);
  Logger.debug(`Response: ${JSON.stringify(response)}`);
  callback(null, response);
};

function handleRequest(request) {
  let { namespace, name, instance} = request.directive.header;

  switch (namespace) {
    case 'Alexa.Discovery':
      return handleDiscovery(request);
    case 'Alexa':
      return {};
    case 'Alexa.ModeController':
      switch (instance) {
      case "Bed.Position":
        return handleBedPosition(request);
      case "Bed.Move.Height":
        return handleMoveBedHeight(request);
        case "Bed.Move.Feet":
        return handleMoveBedFeet(request);
        case "Bed.Move.Head":
        return handleMoveBedHead(request);
      }  
      return {};
    default:
      Logger.log('ERROR', `Unknown namespace ${namespace}`);
      return {};
  }
}

function handleDiscovery(request) {
  let header = request.directive.header;
  header.name = 'Discover.Response';

  return {
    event: {
      header: header,
      payload: {
        endpoints: [{
          endpointId: 'bed-control',
          manufacturerName: 'Apricity',
          friendlyName: "Bed",
          description: "Bed",
          displayCategories: ['OTHER'],
          cookie: {},
          capabilities: [
            AlexaHelpers.modeControllerCapabilityFactory(
              "Bed.Position",
              ["Bed Position"],
              [
                {value: "BedPosition.Flat", names: ["Flat"]},
                {value: "BedPosition.MemoA", names: ["Memo A", "Sleep"]},
                {value: "BedPosition.MemoB", names: ["Memo B", "Hanging Out"]}
              ]
            ),
            AlexaHelpers.modeControllerCapabilityFactory(
              "Bed.Move.Height",
              ["Move Bed Height", "Bed Height", "Bed"],
              [
                {value: "BedMoveHeight.Up", names: ["Raise", "Up", "Move Up"]},
                {value: "BedMoveHeight.Stop", names: ["Stop", "Halt"]},
                {value: "BedMoveHeight.Down", names: ["Lower", "Down", "Move Down"]}
              ]
            ),
            AlexaHelpers.modeControllerCapabilityFactory(
              "Bed.Move.Feet",
              ["Move Bed Feet", "Bed Feet", "Feet", "Legs", "Move Bed Legs", "Move Legs", "Move Feet"],
              [
                {value: "BedMoveFeet.Up", names: ["Raise", "Up", "Move Up"]},
                {value: "BedMoveFeet.Stop", names: ["Stop", "Halt"]},
                {value: "BedMoveFeet.Down", names: ["Lower", "Down", "Move Down"]}
              ]
            ),
            AlexaHelpers.modeControllerCapabilityFactory(
              "Bed.Move.Head",
              ["Move Bed Head", "Bed Head", "Bed Torso", "Head", "Torso", "Head Unit", "Move Head", "Move Head Unit"],
              [
                {value: "BedMoveHead.Up", names: ["Raise", "Up", "Move Up"]},
                {value: "BedMoveHead.Stop", names: ["Stop", "Halt"]},
                {value: "BedMoveHead.Down", names: ["Lower", "Down", "Move Down"]}
              ]
            ),
          ]
        }]
      }
    }
  };
}

async function handleBedPosition(request) {
  Logger.debug('Triggered BedPosition');
  const token = getParticleTokenFromRequest(request);
  const modeToSet = request.directive.payload.mode;

  let switch_id = BedController.SwitchId.Max;
  switch (modeToSet) {
  case 'BedPosition.Flat':
      switch_id = BedController.SwitchId.Zero;
      break;
  case 'BedPosition.MemoA':
      switch_id = BedController.SwitchId.MemoA;
      break;
  case 'BedPosition.MemoB':
      switch_id = BedController.SwitchId.MemoB;
      break;
  }
  
  if (switch_id === BedController.SwitchId.Max) { 
    return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
  }
  
  const success = await BedController.pressFor(DEVICE_ID, token, switch_id);
  return AlexaHelpers.formModeResponse(request, "Bed.Position", modeToSet);
}

async function handleMoveBedHeight(request) {
  Logger.debug('Triggered BedMoveHeight');
  const token = getParticleTokenFromRequest(request);
  const modeToSet = request.directive.payload.mode;

  let switch_id = BedController.SwitchId.Max;
  let stop = false;
  switch (modeToSet) {
  case 'BedMoveHeight.Up':
    switch_id = BedController.SwitchId.BedUp;
    break;
  case 'BedMoveHeight.Stop':
    stop = true;
    break;
  case 'BedMoveHeight.Down':
    switch_id = BedController.SwitchId.BedDown;
    break;
  }
  
  if (stop) {
    const success = await BedController.release(DEVICE_ID, token);
  } else if (switch_id === BedController.SwitchId.Max) { 
    return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
  } else {
    await BedController.release(DEVICE_ID, token);
    const success = await BedController.pressFor(DEVICE_ID, token, switch_id, 30000);
    if (!success) {
      return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
    }
  }
  
  return AlexaHelpers.formModeResponse(request, "Bed.Move.Height", modeToSet);
}

async function handleMoveBedFeet(request) {
  Logger.debug('Triggered BedMoveFeet');
  const token = getParticleTokenFromRequest(request);
  const modeToSet = request.directive.payload.mode;
  let timer = 5000;
  let switch_id = BedController.SwitchId.Max;
  let stop = false;
  switch (modeToSet) {
  case 'BedMoveFeet.Up':
    switch_id = BedController.SwitchId.FeetUp;
    timer = 5000;
    break;
  case 'BedMoveFeet.Stop':
    stop = true;
    break;
  case 'BedMoveFeet.Down':
    switch_id = BedController.SwitchId.FeetDown;
    timer = 10000;
    break;
  }
  
  if (stop) {
    const success = await BedController.release(DEVICE_ID, token);
  } else if (switch_id === BedController.SwitchId.Max) { 
    return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
  } else {
    const success = await BedController.pressFor(DEVICE_ID, token, switch_id, timer);
    if (!success) {
      return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
    }
  }
  
  return AlexaHelpers.formModeResponse(request, "Bed.Move.Feet", modeToSet);
}

async function handleMoveBedHead(request) {
  Logger.debug('Triggered BedMoveHead');
  let timer = 5000;
  const token = getParticleTokenFromRequest(request);
  const modeToSet = request.directive.payload.mode;

  let switch_id = BedController.SwitchId.Max;
  let stop = false;
  switch (modeToSet) {
  case 'BedMoveHead.Up':
    switch_id = BedController.SwitchId.HeadUp;
    timer = 5000;
    break;
  case 'BedMoveHead.Stop':
    stop = true;
    break;
  case 'BedMoveHead.Down':
    switch_id = BedController.SwitchId.HeadDown;
    timer = 10000;
    break;
  }
  
  if (stop) {
    const success = await BedController.release(DEVICE_ID, token);
  } else if (switch_id === BedController.SwitchId.Max) { 
    return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
  } else {
    const success = await BedController.pressFor(DEVICE_ID, token, switch_id, timer);
    if (!success) {
      return AlexaHelpers.formErrorResponse(request, "INVALID_VALUE", "Invalid Bed Position."); 
    }
  }
  
  return AlexaHelpers.formModeResponse(request, "Bed.Move.Head", modeToSet);
}

function getParticleTokenFromRequest(request) {
  // request.directive.endpoint.scope.token OR request.directive.payload.scope.token
  const tokenData = (request || {}).directive || {};
  return ((tokenData.endpoint || tokenData.payload || {}).scope || {}).token;
}

