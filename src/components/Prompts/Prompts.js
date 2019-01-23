import React, { PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  compose,
  defaultProps,
  withState,
  withHandlers,
} from 'recompose';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { arrayPush } from 'redux-form';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import cx from 'classnames';
import { getFieldId } from '../../utils/issues';
import Guidance from '../Guidance';
import OrderedList, { NewButton } from '../OrderedList';
import ValidatedFieldArray from '../Form/ValidatedFieldArray';
import PromptWindow from './PromptWindow';

const notEmpty = value => (
  value && value.length > 0 ? undefined : 'You must create at least one prompt'
);

class Prompts extends PureComponent {
  render() {
    const {
      editField,
      handleEditField,
      handleResetEditField,
      nodeType,
      form,
      disabled,
      handleAddNewPrompt,
      fieldName,
      contentId,
      children,
      editComponent: EditComponent,
      previewComponent: PreviewComponent,
      ...rest
    } = this.props;

    const stageEditorStyles = cx(
      'stage-editor-section',
      { 'stage-editor-section--disabled': disabled },
    );

    const isEditing = !!editField;


    return (
      <Guidance contentId={contentId}>
        <div className={stageEditorStyles}>
          <Flipper
            flipKey={isEditing}
            portalKey="prompts"
          >
            <div id={getFieldId(`${fieldName}._error`)} data-name="Prompts" />
            {children}
            <div className="stage-editor-section-prompts">
              <div className="stage-editor-section-prompts__prompts">
                { nodeType &&
                  <ValidatedFieldArray
                    name={fieldName}
                    component={OrderedList}
                    item={PreviewComponent}
                    form={form}
                    validation={{ notEmpty }}
                    onClickPrompt={handleEditField}
                    editField={editField}
                    {...rest}
                  />
                }
              </div>
              <NewButton onClick={handleAddNewPrompt} />
            </div>
            <PromptWindow
              show={!!editField}
              editField={editField}
              onBlur={handleResetEditField}
            >
              <Flipped flipId={editField}>
                <div className="prompts-prompt-window" >
                  <EditComponent
                    fieldId={editField}
                    onComplete={handleResetEditField}
                    nodeType={nodeType}
                    {...rest}
                  />
                </div>
              </Flipped>
            </PromptWindow>
          </Flipper>
        </div>
      </Guidance>
    );
  }
}

Prompts.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string,
    getValues: PropTypes.func,
  }).isRequired,
  disabled: PropTypes.bool,
  addNewPrompt: PropTypes.func.isRequired,
  nodeType: PropTypes.string,
  fieldName: PropTypes.string.isRequired,
  contentId: PropTypes.string,
  children: PropTypes.node,
  promptComponent: PropTypes.func.isRequired,
};

Prompts.defaultProps = {
  disabled: false,
  nodeType: null,
  contentId: null,
  children: null,
};

const mapStateToProps = (state, { form, fieldName }) => {
  const nodeType = get(form.getValues(state, 'subject'), 'type');
  const prompts = form.getValues(state, fieldName);
  const promptCount = prompts.length;

  return {
    disabled: !nodeType,
    nodeType,
    promptCount,
  };
};

const mapDispatchToProps = (dispatch, { fieldName, form: { name }, template = {} }) => {
  const addNewPrompt = () =>
    arrayPush(name, fieldName, { ...template, id: uuid() });

  return {
    addNewPrompt: bindActionCreators(addNewPrompt, dispatch),
  };
};

const withFieldNameDefault = defaultProps({
  fieldName: 'prompts',
});

const withEditingState = withState('editField', 'setEditField', null);

const withPromptHandlers = compose(
  withHandlers({
    handleEditField: ({ setEditField }) => fieldId => setEditField(fieldId),
    handleResetEditField: ({ setEditField }) => () => setEditField(),
    handleAddNewPrompt: ({ addNewPrompt, setEditField, promptCount, fieldName }) => () => {
      addNewPrompt();
      setImmediate(() => {
        setEditField(`${fieldName}[${promptCount}]`);
      });
    },
  }),
);

export { Prompts };

export default compose(
  withFieldNameDefault,
  withEditingState,
  connect(mapStateToProps, mapDispatchToProps),
  withPromptHandlers,
)(Prompts);
