define(['jquery',
        'underscore',
        'backbone',
        'models/Sound'
        ],
function($, _, Backbone,
                Sound){

  var Sounds = Backbone.Collection.extend({

    model: Sound,

    init:function(params) {
        
    }


  });

  return Sounds;
  
});


