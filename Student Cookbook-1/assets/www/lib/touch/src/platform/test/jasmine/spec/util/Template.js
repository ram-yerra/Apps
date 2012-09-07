describe("Ext.Template", function() {
    
    describe("instantiation", function() {
        var tpl;
        
        it("it should extend Object", function() {
            tpl = new Ext.Template("");
            expect(tpl.superclass()).toEqual(Object.prototype);
        });
        
        describe("configuration options", function() {
            it("should disableFormats by default", function() {
                tpl = new Ext.Template("");
                expect(tpl.disableFormats).toBe(false);
            });
        });
        
        it("should alias applyTemplate with apply", function() {
            tpl = new Ext.Template("");
            expect(tpl.apply).toEqual(tpl.applyTemplate);
        });
        
        it("should be able to compile immediately", function() {
            spyOn(Ext.Template.prototype, "compile").andCallThrough();
            
            tpl = new Ext.Template('<div class="compilable">{something}</div>', {compiled: true});
            
            expect(Ext.Template.prototype.compile).toHaveBeenCalled();
        });
        
        describe("constructor arguments", function() {
            describe("objects", function() {     
                it("should apply all object passed after first arguments to configuration", function() {
                    var o1 = {a: 1},
                        o2 = {a: 2},
                        o3 = {a: 3};
                        
                    spyOn(Ext, "apply");
                    
                    tpl = new Ext.Template("", o1, o2, o3); 

                    expect(Ext.apply.calls[1].args).toEqual([tpl, o1]);
                    expect(Ext.apply.calls[3].args).toEqual([tpl, o2]);
                    expect(Ext.apply.calls[5].args).toEqual([tpl, o3]);
                });
            });
            
            describe("strings", function() {
                it("should concat all strings passed as arguments", function() {
                    var s1 = 'a',
                        s2 = 'b',
                        s3 = 'c';
              
                    tpl = new Ext.Template(s1, s2, s3); 
                    
                    expect(tpl.html).toEqual(s1 + s2 + s3);                 
                });
            });        
        });
    });
    
    describe("methods", function() {
        var appliedArr,
            appliedObject,
            simpleTpl,
            complexTpl,
            rootEl,
            childEl,
            simpleTplEl,
            complexTplEl;
            
        beforeEach(function() {
            rootEl = Ext.getBody().createChild({cls: "foo", children: [{cls: "bar"}]});
            childEl = rootEl.first();
        
            simpleTpl = new Ext.Template('<div class="template">Hello {0}.</div>');
            appliedArr = ["world"];
            
            complexTpl = new Ext.Template([
                    '<div name="{id}">',
                        '<span class="{cls}">{name} {value:ellipsis(10)}</span>',
                    '</div>'
            ]);
            appliedObject = {id: "myid", cls: "myclass", name: "foo", value: "bar"};
            spyOn(Ext, "getDom").andCallThrough(); 
        });
    
        describe("append", function() {
            describe("with a simple template", function() {
                beforeEach(function() {
                    simpleTplEl = simpleTpl.append(rootEl, ["world"], true);
                });
                
                it("should append the new node the end of the specified element", function() {
                    expect(simpleTplEl).toEqual(rootEl.last());
                });
                
                it("should apply the supplied value to the template", function() {
                    expect(simpleTplEl.dom.innerHTML).toEqual('Hello world.');
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(rootEl);
                });                
            });
            
            describe("with a complex template", function() {
                beforeEach(function() {
                    complexTplEl = complexTpl.append(rootEl, appliedObject, true);
                });
                
                it("should append the new node the end of the specified element", function() {
                    expect(complexTplEl).toEqual(rootEl.last());
                });
                
                it("should apply the supplied value to the template", function() {
                    if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class=myclass>foo bar</SPAN>');
                    } else if (Ext.isIE9) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class="myclass">foo bar</SPAN>');  
                    } else {
                        expect(complexTplEl.dom.innerHTML).toEqual('<span class="myclass">foo bar</span>');
                    }
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(rootEl);
                });                
            });        
        });
        
        describe("apply", function() {
            describe("with a simple template", function() {
                it("should applies the supplied value an return an HTML fragments", function() {
                    expect(simpleTpl.apply(appliedArr)).toEqual('<div class="template">Hello world.</div>');
                 });    
            });
    
            describe("with a complex template", function() {
                it("should applies the supplied value an return an HTML fragments", function() {          
                    expect(complexTpl.apply(appliedObject)).toEqual('<div name="myid"><span class="myclass">foo bar</span></div>');
                 });    
            });
            
        });
    
        describe("insertAfter", function() {
            describe("with a simple template", function() {
                beforeEach(function() {
                    simpleTplEl = simpleTpl.insertAfter(childEl, ["world"], true);
                });
                
                it("should insert the new node after the specified element", function() {
                    expect(simpleTplEl).toEqual(childEl.next());
                });
                
                it("should apply the supplied value to the template", function() {
                    expect(simpleTplEl.dom.innerHTML).toEqual('Hello world.');
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(childEl);
                });
            });
    
            describe("with a complex template", function() {            
                beforeEach(function() {
                    complexTplEl = complexTpl.insertAfter(childEl, appliedObject, true);
                });
                
                it("should insert the new node after the specified element", function() {
                    expect(complexTplEl).toEqual(childEl.next());
                });
                
                it("should apply the supplied value to the template", function() {
                    if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class=myclass>foo bar</SPAN>');
                    } else if (Ext.isIE9) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class="myclass">foo bar</SPAN>');  
                    } else {
                        expect(complexTplEl.dom.innerHTML).toEqual('<span class="myclass">foo bar</span>');
                    }               
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(childEl);
                });
            });
        });
        
        describe("insertBefore", function() {
            describe("with a simple template", function() {            
                beforeEach(function() {
                    simpleTplEl = simpleTpl.insertBefore(childEl, ["world"], true);
                });
                
                it("should insert the new node before the specified element", function() {
                    expect(simpleTplEl).toEqual(childEl.prev());
                });
                
                it("should apply the supplied value to the template", function() {
                    expect(simpleTplEl.dom.innerHTML).toEqual('Hello world.');
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(childEl);
                });
            });
            
            describe("with a complex template", function() {            
                beforeEach(function() {
                    complexTplEl = complexTpl.insertBefore(childEl, appliedObject, true);
                });
                
                it("should insert the new node before the specified element", function() {
                    expect(complexTplEl).toEqual(childEl.prev());
                });
                
                it("should apply the supplied value to the template", function() {
                    if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class=myclass>foo bar</SPAN>');
                    } else if (Ext.isIE9) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class="myclass">foo bar</SPAN>');  
                    } else {
                        expect(complexTplEl.dom.innerHTML).toEqual('<span class="myclass">foo bar</span>');
                    }
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(childEl);
                });
            });
        });
        
        describe("insertFirst", function() {
            describe("with a simple template", function() {
                beforeEach(function() {
                    simpleTplEl = simpleTpl.insertFirst(rootEl, ["world"], true);
                });
                
                it("should insert the new node as first child of the specified element", function() {
                    expect(simpleTplEl).toEqual(rootEl.first());
                });
                
                it("should apply the supplied value to the template", function() {
                    expect(simpleTplEl.dom.innerHTML).toEqual('Hello world.');
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(rootEl);
                });
            });
            
            describe("with a complex template", function() {
                beforeEach(function() {
                    complexTplEl = complexTpl.insertFirst(rootEl, appliedObject, true);
                });
                
                it("should insert the new node as first child of the specified element", function() {
                    expect(complexTplEl).toEqual(rootEl.first());
                });
                
                it("should apply the supplied value to the template", function() {
                    if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class=myclass>foo bar</SPAN>');
                    } else if (Ext.isIE9) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class="myclass">foo bar</SPAN>');  
                    } else {
                        expect(complexTplEl.dom.innerHTML).toEqual('<span class="myclass">foo bar</span>');
                    }
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(rootEl);
                });
            });
        });
        
        describe("overwrite", function() {
            describe("with a simple template", function() {            
                beforeEach(function() {
                    simpleTplEl = simpleTpl.overwrite(rootEl, ["world"], true);
                });
                
                it("should overrride the content of the specified element", function() {
                    expect(simpleTplEl).toEqual(rootEl.first());
                    expect(simpleTplEl).toEqual(rootEl.last());
                });
                
                it("should apply the supplied value to the template", function() {
                    expect(simpleTplEl.dom.innerHTML).toEqual('Hello world.');
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(rootEl);
                });
            });
            
            describe("with a complex template", function() {            
                beforeEach(function() {
                    complexTplEl = complexTpl.overwrite(rootEl, appliedObject, true);
                });
                
                it("should overrride the content of the specified element", function() {
                    expect(complexTplEl).toEqual(rootEl.first());
                    expect(complexTplEl).toEqual(rootEl.last());
                });
                
                it("should apply the supplied value to the template", function() {
                    if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class=myclass>foo bar</SPAN>');
                    } else if (Ext.isIE9) {
                        expect(complexTplEl.dom.innerHTML).toEqual('<SPAN class="myclass">foo bar</SPAN>');  
                    } else {
                        expect(complexTplEl.dom.innerHTML).toEqual('<span class="myclass">foo bar</span>');
                    }
                });
                
                it("should call Ext.getDom", function() {
                    expect(Ext.getDom).toHaveBeenCalledWith(rootEl);
                });
            });
        });
        
        describe("set", function() {
            var tplString = '<div class="template">Good bye {0}.</div>';
           
            it("should set the HTML used as the template", function() {
                 simpleTpl.set(tplString);
                 
                 expect(simpleTpl.apply(["world"])).toEqual('<div class="template">Good bye world.</div>');
            });
           
            it("should be able to compile the template", function() {
                simpleTpl.set(tplString, true);
                
                expect(typeof simpleTpl.compiled === "function").toBe(true);
            });
        });
    
        describe("compile", function() {
            it("should call compiled function", function() {
                complexTpl.compile();
                
                spyOn(complexTpl, "compiled");

                complexTpl.apply(appliedObject);
                
                expect(complexTpl.compiled).toHaveBeenCalledWith(appliedObject);
            });
            
            it("should return the same value as if it was'nt compiled with a complex template", function() {
                var htmlWithNotCompiledTemplate,
                    htmlWithCompiledTemplate;
                    
                htmlWithNotCompiledTemplate = complexTpl.apply(appliedObject);
                complexTpl.compile();
                htmlWithCompiledTemplate = complexTpl.apply(appliedObject);
                
                expect(htmlWithCompiledTemplate).toEqual(htmlWithNotCompiledTemplate);
            });
            
            it("should return the same value as if it was'nt compiled with a simple template", function() {
                var htmlWithNotCompiledTemplate,
                    htmlWithCompiledTemplate;
                    
                htmlWithNotCompiledTemplate = simpleTpl.apply(appliedArr);
                simpleTpl.compile();
                htmlWithCompiledTemplate = simpleTpl.apply(appliedArr);
                
                expect(htmlWithCompiledTemplate).toEqual(htmlWithNotCompiledTemplate);
            });
            
            it("should return the template itself", function() {
                expect(simpleTpl.compile()).toEqual(simpleTpl);
            });
            
        });
    });
    
    describe("formats", function() {
        var tpl,
            ellipsisSpy,
            htmlEncodeSpy,
            appliedObject;
            
        beforeEach(function() {
            appliedObject = {a: "123", b: "456789"};
            
            ellipsisSpy = spyOn(Ext.util.Format, "ellipsis");
            htmlEncodeSpy = spyOn(Ext.util.Format, "htmlEncode");
        });
            
        describe("enabled", function() {
            beforeEach(function() {
                tpl = new Ext.Template(
                    '{a:ellipsis(2)}',
                    '{b:htmlEncode}'
                );    
            });
            
            it("should call Ext.util.Format.ellipsis with a non compiled template", function() {
                tpl.apply(appliedObject);

                expect(ellipsisSpy).toHaveBeenCalledWith(appliedObject.a, 2); 
                expect(htmlEncodeSpy).toHaveBeenCalledWith(appliedObject.b);
            });
            
            it("should call Ext.util.Format.ellipsis with compiled template", function() {
                tpl.compile();
                tpl.apply(appliedObject);
                
                expect(ellipsisSpy).toHaveBeenCalledWith(appliedObject.a, 2);
                expect(htmlEncodeSpy).toHaveBeenCalledWith(appliedObject.b);
            });
        });
  
        describe("disabled", function() {
            beforeEach(function() {
                tpl = new Ext.Template(
                    '{a:ellipsis(2)}',
                    {disableFormats: true}
                );
            });
        
            it("should not call Ext.util.Format.ellipsis with a non compiled template", function() {
                tpl.apply(appliedObject);
                
                expect(ellipsisSpy).not.toHaveBeenCalled();
            });
            
            it("should not call Ext.util.Format.ellipsis with compiled template", function() {
                tpl.compile();
                tpl.apply(appliedObject);
                
                expect(ellipsisSpy).not.toHaveBeenCalled();
            });
        });
    });
    
    describe("members functions", function() {
        var tpl,
            memberFn,
            appliedObject;
            
        beforeEach(function() {
            memberFn = jasmine.createSpy().andCallFake(function(a, inc) {
                return a + inc;
            });
            
            tpl = new Ext.Template(
                '{a:this.increment(7)}',
                {increment: memberFn}
            );
            
            appliedObject = {a: 1};
        });
        
        it("should call members functions with a non compiled template", function() {
            tpl.apply(appliedObject);
            expect(memberFn).toHaveBeenCalledWith(1, 7);
        });
        
        it("should call members functions with a compiled template", function() {
            tpl.compile();
            tpl.apply(appliedObject);
            expect(memberFn).toHaveBeenCalledWith(1, 7);
        });

        it("should add member function in initialConfig", function() {
            expect(tpl.initialConfig).toEqual({increment: memberFn});
        });
    });
    
    describe("Ext.Template.from", function() {
        var elWithHtml, elWithValue;
        
        beforeEach(function() {
            elWithHtml =  Ext.getBody().createChild({tag: "div", html:"FOO {0}."});
            elWithValue =  Ext.getBody().createChild({tag: "input"});
            elWithValue.dom.value = "BAR {0}.";
            
        });
        
        it("should create a template with dom element innerHTML", function() {
            var tpl = Ext.Template.from(elWithHtml);
            
            expect(tpl.apply(['BAR'])).toEqual('FOO BAR.');
        });
        
        it("should create a template with dom element value", function() {
            var tpl = Ext.Template.from(elWithValue);
            
            expect(tpl.apply(['FOO'])).toEqual('BAR FOO.');
        });
    });
});
