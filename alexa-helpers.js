exports.formErrorResponse = (request, type, message = "") => {
    let { header, endpoint } = request.directive;
    header.namespace = 'Alexa';
    header.name = 'ErrorResponse';
    
    return {
        header: header,
        endpoint: endpoint,
        payload: {
            type: type,
            message: message
        }
    }
}

exports.formResponse = (request, context) => {
    let { header, endpoint } = request.directive;
    header.namespace = 'Alexa';
    header.name = 'Response';

    const response = {
        context: context,
        event: {
          header: header,
          endpoint: endpoint,
          payload: {},
        }
    };
    return response;    
}

exports.formModeResponse = (request, instance, value) => {
    const returnContext = {
        properties: [{
          namespace: 'Alexa.ModeController',
          name: 'mode',
          instance: instance,
          value: value,
          timeOfSample: (new Date()).toISOString(),
          uncertaintyInMilliseconds: 0
        }]
    };
    
    return exports.formResponse(request, returnContext);
}

exports.modeControllerCapabilityFactory = (instance, names, modes, ordered=false) => {
    let supportedModes = []
    for (var mode of modes) {
        let friendlyNames = []
        for (var friendlyName of mode.names) {
            friendlyNames.push(
                {
                    "@type": "text",
                    "value": {
                      "text": friendlyName,
                      "locale": "en-US"
                    }
                }  
            )            
        }
        supportedModes.push({
            "value": mode.value,
            "modeResources": {
              "friendlyNames": friendlyNames
            }  
        })
    }

    let friendlyNames = []
    for (var friendlyName of names) {
        friendlyNames.push(
            {
                "@type": "text",
                "value": {
                  "text": friendlyName,
                  "locale": "en-US"
                }
            }  
        )            
    }
    return {
        "type": "AlexaInterface",
        "interface": "Alexa.ModeController",
        "version": "3",
        "properties": {
        "supported": [
            {
            "name": "mode"
            }
        ],
        "retrievable": true,
        "proactivelyReported": true
        },
        "instance": instance,
        "capabilityResources": {
            "friendlyNames": friendlyNames
        },
        "configuration": {
            "ordered": ordered,
            "supportedModes": supportedModes
        }
    }
}