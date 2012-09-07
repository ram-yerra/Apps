describe("The Dispatcher", function() {
    var dispatcher = Ext.Dispatcher;

    var mockController = {
        someAction: Ext.emptyFn
    };

    var interaction = {
        controller: mockController,
        action    : 'someAction'
    };

    var options = {
        controller: 'someController',
        action    : 'someAction',
        historyUrl: 'someUrl'
    };

    describe("when dispatching", function() {
        beforeEach(function() {
            Ext.History = {
                add: function() {},
                suspendEvents: function() {},
                resumeEvents: function() {}
            };
            spyOn(Ext.History, 'add').andCallThrough();
            spyOn(Ext.Dispatcher, 'fireEvent').andCallThrough();
        });

        afterEach(function() {
            delete Ext.History;
        });

        it("should create a new Interaction with the correct options", function() {
            Ext.Interaction = function(opts) {};

            spyOn(Ext, 'Interaction').andCallThrough();

            dispatcher.dispatch(options);

            expect(Ext.Interaction).toHaveBeenCalledWith(options);
        });

        it("should fire the before-dispatch event with the interaction object", function() {
            Ext.Interaction = function() {
                return interaction;
            };

            dispatcher.dispatch(options);

            expect(Ext.Dispatcher.fireEvent).toHaveBeenCalledWith('before-dispatch', interaction);
        });

        it("should add the url to History", function() {
            dispatcher.dispatch(options);

            expect(Ext.History.add).toHaveBeenCalled();
        });

        it("should call the controller's action with the interaction object", function() {
            spyOn(mockController, 'someAction');

            dispatcher.dispatch(options);

            expect(mockController.someAction).toHaveBeenCalledWith(interaction);
        });

        it("should mark the interaction as dispatched", function() {
            Ext.Interaction = function() {
                return interaction;
            };

            dispatcher.dispatch(options);

            expect(interaction.dispatched).toBe(true);
        });

        it("should fire the dispatch event with the interaction object", function() {
            Ext.Interaction = function() {
                return interaction;
            };

            dispatcher.dispatch(options);

            expect(Ext.Dispatcher.fireEvent).toHaveBeenCalledWith('dispatch', interaction);
        });
    });

    describe("when redirecting", function() {
        describe("with a url string", function() {
            var url = 'someController/someAction';

            it("should use the Router to find the controller/action pair", function() {
                spyOn(Ext.Router, 'recognize').andCallThrough();

                dispatcher.redirect(url);

                expect(Ext.Router.recognize).toHaveBeenCalledWith(url);
            });

            it("should dispatch", function() {
                var route = {
                    controller: mockController,
                    action    : 'someAction'
                };

                spyOn(Ext.Router, 'recognize').andReturn(route);
                spyOn(Ext.Dispatcher, 'dispatch').andReturn(true);

                dispatcher.redirect(url);

                expect(Ext.Dispatcher.dispatch).toHaveBeenCalledWith(route);
            });
        });

        describe("with an options object", function() {
            it("should dispatch without using the Router", function() {
                spyOn(Ext.Router, 'recognize').andCallThrough();

                dispatcher.redirect(options);

                expect(Ext.Router.recognize).not.toHaveBeenCalled();
            });
        });

        describe("with a Model instance", function() {
            xit("should redirect to the model's show action", function() {

            });
        });
    });

    describe("creating redirect functions", function() {
        var redirect;

        beforeEach(function() {
            redirect = Ext.Dispatcher.createRedirect("someUrl");
        });

        it("should return a function", function() {
            expect(typeof redirect == 'function').toBe(true);
        });

        it("should use the redirect function when called", function() {
            spyOn(Ext.Dispatcher, 'redirect').andReturn(true);

            redirect.call();

            expect(Ext.Dispatcher.redirect).toHaveBeenCalledWith('someUrl');
        });

        it("should be aliased as Ext.createRedirect", function() {
            expect(Ext.createRedirect).toEqual(Ext.Dispatcher.createRedirect);
        });
    });
});