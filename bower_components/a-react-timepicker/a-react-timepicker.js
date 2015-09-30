"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") module.exports = factory();
    if (typeof define === "function" && define.amd) define(factory);
    (global || window).AReactTimepicker = factory();
})(this, function () {
    var React = typeof require === "function" ? require("react") : window.React;

    var CLOCK_SIZE = 222;

    var TimePicker = React.createClass({
        displayName: "TimePicker",

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
            return _pad(this.state.hour) + ":" + _pad(this.state.minute) + " " + (this.state.am ? "AM" : "PM");
        },

        render: function render() {
            return React.createElement(
                "div",
                { className: "time-picker" },
                React.createElement("input", { ref: "trigger", type: "text", readOnly: true, value: this.formatTime(), onClick: this.show }),
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
            this._hour = hour;
            this.setState({
                hoursVisible: false,
                minutesVisible: true
            });
        },

        onHoursHidden: function onHoursHidden() {
            this.props.onTimeChanged(this._hour, this.props.minute, this.props.am);
        },

        onMinuteChanged: function onMinuteChanged(minute) {
            this.props.onDone();
            this._minute = minute;

            this.setState({
                minutesVisible: false,
                amPmVisible: true
            });
        },

        onMinutesHidden: function onMinutesHidden() {
            this.props.onTimeChanged(this.props.hour, this._minute, this.props.am);
        },

        onAmPmChanged: function onAmPmChanged(am) {
            this.props.onTimeChanged(this.props.hour, this.props.minute, am);
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
                    React.createElement(Hours, { visible: this.state.hoursVisible, time: this.getTime(), onClick: this.onHourChanged, onHidden: this.onHoursHidden }),
                    React.createElement(Minutes, { visible: this.state.minutesVisible, time: this.getTime(), onClick: this.onMinuteChanged, onHidden: this.onMinutesHidden })
                ),
                React.createElement(AmPmInfo, { time: this.getTime(), onChange: this.onAmPmChanged })
            );
        }
    });

    var AmPmInfo = React.createClass({
        displayName: "AmPmInfo",

        render: function render() {
            var time = this.props.time;
            return React.createElement(
                "div",
                { className: "am-pm-info" },
                React.createElement(
                    "div",
                    { className: "am" + (time.am ? " selected" : ""), onClick: this.props.onChange.bind(null, true) },
                    "AM"
                ),
                React.createElement(Time, { time: time }),
                React.createElement(
                    "div",
                    { className: "pm" + (!time.am ? " selected" : ""), onClick: this.props.onChange.bind(null, false) },
                    "PM"
                )
            );
        }
    });

    var Time = React.createClass({
        displayName: "Time",

        render: function render() {
            var time = this.props.time;
            return React.createElement(
                "div",
                { className: "time" },
                React.createElement(
                    "span",
                    { className: "hour" },
                    _pad(time.hour)
                ),
                React.createElement(
                    "span",
                    null,
                    ":"
                ),
                React.createElement(
                    "span",
                    { className: "minute" },
                    _pad(time.minute)
                ),
                React.createElement(
                    "span",
                    null,
                    " "
                ),
                React.createElement(
                    "span",
                    { className: "am-pm" },
                    time.am ? "AM" : "PM"
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
            var _props = this.props;
            var time = _props.time;

            var props = _objectWithoutProperties(_props, ["time"]);

            return React.createElement(Face, _extends({}, props, { type: "hours", values: this.buildHours(), selected: this.props.time.hour }));
        }
    });

    var Minutes = React.createClass({
        displayName: "Minutes",

        buildMinutes: function buildMinutes() {
            var minutes = [];
            for (var i = 1; i <= 12; i++) minutes.push(_pad((i === 12 ? 0 : i) * 5));
            return minutes;
        },

        render: function render() {
            var _props2 = this.props;
            var time = _props2.time;

            var props = _objectWithoutProperties(_props2, ["time"]);

            return React.createElement(Face, _extends({}, props, { type: "minutes", values: this.buildMinutes(), selected: this.props.time.minute }));
        }
    });

    var Face = React.createClass({
        displayName: "Face",

        componentDidMount: function componentDidMount() {
            this.refs.face.getDOMNode().addEventListener("transitionend", this.onTransitionEnd);
        },

        componentWillUnmount: function componentWillUnmount() {
            this.refs.face.getDOMNode().removeEventListener("transitionend", this.onTransitionEnd);
        },

        onTransitionEnd: function onTransitionEnd(e) {
            if (e.propertyName === "opacity" && e.target.className.indexOf("face-hide") > -1) this.props.onHidden();
        },

        render: function render() {
            return React.createElement(
                "div",
                { ref: "face", className: "face " + this.props.type + (this.props.visible ? " face-show" : " face-hide") },
                this.props.values.map((function (value, i) {
                    return React.createElement(
                        "div",
                        { key: i, className: "position position-" + (i + 1) + (parseInt(this.props.selected) === parseInt(value) ? " selected" : ""), onClick: this.props.onClick.bind(null, value) },
                        _pad(value)
                    );
                }).bind(this)),
                React.createElement(LongHand, { type: this.props.type, selected: this.props.selected }),
                React.createElement("div", { className: "inner-face" }),
                React.createElement(Ticks, null)
            );
        }
    });

    var LongHand = React.createClass({
        displayName: "LongHand",

        render: function render() {
            var deg = (this.props.selected / this.props.max * 360);
            return React.createElement(
                "div",
                null,
                React.createElement("div", { className: "long-hand", style: { transform: "rotate(" + deg + "deg)", WebkitTransform: "rotate(" + deg + "deg)" } }),
                React.createElement("div", { className: "long-hand-attachment" })
            );
        }
    });

    var Ticks = React.createClass({
        displayName: "Ticks",

        buildTick: function buildTick(index) {
            return React.createElement(
                "div",
                { key: index, className: "tick " + (index % 5 === 0 ? "big " : ""), style: { transform: "rotate(" + index * 6 + "deg)", WebkitTransform: "rotate(" + index * 6 + "deg)" } },
                React.createElement("div", null)
            );
        },

        render: function render() {
            var ticks = [];
            for (var i = 0; i < 60; i++) ticks.push(this.buildTick(i));

            return React.createElement(
                "div",
                { className: "ticks" },
                ticks
            );
        }
    });

    function _pad(value) {
        value = value.toString();
        return value.length === 1 ? "0" + value : value;
    }

    return TimePicker;
});
