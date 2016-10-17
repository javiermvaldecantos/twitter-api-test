(function() {
    var app = angular.module('tweets-app', []);
    
    app.controller('main-ctrl', ['$scope', '$http', function($scope,$http) {
        
        $scope.username = "";
        $scope.allTweets = [];
        
        $scope.bodyContent = './views/body.html';
        $scope.headerContent = './views/header.html';
        $scope.subtitle = "Enter a Twitter username on the box above and you will get their most recent tweets. Only odd tweets are shown on screen.";
        $scope.loadingImage = './img/loading.gif';
        $scope.loadingTweets = false;
        
        //makes a request to our server to get the tweets. Our server will return the latest 10 odd tweets for our user.
        $scope.lookupTweets = function() {
            if(validateUsername($scope.username)) {
                $scope.loadingTweets = true;
                $http({
                    method:'GET',
                    url: '/api/getTweets?' + 'screen_name=' + $scope.username + '&count=20' 
                }).then(function successCallback(response) {
                    console.log('SUCCESS! - ',response);
                    if(response.data.success) {
                        $scope.allTweets = response.data.data;
                        $scope.errorMessage = '';
                    } else {
                        $scope.allTweets = [];
                        $scope.errorMessage = 'Tweets could not be retrieved. Check the username and try again.';
                    }
                    $scope.loadingTweets = false;
                    
                }, function errorCallback(response) {
                    console.log('ERROR! - ',response);
                    $scope.allTweets = [];
                    $scope.errorMessage = 'Oops! There was a server error. Please refresh the page and try again.';
                    $scope.loadingTweets = false;
                });
            } else {
                $scope.allTweets = [];
                $scope.errorMessage = 'Invalid Username format!';
            }
        }
        
        // returns true if the username has 15 or less alphanumeric characters
        function validateUsername(username) {
            if(username.length < 1 || username.length > 16 || !username.match(/^\w+$/)) {
                return false;
            } else {
                return true;
            }
        }
        
        // calculates the time difference between a date and now and returns it as a string
        $scope.calculateDifference = function(date) {
            var difference_s = ( (new Date()) - (new Date(date)) ) / 1000;

            var time = {
                seconds: Math.floor(difference_s),
                minutes: Math.floor(difference_s / 60),
                hours: Math.floor(difference_s / 3600),
                days: Math.floor(difference_s / 86400),
                months: Math.floor(difference_s / 2592000),
                years: Math.floor(difference_s / 31536000)
            }
            
            if (time.years > 0) {
                return time.years + (time.years > 1 ? " years" : " year");
            } else if (time.months > 0) {
                return time.months + (time.months > 1 ? " months" : " month");
            } else if (time.days > 0) {
                return time.days + (time.days > 1 ? " days" : " day");
            } else if (time.hours > 0) {
                return time.hours + "h";
            } else if (time.minutes > 0) {
                return time.minutes + "m";
            } else {
                return time.seconds + "s";
            }
        }
        
    } ]);
    
})();