var debug = require('debug');

module.exports = function (name) {
    var log = {};
    ['debug', 'error', 'warn', 'info'].forEach(function (level) {
        log[level] = debug(name + level);
    });
    return log;
};
