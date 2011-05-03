module.exports = Flux;

var undefined;

function Flux(fn) {
    if (typeof fn.start !== 'function') throw new Error("Flux has no start function");
    if (fn.exit) throw new Error("Flux can't have a function named 'exit'");
    fn.exit = true;

    function flux(args, callback) {
        var pending = 1, locked = true, state = 'start', args = [];
        shim();

        function shim(err) {
            pending--;
            args.push(arguments);
            if (pending > 0) return;
            if (state === 'exit') callback(null, args);
            else {
                var name = state, params = args;
                state = false;
                locked = false;
                args = [];
                fn[name].call(this, next, params);
                locked = true;
                if (state === false) throw new Error("Didn't create Flux callback");
            }
        }

        function next(name) {
            if (state !== false) throw new Error("Can't create more than one Flux callback");
            if (!fn[name]) throw new Error("Flux callback '" + name + "' doesn't exist");
            pending++;
            state = name;
            locked = true;
            return shim;
        }

        next.group = function(name) {
            if (locked) throw new Error("Can't create more than one Flux callback");
            if (state === false) {
                if (!fn[name]) throw new Error("Flux callback '" + name + "' doesn't exist");
                state = name;
            } else if (state !== name) {
                throw new Error("Can only group to one state");
            }
            pending++;
            return shim;
        };
    };

    return flux;
};
