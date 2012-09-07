describe("Ext.data.PolymorphicAssociation", function() {
    var association, instance;
    
    beforeEach(function() {
        Ext.regModel('Comment', {
            fields: [
                {type: 'int', name: 'id'},
                {type: 'int', name: 'associated_id'},
                {type: 'string', name: 'associated_model'}
            ]
        });
        
        Ext.regModel('NewsItem', {
            fields: ['id']
        });
        
        association = new Ext.data.PolymorphicAssociation({
            ownerModel: 'NewsItem',
            associatedModel: 'Comment',
            name: 'comments'
        });
        
        instance = Ext.ModelMgr.create({id: 10}, 'NewsItem');
    });
    
    describe("the generated function", function() {
        it("should use the correct name", function() {
            expect(typeof instance.comments == 'function').toBe(true);
        });
        
        it("should return a Store", function() {
            expect(instance.comments() instanceof Ext.data.Store).toBe(true);
        });
    });

    describe("the generated store", function() {
        var store;
        
        beforeEach(function() {
            store = instance.comments();
        });
        
        it("should have set two remote filters", function() {
            expect(store.filters.length).toEqual(2);
        });
        
        describe("the generated filters", function() {
            var filter1, filter2;
            
            beforeEach(function() {
                filter1 = store.filters.get(0);
                filter2 = store.filters.get(1);
            });
            
            it("should set the foreign key", function() {
                expect(filter1.property).toEqual('associated_id');
            });
            
            it("should set the foreign key value", function() {
                expect(filter1.value).toEqual(10);
            });
            
            it("should set the associated model key", function() {
                expect(filter2.property).toEqual('associated_model');
            });
            
            it("should set the associated model value", function() {
                expect(filter2.value).toEqual("NewsItem");
            });
        });
        
        describe("when adding items to the store", function() {
            it("should set the foreign key of the added item to the id of the owner model", function() {
                var comment = Ext.ModelMgr.create({id: 100}, "Comment");
                
                store.add(comment);
                
                expect(comment.get('associated_id')).toEqual(10);
            });
            
            it("should set the associated_model name to the name of the owner model", function() {
                var comment = Ext.ModelMgr.create({id: 100}, "Comment");
                
                store.add(comment);
                
                expect(comment.get('associated_model')).toEqual("NewsItem");
            });
        });
    }); 
});