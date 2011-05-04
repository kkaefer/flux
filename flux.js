module.exports = Flux;

function Flux(fn) {
    if (typeof fn.start !== 'function') throw new Error("Flux has no start function");

    function flux(context, callback) {
        var pending = 1, locked = true, state = 'start', args = [];

        function check(err) {
            if (err) {
                state = false;
                next.exit(err);
                return;
            }

            args.push(Array.prototype.slice.call(arguments, 1));

            if (!--pending) {
                var name = state, params = args;
                state = false;
                locked = false;
                args = [];
                fn[name].call(context, next, params);
                locked = true;
                if (state === false) throw new Error("Didn't create Flux callback");
            }
        }

        function next(name) {
            if (next.err) throw new Error("Can't recover after error in Flux");
            if (state !== false) throw new Error("Can't create more than one Flux callback");
            if (!fn[name]) throw new Error("Flux callback '" + name + "' doesn't exist");
            pending++;
            state = name;
            locked = true;
            return check;
        }

        next.group = function(name) {
            if (next.err) throw new Error("Can't recover after error in Flux");
            if (locked) throw new Error("Can't create Flux callback after original function returned");
            if (state === false) {
                if (!fn[name]) throw new Error("Flux callback '" + name + "' doesn't exist");
                state = name;
            } else if (state !== name) {
                throw new Error("Can only group to one state");
            }
            pending++;
            return check;
        };

        next.exit = function(err) {
            if (state !== false) throw new Error("Can't exit after other callback was created");
            pending++;
            state = true;
            delete next;
            callback.call(context, err);
        };

        next.err = null;

        check();
    };

    return flux;
};

Flux.exit = function(flux) {
    flux.exit();
};
