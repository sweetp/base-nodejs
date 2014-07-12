var http = require('http');
var url = require('url');
var querystring = require('querystring');
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

/**
 * Calls a sweetp service.
 *
 * @param {String} serverUrl of the sweetp server, e.g. get as parameter
 *		with param type PARAMETER_TYPES.url
 * @param {String} project name
 * @param {String} service path, without leading and trailing slash, e.g. /ui/dialog/password
 * @param {Object} params map which key and value for the service call, e.g. {key:'value'}
 * @param {Boolean} raw JSON, fetched from call. not parsed
 * @param {Function} callback
 */
exports.callService = function (serverUrl, project, service, params, raw, callback) {
	var options, parsed;

	// parse URL into its parts
	parsed = url.parse(serverUrl);

	// create empty request options
	options = {};

	// set options from parsed url
	options.hostname = parsed.hostname;
	options.port = parsed.port;
	options.protocol = parsed.protocol;

	// add path for service and project
	options.path = "/services/" + project + "/" + service;

	// add params
	options.path += "?" + querystring.stringify(params);

	// accept only json from server
	options.headers = {
		'Accept':'application/json'
	};

	// make the request
	return http.get(options, function(res) {
		var data = '';

		// concat data
		res.on('data', function (chunk) {
			data += chunk;
		});

		// data received
		res.on('end', function () {
			if (res.statusCode === 404) {
				return callback(new Error("Sweetp server can't find service '" + service + "', please take a look into the server logs and your services.json file."));
			}

			if (res.statusCode !== 200) {
				// error code, break
				return callback(new Error("Error during call to service '" + service + "', got response: " + res.statusCode + " and data: " + data));
			}

			if (raw) {
				// get raw result
				return callback(null, data);
			}

			// parse json
			json = JSON.parse(data);

			// pass only service answer to callback
			return callback(null, json.service);
		});
	}).on('error', function(e) {
		return callback(new Error("Error during call to service '" + service + "', " + e.message));
	});
};
