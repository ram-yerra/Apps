describe("Ext.util.Router", function() {
    var router;
    
    beforeEach(function() {
        router = new Ext.util.Router({
            defaults: {
                controller: 'myController',
                action    : 'myAction'
            }
        });
    });
    
    describe("setting up", function() {
        
    });
    
    describe("connecting routes", function() {
        it("should connect a simple route", function() {
            router.connect('some/url', {});
            
            expect(router.routes.length).toEqual(1);
        });
        
        it("should create a new Ext.util.Route", function() {
            router.connect('some/url', {});
            
            expect(router.routes[0] instanceof Ext.util.Route).toBe(true);
        });
        
        it("should pass in additional params", function() {
            router.connect('some/url', {controller: 'someController'});
            
            expect(router.routes[0].controller).toEqual('someController');
        });
        
        it("should apply defaults", function() {
            router.connect('some/url', {});
            
            var route = router.routes[0];
            
            expect(route.controller).toEqual('myController');
            expect(route.action).toEqual('myAction');
        });
        
        it("should return the new Route object", function() {
            var route = router.connect('some/url', {});
            
            expect(route instanceof Ext.util.Route).toBe(true);
        });
        
        describe("named routes", function() {
            it("should be accessible by name", function() {
                
            });
        });
    });
    
    describe("recognizing routes", function() {
        it("should allow additional params to be passed", function() {
            
        });
        
        describe("without matchers", function() {
            var match;
            
            beforeEach(function() {
                router.connect('some/url', {controller: 'myController', action: 'index'});
            });
            
            it("should not recognize a url that has not been configured", function() {
                match = router.recognize('this/is/not/a/real/url');
                
                expect(match).toBeUndefined();
            });
            
            it("should recognize a configured url", function() {
                match = router.recognize('some/url');
                
                expect(match.controller).toEqual('myController');
                expect(match.action).toEqual('index');
            });
        });
        
        describe("with matchers", function() {
            
        });
        
        describe("when several routes match", function() {
            xit("should return the first matching route", function() {
                var route1 = router.connect('projects/:action/:id'),
                    route2 = router.connect(':controller/:action/:id'),
                    url    = 'projects/show/123',
                    result = router.recognize(url);
                
                expect(result.controller).toEqual(route1);
            });
        });
    });
});

// Ext.redirect(Ext.pathFor(project, 'builds')); //projects/1/builds
// 
// Ext.redirect(Ext.pathFor('new_project'));
// 
// Ext.util.Router.draw(function(map) {
//     map.resources('Project', function(p) {
//         p.resources('Build');
//     });
//     
//     map.connect('projects',          {controller: 'projects', action: 'index'});
//     map.connect('projects/new',      {controller: 'projects', action: 'build'});
//     map.connect('projects/:id',      {controller: 'projects', action: 'show'});
//     map.connect('projects/:id/edit', {controller: 'projects', action: 'edit'});
//     
//     
//     map.named('new_project', 'projects/new', {controller: 'projects', action: 'build'});
//     
//     
//     map.connect(':controller/:action/:id');
//     map.connect(':controller/:action');
// });