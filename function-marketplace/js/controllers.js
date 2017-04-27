"use strict";

var sensdash_controllers = angular.module("sensdash.controllers", []);

sensdash_controllers.controller("RegistryCtrl", ["$scope", "Registry", "User",
    function ($scope, Registry, User) {
        Registry.load().then(function (sensors) {
            $scope.sensors = sensors;
        });
        $scope.user = User;
        $scope.$watch('user.registries', function (a, b) {
            Registry.load().then(function (sensors) {
                $scope.sensors = sensors;
            });
        })
    }]);

sensdash_controllers.controller("StreamCtrl", ["$scope", "Registry", "User", "XMPP",
    function ($scope, Registry, User, XMPP) {
        $scope.sensors = [];
        $scope.subscrip = Object.keys(User.subscriptions);
        Registry.load().then(function (registry_sensors) {
            for (var i = 0; i < registry_sensors.length; i++) {
                if (User.check_subscribe(registry_sensors[i].id) && User.check_sla(registry_sensors[i])) {
                    $scope.sensors.push(registry_sensors[i]);
                }
            }
        });
        for (var key in User.subscriptions) {
            var ep = User.subscriptions[key];
            XMPP.subscribe(ep);
        }
        $scope.$on("$destroy", XMPP.unsubscribe_all_endpoints);
    }
]);

sensdash_controllers.controller("FavoritesCtrl", ["$scope", "Registry", "User", "XMPP",
    function ($scope, Registry, User, XMPP) {
        var user_favorites = User.favorites;
        $scope.result_favorites = [];
        Registry.load().then(function (all_sensors) {
            for (var i = 0; i < all_sensors.length; i++) {
                if ((user_favorites.indexOf(all_sensors[i].id) != -1) && User.check_sla(all_sensors[i])) {
                    $scope.result_favorites.push(all_sensors[i]);
                  }
            }
        });
        for (var key in User.subscriptions) {
            if (user_favorites.indexOf(key) != -1) {
                var ep = User.subscriptions[key];
                XMPP.subscribe(ep, function () {
                    console.log("Room joined");
                });
            }
        }
        $scope.$on("$destroy", XMPP.unsubscribe_all_endpoints);
    }
]);

sensdash_controllers.controller("SettingsCtrl", ["$scope", "User", function ($scope, User) {
    $scope.user = User;
    $scope.preinstalled_registries = Config.DEFAULT_REGISTRIES;

    $scope.registryAdd = function () {
        if ($scope.user.registries.indexOf($scope.inputRegistryURL) == -1) {
            $scope.user.registries.push($scope.inputRegistryURL);
            $scope.user.save("registries");
            //console.log($scope.user.registries);
            $scope.inputRegistryURL = "";
        }
    };
    $scope.registryDelete = function (x) {
        var r = $scope.user.registries;
        r.splice(r.indexOf(x), 1);
        $scope.user.save("registries");
    }
}
]);

sensdash_controllers.controller("ShowMoreCtrl", ["$scope", function ($scope) {
    $scope.isCollapsed = true;
    $scope.toggleCollapse = function () {
        $scope.isCollapsed = !$scope.isCollapsed;
    }
}
]);

//Modal window controllers, check definition syntax
function SensorModalCtrl($scope, $modal) {
    $scope.open = function () {

        var modalInstance = $modal.open({
            templateUrl: "partials/blocks/sensor_details_modal.html",
            controller: SensorModalInstanceCtrl,
            resolve: {
                sensor: function () {
                    return $scope.sensor;
                }
            }
        });
        modalInstance.result.then(function () {
            }//, function () {
            //  console.log("Modal closed");
            //}
        );
    };
};

var SensorModalInstanceCtrl = function ($scope, $modalInstance, sensor, User) {
    $scope.user = User;
    $scope.sensor = sensor;
    $scope.accept_sla = false;

    $scope.subscribe = function () {
        User.subscribe($scope.sensor);
        $modalInstance.close();
    };

    $scope.unsubscribe = function () {
        User.unsubscribe($scope.sensor, function () {
            console.log("user unsubscribed from sensor: " + $scope.sensor.id);
        });
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss("cancel");
    };
};

//Modal for the Registry view in Settings Tab
function RegistryModalCtrl($scope, $modal, $http, User) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: "partials/blocks/registry_details_modal.html",
            controller: RegistryModalInstanceCtrl,
            resolve: {
                registry: function () {
                    return $scope.registry;
                }
            }
        });
    };
};
var RegistryModalInstanceCtrl = function ($scope, $modalInstance, $http, registry) {
    $http.get(registry).success(function(data){
        $scope.RegistryJSONtext = JSON.stringify(data, null, 4);
    });

    $scope.cancel = function () {
        $modalInstance.dismiss("cancel");
    };
};

//Modal for Log In with another XMPP server
function LogInModalCtrl($scope, $modal) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: "partials/blocks/log_in_modal.html",
            controller: LogInModalInstanceCtrl,
            resolve: {
                registry: function () {
                    return $scope.registry;
                }
            }
        });
    };
};
var LogInModalInstanceCtrl = function ($scope, $modalInstance) {
    $scope.bosh_server = Config.BOSH_SERVER;
    $scope.logIn = function(){
        Config.BOSH_SERVER = $scope.bosh_server;
        console.log("modal submitted, " + Config.BOSH_SERVER);
        $modalInstance.close();
    }
    $scope.cancel = function () {
        $modalInstance.dismiss("cancel");
        $modalInstance.close();
    };
};