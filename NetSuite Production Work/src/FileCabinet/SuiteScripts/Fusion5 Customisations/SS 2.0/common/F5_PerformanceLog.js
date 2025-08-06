define([], function () {
    var logMap = {};
    return {
        start: function(name) {
            logMap[name] = new Date();
        },
        end: function (name) {
            if (logMap[name]) {
                log.debug({title: name, details: 'elapsed time: ' + [(new Date() - logMap[name]) / 1000, 'seconds'].join(' ')});
            }
        }
    };
});