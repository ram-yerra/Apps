describe("Ext.data.Reader", function() {
    var reader, proxy;
    
    describe("reading", function() {
        var response, responseData;
        
        beforeEach(function() {
            Ext.regModel('User', {
                fields: ['id']
            });
            
            proxy = {
                setModel: Ext.emptyFn
            };
            
            reader = new Ext.data.Reader({
                proxy: proxy,
                model: 'User',
                buildExtractors: Ext.emptyFn
            });
            
            spyOn(reader, 'readRecords').andReturn({});
        });
        
        function doRead() {
            return reader.read(response);
        }
        
        describe("if there is a responseText property", function() {
            beforeEach(function() {
                response = {
                    responseText: 'something'
                };
                
                responseData = {
                    something: 'else'
                };
                
                spyOn(reader, 'getResponseData').andCallFake(function() {
                    return responseData;
                });
                
                doRead()
            });
            
            it("should first call getResponseData with the response object", function() {
                expect(reader.getResponseData).toHaveBeenCalledWith(response);
            });
            
            it("should call readRecords with returned response data", function() {
                expect(reader.readRecords).toHaveBeenCalledWith(responseData);
            });
        });
        
        describe("if there is no responseText property", function() {
            beforeEach(function() {
                response = "something";
                
                doRead();
            });
            
            it("should call readRecords with the response", function() {
                expect(reader.readRecords).toHaveBeenCalledWith(response);
            });
        });
        
        describe("if the response was falsy", function() {
            it("should return the nullResultSet if the response is undefined", function() {
                response = undefined;
                
                expect(doRead()).toEqual(Ext.data.Reader.prototype.nullResultSet);
            });
            
            it("should return the nullResultSet if the response is null", function() {
                response = null;
                
                expect(doRead()).toEqual(Ext.data.Reader.prototype.nullResultSet);
            });
            
            it("should return the nullResultSet if the response is false", function() {
                response = false;
                
                expect(doRead()).toEqual(Ext.data.Reader.prototype.nullResultSet);
            });
        });
    });
    
    describe("onMetaChange", function() {
        var meta;
        
        beforeEach(function() {
            Ext.regModel('User', {
                fields: ['id']
            });
            
            proxy = {
                setModel: Ext.emptyFn
            };
            
            reader = new Ext.data.Reader({
                proxy: proxy,
                model: 'User',
                buildExtractors: Ext.emptyFn
            });
            
            meta = {
                root           : 'someRootProperty',
                idProperty     : 'someIdProperty',
                totalProperty  : 'someTotalProperty',
                successProperty: 'someSuccessProperty'
            };
            
            spyOn(reader, 'buildExtractors').andCallThrough();
        });
        
        it("should set the root property", function() {
            reader.onMetaChange(meta);
            
            expect(reader.root).toEqual('someRootProperty');
        });
        
        it("should set the idProperty", function() {
            reader.onMetaChange(meta);
            
            expect(reader.idProperty).toEqual('someIdProperty');
        });
        
        it("should set the totalProperty", function() {
            reader.onMetaChange(meta);
            
            expect(reader.totalProperty).toEqual('someTotalProperty');
        });
        
        it("should set the successProperty", function() {
            reader.onMetaChange(meta);
            
            expect(reader.successProperty).toEqual('someSuccessProperty');
        });
        
        it("should rebuild the extractor functions", function() {
            reader.onMetaChange(meta);
            
            expect(reader.buildExtractors).toHaveBeenCalled();
        });
        
        describe("if fields are present in the meta data", function() {
            beforeEach(function() {
                Ext.apply(meta, {
                    fields: [
                        {name: 'uniqueId', type: 'int'},
                        {name: 'name',     type: 'string'}
                    ]
                });
                
                spyOn(proxy, 'setModel').andReturn();
            });
            
            it("should create a new implicit model", function() {
                var origModel = reader.model;
                
                reader.onMetaChange(meta);
                
                expect(reader.model).not.toEqual(origModel);
            });
            
            it("should add the fields to the new model", function() {
                reader.onMetaChange(meta);
                
                var model = reader.model,
                    fields = model.prototype.fields;
                
                expect(fields.length).toEqual(2);
                expect(fields.items[0].name).toEqual('uniqueId');
                expect(fields.items[1].name).toEqual('name');
            });
            
            it("should update the Proxy's model", function() {
                reader.onMetaChange(meta);
                
                expect(proxy.setModel).toHaveBeenCalledWith(reader.model, true);
            });
        });
    });
});