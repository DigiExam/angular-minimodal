(function()
{
	/* global angular */
	"use strict";
	
	angular.module("angular-minimodal", [])
		.provider("$modal", AngularMiniModal);
		
	var _id = 0;
	function getId() { return ++_id; }
	
	function AngularMiniModal()
	{
		this.$get = [
			"$http",
			"$q",
			"$controller",
			"$compile",
			"$rootScope",
			"$templateCache",
			AngularMiniModalGetter
		];
		
		function AngularMiniModalGetter($http, $q, $controller, $compile, $rootScope, $templateCache)
		{
			angular.extend(this, { show: show, clear: clear });
			
			var defaultOptions = {
				dismissEscape: true
			};
			
			var _instances = [];
			var _currentActiveInstance = null;
			var _hasPendingModal = false; 
			
			function requestModalTemplateSuccess(response)
			{
				if(response.status !== 200)
					throw new Error("angular-minimodal: Could not load template.");
				return angular.element(response.data);
			}
			
			function requestModalTemplate(path)
			{
				var deferred = $q.defer(),
					promise = deferred.promise,
					cacheData = $templateCache.get(path);
				if(cacheData != null && cacheData.length > 0)
					deferred.resolve(angular.element(cacheData));
				else
					promise = $http.get(path)
						.then(requestModalTemplateSuccess);
				return promise;
			}
			
			function hideModal(modal)
			{
				if(modal != null && modal.open)
					modal.close();
			}
			
			function showModal(modal)
			{
				if(modal != null && !modal.open)
					modal.showModal();
			}
			
			function onModalClose(instance)
			{
				if(instance.$$modal.close != null)
					instance.$$modal.close();
				instance.$$modal.parentNode.removeChild(instance.$$modal);
				_instances.shift();
				if(_instances.length > 0)
					_instances[0].show();
			}
			
			function createInstance(deferred)
			{
				return {
					$$id: getId(),
					$$modal: null,
					result: deferred.promise,
					resolve: function(v) { deferred.resolve(v); onModalClose(this); },
					reject: function(v) { deferred.reject(v); onModalClose(this); },
					hide: function() { hideModal(this.$$modal); },
					show: function() { showModal(this.$$modal); }
				};
			}
			
			function clear()
			{
				for(var i = 0; i < _instances.length; ++i)
					_instances[i].reject();
			}
			
			function create(options)
			{
				return requestModalTemplate(options.templateUrl)
					.then(function($modal)
					{
						var deferred = $q.defer();
						var instance = createInstance(deferred);
						
						_instances.unshift(instance);
						
						var modal = $modal[0];
						instance.$$modal = modal;
						
						document.body.appendChild(modal);
						
						if(options.controller)
						{
							var locals = {
								$scope: options.$scope || $rootScope.$new(),
								$modalInstance: instance
							};
							
							var controller = $controller(options.controller, locals);
							$modal.data("$ngControllerController", controller);
							$modal.children().data("$ngControllerController", controller);
						}
						
						$compile($modal)(locals.$scope);
						
						if(options.dismissEscape)
							modal.oncancel = function() { instance.reject(); };
							
						return instance;
					});
			}
			
			function show(options)
			{
				if(_hasPendingModal)
					throw new Error("angular-minimodal: Can't open new modal when a modal is pending.");
				_hasPendingModal = true;
				
				options = angular.extend(defaultOptions, options);
				
				if(options == null)
					throw new Error("angular-minimodal: No options provided.");
					
				if(typeof(options.templateUrl) !== "string")
					throw new Error("angular-minimodal: Invalid templateUrl.");
				
				return create(options)
					.then(function(instance)
					{
						if(_currentActiveInstance != null && _currentActiveInstance != instance)
						{
							_currentActiveInstance.hide();
						}
						
						_currentActiveInstance = instance;
						
						instance.show();
						
						return instance;
					}, function()
					{
						_currentActiveInstance = null;
					}).finally(function()
					{
						_hasPendingModal = false;	
					});
			}
			
			return this;
		}
	}
}());