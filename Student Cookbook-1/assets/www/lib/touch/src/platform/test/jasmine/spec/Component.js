describe("Ext.lib.Component", function(){
    var c, makeComponent;
    beforeEach(function(){
        makeComponent = function(cfg){
            c = new Ext.Component(cfg || {});
        }
    });
    
    afterEach(function(){
        if (c) {
            c.destroy();
        }
        c = makeComponent = null;
    });
    
    describe("ids", function(){
        it("should generate an id if one isn't specified", function(){
            makeComponent();
            expect(c.id).toBeDefined();
        });
        
        it("should use an id if one is specified", function(){
            makeComponent({
                id: 'foo'
            });
            expect(c.id).toEqual('foo');
        });
        
        it("should return the itemId if one exists", function(){
            makeComponent({
                itemId: 'a'
            });      
            expect(c.getItemId()).toEqual('a');
        });
        
        it("should fall back on the id if no itemId is specified", function(){
            makeComponent({
                id: 'foo'
            });
            expect(c.getItemId()).toEqual('foo');    
        });
        
        it("should give the itemId precedence", function(){
            makeComponent({
                id: 'foo',
                itemId: 'bar'
            });    
            expect(c.getItemId()).toEqual('bar');
        });
    });
    
    describe("registering with ComponentMgr", function(){
        it("should register itself upon creation", function(){
            makeComponent({
                id: 'foo'
            });
            expect(Ext.ComponentMgr.get('foo')).toEqual(c);    
        });  
        
        it("should unregister on destroy", function(){
            makeComponent({
                id: 'foo'
            });    
            c.destroy();
            expect(Ext.ComponentMgr.get('foo')).toBeUndefined();
        });
    });
    
    describe("xtypes",  function(){
        it("should work with a string", function(){
            makeComponent();
            expect(c.isXType('component')).toBeTruthy();   
        });    
        
        it("should work with an instance", function(){
            makeComponent();
            var other = new Ext.Component();
            expect(c.isXType(other)).toBeTruthy();
            other.destroy();    
        });
        
        it("should work with a class", function(){
            makeComponent();
            expect(c.isXType(Ext.Component)).toBeTruthy();    
        });
        
        it("should not match incorrectly", function(){
            makeComponent();
            expect(c.isXType('panel')).toBeFalsy();    
        });
        
        it("should match subclasses by default", function(){
            var ct = new Ext.Container();
            expect(ct.isXType('component')).toBeTruthy();
            ct.destroy();
        });
        
        it("should match exactly if shallow is true", function(){
            var ct = new Ext.Container();
            expect(ct.isXType('component', true)).toBeFalsy();
            ct.destroy();    
        });
    });
    
    describe("enable/disable", function(){
        
        describe("config", function(){
            it("should be enabled by default", function(){
                makeComponent();
                expect(c.isDisabled()).toBeFalsy();
            });
            
            it("should read the disabled config", function(){
                makeComponent({
                    disabled: true
                });
                expect(c.isDisabled()).toBeTruthy();
            });
        });
        
        describe("methods", function(){
        
            it("should enable when calling enable", function(){
                makeComponent({
                    disabled: true
                });
                c.enable();
                expect(c.isDisabled()).toBeFalsy();
            });
            
            it("should disable when calling disabled", function(){
                makeComponent();
                c.disable();
                expect(c.isDisabled()).toBeTruthy();
            });
            
            it("should set the appropriate state with setDisabled", function(){
                makeComponent();
                c.setDisabled(true);
                expect(c.isDisabled()).toBeTruthy();
                c.setDisabled(false);
                expect(c.isDisabled()).toBeFalsy();
            });
        });
        
        describe("events", function(){
            it("should fire the enable event", function(){
                makeComponent();
                var o = {
                    fn: Ext.emptyFn
                };
                spyOn(o, 'fn');
                c.on('enable', o.fn);
                c.enable();
                //expect(o.fn).toHaveBeenCalledWith(c);
                expect(o.fn).toHaveBeenCalled();
            });
            
            it("should fire the disable event", function(){
                makeComponent();
                var o = {
                    fn: Ext.emptyFn
                };
                spyOn(o, 'fn');
                c.on('disable', o.fn);
                c.disable();
                //expect(o.fn).toHaveBeenCalledWith(c);
                expect(o.fn).toHaveBeenCalled();
            });
            
            it("should not fire the enable event if silent is true", function(){
                makeComponent();
                var o = {
                    fn: Ext.emptyFn
                };
                spyOn(o, 'fn');
                c.on('enable', o.fn);
                c.enable(true);
                expect(o.fn).not.toHaveBeenCalled();
            });
            
            it("should not fire the disable event if silent is true", function(){
                makeComponent();
                var o = {
                    fn: Ext.emptyFn
                };
                spyOn(o, 'fn');
                c.on('disable', o.fn);
                c.enable(true);
                expect(o.fn).not.toHaveBeenCalled();
            });
        });
        
        describe("when rendered", function(){
            it("should not have the disabled class when it is enabled", function(){
                makeComponent({
                    renderTo: Ext.getBody()
                });
                expect(c.el.dom.className.indexOf(c.disabledCls)).toEqual(-1);
            });
            
            it("should have the disabled class when it is disabled", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    disabled: true
                });
                expect(c.el.dom.className.indexOf(c.disabledCls)).toNotEqual(-1);
            });
        });
    });
    
    describe("visibility", function(){
        //TODO: need to change show/hide to be testable
    });
    
    describe("rendering", function(){
    
        it("should set the rendered property  when it's rendered", function(){
            makeComponent();
            expect(c.rendered).toBeFalsy();
            c.render(Ext.getBody());
            expect(c.rendered).toBeTruthy();    
        });
    
        describe("renderTpl", function(){
            it("should not use any renderTpl by default", function(){
                makeComponent({
                    renderTo: Ext.getBody()
                });    
                expect(c.el.dom.firstChild).toBeNull();
            });
            
            it("should take a renderTpl", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    renderTpl: '<div><span>a</span></div>'
                });
                expect(c.el.dom.innerHTML).toEqual('<div><span>a</span></div>');
            });
        });
        
        describe("rendering to the dom", function(){
            it("should use the renderTo option", function(){
                var el = Ext.getBody().createChild();
                makeComponent({
                    renderTo: el
                });
                expect(el.dom.getElementsByTagName('div')[0]).toEqual(c.el.dom);
                Ext.removeNode(el);    
            });
            
            it("should not render if not explicitly told to", function(){
                var total = document.body.getElementsByTagName('div').length;
                makeComponent();
                expect(document.body.getElementsByTagName('div').length).toEqual(total);
            });
            
            it("should render to a specific element", function(){
                var el = Ext.getBody().createChild();    
                makeComponent();
                c.render(el);
                expect(el.dom.getElementsByTagName('div')[0]).toEqual(c.el.dom);
                Ext.removeNode(el);
            });
        });
        
        describe("content", function(){
            
            describe("initialization", function(){
                it("should accept an html string", function(){
                    makeComponent({
                        html: 'foo',
                        renderTo: Ext.getBody()
                    });    
                    expect(c.el.dom.innerHTML).toEqual('foo');
                });  
                
                it("should accept a markup config for html", function(){
                    makeComponent({
                        html: {
                            tag: 'span',
                            html: 'foo'
                        },
                        renderTo: document.body
                    });    
                    expect(c.el.dom.innerHTML).toEqual('<span>foo</span>');
                });
                
                it("should accept a contentEl", function(){
                    var div = Ext.getBody().createChild({
                        tag: 'div',
                        html: 'foo'
                    });
                    makeComponent({
                        contentEl: div,
                        renderTo: document.body
                    });
                    expect(c.el.dom.firstChild.innerHTML).toEqual('foo');
                    Ext.removeNode(div);
                });
                
                describe("tpl", function(){
                    
                    it("should accept a raw template", function(){
                        makeComponent({
                            renderTo: Ext.getBody(),
                            tpl: '{first} - {last}',
                            data: {
                                first: 'John',
                                last: 'Foo'
                            }
                        });    
                        expect(c.el.dom.innerHTML).toEqual('John - Foo');
                    });
                    
                    it("should take a template instance", function(){
                        makeComponent({
                            tpl: new Ext.XTemplate('{0} - {1}'),
                            data: [3, 7],
                            renderTo: Ext.getBody()
                        });    
                        expect(c.el.dom.innerHTML).toEqual('3 - 7');
                    });
                                        
                });
            }); 
            
            describe("before render", function(){
                it("should be able to change the html before render", function(){
                    makeComponent();
                    c.update('foo');
                    c.render(Ext.getBody());
                    expect(c.el.dom.innerHTML).toEqual('foo');    
                });  
                
                it("should be able to update the markup when not rendered", function(){
                    makeComponent();
                    c.update({
                        tag: 'span',
                        html: 'bar'
                    });    
                    c.render(Ext.getBody());
                    expect(c.el.dom.innerHTML).toEqual('<span>bar</span>');
                });
                
                it("should be able to change the data when not rendered", function(){
                    makeComponent({
                        tpl: '{a} - {b}'
                    });
                    c.update({
                        a: 'foo',
                        b: 'bar'
                    });
                    c.render(Ext.getBody());
                    expect(c.el.dom.innerHTML).toEqual('foo - bar');   
                });
            });   
            
            describe("after render", function(){
                it("should change the html after being rendered", function(){
                    makeComponent({
                        renderTo: Ext.getBody(),
                        html: 'foo'
                    });    
                    expect(c.el.dom.innerHTML).toEqual('foo');
                    c.update('bar');
                    expect(c.el.dom.innerHTML).toEqual('bar');
                });  
                
                it("should change markup if an html config is provided", function(){
                    makeComponent({
                        renderTo: Ext.getBody(),
                        html: {
                            tag: 'span',
                            html: '1'
                        }
                    });    
                    expect(c.el.dom.innerHTML).toEqual('<span>1</span>');
                    c.update({
                        tag: 'div',
                        html: '2'
                    });
                    expect(c.el.dom.innerHTML).toEqual('<div>2</div>');
                });
                
                it("should update tpl data", function(){
                    makeComponent({
                        renderTo: Ext.getBody(),
                        tpl: '{a} - {b}',
                        data: {
                            a: 'v1',
                            b: 'v2'
                        }
                    });
                    expect(c.el.dom.innerHTML).toEqual('v1 - v2');
                    c.update({
                        a: 'v3',
                        b: 'v4'
                    });
                    expect(c.el.dom.innerHTML).toEqual('v3 - v4');
                });
                
                it("should use the correct writeMode", function(){
                    makeComponent({
                        renderTo: Ext.getBody(),
                        tpl: '{a} - {b}',
                        tplWriteMode: 'append',
                        data: {
                            a: 'v1',
                            b: 'v2'
                        }
                    });    
                    expect(c.el.dom.innerHTML).toEqual('v1 - v2');
                    c.update({
                        a: 'v3',
                        b: 'v4'    
                    });
                    expect(c.el.dom.innerHTML).toEqual('v1 - v2v3 - v4');
                });
            });
        }); 
    });
    
    describe("addCls/removeCls", function(){
        it("should be able to add class when not rendered", function(){
            makeComponent();
            c.addCls('foo');
            c.render(Ext.getBody());
            expect(c.el.dom.className.indexOf('foo')).toNotEqual(-1);    
        });
        
        it("should add the class if the item is rendered", function(){
            makeComponent({
                renderTo: Ext.getBody()
            });    
            c.addCls('foo');
            expect(c.el.dom.className.indexOf('foo')).toNotEqual(-1);
        });  
        
        it("should be able to remove class when not rendered", function(){
            makeComponent({
                additionalCls: ['foo']
            });    
            c.removeCls('foo');
            c.render(Ext.getBody());
            expect(c.el.dom.className.indexOf('foo')).toEqual(-1);
        });
        
        it("should remove the class if the item is rendered", function(){
            makeComponent({
                renderTo: Ext.getBody(),
                additionalCls: ['foo']
            });    
            c.removeCls('foo');
            expect(c.el.dom.className.indexOf('foo')).toEqual(-1);
        });
    });
    
    describe("styling", function(){
        it("should apply the cls to the element", function(){
            makeComponent({
                renderTo: Ext.getBody(),
                cls: 'foo'
            });    
            expect(c.el.dom.className.indexOf('foo')).toNotEqual(-1);
        }); 
        
        it("should add the baseCls to the element", function(){
            makeComponent({
                renderTo: Ext.getBody()
            });    
            expect(c.el.dom.className.indexOf(c.baseCls)).toNotEqual(-1);
        });
        
        describe("style", function(){
            it("should accept a style string", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    style: 'background-color: red;'
                });
                expect(c.el.dom.style.backgroundColor).toMatch('^(red|#ff0000)$');
            });
            
            it("should accept a style config", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    style: {
                        color: 'red'
                    }
                });    
                expect(c.el.dom.style.color).toMatch('^(red|#ff0000)$');
            });
        });
        
        describe("padding", function(){
            it("should accept a single number", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    padding: 5
                });    
                var style = c.el.dom.style;
                expect(style.paddingTop).toEqual('5px');
                expect(style.paddingRight).toEqual('5px');
                expect(style.paddingBottom).toEqual('5px');
                expect(style.paddingLeft).toEqual('5px');
            });  
            
            it("should accept a css style string", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    padding: '1 2 3 4'
                });
                var style = c.el.dom.style;
                expect(style.paddingTop).toEqual('1px');
                expect(style.paddingRight).toEqual('2px');
                expect(style.paddingBottom).toEqual('3px');
                expect(style.paddingLeft).toEqual('4px');    
            });
        });
        
        describe("border", function(){
            it("should accept a single number", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    border: 6
                });    
                var style = c.el.dom.style;
                expect(style.borderTop).toEqual('6px');
                expect(style.borderRight).toEqual('6px');
                expect(style.borderBottom).toEqual('6px');
                expect(style.borderLeft).toEqual('6px');
            });  
            
            it("should accept a css style string", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    border: '9 8 7 6'
                });
                var style = c.el.dom.style;
                expect(style.borderTop).toEqual('9px');
                expect(style.borderRight).toEqual('8px');
                expect(style.borderBottom).toEqual('7px');
                expect(style.borderLeft).toEqual('6px');    
            });
        });
        
        describe("margin", function(){
            it("should accept a single number", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    margin: 1
                });    
                var style = c.el.dom.style;
                expect(style.marginTop).toEqual('1px');
                expect(style.marginRight).toEqual('1px');
                expect(style.marginBottom).toEqual('1px');
                expect(style.marginLeft).toEqual('1px');
            });  
            
            it("should accept a css style string", function(){
                makeComponent({
                    renderTo: Ext.getBody(),
                    margin: '4 5 6 7'
                });
                var style = c.el.dom.style;
                expect(style.marginTop).toEqual('4px');
                expect(style.marginRight).toEqual('5px');
                expect(style.marginBottom).toEqual('6px');
                expect(style.marginLeft).toEqual('7px');    
            });
        });
        
        it("should add the styleHtml class when styleHtmlContent iss set to true", function(){
            makeComponent({
                renderTo: Ext.getBody(),
                styleHtmlContent: true
            });    
            expect(c.el.dom.className.indexOf(c.styleHtmlCls)).toNotEqual(-1);
        });
    });
    
    describe("plugins", function(){
        var Plugin;
        beforeEach(function(){
            Plugin = Ext.extend(Object, {
                
                constructor: function(cfg){
                    this.marked = (cfg || {}).marked;
                },
                
                init: function(c){
                    c.marked = this.marked || true;
                }    
            });
            Ext.preg('myplug', Plugin);
        }); 
        
        afterEach(function(){
            delete Ext.PluginMgr.types.myplug;
            Plugin = null;
        });   
        
        it("should accept a single plugin", function(){
            var p = new Plugin();
            spyOn(p, 'init');
            makeComponent({
                plugins: p
            });    
            expect(p.init).toHaveBeenCalledWith(c);
        });
        
        it("should accept an array of plugins", function(){
            var p1 = new Plugin(),
                p2 = new Plugin(),
                p3 = new Plugin();
                
            spyOn(p1, 'init');
            spyOn(p2, 'init');
            spyOn(p3, 'init');
            
            makeComponent({
                plugins: [p1, p2, p3]
            });    
            expect(p1.init).toHaveBeenCalledWith(c);
            expect(p2.init).toHaveBeenCalledWith(c);
            expect(p3.init).toHaveBeenCalledWith(c);
        });
        
        it("should be able to create string plugins", function(){
            makeComponent({
                plugins: 'myplug'
            });
            expect(c.marked).toBeTruthy();
        });
        
        it("should be able to create config object plugins", function(){
            makeComponent({
                plugins: {
                    ptype: 'myplug',
                    marked: 'foo'
                }
            });        
            expect(c.marked).toEqual('foo');
        });
    });
    
    describe("destruction", function(){
        
    });
    
});
