define(['jquery',
        'underscore',
        'backbone',
        'models/Ways',
        'models/Sounds',
        'utils/GeoUtils',
        'text!templates/streetwalk/streetWalkViewTemplate.html',
        'text!templates/streetwalk/streetWalkLoadingViewTemplate.html',
        'text!templates/streetwalk/streetWalkChoosePathViewTemplate.html'
        ],
function($, _, Backbone,
                Ways,
                Sounds,
                GeoUtils,
                streetWalkViewTemplate,
                streetWalkLoadingViewTemplate,
                streetWalkChoosePathViewTemplate){

  var StreetWalkView = Backbone.View.extend({

    el:"#streetwalk",
    elImg:"#streetwalk .streetwalkImg",

    currentPosition:0,
    bodyHeight:10000,

    events:{
        "click .mute-sounds ":"muteSounds"
    },

    initialize : function(params) {
        var self = this;

        self.wayName = params.wayName;
    },

    initMap: function() {
        var self = this;

        self.map = L.mapbox.map('streetwalk-map', 'tdurand.jn29943n',{
            accessToken: 'pk.eyJ1IjoidGR1cmFuZCIsImEiOiI0T1ZEWlRVIn0.1PEGeiEWz6RUBfZq9Bvy7Q',
            zoomControl: false,
            attributionControl: false
        });


        self.map.on("load", function() {
            self.mapLoaded = true;
            self.updateMarkerPosition(self.currentStill.id);

            //Center map every 500ms
            //TODO ONLY IF POSITION CHANGED
            setInterval(function() {
                self.map.panTo(self.way.wayPath[self.currentStill.id]);
            },500);
        });
    },

    initSounds: function() {
        var self = this;

        self.sounds = new Sounds();
        self.sounds.init();

        setTimeout(function() {
            self.sounds.addMarkersToMap(self.map);
        },1000);
    },

    prepare:function() {

        var self = this;

        self.firstScroll = true;

        self.way = Ways.where({ wayName : self.wayName})[0];
        self.way.fetch();

        self.way.on("updatePercentageLoaded", function() {
            self.updateLoadingIndicator(self.way.percentageLoaded);
        });

        self.way.on("loadingFinished", function() {
            self.animating = true;
            self.render();
        });

        self.renderLoading();

        window.scrollTo(0,0);

    },

    renderLoading: function() {
        var self = this;
        
        if(self.$el.find(".loadingNextWay").length > 0) {
            self.$el.find(".loadingNextWay").show();
            self.$el.find(".streetwalk-title").hide();
            self.$el.find(".chooseWay").hide();

            self.isFirstWay = false;
        }
        else {
            self.$el.html(_.template(streetWalkLoadingViewTemplate));
            self.isFirstWay = true;
        }
        

    },

    updateLoadingIndicator: function(pourcentage) {
        var self = this;
        self.$el.find(".loadingIndicator").text(pourcentage);
    },

    renderImg: function(imgNb) {
        var self = this;

        console.log("RENDER IMGNB" + imgNb);

        if(self.currentStill && self.currentStill.id == imgNb) {
            //no need to render again same still
            return;
        }

        self.currentStill = self.way.wayStills.get(imgNb);

        if(!self.currentStill.loaded) {
            console.log("IMG NB NOT LOADED :" +imgNb);

            function sortNumber(a,b) {
              return a - b;
            }
            //Get closest still loaded : TODO FIND THE BEST ALGORITHM, this one is not so optimized and insert the still in the array
            self.currentStill = self.way.wayStills.get(self.way.wayStills.stillLoaded.push( imgNb ) && self.way.wayStills.stillLoaded.sort(sortNumber)[ self.way.wayStills.stillLoaded.indexOf( imgNb ) - 1 ]);


            console.log("Load IMG NB instead:" +self.currentStill.id);
        }

        self.updateMarkerPosition(self.currentStill.id);

        $(self.elImg).attr("src", self.currentStill.get("srcLowRes"));

    },

    renderImgHighRes: function() {
        var self = this;

        self.currentStill.loadHighRes(function() {
            $(self.elImg).attr("src", self.currentStill.get("srcHighRes"));
        });

    },

    render:function() {

        var self = this;

        if(!self.isFirstWay) {
            self.$el.find(".loadingNextWay").hide();
        }

        //render first still
        self.currentStill = self.way.wayStills.first();
        var pathFirstStill = self.way.wayStills.first().get("srcLowRes");

        //render high res after 100ms (TODO DUPLICATE)
        self.highResLoadingInterval = setTimeout(function() {
            self.renderImgHighRes();
        },100);

        if(self.isFirstWay) {
            self.$el.html(_.template(streetWalkViewTemplate,{
                pathFirstStill:self.currentStill.get("srcLowRes")
            }));
        }

        self.initMap();
        self.initSounds();
        self.computeAnimation(true);
    },

    renderElements: function(imgNb) {

        var self = this;

        if(self.firstScroll && imgNb > 1) {
            self.firstScroll = false;
        }

        if(imgNb >= self.way.wayStills.nbImages-1) {
            self.$el.find(".chooseWay").show();
            self.$el.find(".chooseWay").html(_.template(streetWalkChoosePathViewTemplate,{
                wayConnectionsEnd:self.way.wayConnectionsEnd
            }));
        }
        else {
            self.$el.find(".chooseWay").hide();
        }

    },

    computeAnimation: function(firstStill) {
        var self = this;

        if(self.animating) {
 
        //console.log("Compute animation");

        self.targetPosition  = window.scrollY;

        if( Math.floor(self.targetPosition) != Math.floor(self.currentPosition) || firstStill) {
            //console.log("Compute We have moved : scroll position " + self.currentPosition);
            var deaccelerate = Math.max( Math.min( Math.abs(self.targetPosition - self.currentPosition) * 5000 , 10 ) , 2 );
            self.currentPosition += (self.targetPosition - self.currentPosition) / deaccelerate;

            if(self.targetPosition > self.currentPosition) {
                self.currentPosition = Math.ceil(self.currentPosition);
            }
            else{
                self.currentPosition = Math.floor(self.currentPosition);
            }


            //Change image
            var availableHeigth = (self.bodyHeight - window.innerHeight);
            var imgNb = Math.floor( self.currentPosition / availableHeigth * self.way.wayStills.length);

            //Make sure imgNb is in bounds (on chrome macosx we can scroll more than height (rebound))
            if(imgNb < 0) { imgNb = 0; }
            if(imgNb >= self.way.wayStills.length) { imgNb = self.way.wayStills.length-1; }

            //Render image
            self.renderImg(imgNb);
            
            //Render elements at this position:
            self.renderElements(imgNb);
            $("body").removeClass('not-moving');

            //Render highres after 100ms
            clearTimeout(self.highResLoadingInterval);
            self.highResLoadingInterval = setTimeout(function() {
                self.renderImgHighRes();
                $("body").addClass('not-moving');
            },80);

            //Update sounds volume
            if(self.sounds) {
                self.sounds.updateSounds(self.way.wayPath[self.currentStill.id]);
            }

        }

        window.requestAnimationFrame(function() {
            self.computeAnimation();
        });

        }
    },

    updateMarkerPosition: function(stillId) {
        var self = this;

        if(!self.mapLoaded) {
            return;
        }

        if(self.markerMap) {
            self.markerMap.setLatLng(self.way.wayPath[stillId]);
        }
        else {
            if(self.map && self.way.wayPath) {
                self.markerMap = L.marker(self.way.wayPath[stillId]).addTo(self.map);
                if(stillId <= 1) {
                    self.map.panTo(self.way.wayPath[stillId]);
                }
            }
            
        }
        
    },

    muteSounds: function() {
        var self = this;
        self.sounds.mute();
    },


    onClose: function(){
      //Clean
      this.undelegateEvents();
      this.way.clear();
      this.map.remove();
      this.animating = false;
    }

  });

  return StreetWalkView;
  
});


