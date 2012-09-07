describe("Ext.data.Field", function() {
    var field,
        foo = 'foo',
        types = Ext.data.Types,
        stypes = Ext.data.SortTypes,
        Field = Ext.data.Field,
        static_config_options_spec = function(){
            expect(field.name).toEqual(foo);
            expect(field.dateFormat).toBeNull();
            expect(field.defaultValue).toEqual("");
            expect(field.mapping).toBeNull();
            expect(field.sortDir).toEqual("ASC");
            expect(field.allowBlank).toBe(true);
        };
     
    describe("instantiation", function() {
        it("should be an extend of Object", function(){
            expect(Field.prototype.superclass()).toEqual(Object.prototype);
        });
        
        afterEach(function(){
            delete field; 
        });
        
        describe('instantiation with name specified', function() {
            var config_options_spec = function(){
                static_config_options_spec();
                expect(field.type).toEqual(types.AUTO);
                expect(field.sortType).toEqual(types.AUTO.sortType);
                expect(field.convert).toEqual(types.AUTO.convert);
            };
            
            describe("as string", function() {
                beforeEach(function(){
                   field = new Field(foo); 
                });
                
                it("should have correct configuration options", config_options_spec);
            });
            
            describe("in object", function() {
                beforeEach(function(){
                   field = new Field({
                        name: 'foo'
                   }); 
                });
                
                it("should have correct configuration options", config_options_spec);
            });
        });
        
        describe("instantiation with type specified", function() {
            beforeEach(function(){
               field = new Field({
                    name: 'foo',
                    type: 'string'
               }); 
            });
            
            it("should have correct configuration options", function() {
                static_config_options_spec();
                expect(field.type).toEqual(types.STRING);
                expect(field.sortType).toEqual(types.STRING.sortType);
                expect(field.convert).toEqual(types.STRING.convert);
            });
        });
        
        describe("instantiation with convert specified", function() {
            var convert = Ext.emptyFn;
            beforeEach(function(){
               field = new Field({
                    name: 'foo',
                    convert: convert
               }); 
            });
            
            it("should have correct configuration options", function() {
                static_config_options_spec();
                expect(field.type).toEqual(types.AUTO);
                expect(field.sortType).toEqual(types.AUTO.sortType);
                expect(field.convert).toEqual(Ext.emptyFn);
            });
        });
        
        describe("configuration is applied to instantiation", function() {
            var config = {
                name: foo
            };
            
            it("shoud call Ext.apply 1 time", function() {
                var extApplySpy = spyOn(Ext, 'apply').andCallThrough();
                
                field = new Field(config);
                expect(extApplySpy).toHaveBeenCalledWith(field, config);
            });
        });        
    });

    describe("alias", function() {
        var f;
        describe("AUTO", function() {
            it("should have an empty alias", function() {
                f = new Field({type: null});
                expect(f.type).toEqual(types.AUTO)
            });
            
            it("should have auto alias", function() {
                f = new Field({type: 'auto'});
                expect(f.type).toEqual(types.AUTO)
            });
        });

        describe("INT", function() {
            it("should have int alias", function() {
                f = new Field({type: 'int'});
                expect(f.type).toEqual(types.INT);
            });
            
            it("should have integer alias", function() {
                f = new Field({type: 'integer'});
                expect(f.type).toEqual(types.INT);
            });
        });

        describe("FLOAT", function() {
            it("should have float alias", function() {
                f = new Field({type: 'float'});
                expect(f.type).toEqual(types.FLOAT);
            });
            
            it("should have number alias", function() {
                f = new Field({type: 'number'});
                expect(f.type).toEqual(types.FLOAT);
            });
        });
        
        describe("BOOL", function() {
            it("should have bool alias", function() {
                f = new Field({type: 'bool'});
                expect(f.type).toEqual(types.BOOL);
            });
            
            it("should have boolean alias", function() {
                f = new Field({type: 'boolean'});
                expect(f.type).toEqual(types.BOOL);
            });
        });

        describe("STRING", function() {
            it("should have string alias", function() {
                f = new Field({type: 'string'});
                expect(f.type).toEqual(types.STRING);
            });
        });

        describe("DATE", function() {
            it("should have date alias", function() {
                f = new Field({type: 'date'});
                expect(f.type).toEqual(types.DATE);
            });
        });
    });
    
    
    describe("sortTypes", function(){
        var f;
        
        describe("standard sorts", function(){
            describe("AUTO", function() {
                it("should have sortType equal to none", function() {
                    f = new Field({type: 'auto'});
                    expect(f.sortType).toEqual(stypes.none);
                });
                
            });
    
            describe("INT", function() {
                it("should have sortType equal to none", function() {
                    f = new Field({type: 'int'});
                    expect(f.sortType).toEqual(stypes.none);
                });            
            });
    
            describe("FLOAT", function() {
                it("should have sortType equal to none", function() {
                    f = new Field({type: 'float'});
                    expect(f.sortType).toEqual(stypes.none);
                });
            });
            
            describe("BOOL", function() {
                it("should have sortType equal to none", function() {
                    f = new Field({type: 'bool'});
                    expect(f.sortType).toEqual(stypes.none);
                });
            });
    
            describe("STRING", function() {
                it("should have sortType equal to asUCString", function() {
                    f = new Field({type: 'string'});
                    expect(f.sortType).toEqual(stypes.asUCString);
                });
            });
    
            describe("DATE", function() {
                it("should have sortType equal to asDate", function() {
                    f = new Field({type: 'date'});
                    expect(f.sortType).toEqual(stypes.asDate);
                });
            });             
        });
        
        describe("custom sorts", function(){
            it("should handle custom string", function(){
                f = new Ext.data.Field({
                    type: 'auto',
                    sortType: 'asDate'
                });
                expect(f.sortType).toEqual(stypes.asDate);
            });
            
            it("should handle custom function", function(){
                var s1 = function(v){
                    return v * v;    
                };
                
                f = new Ext.data.Field({
                    type: 'int',
                    sortType: s1
                });
                
                expect(f.sortType).toEqual(s1);
            });
            
            it("should handle another custom function", function(){
                var s2 = function(v){
                   return Math.sqrt(v);
                };
                
                f = new Ext.data.Field({
                    type: 'date',
                    sortType: s2
                });
                
                expect(f.sortType).toEqual(s2);
            });
        });
    });
    
    describe("converts", function(){
      var f;
        
        describe("standard converts", function(){
            describe("AUTO", function() {
                it("should have auto convert function", function() {
                    f = new Field({type: 'auto'});
                    expect(f.convert).toEqual(types.AUTO.convert);
                });
            });
    
            describe("INT", function() {
                it("should have int convert function", function() {
                    f = new Field({type: 'int'});
                    expect(f.convert).toEqual(types.INT.convert);
                });      
            });
    
            describe("FLOAT", function() {
                it("should have float convert function", function() {
                    f = new Field({type: 'float'});
                    expect(f.convert).toEqual(types.FLOAT.convert);
                });
            });
            
            describe("BOOL", function() {
                it("should have bool convert function", function() {
                    f = new Field({type: 'bool'});
                    expect(f.convert).toEqual(types.BOOL.convert);
                });
            });
    
            describe("STRING", function() {
                it("should have string convert function", function() {
                    f = new Field({type: 'string'});
                    expect(f.convert).toEqual(types.STRING.convert);
                });
            });
    
            describe("DATE", function() {
                it("should have date convert function", function() {
                    f = new Field({type: 'date'});
                    expect(f.convert).toEqual(types.DATE.convert);
                });
            });             
        });
        
        describe("custom converts", function(){
            it("should handle custom function", function(){
                var c1 = function(v){
                    return v / 3;
                };
                
                f = new Ext.data.Field({
                    type: 'int',
                    convert: c1
                });
                
                expect(f.convert).toEqual(c1);
            });
            
            it("should handle another custom function", function(){
                var c2 = function(v){
                    return v * 4;    
                };
                
                f = new Ext.data.Field({
                    type: 'date',
                    convert: c2
                });
                
                expect(f.convert).toEqual(c2);
            });
        });
    });    
});