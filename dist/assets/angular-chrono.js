
(function(window, angular, undefined) {


angular.module('angular-chrono', []);


/**
 * Directive for our chrono timer, display the timer with the given
 *   settings and update on the specified interval.
 */
function chronoTimerDirective($compile, $log, chronoService) {

  /**
   * Compiler handler
   */
  function chronoCompile(elem, attrs, transclude) {

    return function chronoLink($scope, $element, $attrs) {

      var newScope = $scope.$new();
      var timerName = $attrs.timerName;

      if (!timerName) {
        $log.error('timer-name must be specified');
        return;
      }

      /**
       * Set times on the scope
       */
      function setTimes(milliseconds) {
        newScope.seconds = Math.floor((milliseconds / 1000) % 60);
        newScope.totalSeconds = Math.floor(milliseconds / 1000);
        newScope.minutes = Math.floor((milliseconds / 60000) % 60);
        newScope.totalMinutes = Math.floor(milliseconds / 60000);
        newScope.hours = Math.floor((milliseconds / 3600000) % 24);
        newScope.totalHours = Math.floor((milliseconds / 3600000));
        newScope.totalDays = Math.floor((milliseconds / 3600000) / 24);
      }

      /**
       * Render the timer
       */
      function render(err, timer) {
        if (err) {
          return $log.error(err);
        }

        var startTime = null;

        if (!$attrs.startTime) {
          startTime = Date.now();
        } else {
          startTime = (new Date(newScope.$eval($attrs.startTime))).getTime();
        }

        if (isNaN(startTime)) {
          if (timer.opts.resetOnStop) {
            newScope.seconds = 0;
            newScope.totalSeconds = 0;
            newScope.minutes = 0;
            newScope.totalMinutes = 0;
            newScope.hours = 0;
            newScope.totalHours = 0;
            newScope.totalDays = 0;
            newScope.$digest();
          }
          return;
        }

        newScope.milliseconds = Math.abs(timer.current - startTime);
        setTimes(newScope.milliseconds);
        newScope.$digest();
      }

      /**
       * Unsubscribe from the service on scope destroy
       */
      $scope.$on('$destroy', function onScopeDestroy() {
        chronoService.unsubscribe(timerName, render);
      });

      /**
       * Replace our element with the transclude-d content
       */
      transclude(newScope, function doReplace(clone, innerScope) {
        $element.replaceWith($compile(clone)(innerScope));
      });

      chronoService.subscribe(timerName, render);

    };

  }

  return {
    restrict: 'EA',
    replace: true,
    scope: true,
    transclude: true,
    compile: chronoCompile
  };

}

angular.module('angular-chrono')
  .directive('chronoTimer', [
    '$compile',
    '$log',
    'chronoService',
    chronoTimerDirective
  ]);


/**
 * Zero-pad our time display
 */
function zeroPadFilter(input) {
  if (input !== 0 && !input) {
    return;
  }
  input = input.toString();
  return new Array(2 - input.length + 1).join('0') + input;
}

/**
 * Simple wrapper to return a function
 */
function wrapper() {
  return zeroPadFilter;
}

angular.module('angular-chrono')
  .filter('zeropad', wrapper);

/**
 * Object representing an individual timer.
 *
 * Currently the only option is interval. This represents
 * the time interval of each tick of the timer in ms. Default
 * is 1000ms.
 */
function Timer(name, opts, listener) {
  this.timerId = null;
  this.name = name;
  this.opts = {
    interval: opts.interval || 1000,
    resetOnStop: opts.resetOnStop || false
  };
  this.listener = listener;
  this.current = this.started = Date.now();
}

/**
 * Start a timer ticking.
 */
Timer.prototype.start = function timerStart() {
  var self = this;
  var drift = (Date.now() - this.started) % 1000;

  this.timerId = setTimeout(function init() {
    self.listener(self.name, self);
    self.start();
  }, this.opts.interval - drift);

  return this;
};

/**
 * Stop a timer ticking.
 */
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
 */
ChronoService.prototype.addTimer = function addTimer(name, opts) {
  var self = this;
  this.timers[name] = new Timer(name, opts, function listener(name, timer) {
    return self.onTick(name, timer);
  });
  return this;
};

/**
 * Remove timer from our service (by name).
 */
ChronoService.prototype.removeTimer = function removeTimer(name) {
  if (!this.timers[name]) {
    return this;
  }

  this.timers[name].stop();
  delete this.timers[name];

  return this;
};

/**
 * When the timer ticks, this method will be called with the timer
 *   name and the timer object.
 */
ChronoService.prototype.onTick = function onTick(name, timer) {
  timer.current = Date.now();
  angular.forEach(this.listeners[name], function eachListener(listener) {
    listener(null, timer);
  });
};

/**
 * Subscribe to the service with the given timer name and callback.
 */
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

/**
 * Unsubscribe by name/method.
 */
ChronoService.prototype.unsubscribe = function unsubscribe(name, fn) {
  if (!this.listeners[name]) {
    return this;
  }

  var idx = -1;

  angular.forEach(this.listeners[name], function eachListener(listener, key) {
    if (listener === fn) {
      idx = key;
    }
  });

  if (idx !== -1) {
    this.listeners[name].splice(idx, 1);
  }

  return this;
};

/**
 * Start the service, if name is passed, only start that timer, otherwise
 *   start all the timers.
 */
ChronoService.prototype.start = function startService(name) {
  if (name) {
    if (this.timers[name]) {
      this.timers[name].start();
    }
    return;
  }

  angular.forEach(this.timers, function eachTimer(timer) {
    timer.start();
  });

  return this;
};

/**
 * Stop the service, if name is passed, only stop that timer, otherwise
 *   stop all the timers.
 */
ChronoService.prototype.stop = function stopService(name) {
  if (name) {
    if (this.timers[name]) {
      this.timers[name].stop();
    }
    return;
  }

  angular.forEach(this.timers, function eachTimer(timer) {
    timer.stop();
  });

  return this;
};

/**
 * Clear all timers and subscribers from the service (cleanup)
 */
ChronoService.prototype.clear = function clearService() {
  angular.forEach(this.timers, function eachTimer(timer) {
    timer.stop();
  });
  this.timers = {};
  this.listeners = {};
};

angular.module('angular-chrono')
  .service('chronoService', [ChronoService]);

}(window, angular));
