describe("Ext.util.HashMap", function(){

    var hash;
    
    beforeEach(function(){
        hash = new Ext.util.HashMap();
    });
    
    afterEach(function(){
        hash.clearListeners();
        hash = null;
    });
    
    describe("after construction", function(){
        it("should be empty", function(){
            expect(hash.getCount()).toEqual(0);
        });
        
        it("should not have any keys", function(){
            expect(hash.getKeys()).toEqual([]);
        });
        
        it("should not have any values", function(){
            expect(hash.getValues()).toEqual([]);
        });
    });
    
    describe("adding", function(){
        it("should add simple values", function(){
            hash.add('key', 'a');
            expect(hash.get('key')).toEqual('a');
        });
        
        it("should preserve the type", function(){
            hash.add('key', 3);
            expect((typeof hash.get('key')).toLowerCase()).toEqual('number');
        });
        
        it("should be able to add complex types", function(){
            var obj = {
                foo: 'bar'
            }, arr = [obj];
            
            hash.add('key1', obj);
            hash.add('key2', arr);
            
            expect(hash.get('key1')).toEqual(obj);
            expect(hash.get('key2')).toEqual([obj]);
        });
        
        it("should be able to be called multiple times", function(){
            hash.add('key1', 'a');
            hash.add('key2', 'b');
            expect(hash.get('key1')).toEqual('a');
            expect(hash.get('key2')).toEqual('b');
        });
        
        it("should throw an exception if the same key is added", function(){
            hash.add('key', 1);
            expect(function(){
                hash.add('key', 2);
            }).toThrow('This key already exists in the HashMap');
        });
        
        it("should support taking a single param", function(){
            var o = {
                id: 'key',
                foo: 'bar'
            };
            hash.add(o);
            expect(hash.get('key')).toEqual(o);
        });
        
        it("should fire the add event", function(){
            var o = {
                fn: Ext.emptyFn
            };
            spyOn(o, 'fn');
            hash.on('add', o.fn);
            hash.add('key', 'val');
            //expect(o.fn).toHaveBeenCalledWith(hash, 'key', 'val');
            expect(o.fn).toHaveBeenCalled();
        });
    });
    
    describe("replace", function(){
        it("should add the value if it doesn't exist", function(){
            hash.replace('key', 'val');
            expect(hash.get('key')).toEqual('val');
        });
        
        it("should replace any old value", function(){
            hash.add('key', 'val1');
            hash.replace('key', 'val2');
            expect(hash.get('key')).toEqual('val2');
        });
        
        it("should fire the replace event", function(){
            hash.add('key', 'val1');
            var o = {
                fn: Ext.emptyFn
            };
            spyOn(o, 'fn');
            hash.on('replace', o.fn);
            hash.replace('key', 'val2');
            //expect(o.fn).toHaveBeenCalledWith(hash, 'key', 'val2', 'val1');
            expect(o.fn).toHaveBeenCalled();
        });
    });
    
    describe("counting", function(){
        it("should return 0 when empty", function(){
            expect(hash.getCount()).toEqual(0);
        });
        
        it("should return the correct count", function(){
            hash.add('key1', 1);
            hash.add('key2', 2);
            hash.add('key3', 3);
            hash.add('key4', 4);
            hash.add('key5', 5);
            expect(hash.getCount()).toEqual(5);
        });
    });
    
    describe("removing", function(){
        describe("by key", function(){
            it("should return false if the key doesn't exist", function(){
                expect(hash.removeByKey('key')).toBeFalsy();
            });
            
            it("should remove the item if found", function(){
                hash.add('key', 'val');
                hash.removeByKey('key');
                expect(hash.get('key')).toBeUndefined();
            });
            
            it("should return true on a  successful remove", function(){
                hash.add('key', 'val');
                expect(hash.removeByKey('key')).toBeTruthy();
            });
            
            it("should fire the remove event", function(){
                hash.add('key', 'val');
                var o = {
                    fn: Ext.emptyFn
                };
                spyOn(o, 'fn');
                hash.on('remove', o.fn);
                hash.removeByKey('key');
                //expect(o.fn).toHaveBeenCalledWith(hash, 'key', 'val');
                expect(o.fn).toHaveBeenCalled();
            });
            
            it("should modify the count", function(){
                hash.add('key', 'val');
                hash.removeByKey('key');
                expect(hash.getCount()).toEqual(0);
            });
            
            describe("by value", function(){
                it("should return false if the key doesn't exist", function(){
                    expect(hash.remove(1)).toBeFalsy();
                });
                
                it("should remove the item if found", function(){
                    hash.add('key', 'val');
                    hash.remove('val');
                    expect(hash.get('key')).toBeUndefined();
                });
                
                it("should only remove the first matched value", function(){
                    hash.add('key1', 'val');
                    hash.add('key2', 'val');    
                    
                    hash.remove('val');
                    
                    expect(hash.get('key1')).toBeUndefined();
                    expect(hash.get('key2')).toEqual('val');
                });
                
                it("should return true on a  successful remove", function(){
                    hash.add('key', 'val');
                    expect(hash.remove('val')).toBeTruthy();
                });
                
                it("should fire the remove event", function(){
                    hash.add('key', 'val');
                    var o = {
                        fn: Ext.emptyFn
                    };
                    spyOn(o, 'fn');
                    hash.on('remove', o.fn);
                    hash.remove('val');
                    //expect(o.fn).toHaveBeenCalledWith(hash, 'key', 'val');
                    expect(o.fn).toHaveBeenCalled();
                });
            });
        });
    });
    
    describe("each", function(){
        var o, scope, spy;
        beforeEach(function(){
            o = {
                fn: function(key){
                    scope = this;
                    if (key == 'drop') {
                        return false;
                    }
                }
            };
            spy = spyOn(o, 'fn').andCallThrough();
        });
        
        afterEach(function(){
            o = spy = scope = null;    
        });
        
        it("should not iterate if the hash is empty", function(){
            hash.each(o.fn);
            expect(o.fn).not.toHaveBeenCalled(); 
        }); 
        
        it("should iterate over every item", function(){
            hash.add('key1', 'val1');
            hash.add('key2', 'val2');
            hash.add('key3', 'val3');
            hash.each(o.fn);
            expect(spy.callCount).toEqual(3);
        });
        
        it("should pass in arguments", function(){
            hash.add('key1', 'val1');
            hash.each(o.fn);
            
            expect(spy.argsForCall[0]).toEqual(['key1', 'val1', 1]);           
        });
        
        it("should default to the hash as scope", function(){
            hash.add('key', 'val');
            hash.each(o.fn);
            expect(scope).toEqual(hash);
        });
        
        it("should use scope if one is passed", function(){
            hash.add('key', 'val');
            hash.each(o.fn, o);
            expect(scope).toEqual(o);
        });
        
        it("should stop iterating if false is returned", function(){
            hash.add('key1', 'a');
            hash.add('key2', 'b');
            hash.add('drop', true);
            hash.add('key3', 'c');
            hash.add('key4', 'd');
            hash.each(o.fn);
            expect(spy.callCount).toEqual(3);
        });
    });
    
    describe("checking contains", function(){
        describe("containsKey", function(){
            it("should return false if the hash is empty", function(){
                expect(hash.containsKey('key')).toBeFalsy();    
            });
            
            it("should return false if the key doesn't exist", function(){
                hash.add('key1', 'a');
                expect(hash.containsKey('key')).toBeFalsy();    
            });  
            
            it("should return true if the key is matched", function(){
                hash.add('key', 'val');
                expect(hash.containsKey('key')).toBeTruthy();    
            });
        });
        
        describe("contains", function(){
            it("should return false if the hash is empty", function(){
                expect(hash.contains('val')).toBeFalsy();    
            });
            
            it("should return false if the value doesn't exist", function(){
                hash.add('key', 'v');
                expect(hash.contains('val')).toBeFalsy();    
            });  
            
            it("should return true if the value exists", function(){
                hash.add('key', 'val');
                expect(hash.contains('val')).toBeTruthy();    
            });
        });
    });
    
    describe("get", function(){
        it("should return undefined if the item doesn't exist", function(){
            expect(hash.get('key')).toBeUndefined();    
        });  
        
        it("should return the value if found", function(){
            hash.add('key', 'val');
            expect(hash.get('key')).toEqual('val');    
        });
        
        it("should preserve the type", function(){
            var a = {}, b = {}, c = {};
            hash.add('key', [a, b, c]);
            expect(hash.get('key')).toEqual([a, b, c]);    
        });
    });
    
    describe("clear", function(){
        it("should do nothing if the hash is empty", function(){
            hash.clear();
            expect(hash.getCount()).toEqual(0);    
        }); 
        
        it("should remove all items from the hash", function(){
            hash.add('key1', 'a');    
            hash.add('key2', 'b');
            hash.add('key3', 'c');
            hash.add('key4', 'd');
            hash.add('key5', 'e');
            hash.clear();
            expect(hash.getCount()).toEqual(0);
        });
        
        it("should fire the clear event", function(){
            var o = {
                fn: Ext.emptyFn    
            };
            spyOn(o, 'fn');
            hash.on('clear', o.fn);
            hash.clear();    
            //expect(o.fn).toHaveBeenCalledWith(hash);
            expect(o.fn).toHaveBeenCalled();
        });
    });
    
    describe("getKeys/getValues", function(){
        it("should return an empty array if there are no keys", function(){
            expect(hash.getKeys()).toEqual([]);    
        });
        
        it("should return all of the keys", function(){
            hash.add('a', 'a');
            hash.add('b', 'b');
            hash.add('c', 'c');
            
            var keys = hash.getKeys();
            expect(keys).toContain('a');
            expect(keys).toContain('b');
            expect(keys).toContain('c');    
        });
        
        it("should return an empty array if there are no values", function(){
            expect(hash.getValues()).toEqual([]);    
        });
        
        it("should return all of the values", function(){
            var o = {};
            hash.add('a', 1);
            hash.add('b', o);
            
            var values = hash.getValues();
            expect(values).toContain(1);
            expect(values).toContain(o);    
        });
    });
    
    describe("clone", function(){
        it("should be empty when cloning an empty hash", function(){
            var newHash = hash.clone();
            expect(newHash.getCount()).toEqual(0);    
        });
        
        it("should clone all items", function(){
            hash.add('a', 1);
            hash.add('b', 2);
            
            var newHash = hash.clone();
            expect(hash.get('a')).toEqual(1);
            expect(hash.get('b')).toEqual(2);    
        });
        
        it("should only do a shallow clone", function(){
            var o = {foo: 'bar'}, newHash;
            
            hash.add('key', o);
            newHash = hash.clone();
            expect(newHash.get('key')).toEqual(o);
                
        });
        
    });
});