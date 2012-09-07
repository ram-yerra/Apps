describe("An Association", function() {
    var association, instance;
    
    beforeEach(function() {
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
        
        association = new Ext.data.BelongsToAssociation({
            ownerModel: 'User',
            associatedModel: 'Group'
        });
        
        instance = Ext.ModelMgr.create({
            id: 10,
            group_id: 1
        }, 'User');
    });
    
    it("should throw an error if ownerModel is not a model", function() {
        expect(function() {
            new Ext.data.BelongsToAssociation({
                ownerModel: 'Not a real model',
                associatedModel: 'Group'
            });
        }).toThrow();
    });
    
    it("should throw an error if associatedModel is not a model", function() {
        expect(function() {
            new Ext.data.BelongsToAssociation({
                ownerModel: 'User',
                associatedModel: 'Not a real model'
            });
        }).toThrow();
    });
    
    it("should create a default foreignKey for the associated model", function() {
        expect(association.foreignKey).toEqual('group_id');
    });
    
    it("should allow a custom foreignKey for the associated model", function() {
        association = new Ext.data.BelongsToAssociation({
            ownerModel: 'User',
            associatedModel: 'Group',
            foreignKey: 'myGroupId'
        });
        
        expect(association.foreignKey).toEqual('myGroupId');
    });
    
    it("should create a default associated primary key", function() {
        expect(association.primaryKey).toEqual('id');
    });
    
    it("should allow a custom associated primary key", function() {
        association = new Ext.data.BelongsToAssociation({
            ownerModel: 'User',
            associatedModel: 'Group',
            primaryKey: 'group_id'
        });
        
        expect(association.primaryKey).toEqual('group_id');
    });
});
