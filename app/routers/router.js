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
                'streetwalk/:way/:nbImages':            'streetwalk'
             },

        initialize: function() {
            var self = this;

        },

        streetwalk: function(way,nbImages) {
            var streetWalkView = new StreetWalkView({
                way : way,
                nbImages : nbImages
            });

            streetWalkView = AppView.show(streetWalkView);
            AppView.changePage(streetWalkView);
        }

    });

    return Router;

});