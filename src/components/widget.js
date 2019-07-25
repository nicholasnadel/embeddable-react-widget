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
    const { bodyText, headerText, footerText } = this.props;

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
            <li>Visit</li>
            <li>Apply</li>
            <li>Give</li>
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
  headerText: PropTypes.string,
  bodyText: PropTypes.string,
  footerText: PropTypes.string,
};

Widget.defaultProps = {
  headerText: 'Header',
  bodyText: 'Body',
  footerText: 'Footer',
};

export default Widget;
