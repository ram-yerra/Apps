describe("Ext.data.JsonReader", function() {
    var reader, data1, data2, result1, result2;
    
    beforeEach(function() {
        Ext.regModel('JsonReader', {
            fields: [
                {mapping: 'mappy', name: 'inter', type: 'int'}
            ]
        });
        
        reader = new Ext.data.JsonReader({
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalProp',
            messageProperty: 'messageProp',
            successProperty: 'successProp',
            model: 'JsonReader'
        });
    });
    
    describe("extractors", function() {
        it("should extract the correct total", function() {
            expect(reader.getTotal({totalProp: 500})).toEqual(500);
        });
        
        it("should extract success", function() {
            expect(reader.getSuccess({successProp: false})).toEqual(false);
        });
        
        it("should extract the message", function() {
            expect(reader.getMessage({messageProp: 'Oh hi'})).toEqual('Oh hi');
        });
        
        it("should extract the root", function() {
            expect(reader.getRoot({data: 'data'})).toEqual('data');
        });
        
        it("should extract the id", function() {
            expect(reader.getId({id: 100})).toEqual(100);
        });
        
        it("should respect field mappings", function() {
            expect(reader.extractorFunctions[0]({mappy: 200})).toEqual(200);
        });
    });
    
    describe("reading records", function() {
        beforeEach(function() {
            Ext.regModel("JsonReaderTest", {
                fields: [
                    {name: 'id'},
                    {name: 'floater', type: 'float'},
                    {name: 'bool', type: 'boolean'},
                    {name: 'inter', type: 'integer'},
                    {
                        name: 'string', 
                        type: 'string', 
                        convert: function(v) {
                            return "modified/" + v;
                        }
                    }
                ]
            });
        
            reader = new Ext.data.JsonReader({
                root: 'data',
                idProperty: 'id',
                successProperty: 'successProp',
                totalProperty: 'totalProp',
                model: "JsonReaderTest"
            });
        
            data1 = {
                id     : 1,
                bool   : true,
                inter  : 8675,
                floater: 1.23,
                string : 'Ed'
            };
            
            data2 = {
                id     : 2,
                bool   : false,
                inter  : 309,
                floater: 4.56,
                string : 'Nick'
            };
            
            result1 = reader.readRecords({
                data       : [data1],
                successProp: true,
                totalProp  : 2
            });
            
            result2 = reader.readRecords({
                data       : [data2],
                successProp: false,
                totalProp  : 6
            });
        });
        
        it("should read the success property", function() {
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(false);
        });
        
        it("should read the total record count", function() {
            expect(result1.total).toEqual(2);
            expect(result2.total).toEqual(6);
        });
        
        it("should read records correctly", function() {
            var recData = result1.records[0].data;
            
            expect(recData.id).toEqual(data1.id);
            expect(recData.floater).toEqual(data1.floater);
            expect(recData.bool).toEqual(data1.bool);
            expect(recData.inter).toEqual(data1.inter);
        });
        
        it("should respect the field's convert function", function() {
            var recData = result1.records[0].data;
            
            expect(recData.string).toEqual('modified/Ed');
        });
    });
    
    describe("loading with a 'record' property", function() {
        var data, resultSet;
        
        beforeEach(function() {
            delete Ext.ModelMgr.types.User;
                        
            Ext.regModel('User', {
                fields: [
                    'id', 'name', 'email'
                ]
            });
            
            reader = new Ext.data.JsonReader({
                model: 'User',
                root : 'users',
                record: 'user'
            });
            
            data = {
                users: [
                    {
                        user: {
                            id: 1,
                            name: 'Ed Spencer',
                            email: 'ed@sencha.com'
                        }
                    },
                    {
                        user: {
                            id: 2,
                            name: 'Abe Elias',
                            email: 'abe@sencha.com'
                        }
                    }
                ]
            };
            
            resultSet = reader.readRecords(data);
        });
        
        it("should parse the correct number of results", function() {
            expect(resultSet.count).toEqual(2);
        });
        
        it("should parse each record correctly", function() {
            var record1 = resultSet.records[0],
                record2 = resultSet.records[1];
            
            expect(record1.get('name')).toEqual('Ed Spencer');
            expect(record2.get('name')).toEqual('Abe Elias');
        });
    });
    
    describe("loading nested data", function() {
        var data;
        
        beforeEach(function() {
            //We have five models - User, Address, Order, OrderItem and Product
            Ext.regModel("User", {
                fields: [
                    'id', 'name'
                ],

                hasMany: [
                    {model: 'Order', name: 'orders'},
                    {model: 'Address', name: 'addresses'}
                ],

                proxy: {
                    type: 'rest',
                    reader: {
                        type: 'json',
                        root: 'users'
                    }
                }
            });
            
            Ext.regModel('Address', {
                fields: [
                    'id', 'line1', 'line2', 'town'
                ],
                
                belongsTo: 'User'
            });

            Ext.regModel("Order", {
                fields: [
                    'id', 'total'
                ],

                hasMany  : {model: 'OrderItem', name: 'orderItems', associationKey: 'order_items'},
                belongsTo: 'User'
            });

            Ext.regModel("OrderItem", {
                fields: [
                    'id', 'price', 'quantity', 'order_id', 'product_id'
                ],

                belongsTo: ['Order', {model: 'Product', associationKey: 'product'}]
            });

            Ext.regModel("Product", {
                fields: [
                    'id', 'name'
                ],

                hasMany: {model: 'OrderItem', name: 'orderItems'}
            });
            
            //this is a heavily nested dataset we want to load
            data = Ext.fixtures.readers.AssociationLoadJson;
        });
        
        function createReader(config) {
            return new Ext.data.JsonReader(Ext.apply({}, config, {
                model: "User",
                root : "users"
            }));
        }
        
        afterEach(function() {
            Ext.each(['User', 'Order', 'OrderItem', 'Product'], function(model) {
                delete Ext.ModelMgr.types[model];
            }, this);
        });
        
        it("should set implicitIncludes to true by default", function() {
            reader = createReader();
                        
            expect(reader.implicitIncludes).toEqual(true);
        });
        
        it("should not parse includes if implicitIncludes is set to false", function() {
            reader = createReader({implicitIncludes: false});
            
            var resultSet = reader.read(data),
                user      = resultSet.records[0],
                orders    = user.orders();
            
            expect(orders.getCount()).toEqual(0);
        });
        
        describe("when reading nested data", function() {
            var resultSet, user, orders, orderItems, product, addresses;
            
            beforeEach(function() {
                reader     = createReader();
                resultSet  = reader.read(data);
                user       = resultSet.records[0];
                addresses  = user.addresses();
                orders     = user.orders();
                orderItems = orders.first().orderItems();
                product    = orderItems.first().getProduct();
            });
            
            it("should populate first-order associations", function() {
                expect(orders.getCount()).toEqual(2);
                expect(addresses.getCount()).toEqual(1);
            });
            
            it("should populate second-order associations", function() {
                expect(orderItems.getCount()).toEqual(2);
            });
            
            it("should populate belongsTo associations", function() {
                expect(product.get('name')).toEqual('MacBook Pro');
            });
        });
    });
    
    describe("reconfiguring via metadata", function() {
        var meta;
        
        beforeEach(function() {
            meta = {some: 'meta data'};
            
            spyOn(reader, 'onMetaChange').andReturn();
            spyOn(reader, 'getRoot').andReturn([]);
        });
        
        it("should call onMetaChange", function() {
            reader.readRecords({metaData: meta});
            expect(reader.onMetaChange).toHaveBeenCalledWith(meta);
        });
    });
});
