import React from 'react';
// import { Field } from 'redux-form';
import { Section, Editor, Guidance } from '../../Guided';
import { ValidatedField } from '../../../components/Form';
import SeamlessText from '../../../components/Form/Fields/SeamlessText';

const Title = props => (
  <Section className="stage-editor-section" {...props}>
    <Editor className="stage-editor-section__edit">
      <h2>Title</h2>
      <ValidatedField
        name="label"
        component={SeamlessText}
        placeholder="Enter your title here"
        className="stage-editor-section-title"
        validation={{ required: true }}
      />
    </Editor>
    <Guidance className="stage-editor-section__guidance">
      What is the title for this interface?
    </Guidance>
  </Section>
);

export default Title;
