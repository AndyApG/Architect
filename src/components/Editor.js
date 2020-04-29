import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Form, getFormSyncErrors, hasSubmitFailed } from 'redux-form';
import PropTypes from 'prop-types';
import { compose, withState, withHandlers } from 'recompose';
import windowRootProvider from '@codaco/ui/lib/components/windowRootProvider';
import { FormCodeView } from './CodeView';
import Issues from './Issues';

/**
 * Editor is a scaffold for specific editor components.
 *
 * It includes:
 * - `<Guided />` component (info sidebar)
 * - `<Issues />` component, which provides interactive form errors
 * - `<FormCodeView />` component, which reveals the form's working copy of the configuration
 * - A redux-form `<Form />` component, which allows us to dispatch submit from outside
 *   the editor (necessary for our button footers).
 *
 * Required props:
 * - {string} form Name to use for the form in redux-form, this must match any child form
 *   components which hard-code this values
 * - {Component} component A React component which contains any number of redux-form `<Field />`
 * - {func} onSubmit(values) The submit handler, it receives the values of the form as an argument
 *   and will likely be hooked up to redux state.
 * - It also accepts the same props as `reduxForm()`, such as `initialValues`
 *
 * @example
 * export const formName = 'MY_EDITOR';
 *
 * const MySpecificEditor = ({
 *   submitHandler,
 * }) => (
 *   <Editor
 *     form={formName}
 *     component={MyFieldsComponent}
 *     onSubmit={submitHandler}
 *   />
 * );
 *
 * const mapDispatchToProps = (dispatch) => ({
 *   onSubmit: (values) => {
 *     if (values.id) {
 *       dispatch(actions.update(values.id, values));
 *     } else {
 *       dispatch(actions.create(values));
 *     }
 *   },
 * });
 *
 * export default connect(null, mapDispatchToProps)(MySpecificEditor);
 */
const Editor = ({
  handleSubmit,
  toggleCodeView,
  showCodeView,
  form,
  children,
  issues,
  title,
  submitFailed,
  component: Component,
  setWindowRoot,
  ...rest
}) => (
  <React.Fragment>
    <FormCodeView toggleCodeView={toggleCodeView} form={form} show={showCodeView} />
    <div className="editor" ref={setWindowRoot}>
      <div className="editor__window">
        <div className="editor__container">
          <div className="editor__content">
            <Form onSubmit={handleSubmit}>
              { title &&
                <React.Fragment>
                  <h1 className="editor__heading">{title}</h1>
                  <div className="code-button">
                    <small>(<a onClick={toggleCodeView} alt="show the code view for this interface">&lt;/&gt;</a>)</small>
                  </div>
                </React.Fragment>

              }
              { typeof children === 'function' &&
                children({ form, toggleCodeView, ...rest })
              }
              { children && typeof children !== 'function' && children }
              { !children &&
                <Component form={form} {...rest} />
              }
            </Form>
          </div>
          <Issues
            issues={issues}
            show={submitFailed}
          />
        </div>
      </div>
    </div>
  </React.Fragment>
);

Editor.propTypes = {
  toggleCodeView: PropTypes.func.isRequired,
  showCodeView: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  issues: PropTypes.object.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  form: PropTypes.string.isRequired,
  component: PropTypes.func,
};

Editor.defaultProps = {
  component: null,
};

const mapStateToProps = (state, props) => {
  const issues = getFormSyncErrors(props.form)(state);

  return {
    issues,
    hasSubmitFailed: hasSubmitFailed(props.form)(state),
  };
};

export { Editor };

export default compose(
  withState('showCodeView', 'updateCodeView', false),
  withHandlers({
    toggleCodeView: ({ updateCodeView }) => () => updateCodeView(current => !current),
  }),
  reduxForm({
    touchOnBlur: false,
    touchOnChange: true,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
  windowRootProvider,
)(Editor);
