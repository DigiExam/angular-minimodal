(function()
{
	/* global angular */
	"use strict";

	angular.module("angular-minimodal", [])
		.provider("$modal", AngularMiniModalProvider);

	var _id = 0;
	function getId() { return ++_id; }

	function AngularMiniModalProvider()
	{
		this.$get = [
			"$http",
			"$q",
			"$controller",
			"$compile",
			"$rootScope",
			"$templateCache",
			AngularMiniModal
		];

		function AngularMiniModal($http, $q, $controller, $compile, $rootScope, $templateCache)
		{
			angular.extend(this, { show: show });

			var defaultOptions = {
				dismissEscape: true
			};

			var _instances = [];
			var _currentActiveInstance = null;
			var _hasPendingModal = false;

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

			function hideModal(modal)
			{
				if(typeof(modal.close) !== "function")
					throw new Error("angular-minimodal: Faulty template. No close-method exists.");
				if(modal.open)
					modal.close();
			}

			function showModal(modal)
			{
				if(typeof(modal.showModal) !== "function")
					throw new Error("angular-minimodal: Faulty template. No showModal-method exists.");
				if(!modal.open)
					modal.showModal();
			}

			function onModalClose(instance)
			{
				if(instance.$$modal.close != null && instance.$$modal.open)
					instance.$$modal.close();
				instance.$$modal.parentNode.removeChild(instance.$$modal);
				_instances.shift();
				showPreviousModalIfExists();
			}

			function showPreviousModalIfExists()
			{
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

			function removeFromInstances(instance)
			{
				_instances.splice(_instances.indexOf(instance), 1);
			}

			function create(options)
			{
				return getModalTemplate(options.templateUrl)
					.then(function(modal)
					{
						return requestModalTemplateSuccess(options, modal);
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
					.then(createModalSuccess, createModalFail).finally(function()
					{
						_hasPendingModal = false;
					});
			}

			function getModalTemplateSuccess(response)
			{
				if(response.status !== 200)
					throw new Error("angular-minimodal: Could not load template.");
				return angular.element(response.data)[0];
			}

			function requestModalTemplateSuccess(options, modal)
			{
				var deferred = $q.defer();
				var instance = createInstance(deferred);

				_instances.unshift(instance);

				instance.$$modal = modal;

				document.body.appendChild(modal);

				var locals = {
					$scope: options.$scope || $rootScope.$new(),
					$modalInstance: instance
				};

				if(options.controller)
				{
					var controller = $controller(options.controller, locals);
					$modal.data("$ngControllerController", controller);
					$modal.children().data("$ngControllerController", controller);
				}

				$compile(modal)(locals.$scope || {});

				if(options.dismissEscape)
					modal.oncancel = function() { instance.reject(); };

				return instance;
			}

			function createModalSuccess(instance)
			{
				try
				{
					if(_currentActiveInstance != null && _currentActiveInstance != instance)
						_currentActiveInstance.hide();

					_currentActiveInstance = instance;
					instance.show();
				}
				catch(ex)
				{
					_instances.shift();
					instance.$$modal.parentNode.removeChild(instance.$$modal);
					_currentActiveInstance = null;
					showPreviousModalIfExists();
					return $q.reject(ex);
				}

				return instance;
			}

			function createModalFail(ex)
			{
				if(_instances.indexOf(_currentActiveInstance) > -1)
					_instances.shift();
				_currentActiveInstance = null;
				showPreviousModalIfExists();
				return $q.reject(ex);
			}

			return this;
		}
	}
}());