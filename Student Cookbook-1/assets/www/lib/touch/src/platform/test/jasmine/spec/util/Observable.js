describe("Ext.util.Observable", function() {
    var Boss,
        boss,
        bossConfig,
        bossListeners,
        bossAskListener,
        bossAskFn,
        bossFiredFn,
        bossQuitFn,
        Employee,
        employee,
        employeeConfig,
        employeeListeners,
        employeeBubbleEvents,
        employeeAskListener,
        employeeAskFn,
        employeeFiredListener,
        employeeFiredFn,
        employeeQuitListener,
        employeeQuitFn,
        events;

    beforeEach(function() {
        events = {
            "fired": true,
            "quit": true,
            "ask_salary_augmentation": true
        };
        // boss creation
        Boss = Ext.extend(Ext.util.Observable, {
            constructor: function(conf) {
                conf = conf || {};
                this.addEvents(events);
                this.listeners = conf.listeners;
                Boss.superclass.constructor.call(this, conf);
            }
        });

        bossFiredFn = jasmine.createSpy("bossFiredFn");

        bossQuitFn = jasmine.createSpy("bossQuitFn");

        bossAskFn = jasmine.createSpy("bossAskFn");
        bossAskListener = {
            fn: bossAskFn,
            scope: fakeScope
        };
        bossListeners = {
            ask_salary_augmentation: bossAskListener
        };
        bossConfig = {
            listeners: bossListeners
        };

        boss = new Boss(bossConfig);

        // employee creation
        Employee = Ext.extend(Ext.util.Observable, {
            constructor: function(conf) {
                conf = conf || {};
                this.addEvents(events);
                this.listeners = conf.listeners;
                Employee.superclass.constructor.call(this, conf);
            },
            getBubbleTarget: function() {
                return this.boss;
            }
        });

        employeeFiredFn = jasmine.createSpy("employeeFiredFn");
        employeeQuitFn = jasmine.createSpy("employeeQuitFn");
        employeeAskFn = jasmine.createSpy("employeeAskFn");
        employeeFiredListener = {
            fn: employeeFiredFn,
            scope: fakeScope
        };
        employeeQuitListener = {
            fn: employeeQuitFn,
            scope: fakeScope
        };
        employeeAskListener = {
            fn: employeeAskFn,
            scope: fakeScope
        };
        employeeListeners = {
            ask_salary_augmentation: employeeAskListener,
            fired: employeeFiredListener,
            quit: employeeQuitListener
        };

        employeeBubbleEvents = ['ask_salary_augmentation'];

        employeeConfig = {
            listeners: employeeListeners,
            bubbleEvents: employeeBubbleEvents,
            boss: boss
        };

        // some spies used in constructor
        spyOn(Ext, "apply").andCallThrough();
        spyOn(Employee.prototype, "on").andCallThrough();
        spyOn(Employee.prototype, "enableBubble").andCallThrough();

        employee = new Employee(employeeConfig);
    });

    describe("instantiation", function() {
        it("should apply configuration", function() {
            expect(Ext.apply).toHaveBeenCalledWith(employee, employeeConfig);
        });

        it("should append event handlers passed in configuration params", function() {
            expect(Employee.prototype.on).toHaveBeenCalledWith(employeeListeners);
        });

        it("should delete listeners configuration property", function() {
            expect(employee.listeners).toBeUndefined();
        });

        it("should enable bubble", function() {
            expect(Employee.prototype.enableBubble).toHaveBeenCalledWith(employeeBubbleEvents);
        });
    });

    describe("firing events", function() {

        describe("without options", function() {
            beforeEach(function() {
                employee.fireEvent("fired", "I'am fired :s");
            });

            it("shoud call the handler only one times", function() {
                expect(employeeFiredFn.calls.length).toEqual(1);
            });

            it("shoud call the handler function with passed arguments", function() {
                expect(employeeFiredFn).toHaveBeenCalledWith("I'am fired :s", employeeFiredListener);
            });

            it("should call the handler function with the correct scope", function() {
                expect(employeeFiredFn.calls[0].object).toBe(fakeScope);
            });
        });

        describe("with options", function() {
            describe("single", function() {
                var singleFn,
                    singleEventListener;

                beforeEach(function() {
                    singleFn = jasmine.createSpy("singleFn");
                    boss.addEvents("singleevent");
                    boss.addListener("singleevent", singleFn, fakeScope, {
                        single: true
                    });

                    boss.fireEvent("singleevent", "single 1");
                    boss.fireEvent("singleevent", "single 2");
                    boss.fireEvent("singleevent", "single 3");
                });

                it("should call the handler only one times", function() {
                    expect(singleFn.calls.length).toEqual(1);
                });

                it("shoud call the handler function with passed arguments", function() {
                    expect(singleFn).toHaveBeenCalledWith("single 1", {
                        single: true
                    });
                });

                it("should call the handler function with the correct scope", function() {
                    expect(singleFn.calls[0].object).toBe(fakeScope);
                });

                it("should remove the listener", function() {
                    expect(boss.hasListener("singleevent")).toBe(false);
                });
            });

            describe("buffer", function() {
                var bufferFn,
                    bufferEventListener;

                beforeEach(function() {
                    bufferFn = jasmine.createSpy("bufferFn");
                    boss.addEvents("bufferevent");
                    boss.addListener("bufferevent", bufferFn, fakeScope, {
                        buffer: 5
                    });

                    boss.fireEvent("bufferevent", "buffer 1");
                    boss.fireEvent("bufferevent", "buffer 2");
                    boss.fireEvent("bufferevent", "buffer 3");
                });

                it("should not call handler immediately", function() {
                    expect(bufferFn).not.toHaveBeenCalled();
                });

                it("should call the handler only one times after a certain amount of time", function() {
                    waitsFor(function() {
                        return bufferFn.calls.length === 1;
                    }, "bufferFn wasn't called");
                });

                it("shoud call the handler function with passed arguments coming from the last event firing", function() {
                    waitsFor(function() {
                        return bufferFn.calls.length === 1;
                    }, "bufferFn wasn't called");

                    runs(function() {
                        expect(bufferFn).toHaveBeenCalledWith("buffer 3", {
                            buffer: 5
                        });
                    });
                });

                it("should call the handler function with the correct scope", function() {
                    waitsFor(function() {
                        return bufferFn.calls.length === 1;
                    }, "bufferFn wasn't called");

                    runs(function() {
                        expect(bufferFn.calls[0].object).toBe(fakeScope);
                    });
                });

                it("should not remove the listener", function() {
                    waitsFor(function() {
                        return bufferFn.calls.length === 1;
                    }, "bufferFn wasn't called");

                    runs(function() {
                        expect(boss.hasListener("bufferevent")).toBe(true);
                    });
                });
            });

            describe("delay", function() {
                var delayFn,
                    delayEventListener;

                beforeEach(function() {
                    delayFn = jasmine.createSpy("delayFn");
                    boss.addEvents("delayevent");
                    boss.addListener("delayevent", delayFn, fakeScope, {
                        delay: 5
                    });

                    boss.fireEvent("delayevent", "delay");
                });

                it("should not call handler immediately", function() {
                    expect(delayFn).not.toHaveBeenCalled();
                });

                it("should call the handler only one times after a certain amount of time", function() {
                    waitsFor(function() {
                        return delayFn.calls.length === 1;
                    }, "delayFn wasn't called");
                });

                it("shoud call the handler function with passed arguments", function() {
                    waitsFor(function() {
                        return delayFn.calls.length === 1;
                    }, "delayFn wasn't called");

                    runs(function() {
                        expect(delayFn).toHaveBeenCalledWith("delay", {
                            delay: 5
                        });
                    });
                });

                it("should call the handler function with the correct scope", function() {
                    waitsFor(function() {
                        return delayFn.calls.length === 1;
                    }, "delayFn wasn't called");
                    
                    runs(function() {
                        expect(delayFn.calls[0].object).toBe(fakeScope);
                    });
                });
            });
        });
    });

    describe("adding/removing listeners", function() {
        describe("use a string as first param", function() {
            beforeEach(function() {
                boss.addListener("fired", bossFiredFn, fakeScope);
                boss.fireEvent("fired", "I'am fired! (1)");
                boss.removeListener("fired", bossFiredFn, fakeScope);
                boss.fireEvent("fired", "I'am fired! (2)");
            });

            it("should call the event handler only one time", function() {
                expect(bossFiredFn.calls.length).toEqual(1);
            });

            it("should call the event with correct arguments", function() {
                expect(bossFiredFn).toHaveBeenCalledWith("I'am fired! (1)", {});
            });

            it("should call the event with correct scope", function() {
                expect(bossFiredFn.calls[0].object).toBe(fakeScope);
            });
        });

        describe("use an object as first param without using fn to specify the function", function() {
            var listeners;

            beforeEach(function() {


                listeners = {
                    fired: bossFiredFn,
                    scope: fakeScope
                };

                boss.addListener(listeners);
                boss.fireEvent("fired", "I'am fired! (1)");
                boss.removeListener(listeners);
                boss.fireEvent("fired", "I'am fired! (2)");
            });

            it("should call the event handler only one time", function() {
                expect(bossFiredFn.calls.length).toEqual(1);
            });

            it("should call the event with correct arguments", function() {
                expect(bossFiredFn).toHaveBeenCalledWith("I'am fired! (1)", listeners);
            });

            it("should call the event with correct scope", function() {
                expect(bossFiredFn.calls[0].object).toBe(fakeScope);
            });
        });

        describe("use an object as first param using fn to specify the function", function() {
            var listeners,
                firedListener;

            beforeEach(function() {
                firedListener = {
                    fn: bossFiredFn,
                    scope: fakeScope
                };
                listeners = {
                    fired: firedListener
                };

                boss.addListener(listeners);
                boss.fireEvent("fired", "I'am fired! (1)");
                boss.removeListener(listeners);
                boss.fireEvent("fired", "I'am fired! (2)");
            });

            it("should call the event handler only one time", function() {
                expect(bossFiredFn.calls.length).toEqual(1);
            });

            it("should call the event with correct arguments", function() {
                expect(bossFiredFn).toHaveBeenCalledWith("I'am fired! (1)", firedListener);
            });

            it("should call the event with correct scope", function() {
                expect(bossFiredFn.calls[0].object).toBe(fakeScope);
            });
        });

        describe("remove a listener when a buffered handler hasn't fired yet", function() {
            it("should never call the handler", function() {
                runs(function() {
                   boss.addListener("fired", bossFiredFn, fakeScope, {buffer: 5});
                   boss.fireEvent("fired");
                   boss.removeListener("fired", bossFiredFn, fakeScope, {buffer: 5});
                });
                waits(5);
                runs(function(){
                    expect(bossFiredFn).not.toHaveBeenCalled();
                });
            });
        });

        describe("remove a listener when a delayed handler hasn't fired yet", function() {
            it("should never call the handler", function() {
                runs(function() {
                   boss.addListener("fired", bossFiredFn, fakeScope, {delay: 5});
                   boss.fireEvent("fired");
                   boss.removeListener("fired", bossFiredFn, fakeScope, {buffer: 5});
                });
                waits(5);
                runs(function(){
                    expect(bossFiredFn).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("clearListeners", function() {
        beforeEach(function() {
            employee.clearListeners();
            employee.fireEvent("fired", "I'am fired :s");
            employee.fireEvent("quit", "I'am quitting my job :)");
        });

        it("should not call fired event handler", function() {
            expect(employeeFiredFn).not.toHaveBeenCalled();
        });

        it("should not call quit event handler", function() {
            expect(employeeQuitFn).not.toHaveBeenCalled();
        });
    });

    describe("adding/removing managed listeners", function() {
        describe("use a string as first param", function() {
            beforeEach(function() {
                boss.addManagedListener(employee, "fired", bossFiredFn, fakeScope);
                employee.fireEvent("fired", "I'am fired! (1)");
                boss.removeManagedListener(employee, "fired", bossFiredFn, fakeScope);
                employee.fireEvent("fired", "I'am fired! (2)");
            });

            it("should call the event handler only one time", function() {
                expect(bossFiredFn.calls.length).toEqual(1);
            });

            it("should call the event with correct arguments", function() {
                expect(bossFiredFn).toHaveBeenCalledWith("I'am fired! (1)", {});
            });

            it("should call the event with correct scope", function() {
                expect(bossFiredFn.calls[0].object).toBe(fakeScope);
            });
        });

        describe("use an object as first param without using fn to specify the function", function() {
            var listeners;

            beforeEach(function() {
                listeners = {
                    fired: bossFiredFn,
                    scope: fakeScope
                };

                boss.addManagedListener(employee, listeners);
                employee.fireEvent("fired", "I'am fired! (1)");
                boss.removeManagedListener(employee, listeners);
                employee.fireEvent("fired", "I'am fired! (2)");
            });

            it("should call the event handler only one time", function() {
                expect(bossFiredFn.calls.length).toEqual(1);
            });

            it("should call the event with correct arguments", function() {
                expect(bossFiredFn).toHaveBeenCalledWith("I'am fired! (1)", listeners);
            });

            it("should call the event with correct scope", function() {
                expect(bossFiredFn.calls[0].object).toBe(fakeScope);
            });
        });

        describe("use an object as first param without using fn to specify the function", function() {
            var listeners,
                firedListener;

            beforeEach(function() {
                firedListener = {
                    fn: bossFiredFn,
                    scope: fakeScope
                };
                listeners = {
                    fired: firedListener
                };

                boss.addManagedListener(employee, listeners);
                employee.fireEvent("fired", "I'am fired! (1)");
                boss.removeManagedListener(employee, listeners);
                employee.fireEvent("fired", "I'am fired! (2)");
            });

            it("should call the event handler only one time", function() {
                expect(bossFiredFn.calls.length).toEqual(1);
            });

            it("should call the event with correct arguments", function() {
                expect(bossFiredFn).toHaveBeenCalledWith("I'am fired! (1)", firedListener);
            });

            it("should call the event with correct scope", function() {
                expect(bossFiredFn.calls[0].object).toBe(fakeScope);
            });
        });
    });

    describe("clearManagedListeners", function() {
        beforeEach(function() {
            boss.addManagedListener(employee, "fired", bossFiredFn, fakeScope);
            boss.clearManagedListeners();
            employee.fireEvent("fired", "I'am fired!");
            employee.fireEvent("quit", "I'am quitting!");
        });

        it("should not call fired event handler", function() {
            expect(bossFiredFn).not.toHaveBeenCalled();
        });

        it("should not call quit event handler", function() {
            expect(bossQuitFn).not.toHaveBeenCalled();
        });
    });

    describe("hasListener", function() {
        it("should return true if the observable has a listener on a particular event", function() {
            expect(boss.hasListener("ask_salary_augmentation")).toBe(true);
        });

        it("should return false if the observable has no listener on a particular event", function() {
            expect(boss.hasListener("fired")).toBe(false);
        });
    });

    describe("suspend/resume events", function() {
        var generateFireEventTraffic = function() {
            employee.fireEvent("fired", "I'am fired :s (1)");
            employee.fireEvent("fired", "I'am fired :s (2)");
            employee.fireEvent("quit", "I'am quitting my job :) (1)");
            employee.fireEvent("quit", "I'am quitting my job :) (2)");
        };

        describe("queue suspended events to be fired after the resumeEvents", function() {
            beforeEach(function() {
                employee.suspendEvents(true);
                generateFireEventTraffic();
            });

            describe("when suspended", function() {
                it("should not call fired event handler", function() {
                    expect(employeeFiredFn).not.toHaveBeenCalled();
                });

                it("should not call quit event handler", function() {
                    expect(employeeQuitFn).not.toHaveBeenCalled();
                });
            });

            describe("on resume", function() {
                beforeEach(function() {
                    employee.resumeEvents();
                });

                it("should call fired event handler two times", function() {
                    expect(employeeFiredFn.calls.length).toEqual(2);
                });

                it("should call quit event handler two times", function() {
                    expect(employeeQuitFn.calls.length).toEqual(2);
                });
            });
        });

        describe("discard events", function() {
            beforeEach(function() {
                employee.suspendEvents();
                generateFireEventTraffic();
            });

            describe("when suspended", function() {
                it("should not call fired event handler", function() {
                    expect(employeeFiredFn).not.toHaveBeenCalled();
                });

                it("should not call quit event handler", function() {
                    expect(employeeQuitFn).not.toHaveBeenCalled();
                });
            });

            describe("on resume", function() {
                beforeEach(function() {
                    employee.resumeEvents();
                });

                it("should not call fired event handler", function() {
                    expect(employeeFiredFn).not.toHaveBeenCalled();
                });

                it("should call quit event handler two times", function() {
                    expect(employeeQuitFn).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("event bubbling", function() {
        describe("if handler doesn't return false", function() {
            beforeEach(function() {
                employee.fireEvent("ask_salary_augmentation", "I want 5%!");
            });

            describe("in the bubbling target", function() {
                it("shoud call the handler only one times", function() {
                    expect(bossAskFn.calls.length).toEqual(1);
                });

                it("shoud call the handler function with passed arguments", function() {
                    expect(bossAskFn).toHaveBeenCalledWith("I want 5%!", bossAskListener);
                });

                it("should call the handler function with the correct scope", function() {
                    expect(bossAskFn.calls[0].object).toBe(fakeScope);
                });
            });

            describe("in the main observable", function() {
                it("shoud call the handler only one times", function() {
                    expect(employeeAskFn.calls.length).toEqual(1);
                });

                it("shoud call the handler function with passed arguments", function() {
                    expect(employeeAskFn).toHaveBeenCalledWith("I want 5%!", employeeAskListener);
                });

                it("should call the handler function with the correct scope", function() {
                    expect(employeeAskFn.calls[0].object).toBe(fakeScope);
                });
            });
        });

        describe("if handler return false", function() {
            beforeEach(function() {
                employeeAskFn.andReturn(false);
                employee.fireEvent("ask_salary_augmentation", "I want 5%!");
            });

            describe("in the bubbling target", function() {
                it("shoud not call the handler", function() {
                    expect(bossAskFn).not.toHaveBeenCalled();
                });
            });

            describe("in the main observable", function() {
                it("shoud call the handler only one times", function() {
                    expect(employeeAskFn.calls.length).toEqual(1);
                });

                it("shoud call the handler function with passed arguments", function() {
                    expect(employeeAskFn).toHaveBeenCalledWith("I want 5%!", employeeAskListener);
                });

                it("should call the handler function with the correct scope", function() {
                    expect(employeeAskFn.calls[0].object).toBe(fakeScope);
                });
            });
        });
    });

    describe("relaying events", function() {
        beforeEach(function() {
            employee.relayEvents(boss, ["fired"]);
            boss.fireEvent("fired", "You're fired!");
        });

        it("should call the event handler only one time", function() {
            expect(employeeFiredFn.calls.length).toEqual(1);
        });

        it("should call the event with correct arguments", function() {
            expect(employeeFiredFn).toHaveBeenCalledWith("You're fired!", employeeFiredListener);
        });

        it("should call the event with correct scope", function() {
            expect(employeeFiredFn.calls[0].object).toBe(fakeScope);
        });
    });

    describe("alias", function() {
        it("should alias addListener with on", function() {
            expect(Ext.util.Observable.prototype.addListener).toEqual(Ext.util.Observable.prototype.on);
        });

        it("should alias removeListener with un", function() {
            expect(Ext.util.Observable.prototype.removeListener).toEqual(Ext.util.Observable.prototype.un);
        });

        it("should alias addManagedListener with mon", function() {
            expect(Ext.util.Observable.prototype.addManagedListener).toEqual(Ext.util.Observable.prototype.mon);
        });

        it("should alias removeManagedListener with mun", function() {
            expect(Ext.util.Observable.prototype.removeManagedListener).toEqual(Ext.util.Observable.prototype.mun);
        });

        it("should alias observe with observeClass for retro compatibility", function() {
            expect(Ext.util.Observable.observeClass).toEqual(Ext.util.Observable.observe);
        });
    });

    describe("capture/release", function() {
        beforeEach(function() {
            spyOn(Ext, "createInterceptor");
            Ext.util.Observable.capture(boss, Ext.emptyFn, fakeScope);
        });

        describe("capture", function() {
            it("should create an interceptor of observable fireEvent method", function() {
                expect(Ext.createInterceptor).toHaveBeenCalledWith(Ext.util.Observable.prototype.fireEvent, Ext.emptyFn, fakeScope);
            });
        });

        describe("release", function() {
            beforeEach(function() {
                Ext.util.Observable.releaseCapture(boss);
            });

            it("should restore the original fireEvent function", function() {
                expect(boss.fireEvent).toEqual(Ext.util.Observable.prototype.fireEvent);
            });

        });
    });

    describe("observe", function() {
        var firedListener,
            boss1,
            boss2;

        beforeEach(function() {
            firedListener = {
                    fn: bossFiredFn,
                    scope: fakeScope
            };
            Ext.util.Observable.observe(Boss, {
                fired: firedListener
            });
            boss1 = new Boss();
            boss2 = new Boss();

            boss1.fireEvent("fired", "You're Fired! (boss 1)");
            boss2.fireEvent("fired", "You're Fired! (boss 2)");
        });

        it("should call bossFiredFn two times", function() {
            expect(bossFiredFn.calls.length).toEqual(2);
        });

        describe("first event firing", function() {
            var call;

            beforeEach(function() {
                call = bossFiredFn.calls[0];
            });

            it("should execute handler with the correct scope", function() {
                expect(call.object).toBe(fakeScope);
            });

            it("should execute handler with desired params", function() {
                expect(call.args).toEqual(["You're Fired! (boss 1)", firedListener]);
            });
        });

      describe("second event firing", function() {
            var call;

            beforeEach(function() {
                call = bossFiredFn.calls[1];
            });

            it("should execute handler with the correct scope", function() {
                expect(call.object).toBe(fakeScope);
            });

            it("should execute handler with desired params", function() {
                expect(call.args).toEqual(["You're Fired! (boss 2)", firedListener]);
            });
        });
    });
});
