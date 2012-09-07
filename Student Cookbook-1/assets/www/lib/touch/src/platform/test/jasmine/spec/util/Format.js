describe("Ext.util.Format", function() {
    var Format = Ext.util.Format;
    
    describe("ellipsis", function() {
        var shortString = "A short string",
            longString  = "A somewhat longer string";
        
        it("should keep short strings intact", function() {
            expect(Format.ellipsis(shortString, 100)).toEqual(shortString);
        });
        
        it("should truncate a longer string", function() {
            expect(Format.ellipsis(longString, 10)).toEqual("A somew...");
        });
        
        describe("word break", function() {
            var longStringWithDot  = "www.sencha.com",
                longStringWithExclamationMark = "Yeah!Yeah!Yeah!",
                longStringWithQuestionMark = "Who?When?What?";
                           
            it("should find a word break on ' '", function() {
                expect(Format.ellipsis(longString, 10, true)).toEqual("A...");
            });      
            
            it("should be able to break on '.'", function() {
                expect(Format.ellipsis(longStringWithDot, 9, true)).toEqual("www...");
            });  
            
            it("should be able to break on '!'", function() {
                expect(Format.ellipsis(longStringWithExclamationMark, 9, true)).toEqual("Yeah...");
            }); 
            
            it("should be able to break on '?'", function() {
                expect(Format.ellipsis(longStringWithQuestionMark, 8, true)).toEqual("Who...");
            });       
        });
    });
    
    describe("escapeRegex", function() {
        var str;
        
        it("should escape minus", function() {
            str = "12 - 175";
            
            expect(Format.escapeRegex(str)).toEqual("12 \\- 175");
        });
        
        it("should escape dot", function() {
            str = "Brian is in the kitchen.";
            
            expect(Format.escapeRegex(str)).toEqual("Brian is in the kitchen\\.");
        });
        
        it("should escape asterisk", function() {
            str = "12 * 175";
            
            expect(Format.escapeRegex(str)).toEqual("12 \\* 175");
        });
        
        it("should escape plus", function() {
            str = "12 + 175";
            
            expect(Format.escapeRegex(str)).toEqual("12 \\+ 175");
        });
        
        it("should escape question mark", function() {
            str = "What else ?";
            
            expect(Format.escapeRegex(str)).toEqual("What else \\?");
        });
        
        it("should escape caret", function() {
            str = "^^";
            
            expect(Format.escapeRegex(str)).toEqual("\\^\\^");
        });
        
        it("should escape dollar", function() {
            str = "500$";
            
            expect(Format.escapeRegex(str)).toEqual("500\\$");
        });
        
        it("should escape open brace", function() {
            str = "something{stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\{stupid");
        });
        
        it("should escape close brace", function() {
            str = "something}stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\}stupid");
        });
        
        it("should escape open bracket", function() {
            str = "something[stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\[stupid");
        });
        
        it("should escape close bracket", function() {
            str = "something]stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\]stupid");
        });
        
        it("should escape open parenthesis", function() {
            str = "something(stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\(stupid");
        });
        
        it("should escape close parenthesis", function() {
            str = "something)stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\)stupid");
        });
        
        it("should escape vertival bar", function() {
            str = "something|stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\|stupid");
        });
        
        it("should escape forward slash", function() {
            str = "something/stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\/stupid");
        });
        
        it("should escape backslash", function() {
            str = "something\\stupid";
            
            expect(Format.escapeRegex(str)).toEqual("something\\\\stupid");
        });
    });
    
    describe("htmlEncode", function() {
        var str;
        
        it("should replace ampersands", function() {
            str = "Fish & Chips";
            
            expect(Format.htmlEncode(str)).toEqual("Fish &amp; Chips");
        });
        
        it("should replace less than", function() {
            str = "Fish > Chips";
            
            expect(Format.htmlEncode(str)).toEqual("Fish &gt; Chips");
        });
        
        it("should replace greater than", function() {
            str = "Fish < Chips";
            
            expect(Format.htmlEncode(str)).toEqual("Fish &lt; Chips");
        });
        
        it("should replace double quote", function() {
            str = 'Fish " Chips';
            
            expect(Format.htmlEncode(str)).toEqual("Fish &quot; Chips");
        });
    });
    
    describe("htmlDecode", function() {
        var str;
        
        it("should replace ampersands", function() {
            str = "Fish &amp; Chips";
            
            expect(Format.htmlDecode(str)).toEqual("Fish & Chips");
        });
        
        it("should replace less than", function() {
            str = "Fish &gt; Chips";
            
            expect(Format.htmlDecode(str)).toEqual("Fish > Chips");
        });
        
        it("should replace greater than", function() {
            str = "Fish &lt; Chips";
            
            expect(Format.htmlDecode(str)).toEqual("Fish < Chips");
        });
        
        it("should replace double quote", function() {
            str = 'Fish &quot; Chips';
            
            expect(Format.htmlDecode(str)).toEqual('Fish " Chips');
        });
    });
    
    describe("escaping", function() {
        it("should leave an empty string alone", function() {
            expect(Format.escape('')).toEqual('');
        });
        
        it("should leave a non-empty string without escapable characters alone", function() {
            expect(Format.escape('Ed')).toEqual('Ed');
        });
        
        it("should correctly escape a double backslash", function() {
            expect(Format.escape("\\")).toEqual("\\\\");
        });
        
        it("should correctly escape a single backslash", function() {
            expect(Format.escape('\'')).toEqual('\\\'');
        });
        
        it("should correctly escape a mixture of escape and non-escape characters", function() {
            expect(Format.escape('\'foo\\')).toEqual('\\\'foo\\\\');
        });
    });
    
    describe("formatting", function() {
        it("should leave a string without format parameters alone", function() {
            expect(Format.format('Ed')).toEqual('Ed');
        });
        
        it("should ignore arguments that don't map to format params", function() {
            expect(Format.format("{0} person", 1, 123)).toEqual("1 person");
        });
        
        it("should accept several format parameters", function() {
            expect(Format.format("{0} person {1}", 1, 'came')).toEqual('1 person came');
        });
    });
    
    describe("leftPad", function() {
        it("should pad the left side of an empty string", function() {
            expect(Format.leftPad("", 5)).toEqual("     ");
        });
        
        it("should pad the left side of a non-empty string", function() {
            expect(Format.leftPad("Ed", 5)).toEqual("   Ed");
        });
        
        it("should not pad a string where the character count already exceeds the pad count", function() {
            expect(Format.leftPad("Abraham", 5)).toEqual("Abraham");
        });
        
        it("should allow a custom padding character", function() {
            expect(Format.leftPad("Ed", 5, "0")).toEqual("000Ed");
        });
    });
    
    describe("when toggling between two values", function() {
        it("should use the first toggle value if the string is not already one of the toggle values", function() {
            expect(Format.toggle("Aaron", "Ed", "Abe")).toEqual("Ed");
        });
        
        it("should toggle to the second toggle value if the string is currently the first", function() {
            expect(Format.toggle("Ed", "Ed", "Abe")).toEqual("Abe");
        });
        
        it("should toggle to the first toggle value if the string is currently the second", function() {
            expect(Format.toggle("Abe", "Ed", "Abe")).toEqual("Ed");
        });
    });
    
    describe("trimming", function() {
        it("should not modify an empty string", function() {
            expect(Format.trim("")).toEqual("");
        });
        
        it("should not modify a string with no whitespace", function() {
            expect(Format.trim("Abe")).toEqual("Abe");
        });
        
        it("should trim a whitespace-only string", function() {
            expect(Format.trim("     ")).toEqual("");
        });
        
        it("should trim leading whitespace", function() {
            expect(Format.trim("  Ed")).toEqual("Ed");
        });
        
        it("should trim trailing whitespace", function() {
            expect(Format.trim("Ed   ")).toEqual("Ed");
        });
        
        it("should trim leading and trailing whitespace", function() {
            expect(Format.trim("   Ed  ")).toEqual("Ed");
        });
        
        it("should not trim whitespace between words", function() {
            expect(Format.trim("Fish and chips")).toEqual("Fish and chips");
            expect(Format.trim("   Fish and chips  ")).toEqual("Fish and chips");
        });
        
        it("should trim tabs", function() {
            expect(Format.trim("\tEd")).toEqual("Ed");
        });
        
        it("should trim a mixture of tabs and whitespace", function() {
            expect(Format.trim("\tEd   ")).toEqual("Ed");
        });
    });
});
