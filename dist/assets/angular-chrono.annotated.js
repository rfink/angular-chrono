(function (window, angular, undefined) {
  angular.module('angular-chrono', []);
  function chronoTimerDirective($log, chronoService) {
    function chronoController($scope, $element, $attrs) {
      var timerName = $attrs.timerName;
      if (!timerName) {
        $log.error('timer-name must be specified');
        return;
      }
      function setTimes(milliseconds) {
        $scope.seconds = Math.floor(milliseconds / 1000 % 60);
        $scope.totalSeconds = Math.floor(milliseconds / 1000);
        $scope.minutes = Math.floor(milliseconds / 60000 % 60);
        $scope.totalMinutes = Math.floor(milliseconds / 60000);
        $scope.hours = Math.floor(milliseconds / 360000 % 24);
        $scope.totalHours = Math.floor(milliseconds / 360000);
        $scope.totalDays = Math.floor(milliseconds / 360000 / 24);
      }
      chronoService.subscribe(timerName, function (err, timer) {
        if (err) {
          return console.error(err);
        }
        var startTime = null;
        if (!$attrs.startTime) {
          startTime = Date.now();
        } else {
          startTime = new Date($attrs.startTime).getTime();
        }
        if (isNaN(startTime)) {
          $log.error('Invalid start time specified');
          return;
        }
        $scope.milliseconds = timer.current - startTime;
        setTimes($scope.milliseconds);
        $scope.$digest();
      });
    }
    var ctrlParams = [
        '$scope',
        '$element',
        '$attrs',
        chronoController
      ];
    return {
      restrict: 'EA',
      replace: false,
      scope: 'isolate',
      controller: ctrlParams
    };
  }
  angular.module('angular-chrono').directive('chronoTimer', chronoTimerDirective);
  function zeroPadFilter(input) {
    if (input !== 0 && !input) {
      return;
    }
    input = input.toString();
    return new Array(2 - input.length + 1).join('0') + input;
  }
  function wrapper() {
    return zeroPadFilter;
  }
  angular.module('angular-chrono').filter('zeropad', wrapper);
  function Timer(name, opts, chrono) {
    this.timerId = null;
    this.name = name;
    this.opts = opts || { interval: 1000 };
    this.chrono = chrono;
    this.current = this.started = Date.now();
  }
  Timer.prototype.start = function timerStart() {
    var self = this;
    var drift = (Date.now() - this.started) % 1000;
    this.timerId = setTimeout(function () {
      self.chrono.onTick(self.name, self);
      self.start();
    }, this.opts.interval - drift);
    return this;
  };
  Timer.prototype.stop = function timerStop() {
    clearTimeout(this.timerId);
    this.timerId = null;
    return this;
  };
  function ChronoService() {
    this.timers = {};
    this.listeners = {};
  }
  ChronoService.prototype.addTimer = function addTimer(name, opts) {
    this.timers[name] = new Timer(name, opts, this);
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
      fn = function noop() {
      };
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
  ChronoService.prototype.start = function startService() {
    angular.forEach(this.timers, function (timer) {
      timer.start();
    });
    return this;
  };
  ChronoService.prototype.stop = function stopService() {
    angular.forEach(this.timers, function (timer) {
      timer.stop();
    });
    return this;
  };
  angular.module('angular-chrono').service('chronoService', [ChronoService]);
}(window, angular));