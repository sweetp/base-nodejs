(function () {
	var SweetpService;

	SweetpService = require('./SweetpService');

	/**
	 * Static strings for parameter types for service configuration.
	 *
	 * See [JVM version](https://github.com/sweetp/base-groovy/blob/master/src/main/groovy/org/hoschi/sweetp/services/base/ServiceParameter.groovy) for more details.
	 */
	exports.PARAMETER_TYPES = {};
	exports.PARAMETER_TYPES.url = "url";
	exports.PARAMETER_TYPES.one = "one";
	exports.PARAMETER_TYPES.projectConfig = "projectConfig";
	exports.PARAMETER_TYPES.list = "list";
	exports.PARAMETER_TYPES.request = "request";

	exports.start = function (name, methodsObject, port, host) {
		var service;

		service = new SweetpService(name, methodsObject, port, host);
		service.listen();

		return service;
	};

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
})();
