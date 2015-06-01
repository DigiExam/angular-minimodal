(function()
{
	"use strict";

	angular.module("app", ["angular-minimodal"])
		.controller("DemoController", ["$modal", DemoController])
		.controller("AlertModalController", ["$scope", "$modalInstance", AlertModalController])
		.controller("ConfirmModalController", ["$scope", "$modalInstance", ConfirmModalController]);

	function DemoController($modal)
	{
		var vm = this;

		vm.showAlert = showAlert;
		vm.showConfirm = showConfirm;

		showConfirm();

		function showAlert()
		{
			$modal.show({
				templateUrl: "demo/partials/alert.html",
				controller: "AlertModalController"
			});
		}

		function showConfirm()
		{
			$modal.show({
				templateUrl: "demo/partials/confirm.html",
				controller: "ConfirmModalController"
			}).then(function(instance)
			{
				instance.result.then(function()
				{
					alert("You confirmed!");
				}, function()
				{
					alert("You did not confirm!");
				});
			});
		}
	}

	function AlertModalController($scope, $modalInstance)
	{
		$scope.close = close;

		function close()
		{
			$modalInstance.resolve();
		}
	}

	function ConfirmModalController($scope, $modalInstance)
	{
		$scope.yes = yes;
		$scope.no = no;

		function yes()
		{
			$modalInstance.resolve();
		}

		function no()
		{
			$modalInstance.reject();
		}
	}

}());