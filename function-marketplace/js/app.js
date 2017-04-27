'use strict';

angular.module('sensdash', [
        'ngRoute',
        'sensdash.filters',
        'sensdash.controllers',
        'sensdash.services',
        'sensdash.directives',
        'ui.bootstrap',
        'wu.masonry',
        'ngCookies'
    ]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/registry', {templateUrl: 'partials/registry.html', controller: 'RegistryCtrl'});
        $routeProvider.when('/subscriptions', {templateUrl: 'partials/subscriptions.html', controller: 'StreamCtrl'});
        $routeProvider.when('/favorites', {templateUrl: 'partials/favorites.html', controller: 'FavoritesCtrl'});
        $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsCtrl'});
        $routeProvider.when('/reference', {templateUrl: 'partials/references.html'});
        $routeProvider.otherwise({redirectTo: '/registry'});
    }]);