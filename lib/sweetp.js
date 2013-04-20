var SweetpService;

SweetpService = require('./SweetpService');

/**
 * TODO add static strings for parameter types for service configuration
 */

exports.start = function (methodsObject, port, host) {
	var service;

	service = new SweetpService(methodsObject, port, host);
	service.listen();

	return service;
};

/**
 * TODO add DSL description
 */
exports.createMethods = function(service, baseUrl) {
	var methods, configs, methodName, item;

	configs = [];
	methods = {};
	for (methodName in service) {
		if (service.hasOwnProperty(methodName)) {
			config = service[methodName];

			if (!config.target) {
				config.target = baseUrl + methodName;
			}

			item = {};
			item[config.target] = config.options;
			item[config.target].method = methodName;

			configs.push(item);

			methods[methodName] = config.fn;
		}
	}

	methods.getConfig = function(err, params, callback) {
		if (err) return callback(err);
		return callback(null, configs);
	};

	return methods;
};

