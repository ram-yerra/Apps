describe("Ext.util.Route", function() {
    var route;
    
    describe("a route with no wildcards", function() {
        beforeEach(function() {
            route = new Ext.util.Route({
                url       : 'some/url',
                controller: 'myController',
                action    : 'myAction'
            });
        });
        
        it("should recognize an exactly matching url", function() {
            expect(route.recognize('some/url')).toBeTruthy();
        });
        
        it("should return the correct params", function() {
            var res = route.recognize('some/url');
            
            expect(res.controller).toEqual('myController');
            expect(res.action).toEqual('myAction');
        });
        
        it("should not recognize a non-matching url", function() {
            expect(route.recognize('not/the/right/route')).toBeFalsy();
        });
        
        it("should return the historyUrl associated with the route", function() {
            var match = route.recognize('some/url');
            
            expect(match.historyUrl).toEqual('some/url');
        });
    });
    
    describe("a route with wildcards", function() {
        beforeEach(function() {
            route = new Ext.util.Route({
                url   : ':controller/show/:id',
                action: 'show'
            });
        });
        
        it("should recognize a url with wildcard segments", function() {
            expect(route.recognize('projects/show/1')).toBeTruthy();
        });
        
        it("should extract the correct controller and action", function() {
            var result = route.recognize('projects/show/1');
            
            expect(result.controller).toEqual('projects');
            expect(result.action).toEqual('show');
            expect(result.id).toEqual('1');
        });
        
        it("should not recognize a non-matching url", function() {
            expect(route.recognize('some/bad/url')).toBeFalsy();
        });
    });
    
    describe("finding matches", function() {
        beforeEach(function() {
            route = new Ext.util.Route({
                url: ':controller/:action'
            });
        });
        
        it("should return the correct matches", function() {
            var result = route.matchesFor("myController/myAction");
            
            expect(result.controller).toEqual("myController");
            expect(result.action).toEqual("myAction");
        });
    });
    
    describe("a route with conditions", function() {
        beforeEach(function() {
            route = new Ext.util.Route({
                url: ':controller/:action/:id',
                conditions: {
                    ':controller': "[a-z]+"
                }
            });
        });
        
        it("should match urls where conditions are met", function() {
            expect(route.recognize('lowercase/someAction/123')).toBeTruthy();
        });
        
        it("should not match urls where conditions are not met", function() {
            expect(route.recognize('NoTLowerCase/someAction/123')).toBeFalsy();
        });
    });
    
    describe("building URLs", function() {
        
    });
});