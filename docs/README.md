# API Reference

## $modal

### show(options)

#### Examples:

	var promise = $modal.show({
		templateUrl: "url/to/your/modal.html"
	}).then(function(instance)
	{
		// instance is a $modalInstance
	}, function(ex)
	{
		console.log("Something went wrong and we could not show this modal.", ex);
	});

#### Params:

* **Object** *options* - See [angular-minimodal Options](https://github.com/DigiExam/angular-minimodal/blob/master/docs/OPTIONS.md)

#### Returns:

* **Promise** - Normal HTTP-promise. First success-callback is always called with a $modalInstance as first arg.

## $modalInstance

### resolve(value)

#### Examples:

	$modal.show({
		templateUrl: "url/to/your/modal.html"
	}).then(function(instance)
	{
		instance.result.then(function(userAgreed)
		{
			alert("You agreed to our terms!");
		});

		instance.resolve(true);
	});

#### Params:

* **Anything** *value* - This value will be passed down to the first success-callback

### reject(value)

#### Examples:

	$modal.show({
		templateUrl: "url/to/your/modal.html"
	}).then(function(instance)
	{
		instance.result.then(null, function()
		{
			alert("You did not agree to our terms!");
		});

		instance.reject();
	});

#### Params:

* **Anything** *value* - This value will be passed down to the first error-callback

### **Promise** *result*

### hide()

#### Examples:

	$modal.show({
		templateUrl: "url/to/your/modal.html"
	}).then(function(instance)
	{
		$timeout(function()
		{
			instance.hide();
		}, 1000);
	})

### show()

#### Examples:

	$modal.show({
		templateUrl: "url/to/your/modal.html"
	}).then(function(instance)
	{
		instance.hide();
		$timeout(function()
		{
			instance.show()
		}, 1000);
	});