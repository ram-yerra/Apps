describe("Ext.data.AjaxProxy", function() {
    var proxy;
    
    beforeEach(function() {
        proxy = new Ext.data.AjaxProxy({});
    });
    
    afterEach(function() {
        delete proxy;
    });
    
    describe("instantiation", function() {
        it("should extend Ext.data.ServerProxy", function() {
            expect(proxy.superclass()).toEqual(Ext.data.ServerProxy.prototype);
        });
        
        it("should have correct actionMethods", function() {
            var actionMethods = {
                create : "POST",
                read   : "GET",
                update : "POST",
                destroy: "POST"
            };
                
            expect(proxy.actionMethods).toEqual(actionMethods);
        });
                
        it("should not have defined headers", function() {
            expect(proxy.headers).not.toBeDefined();
        });
    });
    
    describe("performing Operations", function() {
        var operation, writer, request, headers, callback, requestObject, ajaxWasUndefined;
        
        beforeEach(function() {
            if (Ext.Ajax == undefined) {
                ajaxWasUndefined = true;
                Ext.Ajax = {
                    request: Ext.emptyFn
                };
            }
            
            headers = {
                some: 'header'
            };
            
            writer = {
                write: Ext.emptyFn
            };
            
            callback = function() {};
            
            request = new Ext.data.Request({
                action: 'read'
            });
            
            operation = new Ext.data.Operation({
                action: 'read',
                allowWrite: function() {
                    return true;
                }
            });
            
            proxy = new Ext.data.AjaxProxy({
                headers: headers
            });
            
            spyOn(proxy, 'getWriter').andReturn(writer);
            spyOn(proxy, 'buildRequest').andReturn(request);
            spyOn(proxy, 'createRequestCallback').andReturn(callback);
            spyOn(writer, 'write').andReturn(request);
            
            spyOn(Ext.Ajax, 'request').andCallFake(function(options) {
                requestObject = options;
            });
            
            proxy.doRequest(operation);
        });
        
        afterEach(function() {
            if (ajaxWasUndefined) {
                delete Ext.Ajax;
            }
        });
        
        it("should use the configured Writer", function() {
            expect(proxy.getWriter).toHaveBeenCalled();
        });
        
        it("should build the request", function() {
            expect(proxy.buildRequest).toHaveBeenCalledWith(operation, undefined, undefined);
        });
        
        it("should create the request callback", function() {
            expect(proxy.createRequestCallback).toHaveBeenCalled();
        });
        
        it("should create a new AJAX request", function() {
            expect(Ext.Ajax.request).toHaveBeenCalled();
        });
        
        it("should allow the writer to modify the request", function() {
            expect(writer.write).toHaveBeenCalled();
        });
        
        describe("the AJAX request", function() {
            it("should set the scope to the Proxy", function() {
                expect(requestObject.scope).toEqual(proxy);
            });
            
            it("should set the timeout to the Proxy's timeout", function() {
                expect(requestObject.timeout).toEqual(proxy.timeout);
            });
            
            it("should send the correct HTTP method", function() {
                expect(requestObject.method).toEqual("GET");
            });
            
            it("should send any configured headers", function() {
                expect(requestObject.headers).toEqual(headers);
            });
            
            it("should send the callback function", function() {
                expect(requestObject.callback).toEqual(callback);
            });
        });
    });

    describe("creating a request callback", function() {
        var request, operation, callback, scope;
        
        beforeEach(function() {
            request = new Ext.data.Request({
                action: 'read'
            });
            
            operation = new Ext.data.Operation({
                action: 'read'
            });
            
            callback = jasmine.createSpy('callback');
            scope = {
                foo: 'bar'
            };
        });
        
        it("should return a function", function() {
            expect(typeof proxy.createRequestCallback(request, operation, callback, scope) == 'function').toBe(true);
        });
        
        describe("the callback", function() {
            var fn, reader, readerResult, response, record, recordData;
            
            var callRequestCallback = function(successful) {
                fn({}, successful, response);
            };
            
            var successfulRequest = function() {
                callRequestCallback(true);
            };
            
            var failedRequest = function() {
                callRequestCallback(false);
            };
            
            beforeEach(function() {
                fn = proxy.createRequestCallback(request, operation, callback, scope);
                
                recordData = {
                    some: 'data'
                };
                
                response = {};
                record = {
                    set: jasmine.createSpy('set'),
                    data: recordData,
                    getId: function() {
                        return 10;
                    }
                };
                
                operation.records = [record];
                
                readerResult = {
                    records: [{
                        data: recordData,
                        getId: function() {
                            return 10;
                        }
                    }]
                };
                
                reader = {
                    read: function() {
                        return readerResult;
                    }
                };
                
                spyOn(reader, 'read').andCallThrough();
                spyOn(proxy, 'getReader').andReturn(reader);
            });
            
            describe("if the request was successful", function() {
                beforeEach(function() {
                    spyOn(proxy, 'afterRequest').andCallThrough();
                    spyOn(operation, 'setCompleted').andReturn(true);
                    spyOn(operation, 'setSuccessful').andReturn(true);
                    
                    successfulRequest();
                });
                
                it("should get the Reader", function() {
                    expect(proxy.getReader).toHaveBeenCalled();
                });
                
                it("should read the response with the Reader", function() {
                    expect(reader.read).toHaveBeenCalled();
                });
                
                it("should attach the reader result to the Operation", function() {
                    expect(operation.resultSet).toEqual(readerResult);
                });
                
                it("should attach the response object to the Operation", function() {
                    expect(operation.response).toEqual(response);
                });
                
                it("should mark the Operation as completed", function() {
                    expect(operation.setCompleted).toHaveBeenCalled();
                });
                
                it("should mark the Operation as successful", function() {
                    expect(operation.setSuccessful).toHaveBeenCalled();
                });
                
                it("should call afterRequest template method", function() {
                    expect(proxy.afterRequest).toHaveBeenCalledWith(request, true);
                });
                
                it("should call the callback with the Operation", function() {
                    expect(callback).toHaveBeenCalledWith(operation);
                });
                
                it("should update the data of each record", function() {
                    expect(record.set).toHaveBeenCalledWith(recordData);
                });
            });
            
            describe("if the request failed", function() {
                it("should mark the Operation as having an exception", function() {
                    spyOn(operation, 'setException').andReturn(true);
                    
                    failedRequest();
                    
                    expect(operation.setException).toHaveBeenCalled();
                });
                
                it("should fire the exception event", function() {
                    var wasCalled = false;
                    
                    proxy.on('exception', function() {
                        wasCalled = true;
                    }, this);
                    
                    failedRequest();
                    
                    expect(wasCalled).toBe(true);
                });
                
                describe("the exception event", function() {
                    var passedResponse, passedOperation;
                    
                    beforeEach(function() {
                        proxy.on('exception', function(p, r, o) {
                            passedResponse = r;
                            passedOperation = o;
                        }, this);
                        
                        failedRequest();
                    });
                    
                    it("should pass the response", function() {
                        expect(passedResponse).toEqual(response);
                    });
                    
                    it("should pass the Operation", function() {
                        expect(passedOperation).toEqual(operation);
                    });
                });
            });
        });
    });
    
    describe("getMethod", function(){
        var request = new Ext.data.Request({
                url: "/",
                action: "read"
            });
        
        it("should return the HTTP method name for a given request", function() {
            expect(proxy.getMethod(request)).toEqual("GET");
        });
    });
    
    describe("methods", function() {

        
        //TODO: Uncomment, when Ext.Ajax is available in platform
        //describe("doRequest", function(){
        //    var operation = new Ext.data.Operation();
        //    
        //    it("should do an Ext.Ajax.request", function() {
        //        var spy = spyOn(Ext.Ajax, "request");
        //        expect(spy).toHaveBeenCalled();
        //    });
        //
        //});
    });
    
});