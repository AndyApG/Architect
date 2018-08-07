import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { map, get } from 'lodash';
import { compose } from 'recompose';
import { SeamlessText } from '../../Form/Fields';
import { Tweened } from '../../../behaviours/Tweened';
import { Node, Icon } from '../../../ui';
import { actionCreators as protocolActions } from '../../../ducks/modules/protocol';
import PanelGroup from './PanelGroup';

class Overview extends Component {
  get renderNodeTypes() {
    const nodeTypes = get(this.props.variableRegistry, 'node', {});

    if (nodeTypes.length === 0) {
      return 'No node types defined';
    }

    return map(
      nodeTypes,
      (node, key) => (
        <Link to={this.pathTo(`registry/node/${key}`)} key={key}>
          <Node label={node.label} color={get(node, 'color', '')} />
        </Link>
      ),
    );
  }

  get renderEdgeTypes() {
    const edgeTypes = get(this.props.variableRegistry, 'edge', {});

    if (edgeTypes.length === 0) {
      return 'No edge types defined';
    }

    return map(
      edgeTypes,
      (edge, key) => (
        <Link
          to={this.pathTo(`registry/edge/${key}`)}
          key={key}
          className="timeline-overview__edge"
          title={edge.label}
          style={{
            backgroundColor: `var(--${get(edge, 'color', '')})`,
          }}
        >
          <Icon name="links" />
        </Link>
      ),
    );
  }

  get renderForms() {
    const forms = this.props.forms;

    if (forms.length === 0) {
      return 'No forms defined';
    }

    return (
      <ul>
        {map(
          forms,
          (form, key) => (
            <li key={key}>
              <Link to={this.pathTo(`form/${key}`)}>
                {form.title}
              </Link>
            </li>
          ),
        )}
      </ul>
    );
  }

  pathTo(location) {
    const protocol = get(this.props.match, 'params.protocol');
    if (!protocol) { return ''; }
    return `/edit/${protocol}/${location}`;
  }

  render() {
    const {
      name,
      updateOptions,
    } = this.props;

    return (
      <div className="timeline-overview">
        <form>
          <div className="timeline-overview__panel">
            <div className="timeline-overview__content">
              <SeamlessText
                className="timeline-overview__name"
                input={{
                  value: name,
                  onChange: ({ target: { value } }) => { updateOptions({ name: value }); },
                }}
              />
              <div className="timeline-overview__groups">
                <PanelGroup title="Variable registry">
                  <br />
                  <h4>Node types</h4>
                  <div>
                    { this.renderNodeTypes }
                  </div>
                  <br />
                  <h4>Edge types</h4>
                  <div>
                    { this.renderEdgeTypes }
                  </div>
                  <div className="timeline-overview__manage-button">
                    <Link className="button button--small" to={this.pathTo('registry')}>
                      Manage registry
                    </Link>
                  </div>
                </PanelGroup>
                <PanelGroup title="Forms">
                  { this.renderForms }
                  <div className="timeline-overview__manage-button">
                    <Link className="button button--small" to={this.pathTo('forms')}>
                      Manage forms
                    </Link>
                  </div>
                </PanelGroup>
                <PanelGroup title="Global Options">
                  <p>This panel will display global protocol options.</p>
                </PanelGroup>
                <PanelGroup title="Assets">
                  <p>This panel will display assets, such as images, video, and data.</p>
                  <div className="timeline-overview__manage-button">
                    <div className="button button--small button--platinum--dark">
                      Manage assets
                    </div>
                  </div>
                </PanelGroup>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

Overview.propTypes = {
  name: PropTypes.string,
  forms: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  variableRegistry: PropTypes.object,
  externalData: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  updateOptions: PropTypes.func,
  match: PropTypes.object.isRequired,
};

Overview.defaultProps = {
  name: '',
  forms: {},
  variableRegistry: {},
  externalData: {},
  updateOptions: () => {},
};

const mapDispatchToProps = dispatch => ({
  updateOptions: bindActionCreators(protocolActions.updateOptions, dispatch),
});

export default compose(
  connect(null, mapDispatchToProps),
  withRouter,
  Tweened({
    tweenName: 'protocol',
    tweenElement: 'overview-panel',
  }),
)(Overview);
