'use strict';

angular.module('bobouloApp')

    .controller('BasketController', ['$scope', 'basketFactory', 'favoriteFactory', function ($scope, basketFactory, favoriteFactory) {

        $scope.tab = 1;
        $scope.filtText = '';
        $scope.showDetails = false;
        $scope.showFavorites = false;
        $scope.showCompany = false;
        $scope.message = "Loading ...";

        basketFactory.query(
            function (response) {
                $scope.companies = response;
                $scope.showCompany = true;

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });

        $scope.select = function (setTab) {
            $scope.tab = setTab;

            if (setTab === 2) {
                $scope.filtText = "school";
            } else if (setTab === 3) {
                $scope.filtText = "Bank";
            } else if (setTab === 4) {
                $scope.filtText = "security";
            } else {
                $scope.filtText = "";
            }
        };

        $scope.isSelected = function (checkTab) {
            return ($scope.tab === checkTab);
        };

        $scope.toggleDetails = function () {
            $scope.showDetails = !$scope.showDetails;
        };

        $scope.toggleFavorites = function () {
            $scope.showFavorites = !$scope.showFavorites;
        };

        $scope.addToFavorites = function (companyid) {
            console.log('Add to favorites', companyid);
            favoriteFactory.save({ _id: companyid });
            $scope.showFavorites = !$scope.showFavorites;
        };
    }])

    .controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

        $scope.feedback = {
            mychannel: "",
            firstName: "",
            lastName: "",
            agree: false,
            email: ""
        };

        var channels = [{
            value: "tel",
            label: "Tel."
        }, {
                value: "Email",
                label: "Email"
            }];

        $scope.channels = channels;
        $scope.invalidChannelSelection = false;

        $scope.sendFeedback = function () {


            if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                $scope.invalidChannelSelection = true;
            } else {
                $scope.invalidChannelSelection = false;
                feedbackFactory.save($scope.feedback);
                $scope.feedback = {
                    mychannel: "",
                    firstName: "",
                    lastName: "",
                    agree: false,
                    email: ""
                };
                $scope.feedback.mychannel = "";
                $scope.feedbackForm.$setPristine();
            }
        };
    }])

    .controller('CompanyDetailController', ['$scope', '$state', '$stateParams', 'basketFactory', 'commentFactory', function ($scope, $state, $stateParams, basketFactory, commentFactory) {

        $scope.company = {};
        $scope.showCompany = false;
        $scope.message = "Loading ...";

        $scope.company = basketFactory.get({
            id: $stateParams.id
        })
            .$promise.then(
            function (response) {
                $scope.company = response;
                $scope.showCompany = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );

        $scope.mycomment = {
            rating: 5,
            comment: ""
        };

        $scope.submitComment = function () {

            commentFactory.save({ id: $stateParams.id }, $scope.mycomment);

            $state.go($state.current, {}, { reload: true });

            $scope.commentForm.$setPristine();

            $scope.mycomment = {
                rating: 5,
                comment: ""
            };
        }
    }])

    .controller('UsersController', ['$scope', 'usersFactory', function ($scope, usersFactory) {

        $scope.users = [];

        //query users list
        usersFactory.query(
            function (response) {
                $scope.users = response;
                $scope.users = response.map(u => u =
                    {
                        id: u._id,
                        firstname: u.firstname,
                        lastname: u.lastname,
                        username: u.username,
                        picture: "https://localhost:3443/images/" + u.picture,
                        admin: u.admin
                    }
                ).filter(u => u.admin == false);
                // $scope.users = response.map(
                //     u => u.picture = "https://localhost:3443/images/" + u.picture
                // ).filter(u => u.admin == false);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])

    .controller('UserDetailController', ['$scope', '$stateParams', 'usersFactory', 'favoriteFactory', 'uiGmapGoogleMapApi', function ($scope, $stateParams, usersFactory, favoriteFactory, uiGmapGoogleMapApi) {


        $scope.user = {};
        $scope.showUser = false;

        favoriteFactory.get({
            id: $stateParams.id
        })
            .$promise.then(
            function (response) {
                debugger
                $scope.companies = response.companies;
                $scope.showCompany = true;
                uiGmapGoogleMapApi.then(function (maps) {
                    $scope.companies.forEach(a => {
                        geocodeAddress(a.address, function (latLng) {
                            $scope.map.markers.push(
                                {
                                    idKey: a._id,
                                    latitude: latLng.lat(),
                                    longitude: latLng.lng(),
                                    title: a.name,
                                    src: a.image
                                }
                            );
                        });

                    })

                });

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });


        usersFactory.get({
            id: $stateParams.id
        })
            .$promise.then(
            function (response) {
                $scope.user = response;
                $scope.user.picture = "https://localhost:3443/images/" + $scope.user.picture;
                $scope.showUser = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );


        $scope.map = {
            center: { latitude: 45, longitude: -73 },
            zoom: 8,
            markers: [],
            markersEvents: {
                click: function (marker, eventName, model) {
                    $scope.map.window.model = model;
                    $scope.map.window.show = true;
                }
            },
            window: {
                marker: {},
                show: false,
                closeClick: function () {
                    this.show = false;
                },
                options: {}
            }
        };



        // geocode the given address
        var geocodeAddress = function (address, callback) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    callback(results[0].geometry.location);
                } else {
                    console.log("Geocode was not successful for the following reason: " + status);
                }
            });
        };


    }])

    .controller('ProfileController', ['$scope', '$state', 'profileFactory', '$localStorage', 'Upload', '$window', 'FileUploader', function ($scope, $state, profileFactory, $localStorage, Upload, $window, FileUploader) {

        var TOKEN_KEY = 'Token';
        var token = $localStorage.getObject(TOKEN_KEY, '{}').token;
        $scope.user = {};
        $scope.src = "";

        //query user information
        profileFactory.query(
            function (response) {
                $scope.user = response;
                $scope.src = "https://localhost:3443/images/" + $scope.user.picture;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });


        var uploader = $scope.uploader = new FileUploader({
            url: 'https://localhost:3443/users/upload',
            headers: {
                'x-access-token': token
            }
        });

        // FILTERS

        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            console.info('onCompleteAll');
            profileFactory.query(
                function (response) {
                    $scope.user = response;
                    $scope.src = "https://localhost:3443/images/" + $scope.user.picture;
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                });

        };

        console.info('uploader', uploader);



    }])
    // implement the IndexController and About Controller here

    .controller('HomeController', ['$scope', 'basketFactory', 'corporateFactory', 'promotionFactory', function ($scope, basketFactory, corporateFactory, promotionFactory) {
        $scope.showCompany = false;
        $scope.showLeader = false;
        $scope.showPromotion = false;
        $scope.message = "Loading ...";
        var leaders = corporateFactory.query({
            featured: "true"
        })
            .$promise.then(
            function (response) {
                var leaders = response;
                $scope.leader = leaders[0];
                $scope.showLeader = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );
        $scope.company = basketFactory.query({
            featured: "true"
        })
            .$promise.then(
            function (response) {
                var companies = response;
                $scope.company = companies[0];
                $scope.showCompany = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );
        var promotions = promotionFactory.query({
            featured: "true"
        })
            .$promise.then(
            function (response) {
                var promotions = response;
                $scope.promotion = promotions[0];
                $scope.showPromotion = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );
    }])

    .controller('AboutController', ['$scope', 'corporateFactory', function ($scope, corporateFactory) {

        $scope.leaders = corporateFactory.query();

    }])

    .controller('FavoriteController', ['$scope', '$state', 'favoriteFactory', 'uiGmapGoogleMapApi', function ($scope, $state, favoriteFactory, uiGmapGoogleMapApi) {

        $scope.tab = 1;
        $scope.filtText = '';
        $scope.showDetails = false;
        $scope.showDelete = false;
        $scope.showCompany = false;
        $scope.message = "Loading ...";

        favoriteFactory.query(
            function (response) {
                $scope.companies = response.companies;
                $scope.showCompany = true;
                uiGmapGoogleMapApi.then(function (maps) {
                    $scope.companies.forEach(a => {
                        geocodeAddress(a.address, function (latLng) {
                            $scope.map.markers.push(
                                {
                                    idKey: a._id,
                                    latitude: latLng.lat(),
                                    longitude: latLng.lng(),
                                    title: a.name,
                                    src: a.image
                                }
                            );
                        });

                    })

                });

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });

        $scope.select = function (setTab) {
            $scope.tab = setTab;

            if (setTab === 2) {
                $scope.filtText = "school";
            } else if (setTab === 3) {
                $scope.filtText = "bank";
            } else if (setTab === 4) {
                $scope.filtText = "security";
            } else {
                $scope.filtText = "";
            }
        };

        $scope.isSelected = function (checkTab) {
            return ($scope.tab === checkTab);
        };

        $scope.toggleDetails = function () {
            $scope.showDetails = !$scope.showDetails;
        };

        $scope.toggleDelete = function () {
            $scope.showDelete = !$scope.showDelete;
        };

        $scope.deleteFavorite = function (companyid) {
            console.log('Delete favorites', companyid);
            favoriteFactory.delete({ id: companyid });
            $scope.showDelete = !$scope.showDelete;
            $state.go($state.current, {}, { reload: true });
        };

        $scope.map = {
            center: { latitude: 45, longitude: -73 },
            zoom: 8,
            markers: [],
            markersEvents: {
                click: function (marker, eventName, model) {
                    $scope.map.window.model = model;
                    $scope.map.window.show = true;
                }
            },
            window: {
                marker: {},
                show: false,
                closeClick: function () {
                    this.show = false;
                },
                options: {}
            }
        };

        // geocode the given address
        var geocodeAddress = function (address, callback) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    callback(results[0].geometry.location);
                } else {
                    console.log("Geocode was not successful for the following reason: " + status);
                }
            });
        };


    }])

    .controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', 'profileFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory, profileFactory) {

        $scope.loggedIn = false;
        $scope.username = '';
        $scope.isAdmin = false;

        var setAdmin = function () {
            profileFactory.query(
                function (response) {
                    $scope.isAdmin = response.admin;
                },
                function (response) {
                    $scope.isAdmin = false;
                    console.log("Error: " + response.status + " " + response.statusText);
                });
        }


        if (AuthFactory.isAuthenticated()) {
            $scope.loggedIn = true;
            $scope.username = AuthFactory.getUsername();
            setAdmin();
        }

        $scope.openLogin = function () {
            ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller: "LoginController" });
        };

        $scope.logOut = function () {
            AuthFactory.logout();
            $scope.loggedIn = false;
            $scope.username = '';
            $scope.isAdmin = false;
            $state.go('app', {}, { reload: true });
        };

        $rootScope.$on('login:Successful', function () {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
            setAdmin();
        });

        $rootScope.$on('registration:Successful', function () {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
            setAdmin();
        });

        $scope.stateis = function (curstate) {
            return $state.is(curstate);
        };


    }])

    .controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {

        $scope.loginData = $localStorage.getObject('userinfo', '{}');

        $scope.doLogin = function () {
            if ($scope.rememberMe)
                $localStorage.storeObject('userinfo', $scope.loginData);

            AuthFactory.login($scope.loginData);

            ngDialog.close();

        };

        $scope.openRegister = function () {
            ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller: "RegisterController" });
        };

    }])

    .controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {

        $scope.register = {};
        $scope.loginData = {};

        $scope.doRegister = function () {
            console.log('Doing registration', $scope.registration);

            AuthFactory.register($scope.registration);

            ngDialog.close();

        };
    }])
    ;