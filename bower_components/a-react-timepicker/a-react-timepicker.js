"use strict";

(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined")
        module.exports = factory();
    if (typeof define === "function" && define.amd)
        define(factory);
    global.AReactTimepicker = factory();
}(this, function () {
	var React = typeof require === "function" ? require("react") : window.React;

	var CLOCK_SIZE = 182;

	var Timepicker = React.createClass({
		displayName: "exports",

		getInitialState: function getInitialState() {
			return {
				visible: false,
				hour: 12,
				minute: 0,
				am: true,
				position: {
					top: 0,
					left: 0
				}
			};
		},

		componentWillMount: function componentWillMount() {
			document.addEventListener("click", this.hideOnDocumentClick);
		},

		componentWillUnmount: function componentWillUnmount() {
			document.removeEventListener("click", this.hideOnDocumentClick);
		},

		show: function show() {
			var trigger = this.refs.trigger.getDOMNode(),
			    rect = trigger.getBoundingClientRect(),
			    isTopHalf = rect.top > window.innerHeight / 2;

			this.setState({
				visible: true,
				position: {
					top: isTopHalf ? rect.top + window.scrollY - CLOCK_SIZE - 3 : rect.top + trigger.clientHeight + window.scrollY + 3,
					left: rect.left
				}
			});
		},

		hide: function hide() {
			this.setState({
				visible: false
			});
		},

		hideOnDocumentClick: function hideOnDocumentClick(e) {
			if (!this.parentsHaveClassName(e.target, "time-picker")) this.hide();
		},

		parentsHaveClassName: function parentsHaveClassName(element, className) {
			var parent = element;
			while (parent) {
				if (parent.className && parent.className.indexOf(className) > -1) return true;

				parent = parent.parentNode;
			}

			return false;
		},

		onTimeChanged: function onTimeChanged(hour, minute, am) {
			this.setState({
				hour: hour,
				minute: minute,
				am: am
			});
		},

		onDone: function onDone() {
			this.hide();
		},

		formatTime: function formatTime() {
			return _pad(this.state.hour.toString(), 2) + ":" + _pad(this.state.minute.toString(), 2) + " " + (this.state.am ? "AM" : "PM");
		},

		render: function render() {
			return React.createElement(
				"div",
				{ className: "time-picker" },
				React.createElement("input", { ref: "trigger", type: "text", disabled: true, value: this.formatTime(), onClick: this.show }),
				React.createElement(Clock, { visible: this.state.visible, position: this.state.position, onTimeChanged: this.onTimeChanged, onDone: this.onDone, hour: this.state.hour, minute: this.state.minute, am: this.state.am })
			);
		}
	});

	var Clock = React.createClass({
		displayName: "Clock",

		getInitialState: function getInitialState() {
			return {
				hoursVisible: true,
				minutesVisible: false,
				amPmVisible: false,
				position: "below"
			};
		},

		componentWillReceiveProps: function componentWillReceiveProps(props) {
			if (this.props.visible && !props.visible) this.setState({
				hoursVisible: true,
				minutesVisible: false,
				amPmVisible: false
			});
		},

		getTime: function getTime() {
			return {
				hour: this.props.hour,
				minute: this.props.minute,
				am: this.props.am
			};
		},

		onHourChanged: function onHourChanged(hour) {
			this.props.onTimeChanged(hour, this.props.minute, this.props.am);

			this.setState({
				hoursVisible: false,
				minutesVisible: true
			});
		},

		onMinuteChanged: function onMinuteChanged(minute) {
			this.props.onTimeChanged(this.props.hour, minute, this.props.am);

			this.setState({
				minutesVisible: false,
				amPmVisible: true
			});
		},

		onAmPmChanged: function onAmPmChanged(am) {
			this.props.onDone();
			this.props.onTimeChanged(this.props.hour, this.props.minute, am);

			this.setState({
				am: am,
				amPmVisible: false,
				hoursVisible: true
			});
		},

		style: function style() {
			return {
				top: this.props.position.top,
				left: this.props.position.left
			};
		},

		render: function render() {
			return React.createElement(
				"div",
				{ className: "clock " + (this.props.visible ? "clock-show" : "clock-hide"), style: this.style() },
				React.createElement(
					"div",
					{ className: "clock-face-wrapper" },
					React.createElement(Hours, { visible: this.state.hoursVisible, time: this.getTime(), onClick: this.onHourChanged }),
					React.createElement(Minutes, { visible: this.state.minutesVisible, time: this.getTime(), onClick: this.onMinuteChanged }),
					React.createElement(AmPm, { visible: this.state.amPmVisible, time: this.getTime(), onClick: this.onAmPmChanged })
				)
			);
		}
	});

	var Hours = React.createClass({
		displayName: "Hours",

		buildHours: function buildHours() {
			var hours = [];
			for (var i = 1; i <= 12; i++) hours.push(i);
			return hours;
		},

		render: function render() {
			return React.createElement(Face, { visible: this.props.visible, type: "hours", values: this.buildHours(), prompt: "Hour", time: this.props.time, onClick: this.props.onClick, selected: this.props.time.hour });
		}
	});

	var Minutes = React.createClass({
		displayName: "Minutes",

		buildMinutes: function buildMinutes() {
			var minutes = [];
			for (var i = 1; i <= 12; i++) minutes.push(_pad(((i === 12 ? 0 : i) * 5), 2));
			return minutes;
		},

		render: function render() {
			return React.createElement(Face, { visible: this.props.visible, type: "minutes", values: this.buildMinutes(), prompt: "Minute", time: this.props.time, onClick: this.props.onClick, selected: this.props.time.minute });
		}
	});

	var AmPm = React.createClass({
		displayName: "AmPm",

		render: function render() {
			return React.createElement(
				"div",
				{ className: "face am-pm" + (this.props.visible ? " face-show" : " face-hide") },
				React.createElement(
					"div",
					{ className: "centre" },
					React.createElement(
						"div",
						{ className: "prompt" },
						"AM/PM?"
					),
					React.createElement(
						"div",
						{ className: "am-pm" },
						React.createElement(
							"span",
							{ className: this.props.time.am ? "selected" : "", onClick: this.props.onClick.bind(null, true) },
							"AM"
						),
						React.createElement(
							"span",
							{ className: !this.props.time.am ? "selected" : "", onClick: this.props.onClick.bind(null, false) },
							"PM"
						)
					)
				)
			);
		}
	});

	var Face = React.createClass({
		displayName: "Face",

		render: function render() {
			return React.createElement(
				"div",
				{ className: "face " + this.props.type + (this.props.visible ? " face-show" : " face-hide") },
				this.props.values.map((function (value, i) {
					return React.createElement(
						"div",
						{ key: i, className: "position position-" + (i + 1) + (parseInt(this.props.selected) === parseInt(value) ? " selected" : ""), onClick: this.props.onClick.bind(null, value) },
						_pad(value, 2)
					);
				}).bind(this)),
				React.createElement(
					"div",
					{ className: "centre" },
					React.createElement(
						"div",
						{ className: "prompt" },
						this.props.prompt
					)
				)
			);
		}
	});

	function _pad(value, length) {
		value = value.toString();
		while (value.length < length)
			value = "0" + value;
		return value;
	}

    return Timepicker;
}));
