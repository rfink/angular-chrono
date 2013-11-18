
function chronoTimerDirective($log, chronoService) {

  function chronoController($scope, $element, $attrs) {
    var timerName = $attrs.timerName;

    if (!$attrs.startTime) {
      $attrs.startTime = Date.now();
    }

    if (!timerName) {
      $log.error('timer-name must be specified');
      return;
    }

    function setTimes(milliseconds) {
      $scope.seconds = Math.floor((milliseconds / 1000) % 60);
      $scope.totalSeconds = Math.floor(milliseconds / 1000);
      $scope.minutes = Math.floor((milliseconds / 60000) % 60);
      $scope.totalMinutes = Math.floor(milliseconds / 60000);
      $scope.hours = Math.floor((milliseconds / 360000) % 24);
      $scope.totalHours = Math.floor((milliseconds / 360000));
      $scope.totalDays = Math.floor((milliseconds / 360000) / 24);
    }

    chronoService.subscribe(timerName, function(err, timer) {
      if (err) {
        return console.error(err);
      }

      $scope.milliseconds = timer.current - (+$attrs.startTime);
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

angular.module('angular-chrono')
       .directive('chronoTimer', chronoTimerDirective);
