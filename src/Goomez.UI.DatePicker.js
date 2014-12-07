/*
	Goomez.UI.DatePicker copyright by sebagomez (Sebastián Gómez)
	@sebagomez

	Licensed under MIT License (http://opensource.org/licenses/mit-license.php)
	Original source at https://github.com/sebagomez/javascript-winphone-datepicker
*/
(function () {
	"use strict";

	//////////////////////////////////////////////////////////////////////////////////////
	// Goomez.UI.DatePicker
	//////////////////////////////////////////////////////////////////////////////////////
	var _datePicker = WinJS.Class.define(
		function (element, options) {
			this.parent = element;
			this._options = options;
			this.isReadOnly = options.mode === 'view';
			this.dateimeControl = options.control;
			this.picture = options.picture;
			this._minYear = options.minYear || 1940;
			this._maxYear = options.maxYear || 2039;
			this.formatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(this.picture)
			this._order = 'mdy';
			if (options.order &&
				options.order.length === 3 &&
				options.order.toLowerCase().indexOf('d') !== -1 &&
				options.order.toLowerCase().indexOf('m') !== -1 &&
				options.order.toLowerCase().indexOf('y') !== -1){
				this._order = options.order;
			}

			this._calendar = new Windows.Globalization.Calendar();
			this.internalValue = null;


			if (this.isReadOnly) {
				var span = document.createElement('span');
				this.parent.appendChild(span);
				this.control = span;
			}
			else {
				if (this.dateimeControl === 'datetime') {
					this.createDateControl(element);
					this.createTimeControl(element);
				}
				if (this.dateimeControl === 'date')
					this.createDateControl(element);
				if (this.dateimeControl === 'time')
					this.createTimeControl(element);
			}
		},
		{
			createDateControl: function (element) {
				var that = this;
				var index = 1; //if zero based it fails when index === 0
				this._order.split('').forEach(function (v) {
					if (v.toLowerCase() === 'm')
						that.setMonthSelect(element, index);
					if (v.toLowerCase() === 'd')
						that.setDaySelect(element, index);
					if (v.toLowerCase() === 'y')
						that.setYearSelect(element, index);
					index++;
				});
			},
			createTimeControl: function (element) {
				this.setHourSelect(element);
				this.setMinutesSelect(element);
			},
			setMinutesSelect: function (element) {
				this.minute = document.createElement('select');
				this.minute.style.width = '100px';
				this.minute.id = 'minute';
				for (var i = 0; i < 60; i++) {
					var choice = document.createElement('option');
					choice.setAttribute('value', i);
					if (i < 10)
						choice.textContent = "0" + i;
					else
						choice.textContent = i;
					this.minute.appendChild(choice);
				}

				element.appendChild(this.minute);

				this._observeChanges(this.minute, this._selectionChanged.bind(this));

			},
			setHourSelect: function (element) {
				this.hour = document.createElement('select');
				this.hour.style.marginRight = '20px';
				this.hour.style.width = '100px';
				this.hour.id = 'hour';
				for (var i = 0; i <= 23; i++) {
					var choice = document.createElement('option');
					choice.setAttribute('value', i);
					if (this._calendar.getClock() === Windows.Globalization.ClockIdentifiers.twelveHour) {
						if (i === 0)
							choice.textContent = "12 AM";
						else if (i === 12)
							choice.textContent = "12 PM";
						else
							choice.textContent = i < 12 ? i + " AM" : (i - 12) + " PM";
					} else 
						choice.textContent = i;
					
					this.hour.appendChild(choice);
				}

				element.appendChild(this.hour);

				this._observeChanges(this.hour, this._selectionChanged.bind(this));
			},
			setDaySelect: function (element, index) {
				this.day = document.createElement('select');
				if (index && index < 3)
					this.day.style.marginRight = '20px';
				this.day.style.width = '80%';
				this.day.id = 'day';
				for (var i = 1; i <= 31; i++) {
					var choice = document.createElement('option');
					choice.setAttribute('value', i);
					choice.textContent = i;
					this.day.appendChild(choice);
				}

				element.appendChild(this.day);

				this._observeChanges(this.day, this._selectionChanged.bind(this));
			},
			setYearSelect: function (element, index) {
				this.year = document.createElement('select');
				if (index && index < 3)
					this.year.style.marginRight = '20px';
				this.year.style.width = '80%';
				this.year.id = 'year';
				for (var i = this._minYear; i <= this._maxYear; i++) { //??
					var choice = document.createElement('option');
					choice.setAttribute('value', i);
					choice.textContent = i;
					this.year.appendChild(choice);
				}

				element.appendChild(this.year);

				this._observeChanges(this.year, this._selectionChanged.bind(this));
			},
			setMonthSelect: function (element, index) {
				this.month = document.createElement('select');
				if (index && index < 3)
					this.month.style.marginRight = '20px';
				this.month.id = 'month';
				for (var i = 1; i <= 12; i++) {
					var choice = document.createElement('option');
					choice.setAttribute('value', i);
					this._calendar.month = i;
					choice.textContent = this._calendar.monthAsString();
					this.month.appendChild(choice);
				}

				element.appendChild(this.month);

				this._observeChanges(this.month, this._selectionChanged.bind(this));
			},
			_selectionChanged: function (objctInfo) {
				var date;
				if (this.dateimeControl === 'datetime') {
					date = this._getDate();
					var time = this._getTime();
					date.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
				}
				if (this.dateimeControl === 'date')
					date = this._getDate();
				if (this.dateimeControl === 'time')
					date = this._getTime();

				this.value = date;
			},
			_observeChanges: function (element, handle) {
				Rx.Observable.fromEvent(element, 'change').subscribe(handle);
			},
			_getDate: function () {
				var day = this.day.value < 10 ? '0' + this.day.value : this.day.value;
				var month = this.month.value < 10 ? '0' + this.month.value : this.month.value;
				var year = this.year.value;

				var date = this._dateFromJSON(year + "-" + month + "-" + day);
				if (date.getDate() !== parseInt(this.day.value, 10))
					this.day.value = date.getDate().toString();
				if ((date.getMonth() + 1) !== parseInt(this.month.value, 10))
					this.month.value = (date.getMonth() + 1).toString();

				return date;
			},
			_getTime: function () {
				var hours = this.hour.value < 10 ? '0' + this.hour.value : this.hour.value;
				var minutes = this.minute.value < 10 ? '0' + this.minute.value : this.minute.value;

				return this._dateFromJSON(hours + ':' + minutes + ':00');
			},
			_dateFromJSON: function (jsonDate, fromUTC) {
				var date = new Date();
				var offset = date.getTimezoneOffset();

				if (jsonDate === '0000-00-00' || jsonDate === '0000-00-00T00:00:00')
					return null;
				var parts;
				if (jsonDate.length === 10)
					date.setFullYear(parseInt(jsonDate.substr(0, 4), 10), parseInt(jsonDate.substr(5, 2), 10) - 1, parseInt(jsonDate.substr(8, 2), 10));
				else if (jsonDate.length === 19) {
					date.setFullYear(parseInt(jsonDate.substr(0, 4), 10), parseInt(jsonDate.substr(5, 2), 10) - 1, parseInt(jsonDate.substr(8, 2), 10));
					var time = jsonDate.substr(jsonDate.indexOf('T') + 1);
					parts = time.split(':');
					date.setHours(parts[0], parts[1], parts[2]);
					if (fromUTC)
						date.setMinutes(date.getMinutes() - offset);
				}
				else if (jsonDate.length === 8) {
					parts = jsonDate.split(':');
					date.setHours(parts[0], parts[1], parts[2]);
					if (fromUTC)
						date.setMinutes(date.getMinutes() - offset);
				}
				return date;
			},
			changed: function () {
				var event = document.createEvent('UIEvents');
				event.initEvent('change', true, true);
				this.parent.dispatchEvent(event);
			},
			value: {
				get: function () {
					return this.internalValue;
				},
				set: function (value) {
					if (!value || this.internalValue === value)
						return;

					var date;
					this.internalValue = value;
					if (this.isReadOnly) {

						// Get formatters for the date part and the time part.
						var span = this.parent.firstChild;
						var mytimefmt;
						if (this.formatter) {
							mytimefmt = this.formatter;
						}

						date = this._dateFromJSON(value);
						if (date)
							span.textContent = mytimefmt.format(date);
						else
							span.textContent = value;

						if (span.textContent === '0000-00-00')
							span.textContent = "";

					}
					else
						this.changed();
				}
			}
		}
		);

	WinJS.Namespace.define("Goomez.UI", {
		DatePicker: _datePicker
	});

})();