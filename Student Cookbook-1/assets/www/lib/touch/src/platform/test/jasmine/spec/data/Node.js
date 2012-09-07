describe("Ext.data.Node", function() {

    describe("instantiation", function() {
        var node;
        
        beforeEach(function() {
            node = new Ext.data.Node({id: "inode"});
        });
        
        it("should call Ext.id id if there is no attributes supplied", function() {
            var fakeId = "foo";
            
            spyOn(Ext, "id").andReturn(fakeId);
            node = new Ext.data.Node();
            
            expect(Ext.id).toHaveBeenCalledWith(null, "xnode-");
            expect(node.id).toEqual(fakeId);
            expect(node.attributes.id).toEqual(fakeId);
        });
        
        it("should extend Ext.util.Observable", function() {
            expect(node.superclass()).toEqual(Ext.util.Observable.prototype);
        });
        
        it("should have attributes", function() {
            expect(node.attributes).toEqual({id: "inode"});
        });
        
        it("should have attributes listeners", function() {
            expect(node.attributes.listeners).toEqual(node.listeners);
        });
 
        it("should not have childNodes", function() {
            expect(node.childNodes).toEqual([]);
        });
        
        it("should have parentNode null", function() {
            expect(node.parentNode).toBeNull();
        });
        
        it("should have firstChild null", function() {
            expect(node.firstChild).toBeNull();
        });
                
        it("should have lastChild null", function() {
            expect(node.lastChild).toBeNull();
        });
        
        it("should have nextSibling null", function() {
            expect(node.nextSibling).toBeNull();
        });
        
        it("should have previousSibling null", function() {
            expect(node.previousSibling).toBeNull();
        });
        
    });
    
    describe("methods", function() {
        var leftChild,
            rightChild,
            rootNode,
            spareNode,
            insertDefaultChildren,
            spy;
            
        beforeEach(function() {
            leftChild = new Ext.data.Node({
                id: 'left'
            });
            
            rightChild = new Ext.data.Node({
                id: 'right'
            });
            
            rootNode = new Ext.data.Node({
                id: 'root'
            });
            
            //we use this in several tests as an example node to add
            spareNode = new Ext.data.Node({
                id: 'spare'
            });
            
            insertDefaultChildren = function() {
                rootNode.appendChild(leftChild);
                rootNode.appendChild(rightChild);
            };
        });
            
        describe("isFirst", function() {
            beforeEach(function() {
                insertDefaultChildren.call(this);
            });
            
            it("should have rootNode which is first", function() {
                expect(rootNode.isFirst()).toBe(true);
            });
            it("should have leftChild which is first", function() {
                expect(leftChild.isFirst()).toBe(true);
            });
            it("should have rightChild which is not first", function() {
                expect(rightChild.isFirst()).toBe(false);
            });
        });
        
        describe("isLast", function() {
            beforeEach(function(){
                insertDefaultChildren.call(this);
            });
            
            it("should have rootNode which is last", function() {
                expect(rootNode.isLast()).toBe(true);
            });
            it("should have leftChild which is not last", function() {
                expect(leftChild.isLast()).toBe(false);
            });
            it("should have rightChild which is last", function() {
                expect(rightChild.isLast()).toBe(true);
            });
        });
        
        describe("hasChildNodes", function() {
            beforeEach(function() {
                rootNode.appendChild(leftChild);
            });
            
            it("should have rootNode with children", function() {
                expect(rootNode.hasChildNodes()).toBe(true);
            });
            it("should have leftChild whithout children", function() {
                expect(leftChild.hasChildNodes()).toBe(false);
            });
        });
        
        describe("isExpandable", function() {
            describe("when attributes expandable is equal to true", function(){
                beforeEach(function(){
                    spareNode.attributes.expandable = true; 
                });
                it("should have node expandable if it has children", function() {
                   spareNode.appendChild(leftChild);
                   expect(spareNode.isExpandable()).toBe(true);
                });
              
                it("should have node expandable if it's a leaf", function() {
                    expect(spareNode.isExpandable()).toBe(true);
                });               
            });
            
            describe("when attributes expandable is equal to false", function(){
                beforeEach(function(){
                    spareNode.attributes.expandable = false; 
                });
                it("should have node expandable if it has children", function() {
                   spareNode.appendChild(leftChild);
                   expect(spareNode.isExpandable()).toBe(true);
                });
              
                it("should have node not expandable if it's a leaf", function() {
                    expect(spareNode.isExpandable()).toBe(false);
                });               
            });
        });
        
        describe("append", function(){
            describe("appending children", function() {
                it("should fire beforeappend", function() {
                    spy = spyOn(rootNode, "fireEvent").andCallThrough();
                    
                    rootNode.appendChild(leftChild);
                    
                    expect(spy).toHaveBeenCalledWith("beforeappend", rootNode.ownerTree, rootNode, leftChild);
                });
                
                it("should cancel append if beforeappend return false", function() {
                    spy = spyOn(rootNode, "fireEvent").andReturn(false);
                                        
                    expect(rootNode.appendChild(leftChild)).toBe(false);
                    
                    expect(spy.callCount).toEqual(1);
                });
                
                it("should set firstChild", function() {
                    
                    rootNode.appendChild(leftChild);
                    
                    expect(rootNode.firstChild).toEqual(leftChild);
                });
    
                it("should set lastChild", function() {
                    
                    rootNode.appendChild(leftChild);
                    
                    expect(rootNode.lastChild).toEqual(leftChild);
                });
                
                it("should add node to childnodes", function() {
                    var childNodes;
                    
                    rootNode.appendChild(leftChild);
                    
                    childNodes = rootNode.childNodes;
                    
                    expect(childNodes.length).toEqual(1);
                    expect(childNodes[0]).toEqual(leftChild);
                });
                
                it("should call setOwnerTree", function() {
                    spy = spyOn(leftChild, "setOwnerTree").andCallThrough();
                    
                    rootNode.appendChild(leftChild);
            
                    expect(spy).toHaveBeenCalledWith(undefined);
                });
               
                it("should fire append event", function() {
                    spy = spyOn(rootNode, "fireEvent").andCallThrough();
                    
                    rootNode.appendChild(leftChild);
                    
                    expect(spy).toHaveBeenCalledWith("append", rootNode.ownerTree, rootNode, leftChild, 0);
                });
                
                it("should return node", function() {
                    var ret = rootNode.appendChild(leftChild);
                    
                    expect(ret).toEqual(leftChild);
                });
                
                it("should append array of nodes", function() {
                    rootNode.appendChild([leftChild, rightChild]);
                    
                    var childNodes = rootNode.childNodes;
                    
                    expect(childNodes[0]).toEqual(leftChild);
                    expect(childNodes[1]).toEqual(rightChild);
                    expect(childNodes.length).toEqual(2);
                });
                
                it("should append nodes list in arguments", function() {
                    rootNode.appendChild(leftChild, rightChild);
                    
                    var childNodes = rootNode.childNodes;
                    
                    expect(childNodes[0]).toEqual(leftChild);
                    expect(childNodes[1]).toEqual(rightChild);
                    expect(childNodes.length).toEqual(2);
                });
            });
            
            describe("appending with existing siblings", function() {
                beforeEach(function() {
                    insertDefaultChildren.call(this); 
                });
                
                it("should set next sibling", function() {
                    expect(leftChild.nextSibling).toEqual(rightChild);
                    expect(rightChild.nextSibling).toBeNull();
                });
                
                it("should set previous sibling", function() {
                    expect(rightChild.previousSibling).toEqual(leftChild);
                    expect(leftChild.previousSibling).toBeNull();
                });
            });
            
            describe("appending children from an existing node", function() {
                var oldParent, spy;
                
                beforeEach(function() {
                    oldParent = new Ext.data.Node({id: 'oldparent'});
                    oldParent.appendChild(spareNode);
                });
                
                it("should remove from existing node", function() {
                    spy = spyOn(oldParent, "removeChild").andCallThrough();
                    
                    rootNode.appendChild(spareNode);
                    
                    expect(spy).toHaveBeenCalledWith(spareNode);
                });
                
                it("should fire beforeremove event", function(){
                    spy = spyOn(oldParent, "fireEvent").andCallThrough();
                    
                    rootNode.appendChild(spareNode);
                    
                    expect(spy).toHaveBeenCalledWith("beforeremove", oldParent.ownerTree, oldParent, spareNode);
                });
                
                it("should fire remove event", function(){
                    spy = spyOn(oldParent, "fireEvent").andCallThrough();
                    
                    rootNode.appendChild(spareNode);
                    
                    expect(spy).toHaveBeenCalledWith("remove", oldParent.ownerTree, oldParent, spareNode);                    
                });                
            });
        });
        
        describe("insert", function(){
            
            beforeEach(function(){
                rootNode.appendChild(rightChild);
            });
            
            describe("inserting children", function() {
                it("should call appendChild if the node to insert before is null", function() {
                    spy = spyOn(rootNode, "appendChild");
                    
                    rootNode.insertBefore(leftChild);
                    
                    expect(spy).toHaveBeenCalledWith(leftChild);
                });
                
                it("should do nothing if the node to insert before is equal to the node to insert", function() {
                    expect(rootNode.insertBefore(leftChild, leftChild)).toBe(false);
                });
                
                it("should fire beforeinsert", function() {
                    spy = spyOn(rootNode, "fireEvent").andCallThrough();
                    
                    rootNode.insertBefore(leftChild, rightChild);
                    
                    expect(spy).toHaveBeenCalledWith("beforeinsert", rootNode.ownerTree, rootNode, leftChild, rightChild);                    
                });
                
                it("should cancel insert if beforeinsert return false", function() {
                    spy = spyOn(rootNode, "fireEvent").andReturn(false);
                    
                    expect(rootNode.insertBefore(leftChild, rightChild)).toBe(false);
                    
                    expect(spy.callCount).toEqual(1);
                });
                
                it("should set firstChild", function() {
                    rootNode.insertBefore(leftChild, rightChild);
                    
                    expect(rootNode.firstChild).toEqual(leftChild);
                });
    
                it("should set lastChild", function() {
                    rootNode.insertBefore(leftChild, rightChild);
                    
                    expect(rootNode.lastChild).toEqual(rightChild);
                });
                
                it("should fire insert", function() {
                    spy = spyOn(rootNode, "fireEvent").andCallThrough();
                    
                    rootNode.insertBefore(leftChild, rightChild);
                    
                    expect(spy).toHaveBeenCalledWith("insert", rootNode.ownerTree, rootNode, leftChild, rightChild);                    
                });
                
                it("should change the index of the node to insert before", function() {
                    expect(rootNode.indexOf(rightChild)).toEqual(0);
                    
                    rootNode.insertBefore(leftChild, rightChild);
                    
                    expect(rootNode.indexOf(rightChild)).toEqual(1);
                });
                
                it("should handle siblings", function(){
                    expect(leftChild.previousSibling).toBeNull();
                    expect(leftChild.nextSibling).toBeNull();
                    expect(rightChild.previousSibling).toBeNull();
                    expect(rightChild.nextSibling).toBeNull();
                    
                    rootNode.insertBefore(leftChild, rightChild);
                    
                    expect(leftChild.previousSibling).toBeNull();
                    expect(leftChild.nextSibling).toEqual(rightChild);
                    expect(rightChild.previousSibling).toEqual(leftChild);
                    expect(rightChild.nextSibling).toBeNull();
                });
                
                describe("move", function() {
                    beforeEach(function() {
                        rootNode.appendChild(leftChild);
                    });
                    
                    it("should fire beforemove", function() {
                        spy = spyOn(leftChild, "fireEvent").andCallThrough();
                        
                        rootNode.insertBefore(leftChild, rightChild);
                        
                        expect(spy).toHaveBeenCalledWith("beforemove", rootNode.ownerTree, leftChild, rootNode, rootNode, 0, rightChild);                    
                    });
                    
                    it("should cancel insert if beforemove return false", function() {
                        spy = spyOn(leftChild, "fireEvent").andReturn(false);
                        
                        expect(rootNode.insertBefore(leftChild, rightChild)).toBe(false);
                        
                        expect(spy.callCount).toEqual(1);
                    });
                    
                    it("should fire move", function() {
                        spy = spyOn(leftChild, "fireEvent").andCallThrough();
                        
                        rootNode.insertBefore(leftChild, rightChild);
                        
                        expect(spy).toHaveBeenCalledWith("move", rootNode.ownerTree, leftChild, rootNode, rootNode, 0, rightChild);                    
                    });                    
                    
                });
            });
        });
        
        describe("removing children", function() {
            it("should return false when removing bad node", function(){
               expect(rootNode.removeChild(leftChild)).toBe(false); 
            });
            
            it("should fire beforeremove event", function(){
                insertDefaultChildren.call(this);
                
                spy = spyOn(rootNode, "fireEvent").andCallThrough();
                
                rootNode.removeChild(leftChild);
                
                expect(spy).toHaveBeenCalledWith("beforeremove", rootNode.ownerTree, rootNode, leftChild);
            });

            it("should cancel remove if beforeremove return false", function() {
                insertDefaultChildren.call(this);
                
                spy = spyOn(rootNode, "fireEvent").andReturn(false);
                
                expect(rootNode.removeChild(leftChild)).toBe(false);
   
                expect(spy.callCount).toEqual(1);
            });
                
            it("should fire remove event", function() {
                insertDefaultChildren.call(this);
                
                spy = spyOn(rootNode, "fireEvent").andCallThrough();
                
                rootNode.removeChild(leftChild);
                
                expect(spy).toHaveBeenCalledWith("remove", rootNode.ownerTree, rootNode, leftChild);
            });
            
            it("should remove child from childNodes", function() {
                var childNodes, count;
                
                insertDefaultChildren.call(this);
                
                childNodes = rootNode.childNodes;
                count = childNodes.length;
                
                rootNode.removeChild(leftChild);
                
                expect(childNodes.length).toEqual(count - 1);
                expect(childNodes[0]).toEqual(rightChild);
            });
            
            it("should manage siblings", function() {
                insertDefaultChildren.call(this);
                
                //this gives us a third child - 'right' is actually now center
                rootNode.appendChild(spareNode);
            
                rootNode.removeChild(rightChild);
                
                expect(leftChild.nextSibling, spareNode);
                
                expect(spareNode.previousSibling, leftChild);
            });
            
            it("should destroy node if asked", function() {
                insertDefaultChildren.call(this);
                
                spy = spyOn(leftChild, "destroy").andCallThrough();
                
                rootNode.removeChild(leftChild, true);
                
                expect(spy).toHaveBeenCalled();
            });
            
            it("should clear node if asked", function() {
                insertDefaultChildren.call(this);
                
                spy = spyOn(leftChild, "clear").andCallThrough();
                
                rootNode.removeChild(leftChild, false);
                
                expect(spy).toHaveBeenCalled();
            });            
        });
        
        describe("clearing references", function() {
            beforeEach(function(){
                insertDefaultChildren.call(this);
                rootNode.appendChild(spareNode);
            });
            
            it("should nullifies parentNode", function() {
               expect(rightChild.parentNode).not.toBeNull();
               
               rightChild.clear();
               
               expect(rightChild.parentNode).toBeNull();
            });
            
            it("should nullifies nextSibling", function() {
               expect(rightChild.nextSibling).not.toBeNull();
               
               rightChild.clear();
               
               expect(rightChild.nextSibling).toBeNull();
            });
            
            it("should nullifies previousSibling", function() {
               expect(rightChild.previousSibling).not.toBeNull();
               
               rightChild.clear();
               
               expect(rightChild.previousSibling).toBeNull();
            });
            
            it("should unset tree", function() {
                spy = spyOn(rightChild, "setOwnerTree").andCallThrough();
                
                rightChild.clear(true);
                
                expect(spy).toHaveBeenCalledWith(null, true);
            });
            
            it("should remove lastChild and firstChild references", function() {
                rightChild.clear(true);
                
                expect(rightChild.firstChild).toBeNull();
                expect(rightChild.lastChild).toBeNull();
            });
        });
        
        describe("item", function() {
            it("should return the child node at the specified index", function() {
                rootNode.appendChild(leftChild);
                rootNode.appendChild(rightChild);
                rootNode.appendChild(spareNode);
                
                expect(rootNode.getChildAt(0)).toEqual(leftChild);
                expect(rootNode.getChildAt(1)).toEqual(rightChild);
                expect(rootNode.getChildAt(2)).toEqual(spareNode);
            });
        });
        
        describe("silent destroy", function() {
            it("should purge node listeners", function() {
                spy = spyOn(leftChild, "clearListeners").andCallThrough();
                
                leftChild.destroy(true);
                
                expect(spy).toHaveBeenCalled();
            });
            
            it("should clear node", function() {
                spy = spyOn(leftChild, "clear").andCallThrough();
                
                leftChild.destroy(true);
                
                expect(spy).toHaveBeenCalled();
            });
            
            it("should destroy children", function() {
                var spy2;
                
                insertDefaultChildren.call(this);
            
                spy = spyOn(leftChild, "destroy").andCallThrough();
                spy2 = spyOn(rightChild, "destroy").andCallThrough();
                
                rootNode.destroy(true);
                
                expect(spy).toHaveBeenCalledWith(true);
                expect(spy2).toHaveBeenCalledWith(true);
            });
            
            it("should nullifies childNodes", function() {
                insertDefaultChildren.call(this);
                
                expect(rootNode.childNodes).not.toBeNull();
                
                rootNode.destroy(true);
                
                expect(rootNode.childNodes).toBeNull();
            });
        });
        
        describe("non-silent destroy", function() {
            it("should remove node", function() {
               insertDefaultChildren.call(this);
               
               spy = spyOn(leftChild, "remove").andCallThrough();
               
               leftChild.destroy(false);
               
               expect(spy).toHaveBeenCalled();
            });
        });
        
        describe("remove", function() {
            it("should remove from parent", function() {
                spy = spyOn(rootNode, "removeChild").andCallThrough();
                
                rootNode.appendChild(leftChild);
                
                leftChild.remove();
                
                expect(spy).toHaveBeenCalledWith(leftChild, undefined);
            });
            
            it("should return node", function() {
               expect(leftChild.remove()).toEqual(leftChild);
            });
        });
        
        describe("removeAll", function() {
            it("should remove all children", function() {
                spy = spyOn(rootNode, "removeChild").andCallThrough();
                insertDefaultChildren.call(this);
                
                rootNode.removeAll();
                expect(spy.callCount).toEqual(2);
            });
        });
        
        describe("replacing children", function() {
            beforeEach(function() {
                insertDefaultChildren.call(this);
            });
            
            it("should keep the same childNodes length", function() {
                var count = rootNode.childNodes.length;
                
                rootNode.replaceChild(spareNode, leftChild);
                
                expect(rootNode.childNodes.length).toEqual(count);
            });
            
            it("should replace node", function() {
                rootNode.replaceChild(spareNode, leftChild);
                
                expect(rootNode.childNodes[0], spareNode);
            });
        });
        
        describe("getting depth", function() {
            beforeEach(function() {
                insertDefaultChildren.call(this);
                leftChild.appendChild(spareNode);
            });
            
            it("should have a depth of 0 for rootNode", function(){
                expect(rootNode.getDepth()).toEqual(0);
            });
            
            it("should have a depth of 1 for leftChild and rightChild", function(){
                expect(rightChild.getDepth()).toEqual(1);
                expect(leftChild.getDepth()).toEqual(1);
            });
            
            it("should have a depth of 2 for spareNode", function(){
                expect(spareNode.getDepth()).toEqual(2);                
            });
        });
        
        describe("setting owner tree", function() {
            var tree;
            
            beforeEach(function() {
                insertDefaultChildren.call(this);
                tree = new Ext.data.Tree();
            });
            
            it("should set new owner tree", function() {
                expect(rootNode.getOwnerTree()).toBeUndefined();
                
                rootNode.setOwnerTree(tree);
                
                expect(rootNode.getOwnerTree()).toEqual(tree);
            });
            
            it("should unregister node on old tree", function() {
                spy = spyOn(tree, "unregisterNode").andCallThrough();
                
                rootNode.ownerTree = tree;
                
                rootNode.setOwnerTree(new Ext.data.Tree());
                
                expect(spy).toHaveBeenCalledWith(rootNode);
            });
            
            it("should register node on new tree", function() {
                spy = spyOn(tree, "registerNode").andCallThrough();
                
                rootNode.setOwnerTree(tree);
                
                expect(spy).toHaveBeenCalledWith(rootNode);
            });
            
            it("should set children owner tree", function() {
                var spy2;
                
                spy = spyOn(leftChild, "setOwnerTree").andCallThrough();
                spy2 = spyOn(rightChild, "setOwnerTree").andCallThrough();
                
                rootNode.setOwnerTree(tree);
                
                expect(spy).toHaveBeenCalledWith(tree);
                expect(spy2).toHaveBeenCalledWith(tree);
            });            
        });
        
        describe("setting ID", function() {
            var tree;
            
            beforeEach(function() {
                tree = new Ext.data.Tree();
                rootNode.setOwnerTree(tree);
            });
            
            it("should chand id attribute", function() {
                rootNode.setId("yhwh");
                
                expect(rootNode.id).toEqual("yhwh");
                expect(rootNode.attributes.id).toEqual("yhwh");
            });
            
            it("should unregister node", function() {
                spy = spyOn(tree, "unregisterNode").andCallThrough();
                
                rootNode.setId("yhwh");
                
                expect(spy).toHaveBeenCalledWith(rootNode);
            });
            
            it("should reregister node", function() {
                spy = spyOn(tree, "registerNode").andCallThrough();
                
                rootNode.setId("yhwh");
                
                expect(spy).toHaveBeenCalledWith(rootNode);
            });
            
            it("should call on id change", function() {
                spy = spyOn(rootNode, "onIdChange").andCallThrough();
                
                rootNode.setId("yhwh");
                
                expect(spy).toHaveBeenCalledWith("yhwh");                
            });
        });
        
        describe("getting path", function() {
            beforeEach(function() {
                insertDefaultChildren.call(this);
                leftChild.appendChild(spareNode);
                rootNode.setOwnerTree(new Ext.data.Tree());
            });
            
            it("should set root path", function() {
                expect(rootNode.getPath()).toEqual("/root");
            });
            
            it("should set middle path", function() {
                expect(leftChild.getPath()).toEqual("/root/left");
                expect(rightChild.getPath()).toEqual("/root/right");
            });

            it("should set leaf path", function() {
                expect(spareNode.getPath()).toEqual("/root/left/spare");
            });
        });
        
        describe("bubbling", function() {
            var bubbleFn;
            
            beforeEach(function() {
                insertDefaultChildren.call(this);
                leftChild.appendChild(spareNode);
                bubbleFn = jasmine.createSpy();
            });
                
            it("should call bubbleFn 3 times", function() {
                spareNode.bubble(bubbleFn);
                
                expect(bubbleFn.callCount).toEqual(3);
            });
            
            it("should call bubbleFn with node spare, left, root", function() {
                spareNode.bubble(bubbleFn);
                
                expect(bubbleFn.calls[0].args).toEqual([spareNode]);
                expect(bubbleFn.calls[1].args).toEqual([leftChild]);
                expect(bubbleFn.calls[2].args).toEqual([rootNode]);
            });
            
            it("should call bubbleFn with a defined scope", function() {
                spareNode.bubble(bubbleFn, fakeScope);
                
                expect(bubbleFn.calls[0].object).toBe(fakeScope);
                expect(bubbleFn.calls[1].object).toBe(fakeScope);
                expect(bubbleFn.calls[2].object).toBe(fakeScope);
            });
            
            it("should call bubbleFn with customs arguments", function() {
                var customArgs = ['some', 'args'];
                
                spareNode.bubble(bubbleFn, spareNode, customArgs);
                
                expect(bubbleFn.calls[0].args).toEqual(customArgs);
                expect(bubbleFn.calls[1].args).toEqual(customArgs);
                expect(bubbleFn.calls[2].args).toEqual(customArgs);
            });
            
            it("should stop when bubbleFn return false", function() {
                bubbleFn.andCallFake(function(node) {
                    if (node.id == 'left') {
                        return false;
                    }
                });
                
                spareNode.bubble(bubbleFn);
                
                expect(bubbleFn.callCount).toEqual(2);
            });
        });
        
        describe("cascading", function() {
            var cascadeFn;
            
            beforeEach(function(){
               insertDefaultChildren.call(this);
               leftChild.appendChild(spareNode);
               cascadeFn = jasmine.createSpy();
            });
            
            it("should call cascadeFn 4 times", function() {
                rootNode.cascadeBy(cascadeFn);
                
                expect(cascadeFn.callCount).toEqual(4);
            });
            
            it("should call cascadeFn with node root, leftChild, spareNode, rightChild", function() {
                rootNode.cascadeBy(cascadeFn);
                
                expect(cascadeFn.calls[0].args).toEqual([rootNode]);
                expect(cascadeFn.calls[1].args).toEqual([leftChild]);
                expect(cascadeFn.calls[2].args).toEqual([spareNode]);
                expect(cascadeFn.calls[3].args).toEqual([rightChild]);
            });
            
            it("should call cascadeFn with a defined scope", function() {
                rootNode.cascadeBy(cascadeFn, fakeScope);
                
                expect(cascadeFn.calls[0].object).toBe(fakeScope);
                expect(cascadeFn.calls[1].object).toBe(fakeScope);
                expect(cascadeFn.calls[2].object).toBe(fakeScope);
                expect(cascadeFn.calls[3].object).toBe(fakeScope);
            });
            
            it("should call cascadeFn with customs arguments", function() {
                var customArgs = ['some', 'args'];
                
                rootNode.cascadeBy(cascadeFn, rootNode, customArgs);
                
                expect(cascadeFn.calls[0].args).toEqual(customArgs);
                expect(cascadeFn.calls[1].args).toEqual(customArgs);
                expect(cascadeFn.calls[2].args).toEqual(customArgs);
                expect(cascadeFn.calls[3].args).toEqual(customArgs);
            });
            
            it("should stop at end of branch when cascadeFn return false", function() {
                cascadeFn.andCallFake(function(node) {
                    if (node.id == 'left') {
                        return false;
                    }
                });
                
                rootNode.cascadeBy(cascadeFn);
                
                expect(cascadeFn.callCount).toEqual(3);
            });
        });
        
        describe("each child", function() {
            var eachFn;
            
            beforeEach(function (){
                insertDefaultChildren.call(this);
                eachFn = jasmine.createSpy();
            });
            
            it("should be called 2 times", function() {
                
                rootNode.eachChild(eachFn);
                
                expect(eachFn.callCount).toEqual(2);
            });
            
            it("should call eachFn with node root, leftChild, rightChild", function() {
                rootNode.eachChild(eachFn);
                
                expect(eachFn.calls[0].args).toEqual([leftChild]);
                expect(eachFn.calls[1].args).toEqual([rightChild]);
            });
            
            it("should call eachFn with a defined scope", function() {
                rootNode.eachChild(eachFn, fakeScope);
                
                expect(eachFn.calls[0].object).toBe(fakeScope);
                expect(eachFn.calls[1].object).toBe(fakeScope);
            });
            
            it("should call eachFn with customs arguments", function() {
                var customArgs = ['some', 'args'];
                
                rootNode.eachChild(eachFn, rootNode, customArgs);
                
                expect(eachFn.calls[0].args).toEqual(customArgs);
                expect(eachFn.calls[1].args).toEqual(customArgs);
            });
            
            it("should stop when eachFn return false", function() {
                eachFn.andCallFake(function(node) {
                    if (node.id == 'left') {
                        return false;
                    }
                });
                
                rootNode.eachChild(eachFn);
                
                expect(eachFn.callCount).toEqual(1);
            });
        });
        
        describe("ancestors", function() {
            beforeEach(function (){
                insertDefaultChildren.call(this);
                leftChild.appendChild(spareNode);
            });
            
            it("should have parent as ancestor", function() {
                expect(spareNode.isAncestor(leftChild)).toBe(true);
            });
            
            it("should have root as ancestor", function() {
                expect(spareNode.isAncestor(rootNode)).toBe(true);
            });
            
            it("should not have uncle as ancestor", function() {
                expect(spareNode.isAncestor(rightChild)).toBe(false);
            });            
        });
        
        describe("contains", function() {
            beforeEach(function (){
                insertDefaultChildren.call(this);
                leftChild.appendChild(spareNode);
            });
            
            it("should contain child", function() {
                expect(rootNode.contains(leftChild)).toBe(true);
            });
            
            it("should contain grand child", function() {
                expect(rootNode.contains(spareNode)).toBe(true);
            });
            
            it("should not contain parent", function() {
                expect(spareNode.contains(leftChild)).toBe(false);
            });            
        });
        
        describe("finding children", function() {
            beforeEach(function (){
                insertDefaultChildren.call(this);
                leftChild.appendChild(spareNode);
            });
            
            describe("findChild", function() {
                it("should find shallow children", function() {
                    expect(rootNode.findChild('id', 'left')).toEqual(leftChild);
                });
    
                it("should not find deep children if deep is not specified", function() {
                    expect(rootNode.findChild('id', 'spare')).toBeNull();
                });
                
                it("should not find deep children if deep is false", function() {
                    expect(rootNode.findChild('id', 'spare', false)).toBeNull();
                });
                
                it("should find deep children if deep is true", function() {
                    expect(rootNode.findChild('id', 'spare', true)).toEqual(spareNode);
                });                
            });
            
            describe("findChildBy", function() {
                var child;
                
                it("should find shallow children", function(){
                    child = rootNode.findChildBy(function(node) {
                        return node.id == 'right';
                    });
                    
                    expect(child).toEqual(rightChild);
                });
                
                it("should not find deep children if deep is not specified", function(){
                    child = rootNode.findChildBy(function(node) {
                        return node.id == 'spare';
                    });
                    
                    expect(child).toBeNull();
                });
                
                it("should not find deep children if deep is false", function(){
                    child = rootNode.findChildBy(function(node) {
                        return node.id == 'spare';
                    }, this, false);
                    
                    expect(child).toBeNull();
                });
                
                it("should find deep children if deep is true", function(){
                    child = rootNode.findChildBy(function(node) {
                        return node.id == 'spare';
                    }, this, true);
                    
                    expect(child).toEqual(spareNode);
                });
                
                it("should call function with good scope", function(){
                    var findChildFn = jasmine.createSpy().andReturn(false);
                    
                    child = rootNode.findChildBy(findChildFn, fakeScope, true);

                    expect(findChildFn.calls[0].object).toBe(fakeScope);
                    expect(findChildFn.calls[1].object).toBe(fakeScope);
                    expect(findChildFn.calls[2].object).toBe(fakeScope);  
                });
            });
        });
        
        describe("sort", function() {
            var node1,
                node2,
                node3,
                node4,
                sortFn;
    
            beforeEach(function() {
                node1 = new Ext.data.Node({lastname: "Avins", firstname: "Jamie"});
                node2 = new Ext.data.Node({lastname: "Dougan", firstname: "Robert"});
                node3 = new Ext.data.Node({lastname: "Ferrero", firstname: "Nicolas"});
                node4 = new Ext.data.Node({lastname: "Spencer", firstname: "Edward"});
                
                rootNode.appendChild(node4, node2, node3, node1);
                
                sortFn = jasmine.createSpy();
                sortFn.andCallFake(function(a, b){
                    if (a.attributes.lastname ==  b.attributes.lastname) {
                        return 0;
                    }
                    return (a.attributes.lastname < b.attributes.lastname) ? -1 : 1;
                });
                
                rootNode.sort(sortFn, fakeScope);
            });
            
            it("should sort the child by lastname with the correct function", function() {
                expect(rootNode.childNodes[0]).toEqual(node1);
                expect(rootNode.childNodes[1]).toEqual(node2);
                expect(rootNode.childNodes[2]).toEqual(node3);
                expect(rootNode.childNodes[3]).toEqual(node4);
            });
            
            it("should use the correct scope", function() {
                expect(sortFn.calls[0].object).toBe(fakeScope);
                expect(sortFn.calls[1].object).toBe(fakeScope);
                expect(sortFn.calls[2].object).toBe(fakeScope);
            });
            
        });
        
        describe("toString", function() {
            it("must return a string which containt node id", function() {
                expect(rootNode.toString()).toEqual("[Node root]");
            });
        });
    });
});
