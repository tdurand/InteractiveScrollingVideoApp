define(['jquery',
        'underscore',
        'backbone',
        'models/Stills',
        'utils/GeoUtils',
        'text!templates/streetwalk/streetWalkViewTemplate.html',
        'text!templates/streetwalk/streetWalkLoadingViewTemplate.html',
        'howl'
        ],
function($, _, Backbone,
                StillsCollection,
                GeoUtils,
                streetWalkViewTemplate,
                streetWalkLoadingViewTemplate){

  var StreetWalkView = Backbone.View.extend({

    el:"#streetwalk",
    elImg:"#streetwalk .streetwalkImg",

    currentPosition:0,
    bodyHeight:10000,

    events:{
        
    },

    initialize : function(params) {
        var self = this;

        if(params.way === undefined) {
            self.way = "casaparepositionstabilized";
            self.nbImg = "209";
        }
        else {
            self.way = params.way;
            self.nbImg = params.nbImages;
        }
    },

    initMap: function() {
        self.map = L.mapbox.map('streetwalk-map', 'tdurand.ja7g8ce3',{
            accessToken: 'pk.eyJ1IjoidGR1cmFuZCIsImEiOiI0T1ZEWlRVIn0.1PEGeiEWz6RUBfZq9Bvy7Q',
            zoomControl: false,
            attributionControl: false
        });

        var intermediatePoints = GeoUtils.generateIntermediatePoints([
                6.2581378028655275,
                -75.61222583055496
                ],
                [
                6.257823188177031,
                -75.61136215925217
                ],200);

        L.marker([
                6.257823188177031,
                -75.61136215925217
                ],{ title : "End "}).addTo(self.map);

        $.each(intermediatePoints, function(index, val) {
             L.marker(val).addTo(self.map);
        });

        map = self.map;

        console.log(intermediatePoints.length);

    },

    initSounds: function() {
        //Sound
        pregonnegra = new Howl({
          urls: ['data/sounds/pregonnegra.mp3'],
          loop:true
        });
    },

    prepare:function() {

        var self = this;

        self.firstScroll = true;

        self.Stills = new StillsCollection();
        self.Stills.init({
            nbStills : parseInt(self.nbImg,10),
            pathToStills: "data/"+self.way
        });

        self.Stills.fetch();

        self.Stills.on("updatePourcentageLoaded", function() {
            self.updateLoadingIndicator(self.Stills.pourcentageLoaded);
        });

        self.Stills.on("loadingFinished", function() {
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

        if(self.currentStill && self.currentStill.id == imgNb) {
            //no need to render again same still
            return;
        }

        self.currentStill = self.Stills.get(imgNb);

        if(!self.currentStill.loaded) {
            console.log("IMG NB NOT LOADED :" +imgNb);

            function sortNumber(a,b) {
              return a - b;
            }
            //Get closest still loaded : TODO FIND THE BEST ALGORITHM, this one is not so optimized and insert the still in the array
            self.currentStill = self.Stills.get(self.Stills.stillLoaded.push( imgNb ) && self.Stills.stillLoaded.sort(sortNumber)[ self.Stills.stillLoaded.indexOf( imgNb ) - 1 ]);


            console.log("Load IMG NB instead:" +self.currentStill.id);
        }

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
        self.currentStill = self.Stills.first();
        var pathFirstStill = self.Stills.first().get("srcLowRes");

        //render high res after 100ms (TODO DUPLICATE)
        self.highResLoadingInterval = setTimeout(function() {
            self.renderImgHighRes();
        },100);

        if(self.isFirstWay) {
            self.$el.html(_.template(streetWalkViewTemplate,{
                pathFirstStill:self.currentStill.get("srcLowRes")
            }));
        }

        self.computeAnimation();
        self.initMap();
        self.initSounds();
    },

    renderElements: function(imgNb) {

        var self = this;

        if(self.firstScroll && imgNb > 1) {
            self.firstScroll = false;
        }

        if(imgNb > self.Stills.nbImages-1 && self.isFirstWay) {
            self.$el.find(".chooseWay").show();
        }
        else if(!self.firstScroll && !self.isFirstWay && imgNb === 0) {
            self.$el.find(".chooseWay").show();
        }
        else {
            self.$el.find(".chooseWay").hide();
        }

    },

    computeAnimation: function() {
        var self = this;

        if(self.animating) {
 
        //console.log("Compute animation");

        self.targetPosition  = window.scrollY;

        if( Math.floor(self.targetPosition) != Math.floor(self.currentPosition)) {
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
            var imgNb = Math.floor( self.currentPosition / availableHeigth * self.Stills.length);

            //Make sure imgNb is in bounds (on chrome macosx we can scroll more than height (rebound))
            if(imgNb < 0) { imgNb = 0; }
            if(imgNb >= self.Stills.length) { imgNb = self.Stills.length-1; }

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

        }

        window.requestAnimationFrame(function() {
            self.computeAnimation();
        });

        }
    },


    onClose: function(){
      //Clean
      this.undelegateEvents();
      this.Stills.clear();
      this.animating = false;
    }

  });

  return StreetWalkView;
  
});


