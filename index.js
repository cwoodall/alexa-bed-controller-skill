
const DEVICE_ID = 'emmett_bed_controller';
const BedController = require('./bed-controller');
const Logger = require('./logger.js');

exports.handler = async (request, context, callback) => {
  Logger.debug(`Handler request: ${JSON.stringify(request)}`);
  Logger.debug(`Handler context: ${JSON.stringify(context)}`);

  
  const response = await handleRequest(request);
  Logger.debug(`Response: ${JSON.stringify(response)}`);
  callback(null, response);
};

function handleRequest(request) {
  let { namespace, name } = request.directive.header;

  switch (namespace) {
    case 'Alexa.Discovery':
      return handleDiscovery(request);

    case 'Alexa.PowerController':
      return handlePowerControl(request);

    case 'Alexa':
      if (name === 'ReportState') {
        return handleStateReport(request);
      }
      return {};

    default:
      log('ERROR', `Unknown namespace ${namespace}`);
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
          endpointId: 'flightlight-001', 
          manufacturerName: 'Chris Woodall',
          friendlyName: "Flashlight",
          description: "Flashlight",
          displayCategories: ['SWITCH'],
          capabilities: [
            {
              type: 'AlexaInterface',
              interface: 'Alexa',
              version: '3'
            },
            {
              interface: 'Alexa.PowerController',
              version: '3',
              type: 'AlexaInterface',
              properties: {
                supported: [{
                  name: 'powerState'
                }],
                retrievable: true,
                proactivelyReported: false
              }
            }
          ]
        },
        {
            endpointId: 'memo-a', 
            manufacturerName: 'Chris Woodall',
            friendlyName: "Memo A",
            description: "Memo",
            displayCategories: ['SWITCH'],
            capabilities: [
              {
                type: 'AlexaInterface',
                interface: 'Alexa',
                version: '3'
              },
              {
                interface: 'Alexa.PowerController',
                version: '3',
                type: 'AlexaInterface',
                properties: {
                  supported: [{
                    name: 'powerState'
                  }],
                  retrievable: true,
                  proactivelyReported: false
                }
              }
            ]
          }
        ]
      } 
    } 
  };
}


async function handlePowerControl(request) {
  Logger.debug('Triggered PowerControl');
  const token = getParticleTokenFromRequest(request);

  let stateToSet;
  // Set correct state based on the Alexa directive
  if (request.directive.header.name === 'TurnOn') {
    stateToSet = 'ON';
  } else {
    stateToSet = 'OFF';
  }

  // Set the state on the device, also get the actual state (should be the same)
  const success = await BedController.pressFor(DEVICE_ID, token, 10);
  Logger.debug('return: ' + success);
  let { header, endpoint } = request.directive;
  header.namespace = 'Alexa';
  header.name = 'Response';

  const returnContext = {
    properties: [ {
      namespace: 'Alexa.PowerController',
      name: 'powerState',
      value: "OFF",
      timeOfSample: (new Date()).toISOString(),
      uncertaintyInMilliseconds: 0
    } ]
  };

  const response = {
    context: returnContext,
    event: {
      header: header,
      endpoint: endpoint,
      payload: {}
    }
  };

  Logger.debug(`Set State: ${JSON.stringify(response)}`);
  return response;
}

async function handleStateReport(request) {
  let { header, endpoint } = request.directive;
  header.name = 'StateReport';

  const token = getParticleTokenFromRequest(request);
  const stateBool = await BedController.isPressing(DEVICE_ID, token);

  const returnContext = { 
    properties: [{
      namespace: 'Alexa.PowerController',
      name: 'powerState',
      value: stateBool.body.result ? 'ON' : 'OFF',
      timeOfSample: stateBool.body.coreInfo.last_heard,
      uncertaintyInMilliseconds: 0
    }] 
  };

  const response = {
    context: returnContext,
    event: { 
      header: header,
      endpoint: endpoint,
      payload: {}
    } 
  };

  Logger.debug(`State Response: ${JSON.stringify(response)}`);
  return response;
}

function getParticleTokenFromRequest(request) {
  // request.directive.endpoint.scope.token OR request.directive.payload.scope.token
  const tokenData = (request || {}).directive || {};
  return ((tokenData.endpoint || tokenData.payload || {}).scope || {}).token;
}

