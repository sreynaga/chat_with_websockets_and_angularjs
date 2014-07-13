(function () {
    var module = angular.module('Chat');

    module.controller('LoginController', function ($scope, $rootScope, $socket, $location) {
        $scope.login = function (user) {
            $scope.error = true;
            $socket.emit('login', user);
        };

        $scope.error = false;

        $socket.on('loginSuccess', function (user) {
            $rootScope.user = user;
            $location.path('/chat');
        });

        $socket.on('loginFailure', function () {
            $scope.error = true;
        });
    });

    module.controller('MainController', function ($scope, $socket) {
        $socket.on('updateUsers', function (users) {
            $scope.users = users;
        });

        $scope.messages = [];

        $scope.sendMessage = function (message) {
            if (!message) return;

            $socket.emit('newMessage', message);
        };

        $socket.on('newMessage', function (message) {
            $scope.messages.push(message);
            $scope.message = '';
        });
    });

    module.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.on('keypress', function (evt) {
                if (evt.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                }
            });
        };
    });

    module.config(function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: 'login',
            controller: 'LoginController'
        }).when('/chat', {
            templateUrl: 'chat-box',
            controller: 'MainController'
        }).
        otherwise({
            redirectTo: '/chat'
        });

        $locationProvider.html5Mode(true);
    });

})();
