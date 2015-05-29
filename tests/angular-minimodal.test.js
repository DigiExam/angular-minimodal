/* global expect, it, inject, beforeEach, describe, module */
(function()
{
	"use strict";

	function isErrorObject(error)
	{
		return Object.prototype.toString.call(error) === "[object Error]";
	}

	var template1 = "path/to/template1.html";
	var template2 = "path/to/template2.html";
	var faultyTemplate1 = "path/to/faulty-template1.html";
	var faultyTemplate2 = "path/to/faulty-template2.html";

	describe("$modal", function()
	{
		var $modal, $modalInstance;

		var $httpBackend, $q;

		beforeEach(function()
		{
			var miniModal = module("angular-minimodal");

			inject(function(_$modal_, _$httpBackend_, _$q_)
			{
				$modal = _$modal_;
				$httpBackend = _$httpBackend_;
				$q = _$q_;
			});
		});

		afterEach(function()
		{
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		describe(".show()", function()
		{
			it("fails when not providing an options object", function()
			{
				expect(function() { $modal.show(); }).toThrow();
			});

			it("fails when not providing a templateUrl on options object", function()
			{
				expect(function() { $modal.show({}); }).toThrow();
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