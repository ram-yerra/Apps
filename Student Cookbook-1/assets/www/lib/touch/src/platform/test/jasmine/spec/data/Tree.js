describe("Ext.data.Tree", function() {
    var yhwh = "yhwh",
        tree;
    
    describe("instantiation", function() {
        var spy;
        
        beforeEach(function() {
           spy = spyOn(Ext.data.Tree.prototype, "setRootNode");
           tree = new Ext.data.Tree(yhwh); 
        });
        
        it ("should extend Ext.util.Observable", function() {
            expect(tree.superclass()).toEqual(Ext.util.Observable.prototype);
        });
        
        it("should have nodeHash empty object", function() {
            expect(tree.nodeHash).toEqual({});
        });
        
        it("should call setRootNode", function() {
            expect(spy).toHaveBeenCalledWith(yhwh);
        });
        
        it ("should have pathSeparator equal to /", function() {
            expect(tree.pathSeparator).toEqual("/");
        });
    });
    
    describe("methods", function() {
        var node, spy;
        
        beforeEach(function() {
           tree = new Ext.data.Tree();
           node = new Ext.data.Node({id: 42});
        });
        
        describe("proxyNodeEvent", function() {
            it("shoud call fireEvent", function() {
                var arg = 'silly_event';
                
                spy = spyOn(tree, "fireEvent");
                
                tree.proxyNodeEvent(arg);
                
                expect(spy).toHaveBeenCalledWith(arg)
            });
        });
        
        describe("toString", function() {
            it("should return the tree string", function(){
                expect(tree.toString()).toEqual("[Tree]");
            });
        });
        
        describe("setting the root node", function() {
            beforeEach(function() {
                spy = spyOn(tree, "registerNode");
                tree.setRootNode(node);
            });
            
            describe("setRootNode", function() {
                it("should set the root node for the tree", function() {
                    expect(tree.root).toEqual(node);
                });
                
                it("should set the node ownerTree", function() {
                    expect(node.ownerTree).toEqual(tree); 
                });
                            
                it("should set the node as root", function() {
                    expect(node.isRoot).toBe(true); 
                });
                
                it ("should register node", function() {
                   expect(spy).toHaveBeenCalledWith(node);
                });
            });
            
            describe("getRootNode", function(){
                it("should return the root node", function() {
                    expect(tree.getRootNode()).toEqual(node);
                });
            });
        });
        
        describe("registering and unregistering nodes", function() {
            describe("register node", function() {
                it("should not register node before registerNode is called", function() {
                    expect(tree.getNodeById(42)).not.toBeDefined();  
                });
                it("should add node to nodeHash", function() {
                    tree.registerNode(node);
                    expect(tree.getNodeById(42)).toEqual(node);  
                });
            });
            
            describe("unregisterNode", function() {
                it("should remove node from nodeHash", function() {
                    tree.registerNode(node);
                    tree.unregisterNode(node);
                    expect(tree.getNodeById(42)).not.toBeDefined(); 
                });
            });
        });
    });
});