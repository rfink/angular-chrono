
/**
 * Object representing an individual timer.
 *
 * Currently the only option is interval. This represents
 * the time interval of each tick of the timer in ms. Default
 * is 1000ms.
 *
 * @param {String} name
 * @param {Object} opts
 * @param {[type]} listener
 */
function Timer(name, opts, listener) {
  this.timerId = null;
  this.name = name;
  this.opts = opts || { interval: 1000 };
  this.listener = listener;
  this.current = this.started = Date.now();
}

/**
 * Start a timer ticking.
 *
 * @return {Object} The timer we just started.
 */
Timer.prototype.start = function timerStart() {
  var self = this;
  var drift = (Date.now() - this.started) % 1000;

  this.timerId = setTimeout(function () {
    self.listener(self.name, self);
    self.start();
  }, this.opts.interval - drift);

  return this;
};

Timer.prototype.stop = function timerStop() {
  clearTimeout(this.timerId);
  this.timerId = null;

  return this;
};

/**
 * Chrono service object that wraps all of our timers.
 */
function ChronoService() {
  this.timers = {};
  this.listeners = {};
}

/**
 * Add a timer to our service.
 * @param {String} name
 * @param {Object} opts Options passed to the timer object.
 */
ChronoService.prototype.addTimer = function addTimer(name, opts) {
  var self = this;
  this.timers[name] = new Timer(name, opts, function (name, timer) {
    return self.onTick(name, timer);
  });
  return this;
};

ChronoService.prototype.removeTimer = function removeTimer(name) {
  if (!this.timers[name]) {
    return this;
  }

  this.timers[name].stop();
  delete this.timers[name];

  return this;
};

ChronoService.prototype.onTick = function onTick(name, timer) {
  timer.current = Date.now();
  angular.forEach(this.listeners[name], function (listener) {
    listener(null, timer);
  });
};

ChronoService.prototype.subscribe = function subscribe(name, fn) {
  if (typeof fn !== 'function') {
    fn = function noop() {};
  }

  if (!this.timers[name]) {
    fn(new Error('Timer ' + name + ' not found'));
    return this;
  }

  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(fn);

  return this;
};

ChronoService.prototype.unsubscribe = function unsubscribe(name, fn) {
  if (!this.listeners[name]) {
    return this;
  }

  var idx = -1;

  angular.forEach(this.listeners[name], function (listener, key) {
    if (listener === fn) {
      idx = key;
    }
  });

  if (idx !== -1) {
    this.listeners[name].splice(idx, 1);
  }

  return this;
};

ChronoService.prototype.start = function startService(name) {
  if (name) {
    if (this.timers[name]) {
      this.timers[name].start();
    }
    return;
  }

  angular.forEach(this.timers, function (timer) {
    timer.start();
  });

  return this;
};

ChronoService.prototype.stop = function stopService(name) {
  if (name) {
    if (this.timers[name]) {
      this.timers[name].stop();
    }
    return;
  }

  angular.forEach(this.timers, function (timer) {
    timer.stop();
  });

  return this;
};

angular.module('angular-chrono')
       .service('chronoService', [ChronoService]);