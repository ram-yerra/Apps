describe("Ext.ModelMgr", function() {
    describe("extending other models", function() {
        var ModelMgr = Ext.ModelMgr,
            Admin, User;
        
        var registerUser = function() {
            return Ext.regModel('User', {
                fields: [
                    {name: 'id',   type: 'int'},
                    {name: 'name', type: 'string'}
                ],
                
                associations: [
                    {type: 'hasMany', model: 'Product', name: 'products'}
                ],
                
                validations: [
                    {type: 'presence', field: 'name'}
                ],
                
                userMethod: function() {
                    
                }
            });
        };
        
        var registerAdmin = function() {
            return Ext.regModel('Admin', {
                extend: 'User',
                
                fields: [
                    {name: 'email', type: 'string'}
                ],
                
                associations: [
                    {type: 'hasMany', model: 'Article', name: 'articles'}
                ],
                
                validations: [
                    {type: 'length', field: 'name', min: 3}
                ],
                
                adminMethod: function() {
                    
                }
            });
        };
        
        beforeEach(function() {
            //clear out any existing model definitions
            Ext.ModelMgr.types = {};
            
            //these models get registered first so that we can test that associations get created correctly
            Ext.regModel('Product', {
                fields: [{name: 'id', type: 'int'}]
            });
            
            Ext.regModel('Article', {
                fields: [{name: 'id', type: 'int'}]
            });
        });
        
        describe("extending a model that does already exist", function() {
            var admin;
            
            beforeEach(function() {
                User  = registerUser();
                Admin = registerAdmin();
                
                admin = new Admin({});
            });

            it("should result in a new model that is a subclass of the superclass model", function() {
                expect(admin instanceof Admin).toBe(true);
                expect(admin instanceof User).toBe(true);
            });
            
            it("should set the defined state of the new model as true", function() {
                expect(Admin.defined).toBe(true);
            });

            it("should inherit all of the fields of the superclass model", function() {
                expect(admin.fields.length).toEqual(3);
            });

            it("should inherit all of the associations of the superclass model", function() {
                expect(admin.associations.length).toEqual(2);
            });

            it("should inherit all of the validations of the superclass model", function() {
                expect(admin.validations.length).toEqual(2);
            });

            it("should inherit all of the instance methods of the superclass model", function() {
                expect(typeof admin.userMethod == 'function').toBe(true);
            });
        });
        
        xdescribe("extending a model that doesn't exist yet", function() {
            it("should create a shell superclass model", function() {
                registerAdmin();
                
                expect(ModelMgr.types.User).not.toBeUndefined();
            });
            
            it("should return a reference to the new model", function() {
                var AdminModel = registerAdmin();
                
                expect((new AdminModel()) instanceof Ext.data.Model).toBe(true);
            });
            
            it("should mark the shell superclass's defined state as false", function() {
                expect(ModelMgr.types.User.defined).toBe(false);
            });
            
            it("should mark the subclass's defined state as false", function() {
                expect(ModelMgr.types.Admin.defined).toBe(false);
            });
            
            describe("until the superclass has been defined", function() {
                var Admin, proto;
                
                beforeEach(function() {
                    Admin = registerAdmin();
                    proto = Admin.prototype;
                });
                
                it("should not have any of the configured fields", function() {
                    expect(proto.fields.length).toEqual(0);
                });
                
                it("should not have any of the configured associations", function() {
                    expect(proto.associations.length).toEqual(0);
                });
                
                it("should not have any of the configured instance methods", function() {
                    expect(proto.userMethod).toBeUndefined();
                });
            });
            
            describe("if a second direct subclass is defined before the superclass", function() {
                var Guest, GuestProto;
                
                beforeEach(function() {
                    Guest = Ext.regModel('Guest', {
                        extend: 'User',
                        fields: [
                            {name: 'displayName', type: 'string', defaultValue: 'Guest'}
                        ],
                        
                        guestMethod: function() {
                            
                        }
                    });
                    
                    GuestProto = Guest.prototype;
                });
                
                it("should not create the fields, associations or instance methods on the second subclass", function() {
                    expect(GuestProto.fields.length).toEqual(0);
                    expect(GuestProto.validations.length).toEqual(0);
                    expect(GuestProto.associations.length).toEqual(0);
                });
                
                describe("when the superclass is subsequently defined", function() {
                    beforeEach(function() {
                        registerUser();
                    });
                    
                    it("should create the second subclass's fields, associations and instance methods", function() {
                        expect(GuestProto.fields.length).toEqual(3);
                        expect(GuestProto.validations.length).toEqual(1);
                        expect(GuestProto.associations.length).toEqual(1);
                        
                        expect(typeof GuestProto.guestMethod == 'function').toBe(true);
                    });
                });
            });
            
            describe("if a subclass of the first subclass is defined, and the superclass still isn't present", function() {
                var Moderator, ModeratorProto;
                
                beforeEach(function() {
                    Moderator = Ext.regModel('Moderator', {
                        extend: 'Admin',
                        fields: [
                            {name: 'is_moderator', type: 'boolean', defaultValue: 'true'}
                        ],
                        
                        moderatorMethod: function() {
                            
                        }
                    });
                    
                    ModeratorProto = Moderator.prototype;
                });
                
                it("should not create the fields, associations or instance methods on the sub-subclass", function() {
                    expect(ModeratorProto.fields.length).toEqual(0);
                    expect(ModeratorProto.validations.length).toEqual(0);
                    expect(ModeratorProto.associations.length).toEqual(0);
                });
                
                describe("when the superclass is subsequently defined", function() {
                    beforeEach(function() {
                        registerUser();
                        registerAdmin();
                    });
                    
                    it("should create the second subclass's fields, associations and instance methods", function() {
                        expect(ModeratorProto.fields.length).toEqual(4);
                        expect(ModeratorProto.validations.length).toEqual(2);
                        expect(ModeratorProto.associations.length).toEqual(2);
                        
                        expect(typeof ModeratorProto.moderatorMethod == 'function').toBe(true);
                        expect(typeof ModeratorProto.adminMethod == 'function').toBe(true);
                    });
                });
            });
            
            describe("when the superclass is subsequently defined", function() {
                var User, Admin, UserProto, AdminProto;
                
                beforeEach(function() {
                    User = registerUser();
                    UserProto = User.prototype;
                    
                    Admin = Ext.ModelMgr.types.Admin;
                    AdminProto = Admin.prototype;
                });
                
                it("should populate the superclass correctly", function() {
                    expect(UserProto.fields.length).toEqual(2);
                    expect(UserProto.validations.length).toEqual(1);
                    expect(UserProto.associations.length).toEqual(1);
                });
                
                it("should mark the defined state of the superclass as true", function() {
                    expect(User.defined).toBe(true);
                });
                
                it("should mark the defined state of the subclass as true", function() {
                    expect(Admin.defined).toBe(true);
                });
                
                it("should add the subclass's fields after the superclass's fields", function() {
                    expect(AdminProto.fields.length).toEqual(3);
                });
                
                it("should add the subclass's associations after the superclass's associations", function() {
                    expect(AdminProto.associations.length).toEqual(2);
                });
                
                it("should add the subclass's validations after the superclass's validations", function() {
                    expect(AdminProto.validations.length).toEqual(2);
                });
            });
        });
    });
    
    describe("creating the model's associations", function() {
        var ModelMgr = Ext.ModelMgr,
            User, associations;
        
        describe("when the associated model has already been defined", function() {
            beforeEach(function() {
                ModelMgr.registerType('Group', {
                    fields: [
                        {name: 'id', type: 'int'}
                    ]
                });

                ModelMgr.registerType('Product', {
                    fields: [
                        {name: 'id', type: 'int'}
                    ]
                });

                User = ModelMgr.registerType('User', {
                    fields: [
                        {name: 'name',  type: 'string'},
                        {name: 'age',   type: 'int'},
                        {name: 'phone', type: 'string'},
                        {name: 'alive', type: 'boolean', defaultValue: true}
                    ],

                    associations: [
                        {type: 'belongsTo',   model: 'Group'},
                        {type: 'hasMany',     model: 'Product'},
                        {type: 'polymorphic', model: 'Product'}
                    ]
                });

                associations = User.prototype.associations.items;
            });
            
            it("should create the correct number of associations", function() {
                expect(associations.length).toEqual(3);
            });
        
            it("should create associations for each belongsTo association", function() {
                expect(associations[0] instanceof Ext.data.BelongsToAssociation).toBe(true);
            });
        
            it("should create associations for each hasMany association", function() {
                expect(associations[1] instanceof Ext.data.HasManyAssociation).toBe(true);
            });
            
            it("should create associations for each polymorphic association", function() {
                expect(associations[2] instanceof Ext.data.PolymorphicAssociation).toBe(true);
            });
            
            describe("creating from the belongsTo config", function() {
                var Attendance, associations;
                
                beforeEach(function() {
                    Ext.regModel('Event', {
                        fields: ['id']
                    });
                });
                
                describe("when passed a string", function() {
                    beforeEach(function() {
                        Attendance = Ext.regModel('Attendance', {
                            belongsTo: 'Event'
                        });
                        
                        associations = Attendance.prototype.associations.items;
                    });
                    
                    it("should create the BelongsToAssociation", function() {
                        expect(associations.length).toEqual(1);
                        expect(associations[0] instanceof Ext.data.BelongsToAssociation).toBe(true);
                    });
                    
                    it("should link the association to the correct model", function() {
                        expect(associations[0].associatedName).toEqual('Event');
                    });
                });
                
                describe("when passed an object", function() {
                    beforeEach(function() {
                        Attendance = Ext.regModel('Attendance', {
                            belongsTo: {model: 'Event', getterName: 'aDifferentName'}
                        });
                        
                        associations = Attendance.prototype.associations.items;
                    });
                    
                    it("should create the BelongsToAssociation", function() {
                        expect(associations.length).toEqual(1);
                        expect(associations[0] instanceof Ext.data.BelongsToAssociation).toBe(true);
                    });
                    
                    it("should pass in the correct options from the config object", function() {
                        expect(associations[0].getterName).toEqual('aDifferentName');
                    });
                });
                
                describe("when passed an array", function() {
                    beforeEach(function() {
                        Ext.regModel('Person', {
                            fields: ['id']
                        });
                        
                        Attendance = Ext.regModel('Attendance', {
                            belongsTo: ['Person', {model: 'Event', getterName: 'aDifferentName'}]
                        });
                        
                        associations = Attendance.prototype.associations.items;
                    });
                    
                    it("should create the correct number of BelongsToAssociation instances", function() {
                        expect(associations.length).toEqual(2);
                        
                        expect(associations[0] instanceof Ext.data.BelongsToAssociation).toBe(true);
                        expect(associations[1] instanceof Ext.data.BelongsToAssociation).toBe(true);
                    });
                });
            });
            
            describe("creating from the hasMany config", function() {
                var Event, associations;
                
                beforeEach(function() {
                    Ext.regModel('Attendance', {
                        fields: ['id']
                    });
                });
                
                describe("when passed a string", function() {
                    beforeEach(function() {
                        Event = Ext.regModel('Event', {
                            hasMany: 'Attendance'
                        });
                        
                        associations = Event.prototype.associations.items;
                    });
                    
                    it("should create the HasManyAssociation", function() {
                        expect(associations.length).toEqual(1);
                        expect(associations[0] instanceof Ext.data.HasManyAssociation).toBe(true);
                    });
                    
                    it("should link the association to the correct model", function() {
                        expect(associations[0].associatedName).toEqual('Attendance');
                    });
                });
                
                describe("when passed an object", function() {
                    beforeEach(function() {
                        Event = Ext.regModel('Event', {
                            hasMany: {model: 'Attendance', name: 'someName'}
                        });
                        
                        associations = Event.prototype.associations.items;
                    });
                    
                    it("should create the HasManyAssociation", function() {
                        expect(associations.length).toEqual(1);
                        expect(associations[0] instanceof Ext.data.HasManyAssociation).toBe(true);
                    });
                    
                    it("should pass in the correct options from the config object", function() {
                        expect(associations[0].name).toEqual('someName');
                    });
                });
                
                describe("when passed an array", function() {
                    beforeEach(function() {
                        Ext.regModel('Person', {
                            fields: ['id']
                        });
                        
                        Event = Ext.regModel('Event', {
                            hasMany: ['Person', {model: 'Attendance'}]
                        });
                        
                        associations = Event.prototype.associations.items;
                    });
                    
                    it("should create the correct number of BelongsToAssociation instances", function() {
                        expect(associations.length).toEqual(2);
                        
                        expect(associations[0] instanceof Ext.data.HasManyAssociation).toBe(true);
                        expect(associations[1] instanceof Ext.data.HasManyAssociation).toBe(true);
                    });
                });
            });
        });
        
        describe("creating associations with models that have not been created yet", function() {
            var Product;
            
            var createAssociated = function() {
                User = ModelMgr.registerType('User', {
                    fields: [
                        {name: 'name',  type: 'string'},
                        {name: 'age',   type: 'int'},
                        {name: 'phone', type: 'string'},
                        {name: 'alive', type: 'boolean', defaultValue: true}
                    ],

                    associations: [
                        {type: 'hasMany', model: 'Product'}
                    ]
                });
            };
            
            beforeEach(function() {
                delete Ext.ModelMgr.types.User;
                delete Ext.ModelMgr.types.Product;
                Ext.ModelMgr.associationStack = [];
                
                Product = ModelMgr.registerType('Product', {
                    fields: [
                        {name: 'id', type: 'int'}
                    ],
                    
                    belongsTo: "User"
                });
                
                associations = Product.prototype.associations.items;
            });
            
            it("should not create the association immediately", function() {
                expect(associations.length).toEqual(0);
            });
            
            it("should add the association definition to a stack", function() {
                expect(Ext.ModelMgr.associationStack.length).toEqual(1);
            });
            
            it("should create the association once the associated model has been defined", function() {
                createAssociated();
                
                expect(associations.length).toEqual(1);
                expect(associations[0].associatedName).toEqual("User");
            });
            
            it("should remove the deferred association from the associations stack", function() {
                createAssociated();
                
                expect(Ext.ModelMgr.associationStack.length).toEqual(0);
            });
        });
    });
    
    describe('methods', function() {
        var User,
            ModelMgr = Ext.ModelMgr;

        beforeEach(function(){
            User = ModelMgr.registerType('User', {
                fields: [
                    {name: 'name',  type: 'string'},
                    {name: 'age',   type: 'int'},
                    {name: 'phone', type: 'string'},
                    {name: 'alive', type: 'boolean', defaultValue: true}
                ],

                changeName: function() {
                    var oldName = this.get('name'),
                        newName = oldName + " The Barbarian";
                    this.set('name', newName);
                }
            });
        });

        afterEach(function(){
            delete ModelMgr.types['User'];
        });
        
        it("should create do this job correctly", function(){
            var user = ModelMgr.create({
                    name : 'Conan',
                    age  : 24,
                    phone: '555-555-5555'
                }, 'User');
            
            expect(user.data).toEqual({
                    name : 'Conan',
                    age  : 24,
                    phone: '555-555-5555',
                    alive: true
            });
            expect(user.get('name')).toEqual('Conan');
            user.changeName();
            expect(user.get('name')).toEqual('Conan The Barbarian');
        });
        
        describe('getModel', function(){
            it("sould find model by name", function(){
                expect(ModelMgr.getModel('User')).toEqual(User);
            });
            
            it("sould return directly an instance of Ext.data.Model", function(){
                expect(ModelMgr.getModel(User)).toEqual(User);
            });
        });
    });
});