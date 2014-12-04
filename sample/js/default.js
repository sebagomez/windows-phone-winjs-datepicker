(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch)
			var that = this;
			args.setPromise(WinJS.UI.processAll().then(function () {
				Rx.Observable.fromEvent(shortDate, 'change')
				.subscribe(function (eventInfo) {
					selected.textContent = eventInfo.currentTarget.winControl.value.toDateString();
				});
			}));
	};
;

	var _showingError = false;
	app.onerror = function (err) {
		var message = err.detail.errorMessage ||
		(err.detail.exception && err.detail.exception.message) ||
		(err.detail.error && err.detail.error.message) ||
		'Indeterminate error';

		if (err.detail.error && err.detail.error.couldNotRender)
			message = message + ":" + err.detail.error.couldNotRender;

		if (Windows.UI.Popups.MessageDialog && !_showingError) {
			_showingError = true;
			var messageDialog = new Windows.UI.Popups.MessageDialog(message, ":(");
			messageDialog.showAsync().done(function () {
				_showingError = false;
			});
		}

		debugger; //Stop here while debugging

		return true;
	}

	app.start();
})();
