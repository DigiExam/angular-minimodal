angular.module("angular-minimodal", []).provider "$modal", ->

	this.$get = ["$http", "$q", "$controller", "$compile", "$rootScope", ($http, $q, $controller, $compile, $rootScope)->

		getModal = (path)->
			$http.get(path).then (response)->
				if response.status isnt 200
					throw new Error "$modal could not find path '" + path + "'"
				return angular.element response.data

		angular.extend @, {

			show: (options)->

				deferred = $q.defer()
				instance =
					resolve: (v)->
						deferred.resolve v
					reject: (v)->
						deferred.reject v
					result: deferred.promise

				getModalPromise = getModal options.templateUrl
				getModalPromise.then (modal)->

					document.body.appendChild modal[0]

					if(options.controller)
						locals =
							$scope: options.$scope || $rootScope.$new()
							$modalInstance: instance

						controller = $controller options.controller, locals
						modal.data "$ngControllerController", controller
						modal.children().data "$ngControllerController", controller

					$compile(modal) locals.$scope
					modal[0].showModal()

					deferred.promise.finally ->
						modal[0].close()
						modal.remove()

				return instance

		}

	]
	return