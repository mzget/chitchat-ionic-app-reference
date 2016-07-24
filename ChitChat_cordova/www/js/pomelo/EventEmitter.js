
var isArray = Array.isArray;
var defaultMaxListeners = 10;

var root = this;
var _events = {};

class EventEmitter {

    constructor() {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports.EventEmitter = EventEmitter;
        }
        else {
            root = window;
            root.EventEmitter = EventEmitter;
        }
    }




    // By default EventEmitters will print a warning if more than
    // 10 listeners are added to it. This is a useful default which
    // helps finding memory leaks.
    //
    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.

    setMaxListeners(n) {
        if (!_events) _events = {};
        this._maxListeners = n;
    };


    emit() {
        var type = arguments[0];

        // If there is no 'error' event listener then throw.
        if (type === 'error') {
            if (!_events || !_events.error ||
                (isArray(_events.error) && !_events.error.length)) {
                if (this.domain) {
                    var er = arguments[1];
                    er.domain_emitter = this;
                    er.domain = this.domain;
                    er.domain_thrown = false;
                    this.domain.emit('error', er);
                    return false;
                }

                if (arguments[1] instanceof Error) {
                    throw arguments[1]; // Unhandled 'error' event
                }
                else {
                    throw new Error("Uncaught, unspecified 'error' event.");
                }
            }
        }

        if (!_events) return false;
        var handler = _events[type];
        if (!handler) return false;

        if (typeof handler == 'function') {
            if (this.domain) {
                this.domain.enter();
            }
            switch (arguments.length) {
                // fast cases
                case 1:
                    handler.call(this);
                    break;
                case 2:
                    handler.call(this, arguments[1]);
                    break;
                case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                // slower
                default:
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    handler.apply(this, args);
            }
            if (this.domain) {
                this.domain.exit();
            }
            return true;

        } else if (isArray(handler)) {
            if (this.domain) {
                this.domain.enter();
            }
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

            var listeners = handler.slice();
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
            if (this.domain) {
                this.domain.exit();
            }
            return true;

        } else {
            return false;
        }
    };

    addListener(type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('addListener only takes instances of Function');
        }

        if (!_events) _events = {};

        // To avoid recursion in the case that type == "newListeners"! Before
        // adding it to the listeners, first emit "newListeners".  
        //	this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);

        if (!_events[type]) {
            // Optimize the case of one listener. Don't need the extra array object.
            _events[type] = listener;
        } else if (isArray(_events[type])) {

            // If we've already got an array, just append.
            _events[type].push(listener);

        } else {
            // Adding the second element, need to change to array.
            _events[type] = [_events[type], listener];

        }

        // Check for listener leak
        if (isArray(_events[type]) && !_events[type].warned) {
            var m;
            if (this._maxListeners !== undefined) {
                m = this._maxListeners;
            } else {
                m = defaultMaxListeners;
            }

            if (m && m > 0 && _events[type].length > m) {
                _events[type].warned = true;
                console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    _events[type].length);
                console.trace();
            }
        }

        return this;
    };

    on() {
        return EventEmitter.prototype.addListener;
    }
    // EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    once(type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('.once only takes instances of Function');
        }

        var self = this;
        function g() {
            self.removeListener(type, g);
            listener.apply(this, arguments);
        };

        g.listener = listener;
        self.on(type, g);

        return this;
    };

    removeListener(type, listener) {
        if ('function' !== typeof listener) {
            throw new Error('removeListener only takes instances of Function');
        }

        // does not use listeners(), so no side effect of creating _events[type]
        if (!_events || !_events[type]) return this;

        var list = _events[type];

        if (isArray(list)) {
            var position = -1;
            for (var i = 0, length = list.length; i < length; i++) {
                if (list[i] === listener ||
                    (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }

            if (position < 0) return this;
            list.splice(position, 1);
        } else if (list === listener ||
            (list.listener && list.listener === listener)) {
            delete _events[type];
        }

        return this;
    };

    removeAllListeners(type) {
        if (arguments.length === 0) {
            _events = {};
            return this;
        }

        var events = _events && _events[type];
        if (!events) return this;

        if (isArray(events)) {
            events.splice(0);
        } else {
            _events[type] = null;
        }

        return this;
    };

    listeners(type) {
        if (!_events) _events = {};
        if (!_events[type]) _events[type] = [];
        if (!isArray(_events[type])) {
            _events[type] = [_events[type]];
        }
        return _events[type];
    }
}

module.exports = EventEmitter;