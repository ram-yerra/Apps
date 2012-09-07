describe("Ext.data.XmlReader", function() {
    var reader,
        responseText,
        readData,
        createReader,
        user,
        orders,
        ajaxResponse;
    
    describe("loading nested data", function() {
        //We have four models - User, Order, OrderItem and Product
        beforeEach(function() {
            ajaxResponse = new MockAjax();
            
            responseText = "<users>\
                <user>\
                    <id>123</id>\
                    <name>Ed</name>\
                    <orders>\
                        <order>\
                            <id>50</id>\
                            <total>100</total>\
                            <order_items>\
                                <order_item>\
                                    <id>20</id>\
                                    <price>40</price>\
                                    <quantity>2</quantity>\
                                    <product>\
                                        <id>1000</id>\
                                        <name>MacBook Pro</name>\
                                    </product>\
                                </order_item>\
                                <order_item>\
                                    <id>21</id>\
                                    <price>20</price>\
                                    <quantity>1</quantity>\
                                    <product>\
                                        <id>1001</id>\
                                        <name>iPhone</name>\
                                    </product>\
                                </order_item>\
                            </order_items>\
                        </order>\
                        <order>\
                            <id>51</id>\
                            <total>10</total>\
                            <order_items>\
                                <order_item>\
                                    <id>22</id>\
                                    <price>10</price>\
                                    <quantity>1</quantity>\
                                    <product>\
                                        <id>1002</id>\
                                        <name>iPad</name>\
                                    </product>\
                                </order_item>\
                            </order_items>\
                        </order>\
                    </orders>\
                </user>\
            </users>";
            
            ajaxResponse.complete({
                status: 200,
                statusText: 'OK',
                responseText: responseText
            });
                  
            Ext.regModel("User", {
                fields: [
                    'id', 'name'
                ],

                hasMany: {model: 'Order', name: 'orders'},

                proxy: {
                    type: 'rest',
                    reader: {
                        type: 'xml',
                        root: 'users'
                    }
                }
            });

            Ext.regModel("Order", {
                fields: [
                    'id', 'total'
                ],

                hasMany  : {model: 'OrderItem', name: 'orderItems', associationKey: 'order_items'},
                belongsTo: 'User',
                
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'xml',
                        root: 'orders',
                        record: 'order'
                    }
                }
            });

            Ext.regModel("OrderItem", {
                fields: [
                    'id', 'price', 'quantity', 'order_id', 'product_id'
                ],

                belongsTo: ['Order', {model: 'Product', associationKey: 'product'}],
                
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'xml',
                        root: 'order_items',
                        record: 'order_item'
                    }
                }
            });

            Ext.regModel("Product", {
                fields: [
                    'id', 'name'
                ],

                hasMany: {model: 'OrderItem', name: 'orderItems'},
                
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'xml',
                        record: 'product'
                    }
                }
            });

            createReader = function (config) {
                return new Ext.data.XmlReader(Ext.apply({}, config, {
                    model : "User",
                    root  : "users",
                    record: "user"
                }));
            };            
        });
        
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
            readData = reader.read(ajaxResponse);
            user = readData.records[0];
            orders = user.orders();
            
            expect(orders.getCount()).toEqual(0);
        });
        
        describe("when reading nested data", function() {
            beforeEach(function() {
                reader = createReader();
                readData = reader.read(ajaxResponse);
                user = readData.records[0];
                orders = user.orders();
            });
            
            it("should populate first-order associations", function() {
                expect(orders.getCount()).toEqual(2);
            });
            
            it("should populate second-order associations", function() {
                var order = orders.first();
                
                expect(order.orderItems().getCount()).toEqual(2);
            });
            
            it("should populate belongsTo associations", function() {
                var order   = orders.first(),
                    item    = order.orderItems().first(),
                    product = item.getProduct();
                
                expect(product.get('name')).toEqual('MacBook Pro');
            });
        });
    });
});
