describe("Ext.data.ServerProxy", function(){
    var proxy,
        ServerProxy = Ext.data.ServerProxy,
        reader = new Ext.data.Reader({model: 'something'}),
        writer = new Ext.data.Writer();
    
    describe("instantiation", function() {
        var config = {
                extraParams: {
                    foo: true,
                    bar: false
                },
                reader: reader,
                writer: writer
            };
            
        beforeEach(function(){
            proxy = new ServerProxy(config);
        });
        
        it("should extend Ext.data.Proxy", function() {
            expect(proxy.superclass()).toEqual(Ext.data.Proxy.prototype);
        });
        
        it("should have caching disabled", function() {
            expect(proxy.noCache).toBe(true);
        });
        
        it("should have nocache config backward compatibility", function() {
            expect(proxy.nocache).toBe(true);
        });
        
        it("should have cacheString equal to _dc", function() {
            expect(proxy.cacheString).toEqual("_dc");
        });
        
        it("should have defaultReaderType equal to json", function() {
            expect(proxy.defaultReaderType).toEqual("json");
        });
        
        it("should have defaultWriterType equal to json", function() {
            expect(proxy.defaultWriterType).toEqual("json");
        });
        
        it("should have timeout equal to 30000", function() {
            expect(proxy.timeout).toEqual(30000);
        });
        
        it("should have extraParams", function() {
            expect(proxy.extraParams).toEqual(config.extraParams);
        });
        
        it("should have reader", function() {
            expect(proxy.reader).toEqual(config.reader);
        });
        
        it("should have writer", function() {
            expect(proxy.writer).toEqual(config.writer);
        });
    });
    
    describe("methods", function(){
        describe("CRUD Operations", function() {
            beforeEach(function() {
                proxy = new ServerProxy({
                    doRequest: jasmine.createSpy()
                });
            });
            
            describe("create", function() {
                it("should do a request", function() {
                    proxy.read('create', 'create');
                    expect(proxy.doRequest).toHaveBeenCalledWith('create', 'create');
                });
            });
            
            describe("read", function() {
                it("should do a request", function() {
                    proxy.read('read', 'read');
                    expect(proxy.doRequest).toHaveBeenCalledWith('read', 'read');
                });
            });
            
            describe("read", function() {
                it("should do a request", function() {
                    proxy.read('update', 'update');
                    expect(proxy.doRequest).toHaveBeenCalledWith('update', 'update');
                });
            });

            describe("read", function() {
                it("should do a request", function() {
                    proxy.read('destroy', 'destroy');
                    expect(proxy.doRequest).toHaveBeenCalledWith('destroy', 'destroy');
                });
            });
        });
        
        describe("buildUrl", function() {
            var request = new Ext.data.Request({
                    url: 'keep'
                }),
                configWithNoCache = {
                    noCache: false
                },
                configWithCacheString = {
                    cacheString: '_cool'
                };
                
            beforeEach(function() {
               spyOn(Date.prototype, "getTime").andReturn('bro');
            });
            
            it("should return keep?_dc=bro with an empty config", function() {
                proxy = new ServerProxy({});
                expect(proxy.buildUrl(request), 'keep?_dc=bro');
            });
            
            it("should disable caching", function() {
                proxy = new ServerProxy(configWithNoCache);
                expect(proxy.buildUrl(request), request.url);
            });
            
            it("should use cacheString", function() {
                proxy = new ServerProxy(configWithCacheString);
                expect(proxy.buildUrl(request), 'keep?_cool=bro');
            });
        });
        
        describe("doRequest", function() {
            it("should throw an error", function() {
                expect(ServerProxy.prototype.doRequest).toThrow();
            });
        });
        
        describe("getParams", function() {
            var params, sorters, filters, groupers;
            
            function createProxy(config) {
                return new Ext.data.ServerProxy(config || {});
            }
            
            function createOperation(config) {
                return new Ext.data.Operation(Ext.apply({}, config, {
                    page : 10,
                    start: 100,
                    limit: 10,
                    
                    group  : groupers,
                    sorters: sorters,
                    filters: filters
                }));
            }
            
            function getParams(proxyConfig, operationConfig) {
                var proxy     = createProxy(proxyConfig),
                    operation = createOperation(operationConfig);
                
                return proxy.getParams({}, operation);
            }
            
            beforeEach(function() {
                sorters  = [new Ext.util.Sorter({property: 'name', direction: 'ASC'})];
                filters  = [new Ext.util.Filter({property: 'name', value: 'Ed'})];
                groupers = {field: 'name', direction: 'ASC'};
            });
            
            describe("the page param", function() {
                it("should default to 'page'", function() {
                    params = getParams();
                    
                    expect(params['page']).toEqual(10);
                });
                
                it("should be customizable", function() {
                    params = getParams({pageParam: 'thePage'});
                    
                    expect(params['thePage']).toEqual(10);
                });
                
                it("should not be sent if undefined", function() {
                    params = getParams({pageParam: undefined});
                    
                    expect(params['page']).toEqual(undefined);
                });
            });
            
            describe("the start param", function() {
                it("should default to 'start'", function() {
                    params = getParams();
                    
                    expect(params['start']).toEqual(100);
                });
                
                it("should be customizable", function() {
                    params = getParams({startParam: 'theStart'});
                    
                    expect(params['theStart']).toEqual(100);
                });
                
                it("should not be sent if undefined", function() {
                    params = getParams({startParam: undefined});
                    
                    expect(params['start']).toEqual(undefined);
                });
            });
            
            describe("the limit param", function() {
                it("should default to 'limit'", function() {
                    params = getParams();
                    
                    expect(params['limit']).toEqual(10);
                });
                
                it("should be customizable", function() {
                    params = getParams({limitParam: 'theLimit'});
                    
                    expect(params['theLimit']).toEqual(10);
                });
                
                it("should not be sent if undefined", function() {
                    params = getParams({limitParam: undefined});
                    
                    expect(params['limit']).toEqual(undefined);
                });
            });
            
            describe("the group param", function() {
                beforeEach(function() {
                    spyOn(Ext.data.ServerProxy.prototype, 'encodeGroupers').andReturn("groupString");
                });
                
                it("should default to 'group'", function() {
                    params = getParams();
                    
                    expect(params['group']).toEqual("groupString");
                });
                
                it("should be customizable", function() {
                    params = getParams({groupParam: 'theGroup'});
                    
                    expect(params['theGroup']).toEqual("groupString");
                });
                
                it("should not be sent if undefined", function() {
                    params = getParams({groupParam: undefined});
                    
                    expect(params['group']).toEqual(undefined);
                });
                
                it("should encode the groupers", function() {
                    getParams();
                    
                    expect(Ext.data.ServerProxy.prototype.encodeGroupers).toHaveBeenCalledWith(groupers);
                });
                
                it("should not be set if there is no group defined", function() {
                    params = getParams({}, {group: {field: undefined, direction: undefined}});
                    
                    expect(params['group']).toEqual(undefined);
                });
            });
            
            describe("the sort param", function() {
                beforeEach(function() {
                    spyOn(Ext.data.ServerProxy.prototype, 'encodeSorters').andReturn("sorters");
                });
                
                it("should default to 'sort'", function() {
                    params = getParams();
                    
                    expect(params['sort']).toEqual("sorters");
                });
                
                it("should be customizable", function() {
                    params = getParams({sortParam: 'theSorters'});
                    
                    expect(params['theSorters']).toEqual("sorters");
                });
                
                it("should not be sent if undefined", function() {
                    params = getParams({sortParam: undefined});
                    
                    expect(params['sort']).toEqual(undefined);
                });
                
                it("should encode the sorters", function() {
                    getParams();
                    
                    expect(Ext.data.ServerProxy.prototype.encodeSorters).toHaveBeenCalledWith(sorters);
                });
                
                it("should not be set if there are no sorters", function() {
                    params = getParams({}, {sorters: []});
                    
                    expect(params['sort']).toEqual(undefined);
                });
            });
            
            describe("the filter param", function() {
                beforeEach(function() {
                    spyOn(Ext.data.ServerProxy.prototype, 'encodeFilters').andReturn("filters");
                });
                
                it("should default to 'filter'", function() {
                    params = getParams();
                    
                    expect(params['filter']).toEqual("filters");
                });
                
                it("should be customizable", function() {
                    params = getParams({filterParam: 'theFilters'});
                    
                    expect(params['theFilters']).toEqual("filters");
                });
                
                it("should not be sent if undefined", function() {
                    params = getParams({filterParam: undefined});
                    
                    expect(params['filter']).toEqual(undefined);
                });
                
                it("should encode the filters", function() {
                    getParams();
                    
                    expect(Ext.data.ServerProxy.prototype.encodeFilters).toHaveBeenCalledWith(filters);
                });
                
                it("should not be set if there are no filters", function() {
                    params = getParams({}, {filters: []});
                    
                    expect(params['filter']).toEqual(undefined);
                });
            });
        });
        
        describe("encoding sorters", function() {
            var sorter1, sorter2;
            
            beforeEach(function() {
                sorter1 = new Ext.util.Sorter({
                    property : "name",
                    direction: "ASC"
                });
                
                sorter2 = new Ext.util.Sorter({
                    property : "age",
                    direction: "DESC"
                });
                
                proxy = new Ext.data.ServerProxy();
            });
            
            it("should provide a default encoded string", function() {
                var expected = "[{\"property\":\"name\",\"direction\":\"ASC\"},{\"property\":\"age\",\"direction\":\"DESC\"}]";
                
                expect(proxy.encodeSorters([sorter1, sorter2])).toEqual(expected);
            });
        });
        
        describe("encoding filters", function() {
            var filter1, filter2;
            
            beforeEach(function() {
                filter1 = new Ext.util.Filter({
                    property : "name",
                    value    : "Ed"
                });
                
                filter2 = new Ext.util.Filter({
                    property : "age",
                    value    : "25"
                });
                
                proxy = new Ext.data.ServerProxy();
            });
            
            it("should provide a default encoded string", function() {
                var expected = "[{\"property\":\"name\",\"value\":\"Ed\"},{\"property\":\"age\",\"value\":\"25\"}]";
                
                expect(proxy.encodeFilters([filter1, filter2])).toEqual(expected);
            });
        });
        
        describe("encoding group data", function() {
            it("should JSON encode the data", function() {
                var proxy = new Ext.data.ServerProxy(),
                    groupData = {field: 'name', direction: 'ASC'};
                
                expect(proxy.encodeGroupers(groupData)).toEqual("{\"field\":\"name\",\"direction\":\"ASC\"}");
            });
        });
        
        describe("reader accessors", function() {
            var spy,
                config,
                sreader = 'Gotcha',
                defaultReaderType = 'rtype',
                modelName = 'SomeModel', model;
               
                
            beforeEach(function(){
                model = Ext.regModel(modelName, {
                    fields: ['id']
                });
                
                spy = spyOn(Ext.data.ReaderMgr, "create").andCallFake(function() {
                    return arguments[0];
                });
            });
            
            describe("set the proxy's reader by reader instance", function() {
                beforeEach(function(){
                    config = {
                        reader: reader
                    };
                    proxy = new ServerProxy(config); 
                });
                
                it("should not create a new reader instance", function() {
                    expect(spy).not.toHaveBeenCalled();
                });
                
                it("should have a reader set", function() {
                    expect(proxy.getReader()).toEqual(reader);
                });
            });
            
            describe("set the proxy's reader with defaultReaderType", function() {
                beforeEach(function(){
                    config = {
                        model: model,
                        defaultReaderType: defaultReaderType
                    };
                    proxy = new ServerProxy(config); 
                });
                
                it("should not create a new reader instance", function() {
                    expect(spy).toHaveBeenCalledWith({
                        proxy: proxy,
                        model: model,
                        type : defaultReaderType
                    });
                });
                
                it("should have a reader set", function() {
                    expect(proxy.getReader()).toEqual({
                        proxy: proxy,
                        model: model,
                        type : defaultReaderType
                    });
                });
            });
            
            describe("set the proxy's reader by string", function() {
                beforeEach(function(){
                    config = {
                        reader: sreader,
                        proxy: proxy,
                        model: model,
                        defaultReaderType: defaultReaderType
                    };
                    proxy = new ServerProxy(config); 
                });
                
                it("should not create a new reader instance", function() {
                    expect(spy).toHaveBeenCalledWith({
                        model: model,
                        proxy: proxy,
                        type : sreader
                    });
                });
                
                it("should have a reader set", function() {
                    expect(proxy.getReader()).toEqual({
                        model: model,
                        proxy: proxy,
                        type : sreader
                    });
                });
            });
        });
        
        describe("writer accessors", function() {
            var spy,
                config,
                swriter = 'Gotcha',
                defaultWriterType = 'wtype',
                modelName = 'SomeModel', model;
               
            beforeEach(function(){
                model = Ext.regModel(modelName, {
                    fields: ['id']
                });
                
                spy = spyOn(Ext.data.WriterMgr, "create").andCallFake(function() {
                    return arguments[0];
                });
            });
            
            afterEach(function() {
                delete Ext.ModelMgr.types[modelName];
            });
            
            describe("set the proxy's writer by writer instance", function() {
                beforeEach(function(){
                    config = {
                        writer: writer
                    };
                    proxy = new ServerProxy(config); 
                });
                
                it("should not create a new writer instance", function() {
                    expect(spy).not.toHaveBeenCalled();
                });
                
                it("should have a writer set", function() {
                    expect(proxy.getWriter()).toEqual(writer);
                });
            });
            
            describe("set the proxy's writer with defaultWriterType", function() {
                beforeEach(function(){
                    config = {
                        model: model,
                        defaultWriterType: defaultWriterType
                    };
                    proxy = new ServerProxy(config); 
                });
                
                it("should not create a new writer instance", function() {
                    expect(spy).toHaveBeenCalledWith({
                        model: model,
                        type : defaultWriterType
                    });
                });
                
                it("should have a writer set", function() {
                    expect(proxy.getWriter()).toEqual({
                        model: model,
                        type : defaultWriterType
                    });
                });
            });
            
            describe("set the proxy's writer by string", function() {
                beforeEach(function(){
                    config = {
                        writer: swriter,
                        model: model,
                        defaultWriterType: defaultWriterType
                    };
                    proxy = new ServerProxy(config); 
                });
                
                it("should not create a new writer instance", function() {
                    expect(spy).toHaveBeenCalledWith({
                        model: model,
                        type : swriter
                    });
                });
                
                it("should have a writer set", function() {
                    expect(proxy.getWriter()).toEqual({
                        model: model,
                        type : swriter
                    });
                });
            });
        });
        
        describe("destroy", function(){
            var config, spy;
            
            beforeEach(function(){
                config = {
                    reader: reader,
                    writer: writer
                };
                proxy = new ServerProxy(config);
            });
            
            it('should destroy reader and writer', function(){
               spy = spyOn(Ext, "destroy");
               proxy.onDestroy();
               expect(spy).toHaveBeenCalledWith(reader, writer);
            });
        });
    });
});