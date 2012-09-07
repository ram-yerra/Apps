/**
 * Tests Ext.data.TreeStore functionality.
 * Examples based on http://threebit.net/tutorials/nestedset/tutorial1.html
 * @author Ed Spencer
 */
(function() {
    var suite  = Ext.test.session.getSuite('Ext.data.TreeStore'),
        assert = Y.Assert;
    
    var defaultSetup = function() {
        Ext.regModel('User', {
            fields: [
                {name: 'id',       type: 'int'},
                {name: 'first',    type: 'string'},
                {name: 'last',     type: 'string'},
                {name: 'parentId', type: 'int'},
                {name: 'lft',      type: 'int'},
                {name: 'rgt',      type: 'int'}
            ]
        });
        
        //see http://threebit.net/tutorials/nestedset/tutorial1.html for explanation of this data
        this.store = new Ext.data.TreeStore({
            model: 'User',
            data : [
                {id: 1, first: 'Ed',    last: 'Spencer',  lft: 1,  rgt: 16},
                {id: 2, first: 'Abe',   last: 'Elias',    lft: 2,  rgt: 11, parentId: 1},
                {id: 3, first: 'Tommy', last: 'Maintz',   lft: 12, rgt: 15, parentId: 1},
                {id: 4, first: 'Aaron', last: 'Conran',   lft: 3,  rgt: 4,  parentId: 2},
                {id: 5, first: 'Dave',  last: 'Kaneda',   lft: 5,  rgt: 6,  parentId: 2},
                {id: 6, first: 'Jamie', last: 'Avins',    lft: 13, rgt: 14, parentId: 3},
                {id: 7, first: 'Jay',   last: 'Robinson', lft: 7,  rgt: 10, parentId: 5},
                {id: 8, first: 'Arne',  last: 'Bech',     lft: 8,  rgt: 9,  parentId: 7}
            ]
        });
        
        var store = this.store;
        
        this.findPerson = function(name) {
            return store.getAt(store.find('first', name));
        };
    };
    
    suite.add(new Y.Test.Case({
        name: 'getChildren',
        setUp: defaultSetup,
        
        testGetRootChildren: function() {
            var store    = this.store,
                ed       = store.getAt(store.find('first', 'Ed')),
                children = store.getChildren(ed);
            
            assert.areEqual(2, children.length);
            assert.areEqual('Abe', children[0].get('first'));
            assert.areEqual('Tommy', children[1].get('first'));
        },
        
        testGetMidTierChildren: function() {
            var store    = this.store,
                jay      = store.getAt(store.find('first', 'Jay')),
                children = store.getChildren(jay);
            
            assert.areEqual(1, children.length);
            assert.areEqual('Arne', children[0].get('first'));
        },
        
        testGetLeafChildren: function() {
            var store    = this.store,
                aaron    = store.getAt(store.find('first', 'Aaron')),
                children = store.getChildren(aaron);
            
            assert.areEqual(0, children.length);
        },
        
        testGetDeepChildren: function() {
            var store    = this.store,
                abe      = store.getAt(store.find('first', 'Abe')),
                children = store.getChildren(abe, true);
            
            assert.areEqual(4, children.length);
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: 'isLeaf',
        setUp: defaultSetup,
        
        testLeafIsALeaf: function() {
            var store = this.store,
                aaron = store.getAt(store.find('first', 'Aaron'));
            
            assert.isTrue(store.isLeaf(aaron));
        },
        
        testRootIsNotALeaf: function() {
            var store = this.store,
                ed    = store.getAt(store.find('first', 'Ed'));
            
            assert.isFalse(store.isLeaf(ed));
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: 'isRoot',
        setUp: defaultSetup,
        
        testRootIsARoot: function() {
            var store = this.store,
                ed    = store.getAt(store.find('first', 'Ed'));
            
            assert.isTrue(store.isRoot(ed));
        },
        
        testLeafIsNotARoot: function() {
            var store = this.store,
                aaron = store.getAt(store.find('first', 'Aaron'));
            
            assert.isFalse(store.isRoot(aaron));
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: 'getAncestors',
        setUp: defaultSetup,
        
        testGetsNoRootAncestors: function() {
            var store   = this.store,
                ed      = store.getAt(store.find('first', 'Ed')),
                parents = store.getAncestors(ed);
            
            assert.areEqual(0, parents.length);
        },
        
        testGetsLeafAncestors: function() {
            var store   = this.store,
                arne    = store.getAt(store.find('first', 'Arne')),
                parents = store.getAncestors(arne);
            
            assert.areEqual(3, parents.length);
            assert.areEqual('Jay', parents[0].get('first'));
            assert.areEqual('Abe', parents[1].get('first'));
            assert.areEqual('Ed',  parents[2].get('first'));
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: 'getParent',
        setUp: defaultSetup,
        
        testGetsNoRootParent: function() {
            var store = this.store,
                ed    = store.getAt(store.find('first', 'Ed'));
            
            assert.isUndefined(store.getParent(ed));
        },
        
        testGetsLeafAncestors: function() {
            var store = this.store,
                arne  = store.getAt(store.find('first', 'Arne'));
            
            assert.areEqual('Jay', store.getParent(arne).get('first'));
        }
    }));

    suite.add(new Y.Test.Case({
        name: 'removing nodes',
        setUp: defaultSetup,
        
        testRemovesLeaf: function() {
            var store = this.store,
                arne  = this.findPerson('Arne'),
                ed    = this.findPerson('Ed'),
                abe   = this.findPerson('Abe'),
                jay   = this.findPerson('Jay'),
                tommy = this.findPerson('Tommy'),
                jamie = this.findPerson('Jamie'),
                count = store.getCount();
            
            store.remove(arne);
            
            assert.areEqual(count - 1, store.getCount());
            
            assert.areEqual(8, jay.get('rgt'));
            assert.areEqual(9, abe.get('rgt'));
            assert.areEqual(14, ed.get('rgt'));
            
            assert.areEqual(10, tommy.get('lft'));
            assert.areEqual(13, tommy.get('rgt'));
            
            assert.areEqual(11, jamie.get('lft'));
            assert.areEqual(12, jamie.get('rgt'));
        },
        
        testRemovesParentAndChildren: function() {
            var store = this.store,
                arne  = this.findPerson('Arne'),
                ed    = this.findPerson('Ed'),
                abe   = this.findPerson('Abe'),
                jay   = this.findPerson('Jay'),
                tommy = this.findPerson('Tommy'),
                jamie = this.findPerson('Jamie'),
                count = store.getCount();
            
            store.remove(jay);
            
            assert.areEqual(count - 2, store.getCount());
            
            assert.areEqual(7, abe.get('rgt'));
            assert.areEqual(12, ed.get('rgt'));
            
            assert.areEqual(8, tommy.get('lft'));
            assert.areEqual(11, tommy.get('rgt'));
            
            assert.areEqual(9, jamie.get('lft'));
            assert.areEqual(10, jamie.get('rgt'));
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: 'inserting nodes',
        setUp: defaultSetup,
        
        //we're adding Michael as the only child of Arne
        testInsertsLeaf: function() {
            var michael = Ext.ModelMgr.create({
                id   : 9,
                first: 'Michael',
                last : 'Mullany'
            }, 'User');
            
            var store = this.store,
                arne  = this.findPerson('Arne'),
                ed    = this.findPerson('Ed'),
                abe   = this.findPerson('Abe'),
                jay   = this.findPerson('Jay'),
                tommy = this.findPerson('Tommy'),
                jamie = this.findPerson('Jamie'),
                count = store.getCount();
            
            store.insert(michael, arne);
            
            assert.areEqual(count + 1, store.getCount());
            
            assert.areEqual(11, arne.get('rgt'));
            assert.areEqual(12, jay.get('rgt'));
            assert.areEqual(13, abe.get('rgt'));
            assert.areEqual(18, ed.get('rgt'));
            
            assert.areEqual(14, tommy.get('lft'));
            assert.areEqual(17, tommy.get('rgt'));
            
            assert.areEqual(15, jamie.get('lft'));
            assert.areEqual(16, jamie.get('rgt'));
        },
        
        //we're adding Michael between Dave and Jay
        testInsertsLeafAtIndex: function() {
            var michael = Ext.ModelMgr.create({
                id   : 9,
                first: 'Michael',
                last : 'Mullany'
            }, 'User');
            
            var store = this.store,
                arne  = this.findPerson('Arne'),
                ed    = this.findPerson('Ed'),
                abe   = this.findPerson('Abe'),
                jay   = this.findPerson('Jay'),
                tommy = this.findPerson('Tommy'),
                jamie = this.findPerson('Jamie'),
                count = store.getCount();
            
            store.insert(michael, abe, 2);
            
            assert.areEqual(count + 1, store.getCount());
            
            assert.areEqual(7, michael.get('lft'));
            assert.areEqual(8, michael.get('rgt'));
            
            assert.areEqual(10, arne.get('lft'));
            assert.areEqual(11, arne.get('rgt'));
            
            assert.areEqual(9, jay.get('lft'));
            assert.areEqual(12, jay.get('rgt'));
            
            assert.areEqual(13, abe.get('rgt'));
            assert.areEqual(18, ed.get('rgt'));
            
            assert.areEqual(14, tommy.get('lft'));
            assert.areEqual(17, tommy.get('rgt'));
            
            assert.areEqual(15, jamie.get('lft'));
            assert.areEqual(16, jamie.get('rgt'));
        }
    }));
})();