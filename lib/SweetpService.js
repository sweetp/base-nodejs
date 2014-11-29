var net, _;

net = require('net');
_ = require('lodash');
jayson = require('jayson');

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

	// TODO use 'debug' node package as newer services?!
	this.log = _.partial(console.log, "[" + name + " service]");
	this.logError = _.partial(this.logError, "[" + name + " service]");

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
			this.logError("An error occured on spawning JSON RPC server:", err);
			return;
		}

		// get port of http server, this is needed because we get the port from OS
		myServerPort = httpServer.address().port;
		this.log("http port: ", myServerPort);

		serverUrl = "http://" + this.host + ":" + this.sweetpServerPort + "/serviceBroker";
		this.log("server url: ", serverUrl);

		// connect to sweetp server
		this.client = jayson.client.http(serverUrl);

		// register our service methods
		this.client.request('registerHttpService', [myServerPort], function(err, error, response) {
			if(err) return this.log("Can't register service methods at sweetp server:", err, error, response);
			this.log("Succesfully registered our service methods at sweetp server:", response);
		}.bind(this));
	}.bind(this));

	// close http server on exit
	process.on('exit', function () {
		this.log("process exit");
		httpServer.close();
		process.exit(0);
	}.bind(this));
};

module.exports = SweetpService;
