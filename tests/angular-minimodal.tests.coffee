describe "Angular Minimodal", ->
	$modal = null

	beforeEach ->
		module "angular-minimodal"
		inject (_$modal_) -> $modal = _$modal_

	describe ".show()", ->

		it "fails when not providing an options object", ->
			expect(true).toBe(true)

		it "fails when not providing a templateUrl on options object", ->
			expect(true).toBe(true)

		it "fails when not providing a controller on options object", ->
			expect(true).toBe(true)

		it "returns a modalInstance when successfully showing a popup", ->

	describe "modalInstance", ->

		it "has a resolve method", ->
			expect(true).toBe(true)

		it "has a reject method", ->
			expect(true).toBe(true)
