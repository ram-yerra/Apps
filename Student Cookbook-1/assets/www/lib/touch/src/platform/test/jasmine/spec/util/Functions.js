describe("Ext.util.Functions", function() {
    describe("createDelegate", function() {
        var fn,
            delegate;

        beforeEach(function() {
            fn = jasmine.createSpy("delegateSpy");
        });

        it("should return the first argument if it's not a function", function() {
            delegate = Ext.createDelegate("something", this);

            expect(delegate).toEqual("something");
        });

        it("should return a function if a function is passed as first argument", function() {
            delegate = Ext.createDelegate(fn, this);

            expect(typeof delegate === "function").toBe(true);
        });

        it("should use the correct scope", function() {
            delegate = Ext.createDelegate(fn, fakeScope);

            delegate();

            expect(fn.calls[0].object).toBe(fakeScope);
        });

        it("should call the first function when it is executed", function() {
            delegate = Ext.createDelegate(fn, this);

            delegate();

            expect(fn).toHaveBeenCalled();
        });

        describe("argument passing", function() {

            it("should use default args if none are passed", function() {
                delegate = Ext.createDelegate(fn, this, ['a', 'b']);

                delegate();

                expect(fn).toHaveBeenCalledWith('a', 'b');
            });

            it("should use passed args if they are present", function() {
                delegate = Ext.createDelegate(fn, this);

                delegate('c', 'd');

                expect(fn).toHaveBeenCalledWith('c', 'd');
            });

            it("should append args", function() {
                delegate = Ext.createDelegate(fn, this, ['a', 'b'], true);

                delegate('c', 'd');

                expect(fn).toHaveBeenCalledWith('c', 'd', 'a', 'b');
            });

            it("should append args at the given index", function() {
                delegate = Ext.createDelegate(fn, this, ['a', 'b'], 0);

                delegate('c', 'd');

                expect(fn).toHaveBeenCalledWith('a', 'b', 'c', 'd');
            });
        });
    });

    describe("createInterceptor", function() {
        var interceptor,
            interceptorFn,
            interceptedFn,
            interceptorIsRunFirst,
            interceptedIsRunAfter;

        beforeEach(function() {
            interceptorIsRunFirst = false;
            interceptedIsRunAfter = false;

            interceptorFn = jasmine.createSpy("interceptorSpy").andCallFake(function() {
                interceptorIsRunFirst = true;
            });
            interceptedFn = jasmine.createSpy("interceptedSpy").andCallFake(function() {
                interceptedIsRunAfter = interceptorIsRunFirst;
            });
        });

        describe("if no function is passed", function() {
            it("should return the same function", function() {
                expect(Ext.createInterceptor(interceptedFn)).toEqual(interceptedFn);
            });
        });

        describe("if a function is passed", function() {
            beforeEach(function() {
                interceptor = Ext.createInterceptor(interceptedFn, interceptorFn, fakeScope);
                interceptor();
            });

            it("should return a new function", function() {
                expect(typeof interceptor === "function").toBe(true);
                expect(interceptor).not.toEqual(interceptedFn);
            });

            it("should set the correct scope for the interceptor function", function() {
                expect(interceptorFn.calls[0].object).toBe(fakeScope);
            });

            it("should call the interceptor function first", function() {
                expect(interceptedIsRunAfter).toBe(true);
            });

        });

        describe("if the interceptor function returns false", function() {
            it("should not execute the original function", function() {
                interceptor = Ext.createInterceptor(interceptedFn, function() {
                    return false;
                });

                interceptor();
                expect(interceptedFn).not.toHaveBeenCalled();
            });
        });
    });

    describe("defer", function() {
        var fn;

        beforeEach(function(){
            fn = jasmine.createSpy("deferSpy");
        });

        it("should execute the function after the specified number of milliseconds", function() {
            Ext.defer(fn, 10);

            waitsFor(function(){
                return fn.calls.length === 1;
            }, "fn was never called");

            runs(function() {
                expect(fn).toHaveBeenCalled();
            });
        });

        it("should execute the function directly if the specified number of milliseconds is <= 0", function() {
            Ext.defer(fn, 0);

            expect(fn).toHaveBeenCalled();
        });

        it("should set the correct scope", function() {
            Ext.defer(fn, 10, fakeScope);

            waitsFor(function(){
                return fn.calls.length === 1;
            }, "fn was never called");

            runs(function() {
                expect(fn.calls[0].object).toBe(fakeScope);
            });
        });

        it("should pass the correct arguments", function() {
            Ext.defer(fn, 10, this, [1, 2, 3]);

            waitsFor(function(){
                return fn.calls.length === 1;
            }, "fn was never called");

            runs(function() {
                expect(fn).toHaveBeenCalledWith(1,2,3);
            });
        });

        it("should return a timeout number", function() {
            expect(typeof Ext.defer(function() {}, 10) === 'number').toBe(true);
        });
    });

    describe("createSequence", function() {
        var sequence,
            newFn,
            origFn,
            origFnIsRunFirst,
            newFnIsRunAfter;

        beforeEach(function() {
            origFnIsRunFirst = false;
            newFnIsRunAfter = false;

            origFn = jasmine.createSpy("interceptedSpy").andCallFake(function() {
                origFnIsRunFirst = true;
            });

            newFn = jasmine.createSpy("sequenceSpy").andCallFake(function() {
                newFnIsRunAfter = origFnIsRunFirst;
            });
        });

        describe("if no function is passed", function() {
            it("should return the same function", function() {
                expect(Ext.createSequence(origFn)).toEqual(origFn);
            });
        });

        describe("if a function is passed", function() {
            beforeEach(function() {
                sequence = Ext.createSequence(origFn, newFn, fakeScope);
                sequence();
            });

            it("should return a new function", function() {
                expect(typeof sequence === "function").toBe(true);
                expect(sequence).not.toEqual(origFn);
            });

            it("should set the correct scope for the sequence function", function() {
                expect(newFn.calls[0].object).toBe(fakeScope);
            });

            it("should call the sequence function first", function() {
                expect(newFnIsRunAfter).toBe(true);
            });

        });
    });
});
