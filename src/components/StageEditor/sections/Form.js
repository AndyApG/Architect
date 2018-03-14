/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { keys, get, pickBy, isNull } from 'lodash';
import { Section, Edit, Guidance } from '../../Guided';
import { OptionsInput } from '../../../components/Form';

const DEFAULT_FORM = Symbol('DEFAULT_FORM');
const CUSTOM_FORM = Symbol('CUSTOM_FORM');

class Form extends Component {
  static propTypes = {
    stage: PropTypes.object,
    forms: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    stage: {},
    forms: [],
    onChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formType: props.stage.form ? CUSTOM_FORM : DEFAULT_FORM,
    };
  }

  componentWillReceiveProps({ stage: { form } }) {
    this.setState({
      formType: form ? CUSTOM_FORM : DEFAULT_FORM,
    });
  }

  setForm = (formName) => {
    console.log({ formName });
    this.props.onChange({ form: formName })
  };

  onSelectFormCategory = (formType) => {
    if (formType === DEFAULT_FORM || this.select.value === '') {
      this.setForm(null); return;
    }

    this.setForm(this.select.value);
  };

  onSelectCustomForm = ({ target: { value } }) => {
    this.setForm(value);
  };

  onClickCreateNewForm = () => {
    // TODO: Create form popin
  };

  render() {
    const { stage: { form }, nodeType, forms, onChange, dispatch, ...props } = this.props;

    return (
      <Section className="stage-editor-section" {...props} show={!!nodeType}>
        <Edit className="stage-editor-section__edit">
          <h2>Form</h2>
          <p>Which form should be used to create and edit nodes on this stage?</p>
          <label onClick={() => this.onSelectFormCategory(DEFAULT_FORM)}>
            <input type="radio" checked={this.state.formType === DEFAULT_FORM} />
            Use the default node form
          </label>
          <div>
            <label onClick={() => this.onSelectFormCategory(CUSTOM_FORM)}>
              <input type="radio" checked={this.state.formType === CUSTOM_FORM} />
              Use a different form
            </label>
            <select
              onChange={this.onSelectCustomForm}
              ref={(select) => this.select = select}
              value={form}
            >
              <option selected="true" disabled="disabled" value="">Select a form...</option>
              { forms.map((formName) =>
                <option value={formName} key={formName}>
                  {formName}
                </option>)
              }
            </select>
          </div>
          <div onClick={this.onClickCreateNewForm}>
            <input type="radio" checked={false} />
            Create new form...
          </div>
        </Edit>
        <Guidance className="stage-editor-section__guidance">
          Which form would you like to use for these nodes?
        </Guidance>
      </Section>
    );
  }
}

const getForms = (state, props) => {
  const forms = get(state, 'protocol.present.forms', {});
  const nodeType = get(props, 'stage.nodeType', null);

  const validForms = pickBy(forms, form => {
    return form.type === nodeType && form.entity === 'node';
  });

  return keys(validForms);
}

const mapStateToProps = (state, props) => ({
  forms: getForms(state, props),
  nodeType: get(props, 'stage.nodeType', null),
});

export { Form };

export default compose(
  connect(mapStateToProps),
)(Form);
