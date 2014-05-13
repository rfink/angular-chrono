
describe('The Chrono Service', function () {

  var chronos;

  beforeEach(module('angular-chrono'));
  beforeEach(inject(function (chronoService) {
    chronos = chronoService;
  }));

  it('should be clean initially', function () {
    expect(Object.keys(chronos.timers).length).toEqual(0);
    expect(Object.keys(chronos.listeners).length).toEqual(0);
  });

  it('should add a timer correctly', function () {
    chronos.addTimer('bob');

    expect(typeof chronos.timers.bob).toEqual('object');
  });

  it('should clean up correctly', function () {
    chronos.addTimer('bob');
    chronos.clear();
    expect(Object.keys(chronos.timers).length).toEqual(0);
    expect(Object.keys(chronos.listeners).length).toEqual(0);
  });
});
