var net;
net = require('net');

function SweetpService(methodsObject, port, host) {
	this.methods = methodsObject;
	this.host = host;

	if (port === null || port === undefined) {
		this.port = process.env.PORT;
	} else {
		this.port = port;
	}
}

SweetpService.prototype.listen = function() {
	this.socket = net.createConnection(this.port, this.host, this.onConnect.bind(this));
	this.socket.on('data', this.onData.bind(this));
};

SweetpService.prototype.sendResponse = function(response) {
	var message = JSON.stringify(response);
	console.log("------ send: " + message);
	this.socket.write(message + "\n");
	console.log("------ done");
};

SweetpService.prototype.onConnect = function() {
	console.log('Connection with sweetp server established.');
};

SweetpService.prototype.onData = function(data) {
	console.log("Data recieved from server");

	try {
		return this.parseMessage(null, data, this.respond.bind(this));
	} catch (e) {
		return this.respond(e);
	}

};

SweetpService.prototype.parseMessage = function(err, data, callback) {
	var json;
	if (err) return callback(err);
	json = JSON.parse(data.toString());

	if (json.method === null || json.method === undefined ||
		typeof this.methods[json.method] !== 'function') {
		return callback(new Error("Missing method: " + json.method));
	}

	return this.methods[json.method].call(this.methods, null, json.params, callback);
};

SweetpService.prototype.respond = function(err, data) {
	var response;

	if (err && err.match && err.match(/^Missing method/)) {
		response = {
			status: 404,
			data: err
		};
	} else if (err) {
		console.error(err.message, err.stack);
		response = {
			status: 500,
			data: err.message
		};
	} else {
		response = {
			status: 200,
			data: data
		};
	}

	return this.sendResponse(response);
};

/**
 * @public
 */
SweetpService.prototype.closeSocket = function() {
	this.socket.destroy();
};

module.exports = SweetpService;
