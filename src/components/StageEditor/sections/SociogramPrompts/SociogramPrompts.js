import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { arrayPush } from 'redux-form';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import Guidance from '../../../Guidance';
import SociogramPrompt from './SociogramPrompt';
import { Items, NewButton } from '../../Sortable';
import ValidatedFieldArray from '../../../Form/ValidatedFieldArray';

const fieldName = 'prompts';

const notEmpty = value => (
  value && value.length > 0 ? undefined : 'You must create at least one prompt'
);

const SociogramPrompts = ({
  form,
  addNewPrompt,
}) => (
  <Guidance contentId="guidance.editor.sociogram_prompts">
    <div className="stage-editor-section">
      <h2>Prompts</h2>
      <p>Add prompts to your Sociogram:</p>
      <div className="stage-editor-section-prompts">
        <div className="stage-editor-section-prompts__prompts">
          <ValidatedFieldArray
            name={fieldName}
            component={Items}
            itemComponent={SociogramPrompt}
            form={form}
            validation={{ notEmpty }}
          />
        </div>
        <NewButton onClick={addNewPrompt} />
      </div>
    </div>
  </Guidance>
);

SociogramPrompts.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string,
    getValues: PropTypes.func,
  }).isRequired,
  addNewPrompt: PropTypes.func.isRequired,
};

SociogramPrompts.defaultProps = {
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = (dispatch, { form: { name } }) => ({
  addNewPrompt: bindActionCreators(
    () => arrayPush(
      name,
      fieldName,
      {
        id: uuid(),
        text: '',
        subject: {},
        layout: { allowPositioning: true },
        sortOrderBy: [],
        background: { concentricCircles: 4, skewedTowardCenter: false },
      },
    ),
    dispatch,
  ),
});

export { SociogramPrompts };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(SociogramPrompts);
