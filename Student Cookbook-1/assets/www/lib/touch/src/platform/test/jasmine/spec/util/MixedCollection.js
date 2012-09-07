describe("Ext.util.MixedCollection", function() {
    var mc;
    
    it("should get the correct count", function() {
        mc = new Ext.util.MixedCollection();
        
        mc.addAll([{id: 1}, {id: 2}]);
        
        expect(mc.getCount()).toEqual(2);
    });
    
    describe("constructor", function() {
        it("should provide a default getKey implementation", function() {
            mc = new Ext.util.MixedCollection();
            
            var item1 = {id: 1, data: 'first item'},
                item2 = {id: 2, data: 'second item'};
            
            mc.add(item1);
            mc.add(item2);
            
            expect(mc.get(1)).toEqual(item1);
            expect(mc.get(2)).toEqual(item2);
        });
        
        it("should allow a custom getKey implementation", function() {
            mc = new Ext.util.MixedCollection(false, function(item) {
                return item.myKey;
            });
            
            var item1 = {myKey: 'a', data: 'first item'},
                item2 = {myKey: 'b', data: 'second item'};
            
            mc.add(item1);
            mc.add(item2);
            
            expect(mc.get('a')).toEqual(item1);
            expect(mc.get('b')).toEqual(item2);
        });
    });
    
    describe("iterators", function() {
        var fn, callScope, callCount, item1, item2, item3;
        
        beforeEach(function() {
            mc = new Ext.util.MixedCollection();
            
            fn = jasmine.createSpy('fn');
            callCount = 0;
            
            item1 = {id: 1, name: 'first'};
            item2 = {id: 2, name: 'second'};
            item3 = {id: 3, name: 'third'};
            
            mc.addAll([item1, item2, item3]);
        });
        
        describe("each", function() {
            it("should call with the correct scope", function() {
                mc.each(function() {
                    callScope = this;
                }, fakeScope);
                
                expect(callScope).toBe(fakeScope);
            });
            
            it("should call the correct number of times", function() {
                mc.each(function() {
                    callCount++;
                });
                
                expect(callCount).toEqual(3);
            });
            
            it("should be called with each item", function() {
                mc.each(fn);
                
                expect(fn).toHaveBeenCalledWith(item1, 0, 3);
                expect(fn).toHaveBeenCalledWith(item2, 1, 3);
                expect(fn).toHaveBeenCalledWith(item3, 2, 3);
            });
        });
        
        describe("eachKey", function() {
            it("should be called with the correct scope", function() {
                mc.eachKey(function() {
                    callScope = this;
                }, fakeScope);
                
                expect(callScope).toBe(fakeScope);
            });
            
            it("should call the correct number of times", function() {
                mc.eachKey(function() {
                    callCount++;
                });
                
                expect(callCount).toEqual(3);
            });
            
            it("should be called with each key", function() {
                mc.eachKey(fn);
                
                expect(fn).toHaveBeenCalledWith(1, item1, 0, 3);
                expect(fn).toHaveBeenCalledWith(2, item2, 1, 3);
                expect(fn).toHaveBeenCalledWith(3, item3, 2, 3);
            });
        });
    });
    
    describe("adding items", function() {
        beforeEach(function() {
            mc = new Ext.util.MixedCollection();
        });
        
        it("should add an array of items", function() {
            expect(mc.length).toEqual(0);
            
            mc.addAll([{id: 1}, {id: 2}]);
            
            expect(mc.length).toEqual(2);
        });
        
        it("should fire the add event", function() {
            var executed = false;
            
            mc.on('add', function() {
                executed = true;
            });
            
            mc.add({id: 1});
            
            expect(executed).toBe(true);
        });
    });
    
    describe("removing items", function() {
        var item1 = {id: 1},
            item2 = {id: 2};
        
        beforeEach(function() {
            mc = new Ext.util.MixedCollection();
            
            mc.addAll([item1, item2]);
        });
        
        it("should remove a single item", function() {
            mc.remove(item1);
            
            expect(mc.getCount()).toEqual(1);
        });
        
        it("should fire the remove event", function() {
            var executed = false;
            
            mc.on('remove', function() {
                executed = true;
            }, this);
            
            mc.remove(item1);
            
            expect(executed).toBe(true);
        });
    });
    
    describe("clearing items", function() {
        beforeEach(function() {
            mc = new Ext.util.MixedCollection();
            
            mc.addAll([{id: 1}, {id: 2}]);
        });
        
        it("should remove all items", function() {
            expect(mc.length).toEqual(2);
            
            mc.clear();
            
            expect(mc.length).toEqual(0);
        });
        
        it("should fire the clear event", function() {
            var executed = false;
            
            mc.on('clear', function() {
                executed = true;
            });
            
            mc.clear();
            
            expect(executed).toBe(true);
        });
    });
    
    describe("an existing MixedCollection", function() {
        var item1 = {id: 1, name: 'first'},
            item2 = {id: 2, name: 'second'},
            item3 = {id: 3, name: 'third'},
            item4 = {id: 4, name: 'fourth'};
        
        beforeEach(function() {
            mc = new Ext.util.MixedCollection();
            
            mc.addAll([item1, item2, item3]);
        });
        
        describe("inserting items", function() {
            it("should insert a new item", function() {
                var count = mc.getCount();

                mc.insert(0, item4);

                expect(mc.getCount()).toEqual(count + 1);
            });

            it("should fire the add event", function() {
                var executed = false;

                mc.on('add', function() {
                    executed = true;
                });

                mc.insert(item4);

                expect(executed).toBe(true);
            });

            it("should insert the item at the correct location", function() {
                expect(mc.items[0]).toEqual(item1);

                mc.insert(0, item4);

                expect(mc.items[0]).toEqual(item4);
            });
        });

        describe("replacing items", function() {
            it("should replace the correct item", function() {
                mc.replace(2, item4);
                
                expect(mc.getAt(1).name).toEqual('fourth');
            });
            
            it("should not change the count", function() {
                var count = mc.getCount();
                
                mc.replace(2, item4);
                
                expect(mc.getCount()).toEqual(count);
            });
            
            it("should fire the replace event", function() {
                var executed = false;
                
                mc.on('replace', function() {
                    executed = true;
                }, this);
                
                mc.replace(2, item4);
                
                expect(executed).toBe(true);
            });
        });
        
        describe("cloning", function() {
            it("should copy all items into the new MixedCollection", function() {
                var mc2 = mc.clone();
                
                expect(mc2.getCount()).toEqual(3);
                expect(mc2.items[0]).toEqual(item1);
                expect(mc2.items[1]).toEqual(item2);
                expect(mc2.items[2]).toEqual(item3);
            });
        });
        
        describe("getting items", function() {
            it("should get the first item", function() {
                expect(mc.first()).toEqual(item1);
            });
            
            it("should get the last item", function() {
                expect(mc.last()).toEqual(item3);
            });
            
            it("should get by index", function() {
                expect(mc.get(2)).toEqual(item2);
            });
            
            it("should get an item's key", function() {
                expect(mc.getKey(item1)).toEqual(1);
            });
            
            it("should return the correct indexOf an item", function() {
                expect(mc.indexOf(item1)).toEqual(0);
            });
            
            it("should return the correct indexOfKey", function() {
                expect(mc.indexOfKey(2)).toEqual(1);
            });
            
            it("should return the correct key", function() {
                expect(mc.getByKey(3)).toEqual(item3);
            });
            
            it("should get an item by index", function() {
                expect(mc.getAt(2)).toEqual(item3);
            });
            
            it("should get an item by key", function() {
                var item5 = {id: 'a', name: 'fifth item'};
                
                mc.add(item5);
                
                expect(mc.get('a')).toEqual(item5);
            });
            
            it("should return the correct getAt", function() {
                expect(mc.getAt(2)).toEqual(item3);
            });
            
            describe("when getting a range", function() {
                it("should honor the start and limit params", function() {
                    var items = mc.getRange(1, 2);
                    
                    expect(items.length).toEqual(2);
                    expect(items[0]).toEqual(item2);
                    expect(items[1]).toEqual(item3);
                });
                
                it("should return all items if no params are given", function() {
                    var items = mc.getRange();
                    
                    expect(items.length).toEqual(3);
                    expect(items[0]).toEqual(item1);
                    expect(items[1]).toEqual(item2);
                    expect(items[2]).toEqual(item3);
                });
                
                it("should return all items to the end if only the start param is given", function() {
                    var items = mc.getRange(1);
                    
                    expect(items.length).toEqual(2);
                    expect(items[0]).toEqual(item2);
                    expect(items[1]).toEqual(item3);
                });
            });
        });
        
        describe("finding items", function() {
            it("should find an item using a passed function", function() {
                var matched = mc.findBy(function(item) {
                    return item.name == 'third';
                });
                
                expect(matched).toEqual(item3);
            });
            
            it("should find an item's index", function() {
                var matched = mc.findIndex('name', 'third');
                
                expect(matched).toEqual(2);
            });
            
            it("should find an item's index by a function", function() {
                var matched = mc.findIndexBy(function(item) {
                    return item.name == 'second';
                });
                
                expect(matched).toEqual(1);
            });
        });
        
        describe("contains", function() {
            it("should contain items that have been added", function() {
                expect(mc.contains(item1)).toBe(true);
            });
            
            it("should not contain items that have not been added", function() {
                expect(mc.contains({some: 'object'})).toBe(false);
            });
            
            it("should contain an item by key", function() {
                expect(mc.containsKey(1)).toBe(true);
            });
            
            it("should not contain a non-contained item by key", function() {
                expect(mc.containsKey(100)).toBe(false);
            });
        });
    });
    
    describe("filtering", function() {
        var filter, filtered;
        
        beforeEach(function() {
            mc = new Ext.util.MixedCollection(false, function(item) {
                return item.name;
            });
            
            mc.addAll([
                {id: 1, name: 'Ed',     code: 'C', modifier: 10},
                {id: 2, name: 'Abe',    code: 'A', modifier: 100},
                {id: 3, name: 'Edward', code: 'B', modifier: 5}
            ]);
            
            filter = new Ext.util.Filter({
                filterFn: function(item) {
                    return item.name.charAt(0) == 'E';
                }
            });
        });
        
        it("should return a new MixedCollection", function() {
            filtered = mc.filter('name', 'Ed');
            
            expect(filtered instanceof Ext.util.MixedCollection).toBe(true);
            expect(filtered).not.toEqual(mc);
        });
        
        describe("when filtering on a key and value pair", function() {
            it("should filter correctly", function() {
                filtered = mc.filter('name', 'Edward');
            
                expect(filtered.items[0].name).toEqual('Edward');
                expect(filtered.length).toEqual(1);                
            });
            
            it("should use anyMatch by default", function() {
                filtered = mc.filter('name', 'Ed');

                expect(filtered.length).toEqual(2);
            });
        });
        
        describe("when filtering using Filter object", function() {
            it("should accept a single Filter", function() {
                filtered = mc.filter(filter);
                
                expect(filtered.length).toEqual(2);
            });
            
            it("should accept an array of Filters", function() {
                filtered = mc.filter([filter]);
                
                expect(filtered.length).toEqual(2);
            });
        });
    });
    
    describe("sorting", function() {
        beforeEach(function() {
            mc = new Ext.util.MixedCollection(false, function(item) {
                return item.name;
            });
            
            mc.addAll([
                {id: 1, name: 'Ed',     code: 'C', modifier: 10},
                {id: 2, name: 'Abe',    code: 'A', modifier: 100},
                {id: 3, name: 'Edward', code: 'B', modifier: 5}
            ]);
        });
        
        it("should sort ASC by default", function() {
            mc.sort('code');
            
            expect(mc.items[0].code).toEqual('A');
            expect(mc.items[1].code).toEqual('B');
            expect(mc.items[2].code).toEqual('C');
        });
        
        it("should accept a DESC sort", function() {
            mc.sort('code', "DESC");
            
            expect(mc.items[2].code).toEqual('A');
            expect(mc.items[1].code).toEqual('B');
            expect(mc.items[0].code).toEqual('C');
        });
        
        it("should sort with an Ext.util.Sorter", function() {
            mc.sort(new Ext.util.Sorter({
                sorterFn: function(a, b) {
                    return (a.id * a.modifier) - (b.id * b.modifier);
                }
            }));
            
            expect(mc.items[0].code).toEqual('C');
            expect(mc.items[1].code).toEqual('B');
            expect(mc.items[2].code).toEqual('A');
        });
        
        it("should perform a directional sort with an Ext.util.Sorter", function() {
            mc.sort(new Ext.util.Sorter({
                direction: 'DESC',
                sorterFn: function(a, b) {
                    return (a.id * a.modifier) - (b.id * b.modifier);
                }
            }));
            
            expect(mc.items[2].code).toEqual('C');
            expect(mc.items[1].code).toEqual('B');
            expect(mc.items[0].code).toEqual('A');
        });
        
        it("should fire a sort event", function() {
            var executed = false;
            
            mc.on('sort', function() {
                executed = true;
            }, this);
            
            mc.sort('name');
            
            expect(executed).toBe(true);
        });
    });
    
    describe("reordering", function() {
        beforeEach(function() {
            mc = new Ext.util.MixedCollection(false, function(item) {
                return item.name;
            });
            
            mc.addAll([
                {id: 1, name: 'Ed',     code: 'C', modifier: 10},
                {id: 2, name: 'Abe',    code: 'A', modifier: 100},
                {id: 3, name: 'Edward', code: 'B', modifier: 5}
            ]);
        });
        
        it("should reorder correctly", function() {
            mc.reorder({
                1: 2,
                2: 0
            });
            
            expect(mc.items[0].code).toEqual('B');
            expect(mc.items[1].code).toEqual('C');
            expect(mc.items[2].code).toEqual('A');
        });
        
        it("should fire a sort event", function() {
            var executed = false;
            
            mc.on('sort', function() {
                executed = true;
            }, this);
            
            mc.reorder({
                1: 2,
                2: 0
            });
            
            expect(executed).toBe(true);
        });
    });
});
