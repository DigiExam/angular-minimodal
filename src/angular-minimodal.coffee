angular.module("angular-minimodal", []).provider "$modal", ->
	_id = 0
	uniqueId = ->
		return ++_id

	this.$get = ["$http", "$q", "$controller", "$compile", "$rootScope", "$templateCache", ($http, $q, $controller, $compile, $rootScope, $templateCache)->

		defaultOptions =
			dismissEscape: true

		_instances = []

		getModalTemplateSuccess = (response)->
			if response.status isnt 200
				throw new Error "angular-minimodal: Could not load template."
			return angular.element response.data

		getModalTemplate = (path)->
			deferred = $q.defer()
			promise = deferred.promise
			cacheData = $templateCache.get path
			if cacheData?.length > 0
				deferred.resolve angular.element(cacheData)
			else
				promise = $http.get(path).then getModalTemplateSuccess
			return promise

		hideModal = (instance)->
			instance._modal?.close()

		showModal = (instance)->
			instance._modal?.showModal()

		removeModal = (instance)->
			for ins, i in _instances
				if ins._id is instance._id
					_instances.splice i, 1

		show = (options)->
			options = angular.extend defaultOptions, options

			if not options?
				throw new Error "angular-minimodal: No options provided"

			if typeof options.templateUrl isnt "string"
				throw new Error "angular-minmodal: Invalid templateUrl"

			deferred = $q.defer()
			instance =
				_id: uniqueId()
				_modal: null
				result: deferred.promise
				resolve: (v)->
					deferred.resolve v
				reject: (v)->
					deferred.reject v
				hide: ->
					hideModal this
				show: ->
					showModal this

			_instances.push instance

			getModalPromise = getModalTemplate options.templateUrl
			getModalPromise.then ($modal)->
				modal = $modal[0]
				instance._modal = modal

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

				if modal.showModal?
					modal.showModal()

				deferred.promise.finally ->
					if modal.close?
						modal.close()
					removeModal instance
					$modal.remove()

			return instance

		angular.extend @,
			show: show

	]
	return