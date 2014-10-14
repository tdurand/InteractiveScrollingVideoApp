require.config({
    baseUrl: 'app',
    paths: {
        jquery:       'libs/vendor/jquery-2.0.3.min',
        underscore:   'libs/vendor/lodash-2.2.1.min',
        backbone:     'libs/vendor/backbone-1.1.0.min',
        popcorn:      'libs/vendor/popcorn-complete-1.3',
        howl:         'libs/vendor/howler-1.1.14',
        text:         'libs/vendor/text-2.0.10',
        fastclick:    'libs/vendor/fastclick.min',
        mapbox:       'libs/vendor/mapbox-2.1.2.min',
        models:       'models',
        views:        'views',
        utils:        'utils',
        templates:    '../templates',
        data:         '../data'
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone',
            init: function() {
                Backbone.$ = window.$;
            }
        },
        'underscore': {
            exports: '_'
        }
    },
    waitSeconds: 0
});


define(['jquery',
        'underscore',
        'backbone',
        'routers/router',
        'fastclick',
        'utils/Logger'], function($, _,
                            Backbone,
                            Router,
                            FastClick,
                            LOGGER) {

            //data
            //
            
            var longLatArray = [];
        var latlongArray = [
[
-75.56800961494446,
6.251261562401942
],
[
-75.5679640173912,
6.251370879068626
],
[
-75.56792110204697,
6.251528188378152
],
[
-75.56788623332977,
6.25168549764035
],
[
-75.56785941123962,
6.25180814550687
],
[
-75.56784600019455,
6.2518907994876445
],
[
-75.56784868240356,
6.251904130773661
],
[
-75.56785941123962,
6.251920128316402
],
[
-75.56787818670271,
6.251930793344638
],
[
-75.56789964437485,
6.251946790886577
],
[
-75.56792378425598,
6.251954789657363
],
[
-75.56800156831741,
6.251989450996008
],
[
-75.56808471679688,
6.252029444845444
],
[
-75.56815445423126,
6.25207477120445
],
[
-75.56822419166565,
6.252114765047359
],
[
-75.56824296712875,
6.252120097559511
],
[
-75.56825637817383,
6.252120097559511
],
[
-75.56828051805495,
6.252120097559511
],
[
-75.56829392910004,
6.252117431303436
],
[
-75.56831002235413,
6.252112098791245
],
[
-75.56833416223526,
6.252104100022877
],
[
-75.56835293769836,
6.252093434998178
],
[
-75.5683770775795,
6.2520721049481445
],
[
-75.5683958530426,
6.252056107410034
],
[
-75.56840926408768,
6.252032111101966
],
[
-75.5684146285057,
6.252013447306036
],
[
-75.5684146285057,
6.2519867847392705
],
[
-75.5684146285057,
6.251970787198564
],
[
-75.56841999292374,
6.251728157771103
],
[
-75.56842803955078,
6.251714826480609
],
[
-75.56844413280487,
6.251706827706159
],
[
-75.56846022605896,
6.251698828931582
],
[
-75.56847363710403,
6.2516961626733565
],
[
-75.56848973035812,
6.2516961626733565
],
[
-75.56850582361221,
6.2516961626733565
],
[
-75.5685567855835,
6.2517014951897965
],
[
-75.56891351938248,
6.251730824029151
]
];

        $.each(latlongArray,function(latLongIndex,latLong) {
            longLatArray.push([latLong[1],latLong[0]]);
        });

        window.globalLatLongPoints = longLatArray;
        window.globalNbPoints = 50;


    $(document).ready(function() {

         //Fast click
        FastClick.attach(document.body);

        //Instantiate Router
        var router = new Router();

        //Start app Router
        Backbone.history.start();
        
    });

});