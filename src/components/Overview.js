import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Flipped } from 'react-flip-toolkit';
import { map, get, size } from 'lodash';
import { bindActionCreators } from 'redux';
import { compose } from 'recompose';
import { Node, Icon } from '../ui/components';
import * as Fields from '../ui/components/Fields';
import { getProtocol } from '../selectors/protocol';
import Link from './Link';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as uiActions } from '../ducks/modules/ui';

class Overview extends Component {
  renderNodeTypes() {
    const nodeTypes = get(this.props.codebook, 'node', {});
    if (size(nodeTypes) === 0) {
      return (
        <em>No node types defined, yet. <Link screen="type" params={{ category: 'node' }}>Create one?</Link></em>
      );
    }

    return map(
      nodeTypes,
      (node, type) => (
        <Link
          screen="type"
          params={{ category: 'node', type }}
          key={type}
        >
          <Node label={node.label} color={get(node, 'color', '')} />
        </Link>
      ),
    );
  }

  renderEdgeTypes() {
    const edgeTypes = get(this.props.codebook, 'edge', {});

    if (size(edgeTypes) === 0) {
      return (
        <em>No edge types defined, yet. <Link screen="type" params={{ category: 'edge' }}>Create one?</Link></em>
      );
    }

    return map(
      edgeTypes,
      (edge, type) => (
        <Link
          screen="type"
          params={{ category: 'edge', type }}
          key={type}
        >
          <Icon name="links" color={get(edge, 'color', '')} />
        </Link>
      ),
    );
  }

  render() {
    const {
      name,
      description,
      updateOptions,
      show,
      flipId,
    } = this.props;

    if (!show || !flipId) { return null; }

    return (
      <React.Fragment>
        <Flipped flipId={flipId}>
          <div className="overview">
            <div className="overview__panel">
              <div className="overview__groups">
                <div className="overview__group overview__group--title">
                  <h1 className="overview__name">{name}</h1>
                  <Fields.Text
                    className="timeline-overview__name"
                    placeholder="Enter a description for your protocol here"
                    label="Protocol description"
                    input={{
                      value: description,
                      onChange:
                        ({ target: { value } }) => {
                          updateOptions({ description: value });
                        },
                    }}
                  />
                </div>
                {/* <div className="overview__group overview__group--variable-registry">
                  <legend className="overview__group-title">Variable registry</legend>
                  <div className="overview__group-section">
                    <h4>Node types</h4>
                    { this.renderNodeTypes() }
                  </div>
                  <div className="overview__group-section">
                    <h4>Edge types</h4>
                    { this.renderEdgeTypes() }
                  </div>
                  <div className="overview__manage-button">
                    <Link screen="codebook">
                      <Button size="small">Manage codebook</Button>
                    </Link>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </Flipped>
      </React.Fragment>
    );
  }
}

Overview.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  codebook: PropTypes.object.isRequired,
  updateOptions: PropTypes.func,
  flipId: PropTypes.string,
  show: PropTypes.bool,
};

Overview.defaultProps = {
  show: true,
  name: null,
  description: '',
  flipId: null,
  updateOptions: () => {},
};

const mapDispatchToProps = dispatch => ({
  updateOptions: bindActionCreators(protocolActions.updateOptions, dispatch),
  openScreen: bindActionCreators(uiActions.openScreen, dispatch),
});

const mapStateToProps = (state) => {
  const protocol = getProtocol(state);

  return {
    name: protocol && protocol.name,
    description: protocol && protocol.description,
    codebook: protocol && protocol.codebook,
  };
};

export { Overview };

export default compose(connect(mapStateToProps, mapDispatchToProps))(Overview);
