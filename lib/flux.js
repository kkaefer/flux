module.exports = Flux;

function Flux(fn) {
    if (typeof fn.start !== 'function') throw new Error("Flux has no start function");

    function flux(args, callback) {
        var pending = 0;

        function next(name) {
            if (pending) throw new Error("Can't create more than one Flux callback");
            pending++;
            if (name === 'exit') return callback;
            var params = [ next, args ].concat(Array.prototype.slice.call(arguments, 1));
            return function() {
                pending--;
                var value = fn[name].apply(this, params.concat(arguments));
                if (!pending) {
                    if (value) {
                        next.apply(this, value)();
                    } else {
                        throw new Error("Didn't create Flux callback");
                    }
                }
            };
        }

        fn.start.call(this, next, args);
    };
    flux.prototype = fn;

    return flux;
};
