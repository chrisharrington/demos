"use strict";

(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined")
        module.exports = factory();
    if (typeof define === "function" && define.amd)
        define(factory);
    (global || window).AReactTimepicker = factory();
}(this, function () {
	var React = typeof require === "function" ? require("react") : window.React;

    var CLOCK_SIZE = 182;

    var TimePicker = React.createClass({
    	getInitialState: function() {
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

    	componentWillMount: function() {
    		document.addEventListener("click", this.hideOnDocumentClick);
    	},

    	componentWillUnmount: function() {
    		document.removeEventListener("click", this.hideOnDocumentClick);
    	},

    	show: function() {
    		var trigger = this.refs.trigger.getDOMNode(),
    			rect = trigger.getBoundingClientRect(),
    			isTopHalf = rect.top > window.innerHeight/2;

    		this.setState({
    			visible: true,
    			position: {
    				top: isTopHalf ? (rect.top + window.scrollY - CLOCK_SIZE - 3) : (rect.top + trigger.clientHeight + window.scrollY + 3),
    				left: rect.left
    			}
    		});
    	},

    	hide: function() {
    		this.setState({
    			visible: false
    		});
    	},

    	hideOnDocumentClick: function(e) {
    		if (!this.parentsHaveClassName(e.target, "time-picker"))
    			this.hide();
    	},

    	parentsHaveClassName: function(element, className) {
    		var parent = element;
    		while (parent) {
    			if (parent.className && parent.className.indexOf(className) > -1)
    				return true;

    			parent = parent.parentNode;
    		}

    		return false;
    	},

    	onTimeChanged: function(hour, minute, am) {
    		this.setState({
    			hour: hour,
    			minute: minute,
    			am: am
    		});
    	},

    	onDone: function() {
    		this.hide();
    	},

    	formatTime: function() {
    		return this.state.hour.toString().pad(2) + ":" + this.state.minute.toString().pad(2) + " " + (this.state.am ? "AM" : "PM");
    	},

    	render: function() {
    		return <div className="time-picker">
    			<input ref="trigger" type="text" disabled value={this.formatTime()} onClick={this.show} />
    			<Clock visible={this.state.visible} position={this.state.position} onTimeChanged={this.onTimeChanged} onDone={this.onDone} hour={this.state.hour} minute={this.state.minute} am={this.state.am} />
    		</div>;
    	}
    });

    var Clock = React.createClass({
        getInitialState: function() {
            return {
                hoursVisible: true,
                minutesVisible: false,
    			position: "below"
            };
        },

    	componentWillReceiveProps: function(props) {
    		if (this.props.visible && !props.visible)
    			this.setState({
    				hoursVisible: true,
    				minutesVisible: false,
    				amPmVisible: false
    			});
    	},

    	getTime: function() {
    		return {
    			hour: this.props.hour,
    			minute: this.props.minute,
    			am: this.props.am
    		};
    	},

    	onHourChanged: function(hour) {
    		this._hour = hour;
    		this.setState({
    			hoursVisible: false,
    			minutesVisible: true
    		});
    	},

    	onHoursHidden: function() {
    		this.props.onTimeChanged(this._hour, this.props.minute, this.props.am);
    	},

    	onMinuteChanged: function(minute) {
    		this.props.onDone();
    		this._minute = minute;

    		this.setState({
    			minutesVisible: false,
    			amPmVisible: true
    		});
    	},

    	onMinutesHidden: function() {
    		this.props.onTimeChanged(this.props.hour, this._minute, this.props.am);
    	},

    	onAmPmChanged: function(am) {
    		this.props.onTimeChanged(this.props.hour, this.props.minute, am);
    	},

    	style: function() {
    		return {
    			top: this.props.position.top,
    			left: this.props.position.left
    		};
    	},

    	render: function() {
    		return <div className={"clock " + (this.props.visible ? "clock-show" : "clock-hide")} style={this.style()}>
    			<div className="clock-face-wrapper">
    	            <Hours visible={this.state.hoursVisible} time={this.getTime()} onClick={this.onHourChanged} onHidden={this.onHoursHidden} />
    				<Minutes visible={this.state.minutesVisible} time={this.getTime()} onClick={this.onMinuteChanged} onHidden={this.onMinutesHidden} />
    			</div>
    			<AmPmInfo time={this.getTime()} onChange={this.onAmPmChanged} />
    		</div>;
    	}
    });

    var AmPmInfo = React.createClass({
    	render: function() {
    		var time = this.props.time;
    		return <div className="am-pm-info">
    			<div className={"am" + (time.am ? " selected" : "")} onClick={this.props.onChange.bind(null, true)}>AM</div>
    			<Time time={time} />
    			<div className={"pm" + (!time.am ? " selected" : "")} onClick={this.props.onChange.bind(null, false)}>PM</div>
    		</div>;
    	}
    });

    var Time = React.createClass({
    	render: function() {
    		var time = this.props.time;
    		return <div className="time">
    			<span className="hour">{time.hour.toString().pad(2)}</span>
    			<span>:</span>
    			<span className="minute">{time.minute.toString().pad(2)}</span>
    			<span> </span>
    			<span className="am-pm">{time.am ? "AM" : "PM"}</span>
    		</div>;
    	}
    });

    var Hours = React.createClass({
        buildHours: function() {
            var hours = [];
            for (var i = 1; i <= 12; i++)
                hours.push(i);
            return hours;
        },

    	render: function() {
    		var { time, ...props } = this.props;
    		return <Face {...props} type="hours" values={this.buildHours()} selected={this.props.time.hour} />;
    	}
    });

    var Minutes = React.createClass({
        buildMinutes: function() {
            var minutes = [];
            for (var i = 1; i <= 12; i++)
                minutes.push(((i === 12 ? 0 : i)*5).toString().pad(2));
            return minutes;
        },

    	render: function() {
    		var { time, ...props } = this.props;
    		return <Face {...props} type="minutes" values={this.buildMinutes()} selected={this.props.time.minute} />;
    	}
    });

    var Face = React.createClass({
    	componentDidMount: function() {
    		this.refs.face.getDOMNode().addEventListener("transitionend", this.onTransitionEnd);
    	},

    	componentWillUnmount: function() {
    		this.refs.face.getDOMNode().removeEventListener("transitionend", this.onTransitionEnd);
    	},

    	onTransitionEnd: function(e) {
    		if (e.propertyName === "opacity" && e.target.className.indexOf("face-hide") > -1)
    			this.props.onHidden();
    	},

    	pad: function(value) {
    		value = value.toString();
    		return value.length === 1 ? ("0" + value) : value;
    	},

    	render: function() {
    		return <div ref="face" className={"face " + this.props.type + (this.props.visible ? " face-show" : " face-hide")}>
                {this.props.values.map(function(value, i) {
                    return <div key={i} className={"position position-" + (i+1) + (parseInt(this.props.selected) === parseInt(value) ? " selected" : "")} onClick={this.props.onClick.bind(null, value)}>{this.pad(value)}</div>;
                }.bind(this))}
    			<LongHand type={this.props.type} selected={this.props.selected} />
    			<div className="inner-face"></div>
    			<Ticks />
    		</div>;
    	}
    });

    var LongHand = React.createClass({
    	render: function() {
    		return <div>
    			<div className={"long-hand " + this.props.type + "-position-" + this.props.selected}></div>
    			<div className="long-hand-attachment"></div>
    		</div>;
    	}
    });

    var Ticks = React.createClass({
    	buildTick: function(index) {
    		return <div key={index} className={"tick " + (index%5 === 0 ? "big " : "")} style={{ transform: "rotate(" + (index*6) + "deg)"}}>
    			<div></div>
    		</div>;
    	},

    	render: function() {
    		var ticks = [];
    		for (var i = 0; i < 60; i++)
    			ticks.push(this.buildTick(i));

    		return <div className="ticks">
    			{ticks}
    		</div>;
    	}
    });

    return TimePicker;

}));
