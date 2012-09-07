describe("Ext", function() {
    
    describe("Ext.apply", function() {
        var o;
        
        it("should apply properties and return an object", function() {
            o = Ext.apply({}, {
                foo: 1,
                bar: 2
            });
            
            expect(o).toEqual({
                foo: 1,
                bar: 2
            });
        });
        
        it("should change the reference of the object", function() {
            o = {};
            Ext.apply(o, {
                opt1: 'x',
                opt2: 'y'
            });
            
            expect(o).toEqual({
                opt1: 'x',
                opt2: 'y'
            });
        });
        
        it("should overwrite properties", function() {
            o = Ext.apply({
                foo: 1,
                baz: 4
            }, {
                foo: 2,
                bar: 3
            });
            
            expect(o).toEqual({
                foo: 2,
                bar: 3,
                baz: 4
            });
        });
        
        it("should use default", function() {
            o = {};
            
            Ext.apply(o, {
                foo: 'new',
                exist: true
            }, {
                foo: 'old',
                def: true
            });
            
            expect(o).toEqual({
                foo: 'new',
                def: true,
                exist: true
            });
        });
        
        it("should override all defaults", function() {
            o = Ext.apply({}, {
                foo: 'foo',
                bar: 'bar'
            }, {
                foo: 'oldFoo',
                bar: 'oldBar'
            });
            
            expect(o).toEqual( {
                foo: 'foo',
                bar: 'bar'                
            });
        });
        
        it("should return null if null is passed as first argument", function() {
           expect(Ext.apply(null, {})).toBeNull(); 
        });
        
        it("should return the object if second argument is no defined", function() {
            o = {
                foo: 1
            };
            expect(Ext.apply(o)).toEqual(o);
        });
        
        it("should override valueOf", function() {
            o = Ext.apply({}, {valueOf: 1});
            
            expect(o.valueOf).toEqual(1);
        });
        
        it("should override toString", function() {
            o = Ext.apply({}, {toString: 3});
            
            expect(o.toString).toEqual(3);
            
        });        
    });
    
    describe("Ext.applyIf", function(){
        var o;
        
        it("should apply properties and return an object with an empty destination object", function() {
            o = Ext.applyIf({}, {
                foo: 'foo',
                bar: 'bar'
            });
            
            expect(o).toEqual( {
                foo: 'foo',
                bar: 'bar'                
            });
        });
        
        it("should not override default properties", function() {
            o = Ext.applyIf({
                foo: 'foo'
            }, {
                foo: 'oldFoo'
            });
            
            expect(o).toEqual({
                foo: 'foo'
            });
        });
        
        it("should not override default properties with mixing properties", function() {
            o = Ext.applyIf({
                foo: 1,
                bar: 2
            }, {
                bar: 3,
                baz: 4
            });
            
            expect(o).toEqual({
                foo: 1,
                bar: 2,
                baz: 4
            });
        });
        
          it("should change the reference of the object", function() {
            o = {};
            Ext.applyIf(o, {
                foo: 2
            }, {
                foo: 1
            });
            
            expect(o).toEqual({
                foo: 2
            });
        });
          
        it("should return null if null is passed as first argument", function() {
           expect(Ext.applyIf(null, {})).toBeNull(); 
        });
        
        it("should return the object if second argument is no defined", function() {
            o = {
                foo: 1
            };
            
            expect(Ext.applyIf(o)).toEqual(o);
        });
    });
    
    describe("Ext.id", function(){
        var el;
        describe("if element passed as first argument is different of document or window", function() {
            beforeEach(function() {
                el = document.createElement("div"); // do not use the Ext.getBody().createChild() method because it call Ext.id
                sandBox().appendChild(el);
            });
            
            it("should generate an unique id for the element with default prefix ext-gen", function() {
                expect(Ext.id(el)).toEqual("ext-gen" + Ext.idSeed);
            });
            
            it("should generate an unique id for the element with custom prefix", function() {
                var prefix = "nico-yhwh";
                expect(Ext.id(el, prefix)).toEqual(prefix + Ext.idSeed);
            });
            
            it("should not override existing id", function() {
                var id = "unchanged";
                el.id = id;
                expect(Ext.id(el)).toEqual(id);
            });            
        });
        
        describe("if element passed as first argument is document", function() {
            it("should return Ext.documentId", function() {
                expect(Ext.id(document)).toEqual(Ext.documentId);
            });
        });
        
        describe("if element passed as first argument is window", function() {
            it("should return Ext.windowId", function() {
                expect(Ext.id(window)).toEqual(Ext.windowId);
            });
        });        
    });
    
    describe("Ext.repaint", function() {
        it("should create a mask in the body", function(){
            var body = Ext.getBody();
            
            spyOn(Ext, "getBody").andCallThrough();
            spyOn(body, "createChild").andCallThrough();
            
            Ext.repaint();
            
            expect(Ext.getBody).toHaveBeenCalled();
            expect(body.createChild).toHaveBeenCalledWith({cls: "x-mask x-mask-transparent", tag: "div"});
        });
    });
    
    describe("Ext.destroy", function() {
        var o1, o2, o3;
        
        beforeEach(function() {
            o1 = jasmine.createSpyObj("o1", ["destroy"]);
            
            o2 = jasmine.createSpyObj("o2", ["destroy"]);
            
            o3 = jasmine.createSpyObj("o3", ["dest"]);
         
        });
        
        it("should destroy an object", function() {
            Ext.destroy(o1);
            
            expect(o1.destroy).toHaveBeenCalled();
        });

        it("should no destroy an object without a destroy method", function() {
            Ext.destroy(o3);
            
            expect(o3.dest).not.toHaveBeenCalled();
        });
        
        it("should destroy an array of objects", function() {
            Ext.destroy([o1, o2, o3]);
            
            expect(o1.destroy).toHaveBeenCalled();
            expect(o2.destroy).toHaveBeenCalled();
            expect(o3.dest).not.toHaveBeenCalled();
        });
        
        it("should destroy multiple objects", function() {
            Ext.destroy(o1, o2, o3);
            
            expect(o1.destroy).toHaveBeenCalled();
            expect(o2.destroy).toHaveBeenCalled();
            expect(o3.dest).not.toHaveBeenCalled();
        });
        
        it("should remove dom if object is an Ext.element", function() {
           var el = Ext.getBody().createChild({id: "to_destroy"});
      
           Ext.destroy(el);
           
           expect(Ext.fly("to_destroy")).toBeNull();
        });
    });
    
    describe("Ext.each", function() {
        describe("simple cases", function() {
            it("should work with an array of numbers", function() {
                var sum = 0;
                
                Ext.each([1, 2, 3, 4], function(val){
                    sum += val;
                });
                
                expect(sum).toEqual(10);
            });
            
            it("should work with an array of strings", function() {
                var str = '';
                
                Ext.each(["S", "e", "n", "c", "h", "a"], function(s){
                    str += s;
                });
                
                expect(str).toEqual("Sencha");
            });
            
            it("should pass index correctly", function() {
                var arr = [];
                Ext.each([1, 2, 3, 4, 5, 6], function(val, idx){
                    arr.push(idx);
                });
                expect(arr).toEqual([0, 1, 2, 3, 4, 5]);
            });
                        
            it("should work with a non array parameter", function() {
                var sum = 0;
                
                Ext.each(5, function(num){
                    sum += num;
                });
                
                expect(sum).toEqual(5);
            });            
        });
        
        describe("more complex cases that need a spy", function() {
            var eachFn;
            
            beforeEach(function() {
                eachFn = jasmine.createSpy();    
            });
            
            it("should not run eachFn with an empty array", function() {
                Ext.each([], eachFn);
                
                expect(eachFn).not.toHaveBeenCalled();
            });
            
            it("should not run eachFn with null as first param", function() {
                Ext.each(null, eachFn);
                
                expect(eachFn).not.toHaveBeenCalled();
            });
            
            it("should iterate over NodeLists", function() {
                Ext.each(document.getElementsByTagName('body'), eachFn);
                
                expect(eachFn).toHaveBeenCalled();
            });
            
            it("should stop when function called with each item return false", function() {
                eachFn.andCallFake(function(v) {
                    if (v === 5) {
                        return false;
                    }
                });
                
                Ext.each([1, 2, 3, 4, 5, 6], eachFn);
                
                expect(eachFn.callCount).toEqual(5);
            });
            
            it("should runfunction called with each item with correct scope", function() {
                
                Ext.each([1, 2], eachFn, fakeScope);
                
                expect(eachFn.calls[0].object).toBe(fakeScope);
                expect(eachFn.calls[1].object).toBe(fakeScope);
            });
        });
    });
        
    describe("Ext.extend", function() {
        var Dude, Awesome, david;
        
        beforeEach(function() {
            Dude = Ext.extend(Object, {
                constructor: function(config){
                    Ext.apply(this, config);
                    this.isBadass = false;
                }
            });
            
            Awesome = Ext.extend(Dude, {
                constructor: function(){
                    Awesome.superclass.constructor.apply(this, arguments);
                    this.isBadass = true;
                }
            });
            
            david = new Awesome({
                davis: 'isAwesome'
            });
        });

        it("should throw an error if superclass isn't defined", function() {
            expect(function() {
                Ext.extend(undefined, {});
            }).toThrow("Attempting to extend from a class which has not been loaded on the page.");
        });
        
        it("should create a superclass that return the original classe", function() {
            expect(david.superclass()).toEqual(Dude.prototype);
        });
        
        it("should add override method", function() {
            expect(typeof david.override === 'function').toBe(true);
        });
        
        describe("subclass extend method", function() {
            it("should add an extend method", function() {
                expect(typeof Awesome.extend === 'function').toBe(true);
            });
            
            it("should call Ext.extend", function() {
                var extendSpy = spyOn(Ext, "extend");
                
                Awesome.extend();
                
                expect(extendSpy).toHaveBeenCalledWith(Awesome, undefined);
            });
        });

        
        it("should override redefined methods", function() {
            expect(david.isBadass).toBe(true);
        });
        
        it("should keep new properties", function() {
            expect(david.davis).toEqual('isAwesome');
        });
    });
    
    describe("Ext.override", function(){
        var Dude,
            extApplySpy;
        
        beforeEach(function(){
            Dude = Ext.extend(Object, {}); // avoid to directly override Object class
            extApplySpy = spyOn(Ext, "apply");    
        });
        
        it("should apply override", function(){
            var override = {foo: true};
            
            Ext.override(Dude, override);
            
            expect(extApplySpy).toHaveBeenCalledWith(Dude.prototype, override);
        });
    });
    
    describe("Ext.isIterable", function() {
        it("should return true with empty array", function() {
            expect(Ext.isIterable([])).toBe(true);
        });
        
        it("should return true with filled array", function() {
            expect(Ext.isIterable([1, 2, 3, 4])).toBe(true);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isIterable(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isIterable(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isIterable("foo")).toBe(false);
        });

        it("should return false with empty string", function() {
            expect(Ext.isIterable("")).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isIterable(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isIterable(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isIterable(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isIterable(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isIterable({})).toBe(false);
        });
        
        it("should return true with node list", function() {
            expect(Ext.isIterable(document.getElementsByTagName('body'))).toBe(true);
        });
        
        it("should return true with html collection", function() {
            expect(Ext.isIterable(document.images)).toBe(true);
        });
    });
    
    describe("Ext.isArray", function() {
        it("should return true with empty array", function() {
            expect(Ext.isArray([])).toBe(true);
        });
        
        it("should return true with filled array", function() {
            expect(Ext.isArray([1, 2, 3, 4])).toBe(true);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isArray(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isArray(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isArray("foo")).toBe(false);
        });

        it("should return false with empty string", function() {
            expect(Ext.isArray("")).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isArray(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isArray(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isArray(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isArray(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isArray({})).toBe(false);
        });
        
        it("should return false with node list", function() {
            expect(Ext.isArray(document.getElementsByTagName('body'))).toBe(false);
        });
        
        it("should return false with custom class that has a length property", function() {
            var C = Ext.extend(Object, {
                length: 1
            });
            expect(Ext.isArray(new C())).toBe(false);
        });
        
        //it("should return false with element", function() {
        //    expect(Ext.isElement(Ext.getBody().dom)).toBe(false);
        //});
    });

    describe("Ext.isBoolean", function() {
        it("should return false with empty array", function() {
            expect(Ext.isBoolean([])).toBe(false);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isBoolean([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return true with boolean true", function() {
            expect(Ext.isBoolean(true)).toBe(true);
        });
        
        it("should return true with boolean false", function() {
            expect(Ext.isBoolean(false)).toBe(true);
        });
        
        it("should return false with string", function() {
            expect(Ext.isBoolean("foo")).toBe(false);
        });

        it("should return false with empty string", function() {
            expect(Ext.isBoolean("")).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isBoolean(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isBoolean(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isBoolean(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isBoolean(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isBoolean({})).toBe(false);
        });
        
        it("should return false with node list", function() {
            expect(Ext.isBoolean(document.getElementsByTagName('body'))).toBe(false);
        });
        
        //it("should return false with element", function() {
        //    expect(Ext.isElement(Ext.getBody().dom)).toBe(false);
        //});
    });
    
    describe("Ext.isDate", function() {
        it("should return false with empty array", function() {
            expect(Ext.isDate([])).toBe(false);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isDate([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isDate(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isDate(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isDate("foo")).toBe(false);
        });

        it("should return false with empty string", function() {
            expect(Ext.isDate("")).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isDate(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isDate(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isDate(undefined)).toBe(false);
        });
        
        it("should return true with date", function() {
            expect(Ext.isDate(new Date())).toBe(true);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isDate({})).toBe(false);
        });
        
        it("should return false with node list", function() {
            expect(Ext.isDate(document.getElementsByTagName('body'))).toBe(false);
        });
        
        //it("should return true with parseDate result", function() {
        //    expect(Ext.isElement(Date.parseDate('2000', 'Y'))).toBe(true);
        //});
        
        //it("should return false with element", function() {
        //    expect(Ext.isElement(Ext.getBody().dom)).toBe(false);
        //});
    });

    describe("Ext.isDefined", function() {
        it("should return true with empty array", function() {
            expect(Ext.isDefined([])).toBe(true);
        });
        
        it("should return true with filled array", function() {
            expect(Ext.isDefined([1, 2, 3, 4])).toBe(true);
        });
        
        it("should return true with boolean true", function() {
            expect(Ext.isDefined(true)).toBe(true);
        });
        
        it("should return true with boolean false", function() {
            expect(Ext.isDefined(false)).toBe(true);
        });
        
        it("should return true with string", function() {
            expect(Ext.isDefined("foo")).toBe(true);
        });
 
        it("should return true with empty string", function() {
            expect(Ext.isDefined("")).toBe(true);
        });
        
        it("should return true with number", function() {
            expect(Ext.isDefined(1)).toBe(true);
        });
        
        it("should return true with null", function() {
            expect(Ext.isDefined(null)).toBe(true);
        });

        it("should return false with undefined", function() {
            expect(Ext.isDefined(undefined)).toBe(false);
        });
        
        it("should return true with date", function() {
            expect(Ext.isDefined(new Date())).toBe(true);
        });
        
        it("should return true with empty object", function() {
            expect(Ext.isDefined({})).toBe(true);
        });
        
        it("should return true with node list", function() {
            expect(Ext.isDefined(document.getElementsByTagName('body'))).toBe(true);
        });
        
        //it("should return true with element", function() {
        //    expect(Ext.isElement(Ext.getBody().dom)).toBe(true);
        //});
    });
    
    describe("Ext.isElement", function() {
        it("should return false with empty array", function() {
            expect(Ext.isElement([])).toBe(false);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isElement([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isElement(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isElement(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isElement("foo")).toBe(false);
        });
        
        it("should return false with empty string", function() {
            expect(Ext.isElement("")).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isElement(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isElement(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isElement(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isElement(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isElement({})).toBe(false);
        });
        
        it("should return false with node list", function() {
            expect(Ext.isElement(document.getElementsByTagName('body'))).toBe(false);
        });
        
        //it("should return true with element", function() {
        //    expect(Ext.isElement(Ext.getBody().dom)).toBe(true);
        //});
        
        //it("should return false with Ext.Element", function() {
        //    expect(Ext.isElement(Ext.getBody().dom)).toBe(true);
        //});
    });
    
    describe("Ext.isEmpty", function() {
        it("should return true with empty array", function() {
            expect(Ext.isEmpty([])).toBe(true);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isEmpty([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isEmpty(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isEmpty(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isEmpty("foo")).toBe(false);
        });
 
        it("should return true with empty string", function() {
            expect(Ext.isEmpty("")).toBe(true);
        });
 
        it("should return true with empty string with allowBlank", function() {
            expect(Ext.isEmpty("", true)).toBe(false);
        });
               
        it("should return false with number", function() {
            expect(Ext.isEmpty(1)).toBe(false);
        });
        
        it("should return true with null", function() {
            expect(Ext.isEmpty(null)).toBe(true);
        });

        it("should return true with undefined", function() {
            expect(Ext.isEmpty(undefined)).toBe(true);
        });
        
        it("should return false with date", function() {
            expect(Ext.isEmpty(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isEmpty({})).toBe(false);
        });
    });
    
    describe("Ext.isFunction", function() {
        it("should return true with anonymous function", function() {
            expect(Ext.isFunction(function(){})).toBe(true);
        });
        
        it("should return true with new Function syntax", function() {
            expect(Ext.isFunction(new Function('return "";'))).toBe(true);
        });
        
        it("should return true with static function", function() {
            expect(Ext.isFunction(Ext.emptyFn)).toBe(true);
        });
        
        it("should return true with instance function", function() {
            var c = new Ext.util.Observable();
            
            expect(Ext.isFunction(c.fireEvent)).toBe(true);
        });

        it("should return true with function on object", function() {
            var o = {
                fn: function() {
                }
            };
            
            expect(Ext.isFunction(o.fn)).toBe(true);
        });

        it("should return false with empty array", function() {
            expect(Ext.isFunction([])).toBe(false);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isFunction([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isFunction(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isFunction(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isFunction("foo")).toBe(false);
        });

        it("should return false with empty string", function() {
            expect(Ext.isFunction("")).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isFunction(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isFunction(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isFunction(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isFunction(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isFunction({})).toBe(false);
        });
        
        it("should return false with node list", function() {
            expect(Ext.isFunction(document.getElementsByTagName('body'))).toBe(false);
        });              
    });
    
    describe("Ext.isNumber", function() {
        it("should return true with zero", function() {
            expect(Ext.isNumber(0)).toBe(true);
        });
        
        it("should return true with non zero", function() {
            expect(Ext.isNumber(4)).toBe(true);
        });

        it("should return true with negative integer", function() {
            expect(Ext.isNumber(-3)).toBe(true);
        });

        it("should return true with float", function() {
            expect(Ext.isNumber(1.75)).toBe(true);
        });
        
        it("should return true with negative float", function() {
            expect(Ext.isNumber(-4.75)).toBe(true);
        });
        
        it("should return true with Number.MAX_VALUE", function() {
            expect(Ext.isNumber(Number.MAX_VALUE)).toBe(true);
        });

        it("should return true with Number.MIN_VALUE", function() {
            expect(Ext.isNumber(Number.MIN_VALUE)).toBe(true);
        });

        it("should return true with Math.PI", function() {
            expect(Ext.isNumber(Math.PI)).toBe(true);
        });

        it("should return true with Number() contructor", function() {
            expect(Ext.isNumber(Number('3.1'))).toBe(true);
        });

        it("should return false with NaN", function() {
            expect(Ext.isNumber(Number.NaN)).toBe(false);
        });

        it("should return false with Number.POSITIVE_INFINITY", function() {
            expect(Ext.isNumber(Number.POSITIVE_INFINITY)).toBe(false);
        });
        
        it("should return false with Number.NEGATIVE_INFINITY", function() {
            expect(Ext.isNumber(Number.NEGATIVE_INFINITY)).toBe(false);
        });
        
        it("should return false with empty array", function() {
            expect(Ext.isNumber([])).toBe(false);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isNumber([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isNumber(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isNumber(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isNumber("foo")).toBe(false);
        });

        it("should return false with empty string", function() {
            expect(Ext.isNumber("")).toBe(false);
        });
        
        it("should return false with string containing a number", function() {
            expect(Ext.isNumber("1.0")).toBe(false);
        });
        
        it("should return false with undefined", function() {
            expect(Ext.isNumber(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isNumber(new Date())).toBe(false);
        });
        
        it("should return false with empty object", function() {
            expect(Ext.isNumber({})).toBe(false);
        });
        
        it("should return false with node list", function() {
            expect(Ext.isNumber(document.getElementsByTagName('body'))).toBe(false);
        });         
    });

    describe("Ext.isObject", function() {
        it("should return false with empty array", function() {
            expect(Ext.isObject([])).toBe(false);
        });
        
        it("should return false with filled array", function() {
            expect(Ext.isObject([1, 2, 3, 4])).toBe(false);
        });
        
        it("should return false with boolean true", function() {
            expect(Ext.isObject(true)).toBe(false);
        });
        
        it("should return false with boolean false", function() {
            expect(Ext.isObject(false)).toBe(false);
        });
        
        it("should return false with string", function() {
            expect(Ext.isObject("foo")).toBe(false);
        });
 
        it("should return false with empty string", function() {
            expect(Ext.isObject("")).toBe(false);
        });
               
        it("should return false with number", function() {
            expect(Ext.isObject(1)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isObject(null)).toBe(false);
        });

        it("should return false with undefined", function() {
            expect(Ext.isObject(undefined)).toBe(false);
        });
        
        it("should return false with date", function() {
            expect(Ext.isObject(new Date())).toBe(false);
        });
        
        it("should return true with empty object", function() {
            expect(Ext.isObject({})).toBe(true);
        });

        it("should return true with object with properties", function() {
            expect(Ext.isObject({
                foo: 1
            })).toBe(true);
        });
        
        it("should return true with object instance", function() {
            expect(Ext.isObject(new Ext.util.Observable())).toBe(true);
        });
        
        it("should return true with new Object syntax", function() {
            expect(Ext.isObject(new Object())).toBe(true);
        });

        it("should return false with dom element", function() {
            expect(Ext.isObject(Ext.getBody().dom)).toBe(false);
        });
    });
    
    describe("Ext.isPrimitive", function() {
        it("should return true with integer", function() {
            expect(Ext.isPrimitive(1)).toBe(true);
        });
  
        it("should return true with negative integer", function() {
            expect(Ext.isPrimitive(-21)).toBe(true);
        });
        
        it("should return true with float", function() {
            expect(Ext.isPrimitive(2.1)).toBe(true);
        });
        
        it("should return true with negative float", function() {
            expect(Ext.isPrimitive(-12.1)).toBe(true);
        });
        
        it("should return true with Number.MAX_VALUE", function() {
            expect(Ext.isPrimitive(Number.MAX_VALUE)).toBe(true);
        });

        it("should return true with Math.PI", function() {
            expect(Ext.isPrimitive(Math.PI)).toBe(true);
        });
        
        it("should return true with empty string", function() {
            expect(Ext.isPrimitive("")).toBe(true);
        });
        
        it("should return true with non empty string", function() {
            expect(Ext.isPrimitive("foo")).toBe(true);
        });
        
        it("should return true with boolean true", function() {
            expect(Ext.isPrimitive(true)).toBe(true);
        });
        
        it("should return true with boolean false", function() {
            expect(Ext.isPrimitive(false)).toBe(true);
        });
        
        it("should return false with null", function() {
            expect(Ext.isPrimitive(null)).toBe(false);
        });
        
        it("should return false with undefined", function() {
            expect(Ext.isPrimitive(undefined)).toBe(false);
        });
        
        it("should return false with object", function() {
            expect(Ext.isPrimitive({})).toBe(false);
        });

        it("should return false with object instance", function() {
            expect(Ext.isPrimitive(new Ext.util.Observable())).toBe(false);
        });
        
        it("should return false with array", function() {
            expect(Ext.isPrimitive([])).toBe(false);
        });
    });
    
    describe("Ext.isString", function() {
        it("should return true with empty string", function() {
            expect(Ext.isString("")).toBe(true);
        });
        
        it("should return true with non empty string", function() {
            expect(Ext.isString("foo")).toBe(true);
        });
        
        it("should return true with String() syntax", function() {
            expect(Ext.isString(String(""))).toBe(true);
        });
        
        it("should return false with new String() syntax", function() { //should return an object that wraps the primitive
            expect(Ext.isString(new String(""))).toBe(false);
        });
        
        it("should return false with number", function() {
            expect(Ext.isString(1)).toBe(false);
        });

        it("should return false with boolean", function() {
            expect(Ext.isString(true)).toBe(false);
        });
        
        it("should return false with null", function() {
            expect(Ext.isString(null)).toBe(false);
        });
        
        it("should return false with undefined", function() {
            expect(Ext.isString(undefined)).toBe(false);
        });
        
        it("should return false with array", function() {
            expect(Ext.isString([])).toBe(false);
        });
        
        it("should return false with object", function() {
            expect(Ext.isString({})).toBe(false);
        }); 
    });
    
    describe("Ext.iterate", function() {
        var itFn;
        
        beforeEach(function() {
            itFn = jasmine.createSpy();
        });
        
        describe("iterate object", function() {
            var o;
            
            beforeEach(function() {
                o = {
                    n1: 11,
                    n2: 13,
                    n3: 18
                };
            });
            
            describe("if itFn does not return false", function() {
                beforeEach(function() {
                    Ext.iterate(o, itFn);
                });  
                         
                it("should call the iterate function 3 times", function () {
                    expect(itFn.callCount).toEqual(3);
                });
                
                it("should call the iterate function with correct arguments", function () {
                    expect(itFn.calls[0].args).toEqual(["n1", 11, o]);
                    expect(itFn.calls[1].args).toEqual(["n2", 13, o]);
                    expect(itFn.calls[2].args).toEqual(["n3", 18, o]);
                });
            });
            
            describe("if itFn return false", function() {
                beforeEach(function() {
                    itFn.andReturn(false);
                    Ext.iterate(o, itFn);
                });
                
                it("should stop iteration if function return false", function() {
                    itFn.andReturn(false);
                    
                    expect(itFn.calls.length).toEqual(1);
                });            
            });
        });
        
        describe("do nothing on an empty object", function() {
            var o;
            
            beforeEach(function() {
                o = {};
                Ext.iterate(o, itFn);
            });
            
            it("should not call the iterate function", function () {
                expect(itFn).not.toHaveBeenCalled();
            });
        
        });
        
        describe("iterate array", function() {
            var arr;
            
            beforeEach(function() {
                arr = [6, 7, 8, 9];
            });
            
            describe("if itFn does not return false", function() {
                beforeEach(function() {
                    Ext.iterate(arr, itFn);
                });     
                         
                it("should call the iterate function 4 times", function () {
                    expect(itFn.callCount).toEqual(4);
                });
                
                it("should call the iterate function with correct arguments", function () {
                    expect(itFn.calls[0].args).toEqual([6, 0, arr]);
                    expect(itFn.calls[1].args).toEqual([7, 1, arr]);
                    expect(itFn.calls[2].args).toEqual([8, 2, arr]);
                    expect(itFn.calls[3].args).toEqual([9, 3, arr]);
                });
             });
             
            describe("if itFn return false", function() {
                beforeEach(function() {
                    itFn.andReturn(false);
                    Ext.iterate(arr, itFn);
                });
                
                it("should stop iteration if function return false", function() {
                    itFn.andReturn(false);
                    
                    expect(itFn.calls.length).toEqual(1);
                });            
            });
        });
        
        describe("do nothing on an empty array", function() {
            var arr;
            
            beforeEach(function() {
                arr = [];
                Ext.iterate(arr, itFn);
            });
            
            it("should not call the iterate function", function () {
                expect(itFn).not.toHaveBeenCalled();
            });
        
        });
    });
    
    describe("Ext.namespace", function() {
        var w = window;
        
        it("should have an alias named ns", function() {
            expect(Ext.ns).toEqual(Ext.namespace);
        });
        
        it("should create a single top level namespace", function() {
            Ext.namespace('FooTest1');
            
            expect(w.FooTest1).toBeDefined();
            
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                w.FooTest1 = undefined;
            } else {
                delete w.FooTest1;
            }
        });
        
        it("should create multiple top level namespace", function() {
            Ext.namespace('FooTest2', 'FooTest3', 'FooTest4');
            
            expect(w.FooTest2).toBeDefined();
            expect(w.FooTest3).toBeDefined();
            expect(w.FooTest4).toBeDefined();
            
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                w.FooTest2 = undefined;
                w.FooTest3 = undefined;
                w.FooTest4 = undefined;
            } else {
                delete w.FooTest2;
                delete w.FooTest3;
                delete w.FooTest4;
            }            
        });
        
        it("should create a chain of namespaces, starting from a top level", function() {
            Ext.namespace('FooTest5', 'FooTest5.ns1', 'FooTest5.ns1.ns2', 'FooTest5.ns1.ns2.ns3');
            
            expect(w.FooTest5).toBeDefined();
            expect(w.FooTest5.ns1).toBeDefined();
            expect(w.FooTest5.ns1.ns2).toBeDefined();
            expect(w.FooTest5.ns1.ns2.ns3).toBeDefined();
            
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                w.FooTest5 = undefined;
            } else {
                delete w.FooTest5;
            }
        });
        
        it("should create lower level namespaces without first defining the top level", function() {
            Ext.namespace('FooTest6.ns1', 'FooTest7.ns2');
            
            expect(w.FooTest6).toBeDefined();
            expect(w.FooTest6.ns1).toBeDefined();
            expect(w.FooTest7).toBeDefined();
            expect(w.FooTest7.ns2).toBeDefined();
            
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                w.FooTest6 = undefined;
                w.FooTest7 = undefined;
            } else {
                delete w.FooTest6;
                delete w.FooTest7;
            }    
        });
        
        it("should create a lower level namespace without defining the middle level", function() {
            Ext.namespace('FooTest8', 'FooTest8.ns1.ns2');
            
            expect(w.FooTest8).toBeDefined();
            expect(w.FooTest8.ns1).toBeDefined();
            expect(w.FooTest8.ns1.ns2).toBeDefined();
            
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                w.FooTest8 = undefined;
            } else {
                delete w.FooTest8;
            }
        });
        
        it ("should not overwritte existing namespave", function() {
            Ext.namespace('FooTest9');
            
            FooTest9.prop1 = 'foo';
            
            Ext.namespace('FooTest9');
            
            expect(FooTest9.prop1).toEqual("foo");
            
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                w.FooTest9 = undefined;
            } else {
                delete w.FooTest9;
            }
        });
    });
    
    describe("Ext.num", function() {
        it("should work with an integer", function() {
            expect(Ext.num(3)).toEqual(3);
        });
        
        it("should work with a negative integer", function() {
            expect(Ext.num(-7)).toEqual(-7);
        });
        
        it("should work with a float", function() {
            expect(Ext.num(5.43)).toEqual(5.43);
        });
        
        it("should work with a negative float", function() {
            expect(Ext.num(-9.8)).toEqual(-9.8);
        });
        
        it("should work with Math.PI", function() {
            expect(Ext.num(Math.PI)).toEqual(Math.PI);
        });
        
        it("should return undefined with null", function() {
            expect(Ext.num(null)).toBeUndefined();
        });
        
        it("should work with null, with defaults", function() {
            expect(Ext.num(null, 4)).toEqual(4);
        });
        
        it("should return undefined with undefined", function() {
            expect(Ext.num(undefined)).toBeUndefined();
        });

        it("should work with undefined, with defaults", function() {
            expect(Ext.num(undefined, 42)).toEqual(42);
        });
        
        it("should return undefined with boolean", function() {
            expect(Ext.num(true)).toBeUndefined();
        });

        it("should work with boolean, with defaults", function() {
            expect(Ext.num(true, 12)).toEqual(12);
        });
        
        it("should return undefined with empty string", function() {
            expect(Ext.num("")).toBeUndefined();
        });
        
        it("should work with string argument in the form of a number", function() {
            expect(Ext.num('666')).toEqual(666);
        });
        
        it("should return undefined with a string containing only spaces", function() {
            expect(Ext.num("     ")).toBeUndefined();
        });
        
        it("should return undefined with non empty string", function() {
            expect(Ext.num("foo")).toBeUndefined();
        });
        
        it("should return undefined with empty array", function() {
            expect(Ext.num([])).toBeUndefined();
        });
        
        it("should return undefined with non empty array", function() {
            expect(Ext.num([1, 2, 3])).toBeUndefined();
        });
        
        it("should return undefined with array with a single item", function() {
            expect(Ext.num([3])).toBeUndefined();
        });
    });
    
    describe("Ext.pluck", function() {
        it("should return results", function() {
            var results = Ext.pluck([{
                n: 11,
                c: 17
            }, {
                n: 13,
                p: true
            }, {
                n: 18,
                p: false
            }], 'n');
            
            expect(results).toEqual([11, 13, 18]);
        });
    });

    describe("Ext.toArray", function() {
        var span1,
            span2,
            span3,
            span4,
            div,
            htmlCollection;
            
        beforeEach(function() {
            div = Ext.getBody().createChild({tag: "div"});
            span1 = div.createChild({tag: "span"});
            span2 = div.createChild({tag: "span"});
            span3 = div.createChild({tag: "span"});
            span4 = div.createChild({tag: "span"});
            htmlCollection = div.dom.getElementsByTagName("span");
        });
        
        it("should convert iterable to an array", function() {
           expect(Ext.toArray(htmlCollection)).toEqual([span1.dom, span2.dom, span3.dom, span4.dom]);
        });
 
        it("should convert a part of an iterable to an array", function() {
           expect(Ext.toArray(htmlCollection, 1, 3)).toEqual([span2.dom, span3.dom]);
        });       
    });
    
    describe("Ext.urlAppend", function() {
        var url = "http://example.com/";
        
        it("should manage question mark", function() {
            expect(Ext.urlAppend(url, "test=1")).toEqual("http://example.com/?test=1");
        });
        
        it("should manage ampersand", function() {
            expect(Ext.urlAppend(url+"?test=1","foo=2")).toEqual("http://example.com/?test=1&foo=2");
        });
        
        it("should return directly url if content is empty", function() {
            expect(Ext.urlAppend(url)).toEqual(url);
        });
    });
    
    describe("Ext.urlDecode", function() {
        it ("should return an empty object if string is empty", function (){
            expect(Ext.urlDecode("")).toEqual({});
        });
        
        it("should decode 2 keys", function(){
            expect(Ext.urlDecode("foo=1&bar=2")).toEqual({
                foo: "1",
                bar: "2"
            });
        });
        
        it("should decode 2 keys, one of them an array (overwrite off)", function() {
            expect(Ext.urlDecode("foo=1&bar=2&bar=3&bar=4", false)).toEqual({
                foo: "1",
                bar: ['2', '3', '4']
            });
        });

        it("should decode 2 keys, one of them an array (overwrite on)", function() {
            expect(Ext.urlDecode("foo=1&bar=2&bar=3&bar=4", true)).toEqual({
                foo: "1",
                bar: "4"
            });
        });        
    });
    
    describe("Ext.urlEncode", function() {
        it("should encode 2 keys", function() {
            expect(Ext.urlEncode({
                foo: "1",
                bar: "2"
            })).toEqual("foo=1&bar=2");
        });
        
        it("should encode 2 keys, one of them an array", function() {
            expect(Ext.urlEncode({
                foo: "1",
                bar: ['2', '3', '4']
            })).toEqual("foo=1&bar=2&bar=3&bar=4");
        });

        it("should encode 2 keys, one of them an array, with pre: test=1", function() {
            expect(Ext.urlEncode({
                foo: "1",
                bar: ['2', '3', '4']
            }, "test=1")).toEqual("test=1&foo=1&bar=2&bar=3&bar=4");
        });        
    });
    
    describe("Ext.htmlEncode", function() {
        it("should call Ext.util.Format.htmlEncode", function() {
            var val = '';
            spyOn(Ext.util.Format, "htmlEncode");
            Ext.htmlEncode(val);
            expect(Ext.util.Format.htmlEncode).toHaveBeenCalledWith(val);
        });
    });
    
    describe("Ext.htmlEncode", function() {
        it("should call Ext.util.Format.htmlDecode", function() {
            var val = '';
            spyOn(Ext.util.Format, "htmlDecode");
            
            Ext.htmlDecode(val);
            expect(Ext.util.Format.htmlDecode).toHaveBeenCalledWith(val);
        });
    });
    
    describe("Ext.getBody", function() {
        it("should return current document body as an Ext.Element", function() { 
            expect(Ext.getBody(true)).toEqual(Ext.get(document.body)); // see initSandbox in DomSandBox.js for more info
        });
    });
    
    describe("Ext.getHead", function() {
        it("should return current document head as an Ext.Element", function() { 
            expect(Ext.getHead()).toEqual(Ext.get(document.getElementsByTagName("head")[0])); 
        });
    });
    
    describe("Ext.getDoc", function() {
        it("should return the current HTML document object as an Ext.element", function() {
            expect(Ext.getDoc()).toEqual(Ext.get(document));
        });
    });
    
    describe("Ext.getCmp", function() {
        it("should call Ext.ComponentMgr.get", function() {
            var fakeId = "foo",
                cmpMgrSpy = spyOn(Ext.ComponentMgr, "get");
            
            Ext.getCmp(fakeId);
            
            expect(cmpMgrSpy).toHaveBeenCalledWith(fakeId);
        });
    });
    
    describe("Ext.getOrientation", function() {
        it("should return the current orientation of the mobile device", function() {
            if (window.innerHeight > window.innerWidth) {
                expect(Ext.getOrientation()).toEqual("portrait");
            } else {
                expect(Ext.getOrientation()).toEqual("landscape");
            }
        });
    });
    
    describe("Ext.getDom", function() {
        var el1;
            
        beforeEach(function() {
            el1 = Ext.getBody().createChild({id: "elone"}); 
        });
        
        it("should return a dom element if an Ext.element is passed as first argument", function() {
            expect(Ext.getDom(el1)).toEqual(el1.dom);
        });
        
        it("should return a dom element if the string (id) passed as first argument", function() {
            expect(Ext.getDom("elone")).toEqual(el1.dom);
        });
    });
});
