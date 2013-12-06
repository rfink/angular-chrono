
function chronoTimerDirective($compile, $log, chronoService) {

  function chronoController($scope, $element, $attrs) {

    var html = $element.html().trim();
    var compiled = $compile(html)($scope);

    // Use our current scope
    $element.replaceWith(compiled);

    var timerName = $attrs.timerName;

    if (!timerName) {
      $log.error('timer-name must be specified');
      return;
    }

    function setTimes(milliseconds) {
      $scope.seconds = Math.floor((milliseconds / 1000) % 60);
      $scope.totalSeconds = Math.floor(milliseconds / 1000);
      $scope.minutes = Math.floor((milliseconds / 60000) % 60);
      $scope.totalMinutes = Math.floor(milliseconds / 60000);
      $scope.hours = Math.floor((milliseconds / 3600000) % 24);
      $scope.totalHours = Math.floor((milliseconds / 3600000));
      $scope.totalDays = Math.floor((milliseconds / 3600000) / 24);
    }

    function render(err, timer) {
      if (err) {
        return console.error(err);
      }

      var startTime = null;

      if (!$scope.startTime) {
        startTime = Date.now();
      } else {
        startTime = (new Date($scope.startTime)).getTime();
      }

      if (isNaN(startTime)) {
        $log.error('Invalid start time specified');
        return;
      }

      $scope.milliseconds = timer.current - startTime;
      setTimes($scope.milliseconds);
      $scope.$digest();
    }

    $element.bind('$destroy', function() {
      chronoService.unsubscribe(timerName, render);
    });

    chronoService.subscribe(timerName, render);

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
    scope: {
      'startTime': '=startTime'
    },
    controller: ctrlParams
  };

}

angular.module('angular-chrono')
       .directive('chronoTimer', chronoTimerDirective);
