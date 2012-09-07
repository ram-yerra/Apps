describe("A belongs to association", function() {
    var association, instance;
    
    describe("creation of a belongsTo association from a User model to a Group model", function() {
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

        it("should create a getGroup function on the model prototype", function() {
            expect(typeof instance.getGroup == 'function').toBe(true);
        });
        
        it("should create a setGroup function on the model prototype", function() {
            expect(typeof instance.setGroup == 'function').toBe(true);
        });
                
        describe("the created getter function", function() {
            var scope, proxy, fakeInstance, Group;

            beforeEach(function() {
                scope = {
                    foo: 'bar'
                };
                
                Group = Ext.ModelMgr.types['Group'];
                proxy = Group.proxy;
                
                //we're just stubbing out the actual reading of data over the proxy here
                proxy.read = function(operation, callback, scope) {
                    operation.getRecords = function() {
                        var fakeGroup = Ext.ModelMgr.create({
                            id: 1
                        }, 'Group');
                        
                        return [fakeGroup];
                    };
                    
                    callback.call(scope, operation);
                };
                spyOn(Group, 'load').andReturn();
                spyOn(proxy, 'read').andCallThrough();
                
                fakeInstance = {
                    set: Ext.emptyFn,
                    load: Ext.emptyFn
                };
            });
            
            it("should create a new instance of the associated model", function() {
                spyOn(Ext.ModelMgr, 'create').andReturn(fakeInstance);
                
                instance.getGroup(function() {});
                
                expect(Ext.ModelMgr.create).toHaveBeenCalledWith({}, 'Group');
            });
            
            it("should set the foreign key of the owner model instance", function() {
                spyOn(fakeInstance, 'set').andCallThrough();
                spyOn(Ext.ModelMgr, 'create').andReturn(fakeInstance);
                
                instance.getGroup(function() {});
                expect(fakeInstance.set).toHaveBeenCalledWith('id', 1);
            });
            
            it("should automatically load the foreign model instance", function() {
                spyOn(fakeInstance, 'load').andCallThrough();
                spyOn(Ext.ModelMgr, 'create').andReturn(fakeInstance);
                
                instance.getGroup(function() {});
                
                expect(Group.load).toHaveBeenCalled();
            });
        });

        describe("the created setter function", function() {
            it("should update the foreign key of the owner model instance", function() {
                instance.setGroup(10);
                
                expect(instance.get('group_id')).toEqual(10);
            });
            
            describe("if a callback function is passed", function() {
                it("should call save on the owner model", function() {
                    spyOn(instance, 'save').andReturn();
                    
                    instance.setGroup(10, function() {});
                    
                    expect(instance.save).toHaveBeenCalled();
                });
            });
            
            describe("if an options object is passed", function() {
                it("should call save on the owner model", function() {
                    var options = {};
                    
                    spyOn(instance, 'save').andReturn();
                    
                    instance.setGroup(10, options);
                    
                    expect(instance.save).toHaveBeenCalledWith(options);
                });
            });
        });
    });
});