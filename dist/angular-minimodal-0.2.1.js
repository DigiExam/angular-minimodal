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
			var defaultOptions = {
				dismissEscape: true
			};
			
			var _instances = [];
			
			function getModalTemplateSuccess(response)
			{
				if(response.status !== 200)
					throw new Error("angular-minimodal: Could not load template.");
				return angular.element(response.data);
			}
			
			function getModalTemplate(path)
			{
				var deferred = $q.defer(),
					promise = deferred.promise,
					cacheData = $templateCache.get(path);
				if(cacheData != null && cacheData.length > 0)
					deferred.resolve(angular.element(cacheData));
				else
					promise = $http.get(path)
						.then(getModalTemplateSuccess);
				return promise;
			}
			
			function hideModal(instance)
			{
				if(instance.modal != null && instance.modal.open)
					instance.modal.close();
			}
			
			function showModal(instance)
			{
				if(instance.modal != null && !instance.modal.open)
					instance.modal.showModal();
			}
			
			function removeModal(instance)
			{
				var ins, i;
				for(i = 0; i < _instances.length; ++i)
				{
					ins = _instances[i];
					if(ins.id === instance.id)
						_instances.splice(i, 1);
				}
			}
			
			function show(options)
			{
				options = angular.extend(defaultOptions, options);
				
				if(options == null)
					throw new Error("angular-minimodal: No options provided.");
					
				if(typeof(options.templateUrl) !== "string")
					throw new Error("angular-minimodal: Invalid templateUrl.");
					
				var deferred = $q.defer();
				
				var instance = {
					id: getId(),
					modal: null,
					result: deferred.promise,
					resolve: function(v)
					{
						deferred.resolve(v);
					},
					reject: function(v)
					{
						deferred.reject(v);
					},
					hide: function()
					{
						hideModal(this);
					},
					show: function()
					{
						showModal(this);
					}
				};
				
				deferred.promise.finally(function()
				{
					if(instance.modal.close != null)
						instance.modal.close();
						
					removeModal(instance);
					angular.element(instance.modal).remove();
				});
				
				_instances.push(instance);
				
				getModalTemplate(options.templateUrl)
					.then(function($modal)
					{
						var modal = $modal[0];
						instance.modal = modal;
						
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
						if(modal.showModal != null)
							modal.showModal();
					});
				
				return instance;
			}
			
			angular.extend(this, { show: show });
			
			return this;
		}
	}
}());