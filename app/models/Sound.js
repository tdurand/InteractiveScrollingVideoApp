define(['jquery',
        'underscore',
        'backbone',
        'utils/GeoUtils',
        'howl'
        ],
function($, _, Backbone, GeoUtils){

  var Sound = Backbone.Model.extend({

    position: undefined,
    vol: undefined,

    initialize: function() {
        var self = this;

        self.set({
            img:new Image(),
            imgHighRes: new Image()
        });

        var name = self.get("name");
        self.position = self.get("position");


        self.sound = new Howl({
          urls: ['data/sounds/' + name + '.mp3'],
          loop:true
        });

        self.sound.play();
    },

    updateVolume: function(newUserPosition) {
            var self = this;

            // Calculate distance between user and sound
            var distance = GeoUtils.distance(self.position, newUserPosition);
            
            // Calculate new volume based on distance
            self.vol = self.calculateVolume(distance);

            // Set new volume
            self.sound.volume(self.vol);
    },

    updatePan : function(newUserPosition){

        var self = this;

        var xDiff = self.position[0] - newUserPosition[0],
            yDiff = self.position[1] - newUserPosition[1],
            angle = Math.atan2(yDiff, xDiff) * (180/Math.PI);

        // Add POV heading offset
        //angle -= heading;

        // Convert angle to range between -180 and +180
        if (angle < -180)       angle += 360;
        else if (angle > 180)   angle -= 360;

        console.log("ANGLE: " + angle);

        // Calculate panPosition, as a range between -1 and +1
        var panPosition = (angle/90);
        if (Math.abs(panPosition) > 1) {
            var x = Math.abs(panPosition) - 1;
            panPosition = (panPosition > 0) ? 1 - x : -1 + x;
        }

        // Set the new pan poition
        self.sound.pos3d(panPosition, 1, 1);

        // Apply lowpass filter *if* the sound is behind us (11,000hz = filter fully open)
        var freq = 11000;
        if (Math.abs(angle) > 90) {
            // User's back is to the sound - progressively apply filter
            freq -= (Math.abs(angle) - 90) * 55;
        }
        self.sound.filter(freq);
    },

    updateSound: function(newUserPosition) {
        var self = this;
        self.updatePan(newUserPosition);
        self.updateVolume(newUserPosition);
    },

    calculateVolume: function(distance){
        // Calculate volume by using Inverse Square Law
        var vol = 1 / (distance * distance);
        return vol;
    }

  });

  return Sound;
  
});


