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
          {position: [6.2517228252549435,-75.5689188838005],
            name:"esquina1",
            db:100
           },
          {position: [6.251370879068626,-75.56906640529631],
            name:"esquina2",
            db:100
           },
           {position: [6.250986937504368,-75.56924611330032],
            name:"esquina3",
            db:100
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


