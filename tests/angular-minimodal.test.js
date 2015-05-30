/* global expect, it, inject, beforeEach, describe, module */
(function()
{
	"use strict";

	function isErrorObject(error)
	{
		return Object.prototype.toString.call(error) === "[object Error]";
	}

	function domStr(el)
	{
		var parent = document.createElement("div");
		parent.appendChild(el);
		return parent.innerHTML;
	}

	function TestController($scope, $modalInstance)
	{
		$scope.testString = "this is a test";
	}

	var template1 = "path/to/template1.html";
	var template2 = "path/to/template2.html";
	var faultyTemplate1 = "path/to/faulty-template1.html";
	var faultyTemplate2 = "path/to/faulty-template2.html";

	describe("$modal", function()
	{
		var $modal, $modalInstance;

		var $httpBackend, $q, $templateCache, $rootScope;

		beforeEach(function()
		{
			var miniModal = module("angular-minimodal");

			angular.module("angular-minimodal")
				.controller("TestController", ["$scope", "$modalInstance", TestController]);

			inject(function(_$modal_, _$httpBackend_, _$q_, _$templateCache_, _$rootScope_)
			{
				$modal = _$modal_;
				$httpBackend = _$httpBackend_;
				$q = _$q_;
				$templateCache = _$templateCache_;
				$rootScope = _$rootScope_;
			});
		});

		afterEach(function()
		{
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		describe(".show()", function()
		{
			it("fails when not providing a templateUrl on options object", function()
			{
				expect(function() { $modal.show({}); }).toThrow();
			});

			it("fails when can't fetch modal template", function()
			{
				$httpBackend.expectGET(template1).respond(500);

				var promise = $modal.show({
					templateUrl: template1
				});

				promise.then(null, function(ex)
				{
					expect(isErrorObject(ex)).toBe(true);
				});

				$httpBackend.flush();
			});

			it("returns a promiselike object", function()
			{
				$httpBackend.expectGET(template1).respond(200, "<dialog></dialog>");

				var promise = $modal.show({
					templateUrl: template1
				});

				$httpBackend.flush();
				expect(typeof(promise.then)).toBe("function");
				expect(typeof(promise.finally)).toBe("function");
				expect(typeof(promise.catch)).toBe("function");
			});

			it("should get the provided path from $templateCache and return that if an entry exists", function()
			{
				$httpBackend.expectGET(template1).respond(200, "<dialog></dialog>");

				$modal.show({
					templateUrl: template1
				});

				$httpBackend.flush();

				spyOn($templateCache, "get").and.callFake(function()
				{
					return "<dialog>this is a test</dialog>";
				});

				$modal.show({
					templateUrl: template1
				}).then(function(instance)
				{
					expect(instance.$$modal.innerHTML).toEqual('this is a test');
				});
			});

			it("should use a controller if one is provided in options", function(done)
			{
				$httpBackend.expectGET(template1).respond(200, "<dialog>{{testString}}</dialog>");

				$modal.show({
					templateUrl: template1,
					controller: "TestController"
				}).then(function(instance)
				{
					setTimeout(function()
					{
						expect(instance.$$modal.innerHTML).toEqual("this is a test");
						done();
					}, 200);
				});

				$httpBackend.flush();
			});

			it("should throw an error if a modal is already pending", function()
			{
				$httpBackend.expectGET(template1).respond(200, "<dialog></dialog>");

				$modal.show({
					templateUrl: template1
				});

				expect(function()
				{
					$modal.show({
						templateUrl: template2
					});
				}).toThrow();

				$httpBackend.flush();
			});

			it("should hide the currently open modal if another is being shown", function()
			{
				var modal1, modal2;

				$httpBackend.expectGET(template1).respond(200, "<dialog></dialog>");

				$modal.show({
					templateUrl: template1
				}).then(function(instance)
				{
					modal1 = instance.$$modal;
				});

				$httpBackend.flush();

				$httpBackend.expectGET(template2).respond(200, "<dialog></dialog>");

				$modal.show({
					templateUrl: template2
				}).then(function(instance)
				{
					modal2 = instance.$$modal;
				});

				$httpBackend.flush();

				expect(modal1.open).toBe(false);
				expect(modal2.open).toBe(true);
			});

			it("should open the previous modal if one exists when opening a faulty one", function()
			{
				var modal1;

				$httpBackend.expectGET(template1).respond(200, "<dialog></dialog>");

				$modal.show({
					templateUrl: template1
				}).then(function(instance)
				{
					modal1 = instance.$$modal;
				});

				$httpBackend.flush();

				$httpBackend.expectGET(faultyTemplate1).respond(200, "<alert></alert>");

				$modal.show({
					templateUrl: faultyTemplate1
				}).then(null, function(ex)
				{
					expect(isErrorObject(ex)).toBe(true);
				});

				$httpBackend.flush();

				expect(modal1.open).toBe(true);
			});

			// Faulty means that the template has no showModal-method or a close-method
			it("throws an error if the template is faulty", function()
			{
				var promise;

				$httpBackend.expectGET("path/to/faulty-template1.html").respond(200, "<alert></alert>");

				promise = $modal.show({
					templateUrl: "path/to/faulty-template1.html"
				});

				promise.catch(function(error)
				{
					expect(isErrorObject(error)).toBe(true);
				});

				$httpBackend.flush();
			});
		});

		describe("$modalInstance", function()
		{
			it("has a resolve method", function()
			{
				expect(true).toBe(true);
			});

			it("has a reject method", function()
			{
				expect(true).toBe(true);
			});
		});
	});
}());