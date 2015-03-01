var net, _, jayson, log, createLogger;

net = require('net');
_ = require('lodash');
jayson = require('jayson');
createLogger = require('./log');

/**
 * Sweet service base class.
 *
 * @public
 * @param {String} name of service
 * @param {Object} methodsObject with service methods in it
 * @param {Integer} port of Sweetp server, leave empty to get this from environment
 * @param {String} host of Sweetp server, leave empty for localhost
 */
function SweetpService(name, methodsObject, port, host) {
	this.host = host || 'localhost';
	this.methods = methodsObject;

	this.log = createLogger(name + ':base:');

	if (port === null || port === undefined) {
		this.sweetpServerPort = process.env.HTTP_PORT;
	} else {
		this.sweetpServerPort = port;
	}
}

SweetpService.prototype.register = function () {
	var port;

	// let system assign a port
	port = 0;

	// create server for arbitrary connection interface
	this.server = jayson.server(this.methods);

	// create HTTP interface and start it
	httpServer = this.server.http();
	httpServer.listen(port, function (err) {
		var serverUrl, myServerPort;

		if (err) {
			this.log.error("An error occured on spawning JSON RPC server:", err);
			return;
		}

		// get port of http server, this is needed because we get the port from OS
		myServerPort = httpServer.address().port;
		this.log.debug("http port: ", myServerPort);

		serverUrl = "http://" + this.host + ":" + this.sweetpServerPort + "/serviceBroker";
		this.log.debug("server url: ", serverUrl);

		// connect to sweetp server
		this.client = jayson.client.http(serverUrl);

		// register our service methods
		this.client.request('registerHttpService', [myServerPort], function(err, error, response) {
			if(err) return this.log.error("Can't register service methods at sweetp server:", err, error, response);
			this.log.info("Succesfully registered our service methods at sweetp server:", response);
		}.bind(this));
	}.bind(this));

	// close http server on exit
	process.on('exit', function () {
		this.log.info("process exit");
		httpServer.close();
		process.exit(0);
	}.bind(this));
};

module.exports = SweetpService;
