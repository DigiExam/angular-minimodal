angular.module("angular-minimodal", []).provider "$modal", ->

	this.$get = ["$http", "$q", "$controller", "$compile", "$rootScope", "$templateCache", ($http, $q, $controller, $compile, $rootScope, $templateCache)->

		getModal = (path)->
			deferred = $q.defer()
			cacheData = $templateCache.get path
			if cacheData? and cacheData.length > 0
				deferred.resolve angular.element(cacheData)
				return deferred.promise
			else
				return $http.get(path).then (response)->
					if response.status isnt 200
						throw new Error "$modal could not find path '" + path + "'"
					return angular.element response.data

		defaultOptions =
			dismissEscape: true

		angular.extend @, {

			show: (options)->
				options = angular.extend defaultOptions, options

				if not options?
					throw new Error "angular-minimodal: No options provided"

				if typeof options.templateUrl isnt "string"
					throw new Error "angular-minmodal: Invalid templateUrl"

				deferred = $q.defer()
				instance =
					resolve: (v)->
						deferred.resolve v
					reject: (v)->
						deferred.reject v
					result: deferred.promise

				getModalPromise = getModal options.templateUrl
				getModalPromise.then ($modal)->
					modal = $modal[0]
					document.body.appendChild modal

					if(options.controller)
						locals =
							$scope: options.$scope || $rootScope.$new()
							$modalInstance: instance

						controller = $controller options.controller, locals
						$modal.data "$ngControllerController", controller
						$modal.children().data "$ngControllerController", controller

					$compile($modal) locals.$scope

					if options.dismissEscape
						modal.oncancel = ->
							instance.reject()

					isChrome = (navigator.userAgent.toLowerCase().indexOf "chrome") > -1
					if not isChrome
						dialogPolyfill.registerDialog modal

					if modal.showModal?
						modal.showModal()

					deferred.promise.finally ->
						if modal.close?
							modal.close()
						$modal.remove()

				return instance

		}

	]
	return
