
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
  .directive('chronoTimer', chronoTimerDirective);
