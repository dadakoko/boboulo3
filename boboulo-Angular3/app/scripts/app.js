'use strict';

angular.module('bobouloApp', ['ui.router','ngResource','ngDialog','ngFileUpload','angularFileUpload','uiGmapgoogle-maps'])

.config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
    
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyBYj2iKavbAlzSI1qSDyJJRI8u5LrcGYrw',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });
    
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'HomeController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })
        
            // route for the aboutus page
            .state('app.aboutus', {
                url:'aboutus',
                views: {
                    'content@': {
                        templateUrl : 'views/aboutus.html',
                        controller  : 'AboutController'                  
                    }
                }
            })
        
            // route for the contactus page
            .state('app.contactus', {
                url:'contactus',
                views: {
                    'content@': {
                        templateUrl : 'views/contactus.html',
                        controller  : 'ContactController'                  
                    }
                }
            })

            // route for the basket page
            .state('app.basket', {
                url: 'basket',
                views: {
                    'content@': {
                        templateUrl : 'views/basket.html',
                        controller  : 'BasketController'
                    }
                }
            })

            // route for the companydetail page
            .state('app.companydetails', {
                url: 'basket/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/companydetail.html',
                        controller  : 'CompanyDetailController'
                   }
                }
            })
        
            // route for the dishdetail page
            .state('app.favorites', {
                url: 'favorites',
                views: {
                    'content@': {
                        templateUrl : 'views/favorites.html',
                        controller  : 'FavoriteController'
                   }
                }
            })
            
            // route for the user profile page
            .state('app.profile', {
                url: 'users/profile',
                views: {
                    'content@': {
                        templateUrl : 'views/profile.html',
                        controller  : 'ProfileController'
                   }
                }
            })
            
            // route for the users page
            .state('app.users', {
                url: 'users',
                views: {
                    'content@': {
                        templateUrl : 'views/users.html',
                        controller  : 'UsersController'
                   }
                }
            })
            
            // route for the companydetail page
            .state('app.userdetails', {
                url: 'users/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/userdetails.html',
                        controller  : 'UserDetailController'
                   }
                }
            })


            ;
    
        $urlRouterProvider.otherwise('/');
    })
;
