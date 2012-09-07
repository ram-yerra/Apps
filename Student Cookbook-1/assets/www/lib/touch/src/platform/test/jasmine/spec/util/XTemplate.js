describe("Ext.XTemplate", function() {
    var tpl, 
        data;
   
        beforeEach(function() {
            data = {
                name: "Nicolas Ferrero",
                title: "Developer",
                company: "Sencha",
                email: "nico@sencha.com",
                address: "10 Rue St Ferreol",
                city: "Toulouse",
                country: "France",
                zip: "31000",
                drinks: ["Wine", "Coffee", "Corona"],
                something: {
                    name: "root",
                    child : {
                        name: "child"
                    }
                },
                kids: [{
                    name: "Joshua",
                    age:3
                },{
                    name: "Nina",
                    age:2
                },{
                    name: "Solomon",
                    age:0
                }],
                computers: [{
                    cpu: "2Ghz",
                    hdd: "1To"
                },{
                    cpu: "100Mhz",
                    hdd: "500Mo"
                }]
            };
        });
    
    describe("instantiation", function() {
        it("should extend Ext.Template", function() {
            tpl = new Ext.XTemplate("");
           
            expect(tpl.superclass()).toEqual(Ext.Template.prototype);
        });
        
        it("should alias applyTemplate with apply", function() {
            tpl = new Ext.XTemplate("");
            
            expect(tpl.apply).toEqual(tpl.applyTemplate);
        });
        
        it("should be able to compile immediately", function() {
            var compileSpy = spyOn(Ext.XTemplate.prototype, "compile").andCallThrough();
            
            tpl = new Ext.XTemplate('<div class="compilable">{something}</div>', {compiled: true});
            
            expect(compileSpy).toHaveBeenCalled();
        }); 
    });
    
    describe("tags", function() { 
        describe("if", function() {
            it('should handle <tpl if=""> like <tpl>', function() {
                tpl = new Ext.XTemplate(
                    '<p>Kids: ',
                    '<tpl if="">',      
                    '<p>{name}</p>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data.kids)).toEqual('<p>Kids: <p></p></p>');
            }); 
        });       
        
        describe("for", function () {
            it('should examine the data object provided if for="." is specified (include array index test)', function() {
                tpl = new Ext.XTemplate(
                    '<p>Kids: ',
                    '<tpl for=".">',      
                    '<p>{#}. {name}</p>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data.kids)).toEqual('<p>Kids: <p>1. Joshua</p><p>2. Nina</p><p>3. Solomon</p></p>');
            });
 
            it('should handle <tpl for=""> like <tpl>', function() {
                tpl = new Ext.XTemplate(
                    '<p>Kids: ',
                    '<tpl for="">',      
                    '<p>{name}</p>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data.kids)).toEqual('<p>Kids: <p></p></p>');
            }); 
                      
            it('should examine the data of parent object if for=".." is specified', function() {
                 tpl = new Ext.XTemplate(
                    '<p>Computer: ',
                    '<tpl for="computers">',      
                        '<p>Cpu: {cpu} Hdd: {hdd}',
                            '<tpl for="..">',
                                ' User: {name}',
                            '</tpl>',
                        '</p>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data)).toEqual('<p>Computer: <p>Cpu: 2Ghz Hdd: 1To User: Nicolas Ferrero</p><p>Cpu: 100Mhz Hdd: 500Mo User: Nicolas Ferrero</p></p>');
            });
          
            it("should be able to access specified members of the provided data object (include array index test)", function() {
                tpl = new Ext.XTemplate(
                    '<p>Name: {name}</p>',
                    '<p>Title: {title}</p>',
                    '<p>Company: {company}</p>',
                    '<p>Kids: ',
                    '<tpl for="kids">',    
                        '<p>{#}. {name}</p>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data)).toEqual('<p>Name: Nicolas Ferrero</p><p>Title: Developer</p><p>Company: Sencha</p><p>Kids: <p>1. Joshua</p><p>2. Nina</p><p>3. Solomon</p></p>');
            });
            
            it("should be able to auto-render flat array content with special variable {.} (include array index test)", function() {
                tpl = new Ext.XTemplate(
                   '<p>{name}\'s favorite beverages:</p>',
                   '<tpl for="drinks">',
                      '<div>{#} - {.}</div>',
                   '</tpl>'
               );
               expect(tpl.apply(data)).toEqual("<p>Nicolas Ferrero's favorite beverages:</p><div>1 - Wine</div><div>2 - Coffee</div><div>3 - Corona</div>");            
            });
            
             it("should not fail if for try to handle an undefined variable.", function() {
                tpl = new Ext.XTemplate(
                   '<p>{name}\'s:</p>',
                   '<tpl for="nothing">',
                      '<div>{nothing1}</div>',
                   '</tpl>'
               );
               expect(tpl.apply(data)).toEqual("<p>Nicolas Ferrero's:</p>");            
            });
            
            it("should be able to access parent object member via the parent object", function() {
                tpl = new Ext.XTemplate(
                    '<p>Name: {name}</p>',
                    '<p>Kids: ',
                    '<tpl for="kids">',
                        '<tpl if="age &gt; 1">',
                            '<p>{name}</p>',
                            '<p>Dad: {parent.name}</p>',
                        '</tpl>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data)).toEqual("<p>Name: Nicolas Ferrero</p><p>Kids: <p>Joshua</p><p>Dad: Nicolas Ferrero</p><p>Nina</p><p>Dad: Nicolas Ferrero</p></p>");
            });
            
            it("should be able to access child object like a tree", function() {
                tpl = new Ext.XTemplate("{something.child.name}");
                expect(tpl.apply(data)).toEqual("child");
            });
        });
                        
        describe("exec", function() {
            it("should considerer that anything between {[ ... ]} is code to be executed in the scope of the template", function() {
                tpl = new Ext.XTemplate(
                    '<p>Name: {name}</p>',
                    '<p>Company: {[values.company.toUpperCase() + ", " + values.title]}</p>',
                    '<p>Kids: ',
                    '<tpl for="kids">',
                       '<div class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
                        '{[fm.ellipsis(values.name, 5)]}/{[xcount]}',
                        '</div>',
                    '</tpl></p>'
                );
                expect(tpl.apply(data)).toEqual('<p>Name: Nicolas Ferrero</p><p>Company: SENCHA, Developer</p><p>Kids: <div class="odd">Jo.../3</div><div class="even">Nina/3</div><div class="odd">So.../3</div></p>');
            });
        });
        
        it('should handle <tpl exec=""> like <tpl>', function() {
            tpl = new Ext.XTemplate(
                '<p>Kids: ',
                '<tpl exec="">',      
                '<p>{name}</p>',
                '</tpl></p>'
            );
            expect(tpl.apply(data.kids)).toEqual('<p>Kids: <p></p></p>');
        });    
             
        describe("execute code without producing any output with exec operator", function() {
            describe("simple exec operator", function() {
                beforeEach(function() {
                    tpl = new Ext.XTemplate(
                        '<tpl for="kids">',
                            '<tpl exec="this.spy(); return 1">',
                                '<p>{name}</p>',
                            '</tpl>',
                        '</tpl>', 
                        {
                            spy : jasmine.createSpy("tplMemberSpy")
                        });
                });
                
                it("should execute the code", function() {   
                    tpl.apply(data);
                    expect(tpl.spy.calls.length).toEqual(3);
                });
                
                it("should not interfere with output even if exec return a value", function() {
                    expect(tpl.apply(data)).toEqual('<p>Joshua</p><p>Nina</p><p>Solomon</p>');
                });            
            });
            
            describe("for and exec declared in the same tpl tag", function() {
                beforeEach(function() {
                    tpl = new Ext.XTemplate(
                        '<tpl for="kids" exec="this.spy(values, xindex, parent); return 1">',
                            '<p>{name}</p>',
                        '</tpl>', 
                        {
                            spy : jasmine.createSpy("tplMemberSpy")
                        });
                 
                });
                
                it("should execute code for each item in the array", function() {   
                    tpl.apply(data);
                    expect(tpl.spy.calls.length).toEqual(3);
                });

                it("should execute code for each item in the array", function() {   
                    tpl.apply(data);
                    expect(tpl.spy.calls.length).toEqual(3);
                });
                
                it("should be run for each item in the array with index of the loop you are in, values of the current scope, and scope of ancestor template", function() {   
                    tpl.apply(data);
                    expect(tpl.spy.calls[0].args).toEqual([data.kids[0], 1, data]);
                    expect(tpl.spy.calls[1].args).toEqual([data.kids[1], 2, data]);
                    expect(tpl.spy.calls[2].args).toEqual([data.kids[2], 3, data]);
                });
                                
                it("should not interfere with output even if exec return a value", function() {
                    expect(tpl.apply(data)).toEqual('<p>Joshua</p><p>Nina</p><p>Solomon</p>');
                });
            });
            
            describe("if and exec declared in the same tpl tag", function() {
                beforeEach(function() {
                    tpl = new Ext.XTemplate(
                        '<tpl for="kids">',
                            '<tpl if="name == \'Joshua\'" exec="this.inc++; return 1">',
                                '<p>{name}</p>',
                            '</tpl>',
                        '</tpl>', 
                        {
                            inc : 0
                        });
                 
                });
                
                it("should be run only if the if operator conditional checks is true", function() {   
                    tpl.apply(data);
                    expect(tpl.inc).toEqual(1);
                });
                
                it("should not interfere with output", function() {
                    expect(tpl.apply(data)).toEqual('<p>Joshua</p>');
                });
            });
        });
    });
    
    describe("template member functions", function() {
        var spy;
        beforeEach(function() {
            spy = jasmine.createSpy("membersArguments").andCallFake(function(value, suffix, limit) {
                return Ext.util.Format.ellipsis(value + ' ' + suffix, 13);
            });
            tpl = new Ext.XTemplate(
                '<p>{[this.addMr(values.name)]}</p>',
                '<p>Company: {company:this.spy("Incorporated", 10)}</p>',
                '<p>Title: {title:this.addJs()}</p>',
                '<p>Kids: ',
                '<tpl for="kids">',
                    '<tpl if="this.isGirl(name)">',
                        '<p>Girl: {name} - {age}</p>',
                    '</tpl>',
                    '<tpl if="this.isGirl(name) == false">',
                        '<p>Boy: {name} - {age}</p>',
                    '</tpl>',
                    '<tpl if="this.isBaby(age)">',
                        '<p>{name} is a baby!</p>',
                    '</tpl>',
                '</tpl></p>',
                {
                    addMr: function(name) {
                        return "Mr. " + name;  
                    },
                    addJs: function(title) {
                        return "Js " + title;  
                    },
                    isGirl: function(name) {
                        return name == 'Nina';
                    },
                    isBaby: function(age) {
                        return age < 1;
                    },
                    spy: spy
                }
            );
        });

        it("should call members functions using various methods", function() {
            expect(tpl.apply(data)).toEqual("<p>Mr. Nicolas Ferrero</p><p>Company: Sencha Inc...</p><p>Title: Js Developer</p><p>Kids: <p>Boy: Joshua - 3</p><p>Girl: Nina - 2</p><p>Boy: Solomon - 0</p><p>Solomon is a baby!</p></p>");                    
        });
        
        it("should call members format functions with passed arguments", function() {
            tpl.apply(data);
            expect(spy).toHaveBeenCalledWith(data.company, "Incorporated", 10);
        });
    });

    describe("basic math support", function() {
        it("should be able to apply basic math operators + -  * / on numeric data values", function() {
            tpl = new Ext.XTemplate(
                '<tpl for="kids">',
                '<p>{age + 5} {age - 7} {age * 3} {age / 2}</p>',
                '<p>{age + (5*2)}</p>',
                '</tpl>'
            );
            expect(tpl.apply(data)).toEqual("<p>8 -4 9 1.5</p><p>13</p><p>7 -5 6 1</p><p>12</p><p>5 -7 0 0</p><p>10</p>");
        });
    });
        
    describe("formats", function() {
        var ellipsisSpy,
            htmlEncodeSpy,
            appliedObject;
            
        beforeEach(function() {
            appliedObject = {a: "123", b: "456789"};
            
            ellipsisSpy = spyOn(Ext.util.Format, "ellipsis");
            htmlEncodeSpy = spyOn(Ext.util.Format, "htmlEncode");
        });
            
        describe("enabled", function() {
            beforeEach(function() {
                tpl = new Ext.XTemplate(
                    '{a:ellipsis(2)}',
                    '{b:htmlEncode}'
                );    
            });
            
            it("should call Ext.util.Format.ellipsis", function() {
                tpl.apply(appliedObject);

                expect(ellipsisSpy).toHaveBeenCalledWith(appliedObject.a, 2); 
                expect(htmlEncodeSpy).toHaveBeenCalledWith(appliedObject.b);
            });
            
        });
  
        describe("disabled", function() {
            beforeEach(function() {
                tpl = new Ext.XTemplate(
                    '{a:ellipsis(2)}',
                    {disableFormats: true}
                );
            });
        
            it("should not call Ext.util.Format.ellipsis", function() {
                tpl.apply(appliedObject);
                
                expect(ellipsisSpy).not.toHaveBeenCalled();
            });
        });
    });
    
    describe("Ext.XTemplate.from", function() {
        var elWithHtml, elWithValue;
        
        beforeEach(function() {
            elWithHtml =  Ext.getBody().createChild({tag: "div", html:"FOO {0}."});
            elWithValue =  Ext.getBody().createChild({tag: "input"});
            elWithValue.dom.value = "BAR {0}.";
        });
        
        it("should create a template with dom element innerHTML", function() {
            tpl = Ext.XTemplate.from(elWithHtml);
            
            expect(tpl.apply(['BAR'])).toEqual('FOO BAR.');
        });
        
        it("should create a template with dom element value", function() {
            tpl = Ext.XTemplate.from(elWithValue);
            
            expect(tpl.apply(['FOO'])).toEqual('BAR FOO.');
        });
    });
});
