describe("jasmine.CodeHighLighter", function() {
    var codeHighLighter;

    beforeEach(function() {
        codeHighLighter = new jasmine.CodeHighLighter({});
    });

    describe("beautifier", function() {
        var beautify = function(source) {
            codeHighLighter.source = source;
            codeHighLighter.prepareIndent();
            codeHighLighter.doIndent();
            return codeHighLighter.source;
        },
        test = function(expected, actual) {
            expect(beautify(expected)).toEqual(actual);
        };
        
        it("should crop n whitespaces", function() {
            test('foo        =          1', 'foo = 1');
        });

        it("should indent if", function() {
            test('if (1) {2} else {3}', "if (1) {\n    2\n}\nelse {\n    3\n}");
        });
        
        it("should beautify array", function() {
            test("var bar = [1,2,3];", "var bar = [\n    1,\n    2,\n    3\n];");
        });

        it("should beautify objects", function() {
            test("var bar = {a:1,b:2,c:3};", "var bar = {\n    a:1,\n    b:2,\n    c:3\n};");
        });

        it("should beautify functions", function() {
            test("function(a,b,c){var foo = 'bar'; return foo;};", "function(a,b,c){\n    var foo = 'bar';\n    return foo;\n};");
        });

        it("should indent nested object", function() {
            test("var bar = {1:'foo',{2:'foo',3:'foo'},4:'foo'};", "var bar = {\n    1:'foo', {\n        2:'foo',\n        3:'foo'\n    },\n    4:'foo'\n};");
        });

        it("should indent nested array", function() {
            test("var bar = [1,[2,3],4];", "var bar = [\n    1,\n    [\n        2,\n        3\n    ],\n    4\n];");
        });
    });

    describe("code highlighter", function() {
        var process = function(source) {
            codeHighLighter.source = source;
            return codeHighLighter.process();
        },
        test = function(expected, type) {
            expect(process(expected)).toEqual('<span class="jsHl' + type + '">' + expected + '</span>');
        };
        
        describe("keywords", function() {
            it("should highlight break", function() {
                test("break", "Keyword");
            });
            
            it("should highlight case", function() {
                test("case", "Keyword");
            });
            
            it("should highlight catch", function() {
                test("catch", "Keyword");
            });
            
            it("should highlight continue", function() {
                test("continue", "Keyword");
            });
            
            it("should highlight default", function() {
                test("default", "Keyword");
            });
            
            it("should highlight delete", function() {
                test("delete", "Keyword");
            });
            
            it("should highlight do", function() {
                test("do", "Keyword");
            });
            
            it("should highlight else", function() {
                test("else", "Keyword");
            });
            
            it("should highlight false", function() {
                test("false", "Keyword");
            });
            
            it("should highlight for", function() {
                test("for", "Keyword");
            });
            
            it("should highlight function", function() {
                test("function", "Keyword");
            });
            
            it("should highlight if", function() {
                test("if", "Keyword");
            });
            
            it("should highlight in", function() {
                test("in", "Keyword");
            });
            
            it("should highlight instanceof", function() {
                test("instanceof", "Keyword");
            });

            it("should highlight new", function() {
                test("new", "Keyword");
            });            

            it("should highlight null", function() {
                test("null", "Keyword");
            });            

            it("should highlight return", function() {
                test("return", "Keyword");
            });            

            it("should highlight switch", function() {
                test("switch", "Keyword");
            });            

            it("should highlight this", function() {
                test("this", "Keyword");
            });

            it("should highlight throw", function() {
                test("throw", "Keyword");
            }); 

            it("should highlight true", function() {
                test("true", "Keyword");
            });

            it("should highlight try", function() {
                test("try", "Keyword");
            });

            it("should highlight typeof", function() {
                test("typeof", "Keyword");
            }); 

            it("should highlight var", function() {
                test("var", "Keyword");
            });

            it("should highlight while", function() {
                test("while", "Keyword");
            }); 

            it("should highlight with", function() {
                test("with", "Keyword");
            }); 
        });

        describe("operators", function() {
            it("should highlight +", function() {
                test("+", "Operator");
            });
            
            it("should highlight +", function() {
                test("+", "Operator");
            });
            
            it("should highlight -", function() {
                test("-", "Operator");
            });
            
            it("should highlight *", function() {
                test("*", "Operator");
            });
            
            it("should highlight /", function() {
                test("/", "Operator");
            });
            
            it("should highlight =", function() {
                test("=", "Operator");
            });

            it("should highlight ?", function() {
                test("?", "Operator");
            });

            it("should highlight =", function() {
                test("!", "Operator");
            });

            it("should highlight ++", function() {
                test("++", "Operator");
            });

            it("should highlight --", function() {
                test("--", "Operator");
            });    
        });
        
        it("should highlight numbers", function() {
            test("1", "Number");
        });

        describe("strings", function() {
            it("should highlight simple quoted strings", function() {
                test("'aaaa'", "String");
            });

            it("should highlight double quoted strings", function() {
                test("\"aaaa\"", "String");
            });

            it("should highlight multilines simple quoted strings", function() {
                test("'aaaa\\\neeeeeee'", "String");
            });

            it("should highlight multilines double quoted strings", function() {
                test("'aaaa\\\neeeeeee'", "String");
            });

            it("should highlight strings with // inside", function() {
                test("'http://'", "String");
            });

            it("should highlight strings with /* */ inside", function() {
                test("'/* string: \"oooo\" */'", "String");
            });
        });

        describe("comments", function() {
            it("should highlight simple double-backslash comments", function() {
                test("// foo", "Comment");
            });

            it("should highlight simple /* */ comments", function() {
                test("/* foo */", "Comment");
            });

            it("should highlight multilines /* */ comments", function() {
                test("/* foo\n bar\n */", "Comment");
            });

            it("should highlight comments with strings inside", function() {
                test("/* 'aaa' */", "Comment");
            });
            
            it("should highlight comments with simple quote inside", function() {
                test("/* let's go */", "Comment");
            });
            
            it("should highlight comments with double quote inside", function() {
                test('/*  1 "2 */', "Comment");
            });
        });

    });
});
