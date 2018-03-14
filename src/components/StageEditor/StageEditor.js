import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { compose, withState, withHandlers } from 'recompose';
import cx from 'classnames';
import {
  Title,
  ContentItems,
  NodeType,
  Form,
  Prompts,
  Panels,
} from './sections';
import { Guided, Section, Edit } from '../Guided';

const withCodeViewToggle = compose(
  withState('codeView', 'toggleCodeView', false),
  withHandlers({
    showCodeView: ({ toggleCodeView }) => () => toggleCodeView(true),
    hideCodeView: ({ toggleCodeView }) => () => toggleCodeView(false),
    toggleCodeView: ({ toggleCodeView }) => () => toggleCodeView(current => !current),
  }),
);

const interfaces = {
  Information: [
    Title,
    ContentItems,
  ],
  NameGenerator: [
    Title,
    NodeType,
    Form,
    Prompts,
    Panels,
  ],
};

const renderSections = (interfaceSections, props) => {
  if (interfaceSections.length === 0) { return (<div>Not yet editable.</div>); }

  return interfaceSections.map(
    (InterfaceSection, index) =>
      <InterfaceSection {...props} key={index} />,
  );
};

const renderInterfaceSections = (props) => {
  const stageType = props.stage.type;
  const interfaceSections = get(interfaces, stageType, []);
  return renderSections(interfaceSections, props);
};

const StageEditor = (props) => {
  const { stage: { type }, toggleCodeView, codeView } = props;

  return (
    <div className={cx('stage-editor', { 'stage-editor--show-code': codeView })}>
      <Guided className="stage-editor__sections">
        <Section className="stage-editor-section">
          <Edit className="stage-editor-section__edit">
            <h1>Edit {type} Screen</h1>
            <button onClick={toggleCodeView}>Show Code View</button>
          </Edit>
        </Section>
        { renderInterfaceSections(props) }
      </Guided>
      <div className="stage-editor__code" onClick={toggleCodeView}>
        <pre>
          <code>
            { JSON.stringify(props.stage, null, 2) }
          </code>
        </pre>
      </div>
    </div>
  );
};

StageEditor.propTypes = {
  stage: PropTypes.object.isRequired,
  toggleCodeView: PropTypes.func.isRequired,
  codeView: PropTypes.bool.isRequired,
};

export default compose(
  withCodeViewToggle,
)(StageEditor);
