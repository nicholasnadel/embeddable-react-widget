import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import './widget.scss';

class Widget extends Component {
  state = {
    opened: true,
    showDock: true,
  }

  handleToggleOpen = () => {
    this.setState((prev) => {
      let { showDock } = prev;
      if (!prev.opened) {
        showDock = false;
      }
      return {
        showDock,
        opened: !prev.opened,
      };
    });
  }

  handleWidgetExit = () => {
    this.setState({
      showDock: true,
    });
  }

  renderBody = () => {
    const { showDock } = this.state;

    if (!showDock) return '';

    return (
      <button
        type="button"
        className="dock"
        onClick={this.handleToggleOpen}
        onKeyPress={this.handleToggleOpen}
      >
        ^ OPEN ^
      </button>
    );
  }

  render() {
    const { opened } = this.state;
    const body = this.renderBody();
    const { var1, var2, var3 } = this.props;

    return (
      
      <div className="docked-widget">
        <div className="omninav">
        <div className="omninav-topbar black">
          <div className="leftmost">
          <ul>
            <li>
            More Info For  
            </li>  
          </ul>
          </div>
          <div className="rightmost">
          <ul>
            <li>{var1}</li>
            <li>{var2}</li>
            <li>{var3}</li>
          </ul>
          </div>
          <div className="omninav-search">
            search
          </div>
          <div className="paw">
            paw
          </div>
        </div>
      </div>
      </div>
    );
  }
}

Widget.propTypes = {
  var2: PropTypes.string,
  var1: PropTypes.string,
  var3: PropTypes.string,
};

Widget.defaultProps = {
  var1: ' default props',
  var2: ' from https://focused-ramanujan-df5c24.netlify.com/blank.html',
  var3: ' trying to pass from https://dev-cascade.chapman.edu/entity/open.act?id=2a73ea16c0a81e4b340dfbdd488c8d66&type=format',
};

export default Widget;
