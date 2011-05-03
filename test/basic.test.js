var assert = require('assert');
var Flux = require('..');

exports['test basic functionality'] = function(beforeExit) {
    var completion = {
        start: 0,
        next: 0,
        third: 0,
        done: 0
    };

    insertData = Flux({
        start: function(flux) {
            completion.start++;
            setTimeout(flux('next'), 10);
            assert.throws(function() {
                flux('next');
            }, "Can't create more than one Flux callback");
        },
        next: function(flux) {
            completion.next++;
            setTimeout(flux.group('third'), 10);
            setTimeout(flux.group('third'), 10);
            setTimeout(function() {
                assert.throws(function() {
                    setTimeout(flux.group('third'), 10);
                }, "Can't create group callback after function completed");
            }, 20);
        },
        third: function(flux) {
            completion.third++;
            flux('fourth')();
        },
        fourth: function(flux) {
            flux('exit')();
        }
    });

    insertData('context', function() {
        completion.done++;
    });

    beforeExit(function() {
        assert.deepEqual({
            start: 1,
            next: 1,
            third: 1,
            done: 1
        }, completion);
    });
};

exports['test parameter passing functionality'] = function(beforeExit) {
    var completion = {
        start: 0,
        second: 0,
        third: 0,
        done: 0
    };

    insertData = Flux({
        start: function(flux) {
            completion.start++;
            var next = flux('second');
            setTimeout(function() {
                next('foo');
            }, 10);
        },
        second: function(flux, param) {
            completion.second++;
            assert.equal(param[0][0], 'foo');
            setTimeout(flux.group('third'), 10);
            setTimeout(flux.group('third'), 10);
            setTimeout(flux.group('third'), 10);
            setTimeout(flux.group('third'), 10);
        },
        third: function(flux, param) {
            completion.third++;
            assert.equal(4, param.length);
            flux('fourth')();
        },
        fourth: function(flux) {
            flux('exit')();
        }
    });

    insertData('context', function() {
        completion.done++;
    });

    beforeExit(function() {
        assert.deepEqual({
            start: 1,
            second: 1,
            third: 1,
            done: 1
        }, completion);
    });
};
