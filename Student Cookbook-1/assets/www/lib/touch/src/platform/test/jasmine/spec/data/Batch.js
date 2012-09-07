describe("Ext.data.Batch", function() {
    var batch;

    describe("instantiation", function() {
        beforeEach(function() {
            batch = new Ext.data.Batch({
                operations: false
            });
        });

        it("should extend Ext.util.Observable", function() {
            expect(batch.superclass()).toEqual(Ext.util.Observable.prototype);
        });

        describe("configuration options", function() {
            it("should have autoStart equal to false", function() {
                expect(batch.autoStart).toBe(false);
            });

            it("should have current equal to -1", function() {
                expect(batch.current).toEqual( - 1);
            });

            it("should have total equal to 0", function() {
                expect(batch.total).toEqual(0);
            });

            it("should have isRunning equal to false", function() {
                expect(batch.isRunning).toBe(false);
            });

            it("should have isComplete equal to false", function() {
                expect(batch.isComplete).toBe(false);
            });

            it("should have hasException equal to false", function() {
                expect(batch.hasException).toBe(false);
            });

            it("should have pauseOnException equal to true", function() {
                expect(batch.pauseOnException).toBe(true);
            });

            it("should have operations equal to [] and operations is not overridable by configuration", function() {
                expect(batch.operations).toEqual([]);
            });
        });

        describe("methods", function() {
            var operation1,
            operation2;

            beforeEach(function() {
                batch = new Ext.data.Batch();
                operation1 = new Ext.data.Operation({
                    action: "create"
                });
                operation2 = new Ext.data.Operation({
                    action: "update"
                });
            });

            describe("add", function() {
                var setBatchOp1Spy;

                beforeEach(function() {
                    setBatchOp1Spy = spyOn(operation1, "setBatch");

                    batch.add(operation1);
                });

                it("should increment total property", function() {
                    expect(batch.total).toEqual(1);
                });

                it("should set operation batch", function() {
                    expect(setBatchOp1Spy).toHaveBeenCalledWith(batch);
                });

                it("should add operation to operations array", function() {
                    expect(batch.operations[0]).toEqual(operation1);
                });
            });

            describe("start", function() {
                var runOpSpy;

                beforeEach(function() {
                    runOpSpy = spyOn(batch, "runOperation");
                    batch.start();
                });

                it("should set hasException to false", function() {
                    expect(batch.hasException).toBe(false);
                });

                it("should set isRunning to true", function() {
                    expect(batch.isRunning).toBe(true);
                });

                it("should call runOperation with index of 0", function() {
                    expect(runOpSpy).toHaveBeenCalledWith(0);
                });
            });

            describe("pause", function() {
                it("should set isRunning to false", function() {
                    batch.pause();

                    expect(batch.isRunning).toBe(false);
                });
            });

            describe("runOperation", function() {
                var fireEventSpy;

                beforeEach(function() {
                    batch.add(operation1);

                    fireEventSpy = spyOn(batch, "fireEvent");
                });

                describe("if operation is undefined", function() {
                    beforeEach(function() {
                        batch.add(operation2);
                        batch.runOperation(999);
                    });

                    it("should set isRunning property to false", function() {
                        expect(batch.isRunning).toBe(false);
                    });

                    it("should set isComplete property to true", function() {
                        expect(batch.isComplete).toBe(true);
                    });

                    it("should fireEvent complete with appropriate params", function() {
                        expect(fireEventSpy).toHaveBeenCalledWith("complete", batch, operation2);
                    });
                });

                describe("if operation is defined (all operations are completed)", function() {
                    var proxy;

                    beforeEach(function() {
                        var fakeProxyOperationHandling = function(operation, proxyReturn, scope) {
                            proxyReturn.call(scope, operation);
                        };

                        // create a fake proxy object with support for operation1
                        proxy = jasmine.createSpyObj("proxy", ["create"]);

                        proxy.create.andCallFake(fakeProxyOperationHandling);
                        //proxy.update.andCallFake(fakeProxyOperationHandling);
                        batch.proxy = proxy;
                    });

                    it("should set current property to operation index", function() {
                        batch.runOperation(0);

                        expect(batch.current).toEqual(0);
                    });

                    it("should start operation", function() {
                        var setStartedSpy = spyOn(operation1, "setStarted");

                        batch.runOperation(0);

                        expect(setStartedSpy).toHaveBeenCalled();
                    });

                    it("should check if operation encounter an exception", function() {
                        var hasExceptionSpy = spyOn(operation1, "hasException");

                        batch.runOperation(0);

                        expect(hasExceptionSpy).toHaveBeenCalled();
                    });

                    describe("if operation doesn't encounter an exception", function() {

                        it("should fireEvent operation-complete with appropriate arguments", function() {
                            batch.runOperation(0);

                            expect(fireEventSpy).toHaveBeenCalledWith("complete", batch, operation1);
                        });

                        it("should mark operation completed", function() {
                            var setCompletedSpy = spyOn(operation1, "setCompleted");

                            batch.runOperation(0);

                            expect(setCompletedSpy).toHaveBeenCalled();
                        });

                        it("should run next operation", function() {
                            var runOperationSpy = spyOn(batch, "runOperation").andCallThrough();

                            batch.runOperation(0);

                            expect(runOperationSpy.calls[0].args).toEqual([0]);
                            expect(runOperationSpy.calls[1].args).toEqual([1]);
                        });
                    });

                    describe("if operation encounter an exception", function() {
                        var hasExceptionSpy;

                        beforeEach(function() {
                            hasExceptionSpy = spyOn(operation1, "hasException").andReturn(true);
                        });

                        it("should fireEvent exception with appropriate arguments", function() {
                            batch.runOperation(0);

                            expect(fireEventSpy).toHaveBeenCalledWith("exception", batch, operation1);
                        });
                        
                        it("should set hasException to true", function() {
                            batch.runOperation(0);
                            
                            expect(batch.hasException).toEqual(true);
                        });

                        describe("if batch pause on exception", function() {

                            it("should pause the batch", function() {
                                var pauseSpy = spyOn(batch, "pause");

                                batch.runOperation(0);

                                expect(pauseSpy).toHaveBeenCalled();
                            });

                            it("should not complete the operation", function() {
                                var setCompletedSpy = spyOn(operation1, "setCompleted");

                                batch.runOperation(0);

                                expect(setCompletedSpy).not.toHaveBeenCalled();
                            });

                            it("should not run the next operation", function() {
                                var runOperationSpy = spyOn(batch, "runOperation").andCallThrough();

                                batch.runOperation(0);

                                expect(runOperationSpy.calls[0].args).toEqual([0]);
                                expect(runOperationSpy.calls[1]).toBeUndefined();
                            });
                        });

                        describe("if batch doesn't pause on exception", function() {
                            beforeEach(function() {
                                batch.pauseOnException = false;
                            });

                            it("should not pause the batch", function() {
                                var pauseSpy = spyOn(batch, "pause");

                                batch.runOperation(0);

                                expect(pauseSpy).not.toHaveBeenCalled();
                            });

                            it("should complete the operation", function() {
                                var setCompletedSpy = spyOn(operation1, "setCompleted");

                                batch.runOperation(0);

                                expect(setCompletedSpy).toHaveBeenCalled();
                            });

                            it("should run the next operation", function() {
                                var runOperationSpy = spyOn(batch, "runOperation").andCallThrough();

                                batch.runOperation(0);

                                expect(runOperationSpy.calls[0].args).toEqual([0]);
                                expect(runOperationSpy.calls[1].args).toEqual([1]);
                            });
                        });
                    });
                });
            });
        });
    });
});