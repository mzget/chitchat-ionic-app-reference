
(function () {
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() { }
			F.prototype = o;
			return new F();
		};
	}

	var root = window;
	var eventEmit = require("./EventEmitter");
	var protocol = require("./Protocal");
	var pomelo = Object.create(eventEmit.prototype); // object extend from object
	root.pomelo = pomelo;
	var socket = null;
	var id = 1;
	var callbacks = {};

	module.exports = pomelo;

	pomelo.init = function (params, cb) {
		pomelo.params = params;
		params.debug = true;
		var host = params.host;
		var port = params.port;

		var url = 'ws://' + host;
		if (port) {
			url += ':' + port;
		}

		socket = io.connect(url, { 'force new connection': true, reconnect: false });
		//      socket = io.connect(url, { 'force new connection': true }); reconnection: false, reconnectionDelay: 1000 

		socket.on('connect', function () {
			console.log('[pomeloclient.init] websocket connected!');

			cb(null);
		});
		socket.on('connect_timeout', function () {
			console.log('connect_timeout');
		});
		socket.on('connect_error', function () {
			console.log('connect_error');
		});

		socket.on('reconnect', function () {
			console.log('reconnect');
		});
		socket.on('reconnect_failed', function () {
			console.log('reconnect_failed');
		});
		socket.on('reconnect_error', function () {
			console.log('reconnect_error');
		});

		socket.on('message', function (data) {
			if (typeof data === 'string') {
				data = JSON.parse(data);
			}
			if (data instanceof Array) {
				processMessageBatch(pomelo, data);
			} else {
				processMessage(pomelo, data);
			}
		});

		socket.on('error', function (err) {
			var msg = err + " : " + url;
			console.error("pomelo.init: error! " + msg);

			cb(msg);
		});

		socket.on('disconnect', function (reason) {
			pomelo.emit('disconnect', reason);
			console.warn("disconnect: ", reason);
		});
	};

	pomelo.disconnect = function () {
		if (socket) {
			socket.disconnect();
			socket = null;
		}
	};

	pomelo.request = function (route) {
		if (!route) {
			return;
		}
		var msg = {};
		var cb;
		var arguments = Array.prototype.slice.apply(arguments);
		if (arguments.length === 2) {
			if (typeof arguments[1] === 'function') {
				cb = arguments[1];
			} else if (typeof arguments[1] === 'object') {
				msg = arguments[1];
			}
		} else if (arguments.length === 3) {
			msg = arguments[1];
			cb = arguments[2];
		}
		msg = filter(msg, route);
		id++;
		callbacks[id] = cb;
		var sg = protocol.encode(id, route, msg);
		socket.send(sg);
	};

	pomelo.notify = function (route, msg) {
		this.request(route, msg);
	};

	pomelo.on = eventEmit.prototype.addListener;

	var processMessage = function (pomelo, msg) {
		var route;
		if (msg.id) {
			//if have a id then find the callback function with the request
			var cb = callbacks[msg.id];

			delete callbacks[msg.id];
			if (typeof cb !== 'function') {
				//		console.log('[pomeloclient.processMessage] cb is not a function for request ' + msg.id);
				return;
			}

			cb(msg.body);
			return;
		}

		// server push message or old format message
		processCall(msg);

		//if no id then it should be a server push message
		function processCall(msg) {
			var route = msg.route;
			if (!!route) {
				if (!!msg.body) {
					pomelo.emit(route, msg.body);
				} else {
					var body = msg.body.body;
					if (!body) {
						body = msg.body;
					}
					pomelo.emit(route, body);
				}
			} else {
				pomelo.emit(msg.body.route, msg.body);
			}
		}
	};

	var processMessageBatch = function (pomelo, msgs) {
		for (var i = 0, l = msgs.length; i < l; i++) {
			processMessage(pomelo, msgs[i]);
		}
	};

	function filter(msg, route) {
		if (route.indexOf('area.') === 0) {
			msg.areaId = pomelo.areaId;
		}

		msg.timestamp = Date.now();
		return msg;
	}

	return {
		init: pomelo.init,
		request: pomelo.request,
		disconnect: pomelo.disconnect,
		on: pomelo.on,
		emit: pomelo.emit,
		notify: pomelo.notify,
		removeListener: pomelo.removeListener,
		removeAllListeners: pomelo.removeAllListeners
	}
})()