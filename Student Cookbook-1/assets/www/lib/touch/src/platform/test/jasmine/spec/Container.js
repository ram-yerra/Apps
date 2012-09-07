describe("Ext.lib.Container", function(){
    var makeContainer, createItems, ct;
    beforeEach(function(){
        makeContainer = function(cfg){
            cfg = cfg || {};
            ct = new Ext.lib.Container(cfg);
        };
    });
    
    afterEach(function(){
        if (ct) {
            ct.destroy();
        }
        ct = makeContainer = createItems = null;
    });
    
    
    describe("reading items", function(){
        it("should have item count 0 if items is ommitted", function(){
            makeContainer();
            expect(ct.items.getCount()).toEqual(0);
        });
        
        it("should have an item count 0 if an empty array is specified", function(){
            makeContainer({
                items: []
            });
            expect(ct.items.getCount()).toEqual(0);
        });
        
        it("should handle adding a single item configuration", function(){
            makeContainer({
                items: {
                    itemId: 'first'
                }
            });
            expect(ct.items.getCount()).toEqual(1);
            expect(ct.items.first().itemId).toEqual('first');
        });
        
        it("should handle an array of items", function(){
            makeContainer({
                items: [{
                    itemId: 'item1'
                }, {
                    itemId: 'item2'
                }]
            });
            expect(ct.items.getCount()).toEqual(2);
            expect(ct.items.first().itemId).toEqual('item1');
            expect(ct.items.last().itemId).toEqual('item2');
        });
    });
    
    describe("defaultType", function(){
        it("should use panel if one isn't specified", function(){
            makeContainer({
                items: [{
                    itemId: 'item'
                }]
            });    
            expect(ct.items.first() instanceof Ext.Panel).toBeTruthy();
        });  
        
        it("should use a specified default type", function(){
            makeContainer({
                defaultType: 'container',
                items: [{
                    itemId: 'item'
                }]
            });
            expect(ct.items.first() instanceof Ext.Container);
        });
    });
    
    describe("getComponent", function(){
        var a, b, c, d;
        beforeEach(function(){
            a = new Ext.Component({itemId: 'a'});
            b = new Ext.Component({id: 'b'});
            c = new Ext.Component({itemId: 'c'});
            d = new Ext.Component({itemId: 'd'});
            makeContainer({
                items: [a, b, c, d]
            });
        });
        
        afterEach(function(){
            a = b = c = d = null;
        });
        
        it("should return undefined if id is not found", function(){
            expect(ct.getComponent('foo')).not.toBeDefined();
        });
        
        it("should return undefined if index is not found", function(){
            expect(ct.getComponent(100)).not.toBeDefined();
        });
        
        it("should return undefined if instance is not found", function(){
            expect(ct.getComponent(new Ext.Component())).not.toBeDefined();
        });  
        
        it("should find a passed instance", function(){
            expect(ct.getComponent(b)).toEqual(b);
        });
        
        it("should find a passed index", function(){
            expect(ct.getComponent(2)).toEqual(c);    
        });
        
        it("should find by id", function(){
            expect(ct.getComponent('d')).toEqual(d);    
        });
    });
    
    describe("add", function(){
        
        it("should return the added item", function(){
            makeContainer();
            var c = new Ext.Component();
            expect(ct.add(c)).toEqual(c);
        });
        
        it("should accept a single item", function(){
            makeContainer();
            var c = ct.add({
                itemId: 'foo'
            });
            expect(ct.items.getCount()).toEqual(1);
            expect(ct.items.first()).toEqual(c);
        });
        
        it("should be able to be called sequentiallly", function(){
            makeContainer();
            var a = ct.add({}),
                b = ct.add({}),
                c = ct.add({});
                
            expect(ct.items.getCount()).toEqual(3);
            expect(ct.items.first()).toEqual(a);
            expect(ct.items.getAt(1)).toEqual(b);
            expect(ct.items.last()).toEqual(c);   
        });
        
        it("should accept an array of items", function(){
            makeContainer();
            var a = ct.add({}),
                b = ct.add({}),
                c = ct.add({}),
                result;
                
            result = ct.add([a, b, c]);
            expect(result[0]).toEqual(a);
            expect(result[1]).toEqual(b);
            expect(result[2]).toEqual(c);
            expect(ct.items.first()).toEqual(a);
            expect(ct.items.getAt(1)).toEqual(b);
            expect(ct.items.last()).toEqual(c);
        });
        
        it("should accept n parameters, similar to array", function(){
            makeContainer();
            var a = ct.add({}),
                b = ct.add({}),
                c = ct.add({}),
                d = ct.add({}),
                result;
                
            result = ct.add(a, b, c, d);
            expect(result[0]).toEqual(a);
            expect(result[1]).toEqual(b);
            expect(result[2]).toEqual(c);
            expect(result[3]).toEqual(d);
            expect(ct.items.first()).toEqual(a);
            expect(ct.items.getAt(1)).toEqual(b);
            expect(ct.items.getAt(2)).toEqual(c);
            expect(ct.items.last()).toEqual(d);
        });
        
        it("should fire the beforeadd event",  function(){
            makeContainer(); 
            var o = {
                fn: Ext.emptyFn
            }, c = new Ext.Component();
            spyOn(o, 'fn');
            ct.on('beforeadd', o.fn);
            ct.add(c);
            //expect(o.fn).toHaveBeenCalledWith(ct, c, 0);
            expect(o.fn).wasCalled();
        });
        
        it("should cancel if beforeadd returns false", function(){
            makeContainer();
            ct.on('beforeadd', function(){
                return false;    
            });
            ct.add({});
            expect(ct.items.getCount()).toEqual(0);
        });
        
        it("should fire the add event", function(){
            makeContainer(); 
            var o = {
                fn: Ext.emptyFn
            }, c = new Ext.Component();
            spyOn(o, 'fn');
            ct.on('add', o.fn);
            ct.add(c);
            //expect(o.fn).toHaveBeenCalledWith(ct, c, 0);
            expect(o.fn).wasCalled();
        });
        
    });
    
    describe("insert", function(){
        
        it("should return the component instance", function(){
            makeContainer();
            var c = new Ext.Component();
            expect(ct.insert(0, c)).toEqual(c);    
        });
        
        it("should insert to the first spot when empty", function(){
            makeContainer();
            var c = ct.insert(0, {});
            expect(ct.items.first()).toEqual(c);    
        });
        
        it("should be able to be called sequentially", function(){
            makeContainer();
            var a = new Ext.Component(),
                b = new Ext.Component(),
                c = new Ext.Component();
                
            ct.insert(0, c);
            ct.insert(0, b);
            ct.insert(0, a);
            
            expect(ct.items.first()).toEqual(a);
            expect(ct.items.getAt(1)).toEqual(b);
            expect(ct.items.last()).toEqual(c);  
        });
        
        it("should insert to the lowest possible index if the specified index is too high", function(){
            makeContainer({
                items: [{}, {}, {}]
            });
            var c = ct.insert(100, {});
            expect(ct.items.last()).toEqual(c);    
        });
        
        it("should insert at at the end if we use -1", function(){
            makeContainer({
                items: [{}, {}, {}]
            });
            var c = ct.insert(-1, {});
            expect(ct.items.last()).toEqual(c);
        });
        
        it("should put the item into the correct position", function(){
            makeContainer({
                items: [{}, {}, {}]
            });
            var c = ct.insert(1, {});
            expect(ct.items.getAt(1)).toEqual(c);    
        });
        
        it("should accept an array", function(){
            makeContainer({
                items: [{}, {}, {}]
            });   
            var a = new Ext.Component(),
                b = new Ext.Component(),
                c = new Ext.Component();
                
            ct.insert(1, [a, b, c]);
            expect(ct.items.getAt(1)).toEqual(a);
            expect(ct.items.getAt(2)).toEqual(b);
            expect(ct.items.getAt(3)).toEqual(c); 
        });
    });
    
    describe("remove", function(){
        var a, b, c;
        beforeEach(function(){
            a = new Ext.Component({
                itemId: 'item1'
            });
            b = new Ext.Component();
            c = new Ext.Component();
            
            makeContainer = function(items){
                ct = new Ext.lib.Container({
                    items: items || [a, b, c]
                });
            };
        });
        
        afterEach(function(){
            a.destroy();
            b.destroy();
            c.destroy();
            makeContainer = a = b = c = null;
        });
        it("should not remove if the component isn't in the container", function(){
            makeContainer();
            var cmp = new Ext.Component();
            ct.remove(cmp);
            expect(ct.items.getCount()).toEqual(3);    
        });
        
        it("should do nothing if the container is empty", function(){
            makeContainer([]);
            ct.remove(a);
            expect(ct.items.getCount()).toEqual(0);    
        });
        
        it("should return the removed item", function(){
            makeContainer();    
            expect(ct.remove(b)).toEqual(b);
        });
        
        it("should be able to remove by instance", function(){
            makeContainer();    
            ct.remove(a);
            expect(ct.items.getCount()).toEqual(2);
        });
        
        it("should be able to remove by index", function(){
            makeContainer();    
            ct.remove(1);
            expect(ct.items.getCount()).toEqual(2);
        });
        
        it("should be able to remove by id", function(){
            makeContainer();    
            ct.remove('item1');
            expect(ct.items.getCount()).toEqual(2);
        });
        
        it("should be able to be called sequentially", function(){
            makeContainer();
            ct.remove(a);
            ct.remove(b);
            expect(ct.items.getCount()).toEqual(1);
            expect(ct.items.first()).toEqual(c);    
        });
        
        it("should leave items in the correct order", function(){
            makeContainer();    
            ct.remove(1);
            expect(ct.items.first()).toEqual(a);
            expect(ct.items.last()).toEqual(c);
        });
        
        it("should fire beforeremove", function(){
            makeContainer();
            var o = {
                fn: Ext.emptyFn
            };    
            spyOn(o, 'fn');
            ct.on('beforeremove', o.fn);
            ct.remove(a);
            //expect(o.fn).toHaveBeenCalledWith(ct, a);
            expect(o.fn).wasCalled();
        });
        
        it("should cancel the remove if beforeremove returns false", function(){
            makeContainer();
            ct.on('beforeremove', function(){
                return false;    
            });  
            ct.remove(a);
            expect(ct.items.getCount()).toEqual(3);
            expect(ct.items.first()).toEqual(a);
        });
        
        it("should fire the remove event", function(){
            makeContainer();
            var o = {
                fn: Ext.emptyFn
            };    
            spyOn(o, 'fn');
            ct.on('remove', o.fn);
            ct.remove(b);
            //expect(o.fn).toHaveBeenCalledWith(ct, b);
            expect(o.fn).wasCalled();
        });
        
        it("should use container autoDestroy as a default", function(){
            makeContainer();
            ct.remove(a);
            expect(a.isDestroyed).toBeTruthy();  
            ct.autoDestroy = false;
            ct.remove(b);
            expect(b.isDestroyed).toBeFalsy();  
        });
        
        it("should respect the autoDestroy paramater", function(){
            makeContainer();
            ct.autoDestroy = false;
            ct.remove(a, true);
            expect(a.isDestroyed).toBeTruthy();
            ct.autoDestroy = true;
            ct.remove(b, false);
            expect(b.isDestroyed).toBeFalsy();    
        });
    });
    
    describe("removeAll", function(){
        var a, b, c;
        beforeEach(function(){
            a = new Ext.Component({
                itemId: 'item1'
            });
            b = new Ext.Component();
            c = new Ext.Component();
            
            makeContainer = function(items){
                ct = new Ext.lib.Container({
                    items: items || [a, b, c]
                });
            };
        });
        
        afterEach(function(){
            a.destroy();
            b.destroy();
            c.destroy();
            makeContainer = a = b = c = null;
        });
        
        it("should do nothing if the container is empty", function(){
            makeContainer([]);
            ct.removeAll();
            expect(ct.items.getCount()).toEqual(0);    
        });      
        
        it("should remove all the items", function(){
            makeContainer();
            ct.removeAll();
            expect(ct.items.getCount()).toEqual(0);    
        });
        
        it("should return the removed items", function(){
            var result;
            makeContainer();
            
            result = ct.removeAll();
            
            expect(result[0]).toEqual(a);
            expect(result[1]).toEqual(b);
            expect(result[2]).toEqual(c);   
        });
        
        it("should destroy items if autoDestroy is true", function(){
            makeContainer();
            ct.removeAll(true);
            expect(a.isDestroyed).toBeTruthy();
            expect(b.isDestroyed).toBeTruthy();
            expect(c.isDestroyed).toBeTruthy();    
        });
        
        it("should not destroy items if autoDestroy is false", function(){
            makeContainer();
            ct.removeAll(false);
            expect(a.isDestroyed).toBeFalsy();
            expect(b.isDestroyed).toBeFalsy();
            expect(c.isDestroyed).toBeFalsy();
        });
    });
    
    describe("defaults", function(){
       it("should accept a defaults function", function(){
           makeContainer({
               defaults: function(){
                   return {
                       disabled: true
                   }
               },
               items: [{}, {}]
           });    
           expect(ct.items.first().disabled).toBeTruthy();
           expect(ct.items.last().disabled).toBeTruthy();
       });
       
       it("should apply defaults to component instances", function(){
           makeContainer({
               items: new Ext.Component({
                   disabled: false
               }),
               defaults: {
                   disabled: true
               }
           });
           expect(ct.items.first().disabled).toBeTruthy();
       });
       
       it("should only apply defaults to configs if they don't exist", function(){
           makeContainer({
               items: {
                   disabled: false
               },
               defaults: {
                   disabled: true,
                   hidden: true
               }
           });    
           expect(ct.items.first().disabled).toBeFalsy();
           expect(ct.items.first().hidden).toBeTruthy();
       });
    });
    
    // the intent here is not to test ComponentQuery, just that the API calls the appropriate methods
    describe("ComponentQuery", function(){
        beforeEach(function(){
            ct = new Ext.Container({
                items: [{
                    foo: 1,
                    id: 'top1',
                    items: [{
                        foo: 3,
                        id: 'child1'
                    },{
                        bar: 2,
                        itemId: 'child2',
                        items: [{
                            foo: 5
                        }]
                    }]
                },{
                    foo: 2,
                    itemId: 'top2',
                    items: [{
                        foo: 7,
                        itemId: 'child3'
                    },{
                        bar: 4
                    }]
                },{
                    bar: 3
                },{
                    foo: 8
                }]
            });
        });
        
        describe("query", function(){
            it("should return an empty array for no matches", function(){
                var arr = ct.query('list');
                expect(arr).toEqual([]);
            });    
            
            it("should return a filled array with matches", function(){
                var arr = ct.query('#child1');
                expect(arr).toEqual([Ext.getCmp('child1')]);
            });
            it("should return a filled array with matches", function(){
                var arr = ct.query('[foo=1] #child1');
                expect(arr).toEqual([Ext.getCmp('child1')]);
            });
        });
        
        describe("child", function(){
            it("should return null if no match is found", function(){
                expect(ct.child('#foo')).toBeNull();    
            });
            
            it("should only return direct children", function(){
               expect(ct.child('#child3')).toBeNull(); 
            });
            
            it("should return matching direct children", function(){
                var c = ct.items.last();
                expect(ct.child('component[foo="8"]')).toEqual(c);    
            });
        });
        
        describe("down", function(){
            it("should return null if no match is found", function(){
                expect(ct.down('#foo')).toBeNull();    
            });
            
            it("should return children at any level", function(){
                var c = ct.items.getAt(1).items.first();
                expect(ct.down('#child3')).toEqual(c); 
            }); 
            
            it("should return the first match", function(){
                var c = ct.items.first();
                expect(ct.down('component[foo]')).toEqual(c);    
            });
        });
    });
    
    it("should destroy any child items on destroy", function(){
        var a = new Ext.Component(),
            b = new Ext.Component();
        makeContainer({
            items: [a, b]
        });    
        ct.destroy();
        expect(a.isDestroyed).toBeTruthy();
        expect(b.isDestroyed).toBeTruthy();
    });
});
