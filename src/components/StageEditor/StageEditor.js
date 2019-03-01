import React, { Component } from 'react';
import {
  formValueSelector,
} from 'redux-form';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import Editor from '../Editor';
import { getInterface } from './Interfaces';

const formName = 'edit-stage';

const INTERFACE_NAMES = {
  Information: 'Information',
  NameGenerator: 'Name Generator',
  NameGeneratorList: 'Roster Name Generator (list)',
  NameGeneratorAutoComplete: 'Roster Name Generator (search)',
  Sociogram: 'Sociogram',
};

const getInterfaceName = type => INTERFACE_NAMES[type] || type;

class StageEditor extends Component {
  componentDidMount() {
    ipcRenderer.on('REFRESH_PREVIEW', this.handleRefresh);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('REFRESH_PREVIEW', this.handleRefresh);
  }

  sections() {
    return getInterface(this.props.type).sections;
  }

  handleRefresh = () => {
    this.props.previewStage();
  }

  render() {
    const getFormValues = formValueSelector(formName);
    // TODO: remove form value getter and make this a string,
    // requires updating components
    const form = { name: formName, getValues: getFormValues };

    return (
      <Editor
        formName={formName}
        title={`Edit ${getInterfaceName(this.props.type)}`}
        {...this.props}
      >
        {
          ({ submitFailed, windowRoot }) =>
            this.sections().map((SectionComponent, index) => (
              <SectionComponent
                key={index}
                form={form}
                hasSubmitFailed={submitFailed}
                // `windowRoot` will ensure connect() components re-render
                // when the window root changes
                windowRoot={windowRoot}
              />
            ))
        }
      </Editor>
    );
  }
}

StageEditor.propTypes = {
  type: PropTypes.string.isRequired,
};

export {
  formName,
  StageEditor,
};

export default StageEditor;
