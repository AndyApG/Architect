import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Button, Icon } from 'network-canvas-ui';
import { actionCreators as protocolsActions } from '../ducks/modules/protocols';
import { ProtocolCard } from '../components/Start';

class Start extends PureComponent {
  static propTypes = {
    protocols: PropTypes.array.isRequired,
    createProtocol: PropTypes.func.isRequired,
    loadProtocol: PropTypes.func.isRequired,
    locateAndLoadProtocol: PropTypes.func.isRequired,
  };

  static defaultProps = {
    protocols: [],
  };

  render() {
    return (
      <div className="start">

        <div className="start__brand" />

        <div className="start__hero">
          <div className="start__welcome">
            <h1 className="start__welcome-title">Architect</h1>
            <p className="start__welcome-lead">A tool for creating Network Canvas interviews</p>
          </div>

          <div className="start__call-to-action">
            <Button
              type="button"
              color="white"
              size="small"
              icon={<Icon name="arrow-right" />}
              onClick={() => this.props.createProtocol()}
            >Create new</Button>
            <Button
              type="button"
              color="platinum"
              size="small"
              icon={<Icon name="arrow-right" />}
              onClick={() => this.props.locateAndLoadProtocol()}
            >Open existing</Button>
          </div>
        </div>

        <div className="start__protocols">
          { this.props.protocols.map(protocol => (
            <div
              className="start__protocols-protocol"
              key={protocol.path}
            >
              <ProtocolCard
                name={protocol.path}
                onClick={() => this.props.loadProtocol(protocol.path)}
              />
            </div>
          )) }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  protocols: get(state, 'protocols', []).slice(-3),
});

const mapDispatchToProps = dispatch => ({
  createProtocol: bindActionCreators(protocolsActions.createProtocol, dispatch),
  loadProtocol: bindActionCreators(protocolsActions.loadProtocol, dispatch),
  locateAndLoadProtocol: bindActionCreators(protocolsActions.locateAndLoadProtocol, dispatch),
});

export { Start };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Start);
