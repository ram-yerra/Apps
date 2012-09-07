Ext.ns('Ext.fixtures', 'Ext.fixtures.readers');

Ext.fixtures.readers.AssociationLoadJson = {
    "users": [
        {
            "id": 123,
            "name": "Ed",
            "addresses": [
                {
                    "line1": "525 University Avenue",
                    "line2": "Suite 23",
                    "town" : "Palo Alto"
                }
            ],
            "orders": [
                {
                    "id": 50,
                    "total": 100,
                    "order_items": [
                        {
                            "id"      : 20,
                            "price"   : 40,
                            "quantity": 2,
                            "product" : {
                                "id": 1000,
                                "name": "MacBook Pro"
                            }
                        },
                        {
                            "id"      : 21,
                            "price"   : 20,
                            "quantity": 1,
                            "product" : {
                                "id": 1001,
                                "name": "iPhone"
                            }
                        }
                    ]
                },
                {
                    "id": 51,
                    "total": 10,
                    "order_items": [
                        {
                            "id": 22,
                            "price": 10,
                            "quantity": 1,
                            "product": {
                                "id"  : 1002,
                                "name": "iPad"
                            }
                        }
                    ]
                }
            ]
        }
    ]
};

Ext.fixtures.readers.AssociationLoadXml = [
    "<users>",
    "    <user>",
    "        <id>123</id>",
    "        <name>Ed</name>",
    "        <orders>",
    "            <order>",
    "                <id>50</id>",
    "                <total>100</total>",
    "                <order_items>",
    "                    <order_item>",
    "                        <id>20</id>",
    "                        <price>40</price>",
    "                        <quantity>2</quantity>",
    "                        <product>",
    "                            <id>1000</id>",
    "                            <name>MacBook Pro</name>",
    "                        </product>",
    "                    </order_item>",
    "                    <order_item>",
    "                        <id>21</id>",
    "                        <price>20</price>",
    "                        <quantity>1</quantity>",
    "                        <product>",
    "                            <id>1001</id>",
    "                            <name>iPhone</name>",
    "                        </product>",
    "                    </order_item>",
    "                </order_items>",
    "            </order>",
    "            <order>",
    "                <id>51</id>",
    "                <total>10</total>",
    "                <order_items>",
    "                    <order_item>",
    "                        <id>22</id>",
    "                        <price>10</price>",
    "                        <quantity>1</quantity>",
    "                        <product>",
    "                            <id>1002</id>",
    "                            <name>iPad</name>",
    "                        </product>",
    "                    </order_item>",
    "                </order_items>",
    "            </order>",
    "        </orders>",
    "    </user>",
    "</users>"
].join("\n");