
exports.log = (type, value) => {
    console.log(`${type}: ${value}`);
}

exports.debug = (value) => { exports.log("DEBUG", value); }