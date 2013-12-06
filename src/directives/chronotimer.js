
function chronoTimerDirective($compile, $log, chronoService) {

  function chronoCompile(elem, attrs, transclude) {

    return function chronoLink($scope, $element, $attrs) {

      var newScope = $scope.$new();
      var timerName = $attrs.timerName;

      if (!timerName) {
        $log.error('timer-name must be specified');
        return;
      }

      function setTimes(milliseconds) {
        newScope.seconds = Math.floor((milliseconds / 1000) % 60);
        newScope.totalSeconds = Math.floor(milliseconds / 1000);
        newScope.minutes = Math.floor((milliseconds / 60000) % 60);
        newScope.totalMinutes = Math.floor(milliseconds / 60000);
        newScope.hours = Math.floor((milliseconds / 3600000) % 24);
        newScope.totalHours = Math.floor((milliseconds / 3600000));
        newScope.totalDays = Math.floor((milliseconds / 3600000) / 24);
      }

      function render(err, timer) {
        if (err) {
          return console.error(err);
        }

        var startTime = null;

        if (!$attrs.startTime) {
          startTime = Date.now();
        } else {
          startTime = (new Date(newScope.$eval($attrs.startTime))).getTime();
        }

        if (isNaN(startTime)) {
          $log.error('Invalid start time specified');
          return;
        }

        newScope.milliseconds = timer.current - startTime;
        setTimes(newScope.milliseconds);
        newScope.$digest();
      }

      $element.bind('$destroy', function() {
        chronoService.unsubscribe(timerName, render);
      });

      transclude(newScope, function(clone, innerScope) {
        $element.replaceWith($compile(clone)(innerScope));
      });

      /*var html = $element.html().trim();
       var compiled = $compile(html)($scope);

       // Use our current scope
       $element.replaceWith(compiled);*/

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
