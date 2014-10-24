define([
        'jquery',
        'underscore',
        'backbone',
        'utils/AppView',
        'views/streetwalk'
        ],
    function($, _, Backbone,
                    AppView,
                    StreetWalkView) {

        var Router = Backbone.Router.extend({
            routes: {
                '':                                     'streetwalk',
                'streetwalk':                           'streetwalk',
                'streetwalk/:way':                      'streetwalk'
             },

        initialize: function() {
            var self = this;

        },

        streetwalk: function(wayName) {

            if(_.isUndefined(wayName)) {
                wayName = "carabobo-cl52-cl51";
            }

            var streetWalkView = new StreetWalkView({
                wayName : wayName
            });

            streetWalkView = AppView.show(streetWalkView);
            AppView.changePage(streetWalkView);
        }

    });

    return Router;

});