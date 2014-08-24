define(['underscore'],function(_) {

    var GeoUtils = {

        _midpointcoordinates: function(point1,point2) {

            var lat1 = point1[0];
            var lon1 = point1[1];
            var lat2 = point2[0];
            var lon2 = point2[1];
            // Converts from degrees to radians.
            Math.toRadians = function(degrees) {
              return degrees * Math.PI / 180;
            };
             
            // Converts from radians to degrees.
            Math.toDegrees = function(radians) {
              return radians * 180 / Math.PI;
            };

                
            var dLon = Math.toRadians(lon2 - lon1);

            //convert to radians
            lat1 = Math.toRadians(lat1);
            lat2 = Math.toRadians(lat2);
            lon1 = Math.toRadians(lon1);

            var Bx = Math.cos(lat2) * Math.cos(dLon);
            var By = Math.cos(lat2) * Math.sin(dLon);
            var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
            var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

            return [Math.toDegrees(lat3),Math.toDegrees(lon3)];
        },

        generateIntermediateSegments: function(arraySegments,arrayPoints,nbTotalPoints) {

            var self = this;

            var newArraySegments = [];


            $.each(arraySegments, function(index,segment) {
                 var midPoint = self._midpointcoordinates(segment[0],segment[1]);
                 var segmentFirstPoint = segment[0];
                 var segmentLastPoint = segment[1];
                 newArraySegments.push([segmentFirstPoint,midPoint]);

                 // L.marker(midPoint).addTo(map);
                 // This is good, the midPoints are correctly calculated
                 // Store the midpoint at the right place in the array
                 // 1,200
                 // 5
                 // 100
                 // 50
                 // 150
                 // 
                 arrayPoints.push(midPoint);


                 //have the exact coordinates number
                 if(newArraySegments.length+1 >= nbTotalPoints) {
                    return false;
                 }

                 newArraySegments.push([midPoint,segmentLastPoint]);


                 if(newArraySegments.length+1 >= nbTotalPoints) {
                    return false;
                 }
            });

            if(newArraySegments.length+1 >= nbTotalPoints) {
                return arrayPoints;
            }
            else {
                return self.generateIntermediateSegments(newArraySegments,arrayPoints,nbTotalPoints);
            }

        },

        generateIntermediatePoints: function(pointA,pointB,nbTotalPoints) {

            //pointA
            // [lat,long]

            var self = this;

            var arraySegments = [[pointA,pointB]];
            var arrayPoints = [pointA,pointB];

            //TODO
            //We have all the points bug in disorder [ N°1, N°200 , N°100 , N°50 , N°150 , N°25 ,  ... ]
            //The scale is not the same at the end in order to have the right number of point
            //TODO REORDER AT THE END WITH A SMART SORT METHOD
            //
            //IF WE DO NOT BREAK IN THE generateIntermediaSegments, we have all the points but maybe more, 
            //because it goes exponentially, 2, 3, 5, 9, 17, 33 ..., so we can't have the right number spaced
            //equally easily

            //var arrayWithAllSegments = self.generateIntermediateSegments(arraySegments,arrayPoints,nbTotalPoints);

            //var allIntermediatesPoints = _.uniq(_.flatten(arrayWithAllSegments,true));

            var allIntermediatesPoints = self.generateIntermediateSegments(arraySegments,arrayPoints,nbTotalPoints);

            console.log(allIntermediatesPoints.length);

            return allIntermediatesPoints;

        }

    };

    window.GeoUtils = GeoUtils;

    return GeoUtils;

});