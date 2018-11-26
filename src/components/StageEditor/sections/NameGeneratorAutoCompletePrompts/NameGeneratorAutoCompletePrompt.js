import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import Markdown from 'react-markdown';
import { Field } from 'redux-form';
import { ValidatedField } from '../../../Form';
import * as Fields from '../../../../ui/components/Fields';
import Select from '../../../Form/Fields/Select';
import MultiSelect from '../../../Form/MultiSelect';
import AttributesTable from '../../../AttributesTable';
import { ExpandableItem, Row, Group } from '../../../OrderedList';
import { getFieldId } from '../../../../utils/issues';
import {
  optionGetters,
  withFieldValues,
  withExternalDataPropertyOptions,
} from '../NameGeneratorListPrompts';
import withDisplayLabelChangeHandler from '../NameGeneratorListPrompts/withDisplayLabelChangeHandler';

const NameGeneratorAutoCompletePrompt = ({
  handleValidateAttributes,
  fieldId,
  form,
  nodeType,
  dataSources,
  dataSource,
  cardOptions,
  externalDataPropertyOptions,
  handleChangeDisplayLabel,
  ...rest
}) => {
  const displayLabel = cardOptions && cardOptions.displayLabel;

  const additionalPropertiesOptions = optionGetters.getExternalPropertiesOptionGetter(
    externalDataPropertyOptions.filter(({ value }) => value !== displayLabel),
  );

  return (
    <ExpandableItem
      {...rest}
      preview={(
        <div className="stage-editor-section-prompt__preview--centered">
          <Field
            name={`${fieldId}.text`}
            component={field => <Markdown source={field.input.value} />}
          />
        </div>
      )}
    >
      <Row>
        <div id={getFieldId(`${fieldId}.text`)} data-name="Prompt text" />
        <h3>Text for Prompt</h3>
        <ValidatedField
          name={`${fieldId}.text`}
          component={Fields.TextArea}
          label=""
          placeholder="Enter text for the prompt here"
          validation={{ required: true }}
        />
      </Row>
      <Row>
        <div id={getFieldId(`${fieldId}.additionalAttributes`)} data-name="Prompt additional attributes" />
        <h3>Additional attributes</h3>
        <AttributesTable
          name={`${fieldId}.additionalAttributes`}
          id="additionalAttributes"
          nodeType={nodeType}
        />
      </Row>
      <Row id={getFieldId(`${fieldId}.dataSource`)} data-name="Prompt data source">
        <h3>External data-source for roster</h3>
        <p>This prompt needs a source of nodes to populate the roster.</p>
        <ValidatedField
          component={Select}
          name={`${fieldId}.dataSource`}
          id="dataSource"
          options={dataSources}
          validation={{ required: true }}
        />
      </Row>

      { dataSource &&
        <Group>
          <Row>
            <h3>Card options</h3>
            <p>
              How would you like to the search results to be displayed?
            </p>
          </Row>
          <Row id={getFieldId(`${fieldId}.cardOptions.displayLabel`)} data-name="Prompt card display Label">
            <h4>Display Label</h4>
            <p>Which property should be used to uniquely identify each node?</p>
            <ValidatedField
              component={Select}
              name={`${fieldId}.cardOptions.displayLabel`}
              id="displayLabel"
              options={externalDataPropertyOptions}
              validation={{ required: true }}
              onChange={handleChangeDisplayLabel}
            />
          </Row>

          { displayLabel &&
            <Row>
              <h4>Additional Display Properties</h4>
              <p>
                Would you like do display any other attributes to help identify each node?
              </p>
              <MultiSelect
                name={`${fieldId}.cardOptions.additionalProperties`}
                maxItems={externalDataPropertyOptions.length - 1}
                properties={[
                  {
                    fieldName: 'variable',
                  },
                  {
                    fieldName: 'label',
                    component: Fields.Text,
                    placeholder: 'Label',
                  },
                ]}
                options={additionalPropertiesOptions}
              />
            </Row>
          }
        </Group>
      }

      { dataSource &&
        <Group>
          <Row>
            <h3>Search options</h3>
            <p>
              Which properties would you like to make searchable?
            </p>
          </Row>
          <Row
            id={getFieldId(`${fieldId}.searchOptions.matchProperties`)}
            data-name="Prompt Search Match Properties"
          >
            <h4>Search Properties</h4>
            <p>When the participant searches, which properties should be searched?</p>
            <Field
              name={`${fieldId}.searchOptions.matchProperties`}
              component={Fields.CheckboxGroup}
              options={externalDataPropertyOptions}
            />
          </Row>
          <Row
            id={getFieldId(`${fieldId}.searchOptions.fuzziness`)}
            data-name="Prompt Search Fuzziness"
          >
            <h4>Search Fuzziness</h4>
            <p>How accurate does the participant need to be when searching?</p>
            <p>If the roster contains many similar nodes, you might want to help narrow down
              searches by selecting &quot;low&quot; fuzziness.
            </p>
            <Field
              name={`${fieldId}.searchOptions.fuzziness`}
              component={Fields.RadioGroup}
              options={[
                { value: 0, label: 'Exact' },
                { value: 0.3, label: 'Low' },
                { value: 0.6, label: 'High' },
              ]}
            />
          </Row>
        </Group>
      }
    </ExpandableItem>
  );
};

NameGeneratorAutoCompletePrompt.propTypes = {
  fieldId: PropTypes.string.isRequired,
  form: PropTypes.shape({
    name: PropTypes.string,
    getValues: PropTypes.func,
  }).isRequired,
  nodeType: PropTypes.string,
  dataSources: PropTypes.array,
  externalDataPropertyOptions: PropTypes.array,
};

NameGeneratorAutoCompletePrompt.defaultProps = {
  nodeType: null,
  dataSources: [],
  externalDataPropertyOptions: [],
};

export { NameGeneratorAutoCompletePrompt };

export default compose(
  withFieldValues(['dataSource', 'cardOptions']),
  withExternalDataPropertyOptions,
  withDisplayLabelChangeHandler,
)(NameGeneratorAutoCompletePrompt);
