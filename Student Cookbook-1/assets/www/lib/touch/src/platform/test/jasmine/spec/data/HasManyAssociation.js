describe("A HasMany association from a Group model to a User model", function() {
    var association, instance;
    
    function createModels() {
        Ext.regModel('User', {
            fields: [
                'name',
                {name: 'id', type: 'int'},
                {name: 'group_id', type: 'int'}
            ]
        });
        
        Ext.regModel('Group', {
            fields: [
                'name',
                {name: 'id', type: 'int'}
            ]
        });
    }
    
    beforeEach(function() {
        createModels();
        
        association = new Ext.data.HasManyAssociation({
            ownerModel: 'Group',
            associatedModel: 'User',
            name: 'groups'
        });
        
        instance = Ext.ModelMgr.create({
            id: 10,
            name: 'admins'
        }, 'Group');
    });
    
    describe("the generated function", function() {
        it("should have the same name as that passed to the association", function() {
            expect(typeof instance.groups == 'function').toBe(true);
        });

        it("should return a store", function() {
            expect(instance.groups() instanceof Ext.data.Store).toBe(true);
        });
    });
    
    describe("the generated store", function() {
        var store;
        
        beforeEach(function() {
            store = instance.groups();
        });
        
        it("should have the model set to the associated model", function() {
            expect(store.model).toEqual(Ext.ModelMgr.types.User);
        });
        
        //TODO: can't remember the reason for this, have disabled for now
        xit("should have remoteFilter set to true", function() {
            expect(store.remoteFilter).toBe(true);
        });
        
        it("should have set a remote filter", function() {
            expect(store.filters.length).toEqual(1);
        });
        
        describe("the generated filter", function() {
            var filter;
            
            beforeEach(function() {
                filter = store.filters.get(0);
            });
            
            it("should set the foreign key", function() {
                expect(filter.property).toEqual('group_id');
            });
            
            it("should set the foreign key value", function() {
                expect(filter.value).toEqual(10);
            });
        });
        
        describe("customising the generated filter", function() {
            var filter;
            
            beforeEach(function() {
                Ext.regModel('Search', {
                    fields: [
                        'id', 'query'
                    ]
                });
                
                Ext.regModel('Tweet', {
                    fields: [
                        'id', 'tweeter', 'tweet'
                    ]
                });
                
                association = new Ext.data.HasManyAssociation({
                    ownerModel: 'Search',
                    associatedModel: 'Tweet',
                    name: 'tweets',
                    filterProperty: 'query'
                });
                
                instance = Ext.ModelMgr.create({
                    id: 10,
                    query: 'test'
                }, 'Search');
                
                store = instance.tweets();
                filter = store.filters.get(0);
            });
            
            it("should allow the foreign key to be set", function() {
                expect(filter.property).toEqual('query');
            });
            
            it("should set the filter value appropriately", function() {
                expect(filter.value).toEqual('test');
            });
        });
        
        describe("when adding items to the store", function() {
            it("should set the foreign key of the added item to the id of the owner model", function() {
                var user = Ext.ModelMgr.create({id: 100}, "User");
                
                store.add(user);
                
                expect(user.get('group_id')).toEqual(10);
            });
        });
    });
});