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
        
        var self = this;

        self.add([
          {position: [6.257991160449556,-75.6118181347847],
            name:"pregonnegra",
            db:30
           },
          {position: [6.258033820065721,-75.61211049556732],
            name:"bruitdefondmusic",
            db:60
           }
        ]);
    },

    updateSounds: function(newUserPosition) {
        var self = this;
        _.each(self.models, function(sound) {
            sound.updateSound(newUserPosition);
        });
    },

    addMarkersToMap: function(map) {
        var self = this;
        _.each(self.models, function(sound) {
            L.marker(sound.position).addTo(map);
        });
    },

    mute: function() {
        var self = this;
        _.each(self.models, function(sound) {
            sound.sound.stop();
        });
    }


  });

  return Sounds;
  
});


