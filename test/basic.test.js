var assert = require('assert');
var Flux = require('..');

exports['test basic functionality'] = function(beforeExit) {
    var completion = {
        start: 0,
        next: 0,
        third: 0,
        done: 0
    };

    var context = { 'this is args': true };

    insertData = Flux({
        start: function(flux, args) {
            completion.start++;
            assert.equal(context, args);
            setTimeout(flux('next', 'foo', 'bar', 'baz'), 10);
            assert.throws(function() {
                flux('next');
            }, "Can't create more than one Flux callback");
        },
        next: function(flux, args, param1, param2, param3) {
            completion.next++;
            assert.equal(context, args);
            assert.equal(param1, 'foo');
            assert.equal(param2, 'bar');
            assert.equal(param3, 'baz');
            setTimeout(flux('third'), 10);
        },
        third: function(flux) {
            completion.third++;
            return ['exit'];
        },
    });

    insertData(context, function() {
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
