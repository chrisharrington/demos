"use strict";

var DatePicker = React.createClass({displayName: "exports",
	getInitialState: function() {
        var def = this.props.selected || moment();
		return {
			view: def.clone(),
            selected: def.clone(),
			minDate: null,
			maxDate: null,
			visible: false
		};
	},

	componentDidMount: function() {
		document.addEventListener("click", function(e) {
			if (this.state.visible && e.target.className !== "date-picker-trigger" && !this.parentsHaveClassName(e.target, "date-picker"))
				this.hide();
		}.bind(this));
	},

	parentsHaveClassName: function(element, className) {
		var parent = element;
		while (parent) {
			if (parent.className && parent.className.indexOf(className) > -1)
				return true;

			parent = parent.parentNode;
		}
	},

	setMinDate: function(date) {
		this.setState({ minDate: date });
	},

	setMaxDate: function(date) {
		this.setState({ maxDate: date });
	},

	onSelect: function(day) {
        this.setState({ selected: day });
		this.props.onSelect(day);
		this.hide();
	},

	show: function() {
		this.setState({ visible: true });
	},

	hide: function() {
		this.setState({ visible: false });
	},

	render: function() {
		return React.createElement("div", {className: "date-picker"},
			React.createElement("input", {type: "text", className: "date-picker-trigger", readOnly: true, value: this.state.selected.format("YYYY-MM-DD"), onClick: this.show}),

			React.createElement(Calendar, {visible: this.state.visible, view: this.state.view, selected: this.state.selected, onSelect: this.onSelect, minDate: this.state.minDate, maxDate: this.state.maxDate})
		);
	}
});

var Calendar = React.createClass({displayName: "Calendar",
	onMove: function(view, isForward) {
		this.refs.weeks.moveTo(view, isForward);
	},

	onTransitionEnd: function() {
		this.refs.monthHeader.enable();
	},

	render: function() {
		return React.createElement("div", {className: "calendar" + (this.props.visible ? " visible" : "")},
			React.createElement(MonthHeader, {ref: "monthHeader", view: this.props.view, onMove: this.onMove}),
			React.createElement(WeekHeader, null),
			React.createElement(Weeks, {ref: "weeks", view: this.props.view, selected: this.props.selected, onTransitionEnd: this.onTransitionEnd, onSelect: this.props.onSelect, minDate: this.props.minDate, maxDate: this.props.maxDate})
		);
	}
});

var MonthHeader = React.createClass({displayName: "MonthHeader",
	getInitialState: function() {
		return {
			view: this.props.view.clone(),
			enabled: true
		};
	},

    moveBackward: function() {
		this.move(this.state.view.clone().add(-1, "months"), false);
    },

    moveForward: function() {
		this.move(this.state.view.clone().add(1, "months"), true);
    },

	move: function(view, isForward) {
		if (!this.state.enabled)
			return;

		this.setState({
			view: view,
			enabled: false
		});

		this.props.onMove(view, isForward);
	},

	enable: function() {
		this.setState({ enabled: true });
	},

	render: function() {
		var enabled = this.state.enabled;
		return React.createElement("div", {className: "month-header"},
            React.createElement("i", {className: "fa fa-angle-left" + (enabled ? "" : " disabled"), onClick: this.moveBackward}),
            React.createElement("span", null, this.state.view.format("MMMM YYYY")),
            React.createElement("i", {className: "fa fa-angle-right" + (enabled ? "" : " disabled"), onClick: this.moveForward})
		);
	}
});

var WeekHeader = React.createClass({displayName: "WeekHeader",
	render: function() {
		return React.createElement("div", {className: "week-header"},
            React.createElement("span", null, "Sun"),
            React.createElement("span", null, "Mon"),
            React.createElement("span", null, "Tue"),
            React.createElement("span", null, "Wed"),
            React.createElement("span", null, "Thu"),
            React.createElement("span", null, "Fri"),
            React.createElement("span", null, "Sat")
		);
	}
});

var Weeks = React.createClass({displayName: "Weeks",
	getInitialState: function() {
		return {
			view: this.props.view.clone(),
			other: this.props.view.clone(),
			sliding: null
		};
	},

	componentDidMount: function() {
		this.refs.current.getDOMNode().addEventListener("transitionend", this.onTransitionEnd);
	},

	onTransitionEnd: function() {
		this.setState({
			sliding: null,
			view: this.state.other.clone()
		});

		this.props.onTransitionEnd();
	},

    getWeekStartDates: function(view) {
		var view = view.clone().day(0),
         	starts = [view],
			current = view.clone().add(1, "week"),
			month = current.month();

		while (current.month() === month) {
			starts.push(current.clone());
			current = current.add(1, "week");
		}

		return starts;
    },

	moveTo: function(view, isForward) {
		this.setState({
			sliding: isForward ? "left" : "right",
			other: view.clone()
		});
	},

	render: function() {
		return React.createElement("div", {className: "weeks"},
			React.createElement("div", {ref: "current", className: "current" + (this.state.sliding ? (" sliding " + this.state.sliding) : "")},
				this.renderWeeks(this.state.view)
			),
			React.createElement("div", {ref: "other", className: "other" + (this.state.sliding ? (" sliding " + this.state.sliding) : "")},
				this.renderWeeks(this.state.other)
			)
		);
	},

	renderWeeks: function(view) {
		var starts = this.getWeekStartDates(view),
			month = starts[1].month();

		return _.map(starts, function(s, i) {
			return React.createElement(Week, {key: i, start: s, month: month, selected: this.props.selected, onSelect: this.props.onSelect, minDate: this.props.minDate, maxDate: this.props.maxDate});
		}.bind(this));
	}
});

var Week = React.createClass({displayName: "Week",
    buildDays: function(start) {
        var days = [start.clone()];
        for (var i = 1; i <= 6; i++)
            days.push(start.clone().day(i));
        return days;
    },

    isOtherMonth: function(day) {
        return this.props.month !== day.month();
    },

    getDayClassName: function(day) {
        var className = "day";
        if (day.isSame(moment(), "day"))
            className += " today";
        if (this.props.month !== day.month())
            className += " other-month";
        if (this.props.selected && this.props.selected.isSame(day, "day"))
            className += " selected";
		if (this.isDisabled(day))
			className += " disabled";
        return className;
    },

	onSelect: function(day) {
		if (!this.isDisabled(day))
			this.props.onSelect(day);
	},

	isDisabled: function(day) {
		var minDate = this.props.minDate,
			maxDate = this.props.maxDate;

		return (minDate && day.isBefore(minDate, "day")) || (maxDate && day.isAfter(maxDate, "day"));
	},

	render: function() {
        var days = this.buildDays(this.props.start);
		return React.createElement("div", {className: "week"},
            _.map(days, function(day, i) {
                return React.createElement("div", {key: i, onClick: this.onSelect.bind(null, day), className: this.getDayClassName(day)}, day.format("DD"))
            }.bind(this))
		);
	}
});
