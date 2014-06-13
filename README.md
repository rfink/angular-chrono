angular-chrono
==============

A timer directive for angularjs.  angular-timer is a great module,
but it is missing some pieces I needed and can be resource intensive.
In this module, you can name timers and have many directives listen on
the same timer.

Usage
==============

To install in your app, simply run:

```
    bower install angular-chrono
```

To use in your angular app, add "angular-chrono" to your dependencies:

```javascript
    var myApp = angular.module('myApp', ['angular-chrono']);
```

Then, you can add "chrono-timer" directive inside your html.
A "zeropad" filter has been added for convenience to left pad
hours/minutes/seconds with zeroes, for a cleaner look.

```html
    <div chrono-timer timer-name="myTimer" start-time="time">
        {{ totalDays }} days<br />
        {{ hours }} hours<br />
        {{ minutes|zeropad }} minutes<br />
        {{ seconds|zeropad }} seconds
    </div>
```

Finally, you can start/stop the timer inside your controller(s).

```javascript
    myApp.controller('MyCtrl', function MyCtrl($scope, chronoService) {
        $scope.time = Date.now();
        chronoService.addTimer('myTimer', { interval: 500 });
        chronoService.start();
    });
```

The available scope vars inside the directive are as follows:
+ seconds: relative number of seconds (0-59) that have passed
+ totalSeconds: total number of seconds passed (i.e. 336)
+ minutes: relative number of minutes (0-59) that have passed
+ totalMinutes: total number of minutes passed
+ hours: relative number of hours (0-23) that have passed
+ totalHours: total number of hours passed
+ totalDays: total number of days passed

Interval is the only current option passed into the second param object
for addTimer.  It defaults to 1000 milliseconds, or one second.

See examples/index.html for an example usage.  Other examples
may be included as necessary.
