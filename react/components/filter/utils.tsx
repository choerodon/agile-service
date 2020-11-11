import React from 'react';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import { IFilter } from '@/components/filter';
import { find } from 'lodash';
import { IFilterField, ICustomField } from './index';
import { IRenderFields } from './Filter';
import InputField from './components/InputField';
import NumberField from './components/NumberField';
/* eslint-disable camelcase */
export function getFlatElement(field: IFilterField, element: React.ReactNode) {
  if (field.system) {
    return element;
  }
  switch (field.fieldType) {
    case 'number':
      // @ts-ignore
      return <NumberField />;
    case 'input':
    case 'text':
      // @ts-ignore
      return <InputField />;
    default: {
      return element;
    }
  }
}
export function renderFlatField(field: IFilterField, { element, removeButton }: { element: React.ReactElement, removeButton: React.ReactElement | null }) {
  const isSelect = ['single', 'multiple', 'radio', 'checkbox', 'member'].includes(field.fieldType);
  const className = classNames({
    'c7n-pro-select-flat': isSelect,
    'c7n-pro-cascader-flat': isSelect,
  });
  return (
    <div
      key={field.code}
      style={{
        display: 'flex', alignItems: 'center', marginBottom: 10,
      }}
    >
      {React.cloneElement(element, {
        style: {
          marginRight: 10, marginTop: 0, flex: 1, flexShrink: 1,
        },
        className,
      })}
      {removeButton && (
        <div
          role="none"
          style={{
            cursor: 'pointer',
            borderRadius: '50%',
            width: 14,
            height: 14,
            lineHeight: '11px',
            background: 'rgba(0,0,0,0.16)',
            color: 'white',
            textAlign: 'center',
            marginRight: 10,
          }}
          onClick={removeButton.props.onClick}
        >
          <Icon
            type="close"
            style={{ fontSize: '10px' }}
          />
        </div>
      )}
    </div>
  );
}
function renderField(field: IFilterField, { element, removeButton }: { element: React.ReactElement, removeButton: React.ReactElement | null }) {
  return (
    <div key={field.code} style={{ display: 'flex', alignItems: 'center' }}>
      {React.cloneElement(element, {
        style: {
          marginRight: 10, marginBottom: 10, marginTop: 10, flex: 1, flexShrink: 1, maxWidth: 'calc(100% - 50px)',
        },
        labelLayout: 'float',
      })}
      {removeButton}
    </div>
  );
}
export const renderGroupedFields: IRenderFields = ({
  fields, getFieldElement, selectField, resetButton,
}) => {
  const selectTypes: IFilterField[] = [];
  const dateTypes: IFilterField[] = [];
  const inputTypes: IFilterField[] = [];
  let contentField = null;
  fields.forEach((field) => {
    if (field.code === 'contents' || field.code === 'content') {
      contentField = field;
      return;
    }
    if (['single', 'multiple', 'radio', 'checkbox', 'member'].includes(field.fieldType)) {
      selectTypes.push(field);
    } else if (['time', 'datetime', 'date'].includes(field.fieldType)) {
      dateTypes.push(field);
    } else if (['input', 'text', 'number'].includes(field.fieldType)) {
      inputTypes.push(field);
    }
  });
  const types = [selectTypes, inputTypes, dateTypes].filter((arr) => arr.length > 0);
  const result = types.map((type) => (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 4,
    }}
    >
      {type.map((f, i) => renderFlatField(f, getFieldElement(f)))}
    </div>
  ));
  if (result.length > 0) {
    result[result.length - 1].props.children.push(<div style={{ marginLeft: 10, marginTop: 3 }}>{selectField}</div>);
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {contentField && <div>{getFieldElement(contentField).element}</div>}
      <div>
        {result}
      </div>
      {resetButton && React.cloneElement(resetButton, {
        style: {
          marginLeft: 'auto',
          marginRight: 10,
          flexShrink: 0,
        },
      })}
    </div>
  );
};
export const renderFields: IRenderFields = ({
  fields, getFieldElement, selectField, resetButton,
}) => (
  <>
    {fields.map((f) => renderField(f, getFieldElement(f)))}
    {selectField}
  </>
);

interface ICustomFieldSearch {
  fieldId: string
  value: any
}
interface IDateFieldSearch {
  fieldId: string,
  startDate: string,
  endDate: string,
}
export interface ICustomFieldFilter {
  option: ICustomFieldSearch[],
  date: IDateFieldSearch[],
  date_hms: IDateFieldSearch[],
  number: ICustomFieldSearch[],
  string: ICustomFieldSearch[],
  text: ICustomFieldSearch[],
}

export function departFilter(filter: IFilter, fields: IFilterField[]) {
  const customField: ICustomFieldFilter = {
    option: [],
    date: [],
    date_hms: [],
    number: [],
    string: [],
    text: [],
  };
  const systemFilter: { [key: string]: any } = {};
  const otherFilter: { [key: string]: any } = {};
  Object.keys(filter).forEach((code) => {
    const field = find(fields, { code });

    if (field) {
      const { fieldType, system } = field;
      const value = filter[code];
      if (value === undefined || value === null || value === '') {
        return;
      }

      // 系统字段
      if (system) {
        systemFilter[code] = value;
        return;
      }
      const { id } = field as ICustomField;
      switch (fieldType) {
        case 'single':
        case 'multiple':
        case 'radio':
        case 'checkbox':
        case 'member': {
          const v = Array.isArray(value) ? value : [value];
          if (v.length > 0) {
            customField.option.push({
              fieldId: id,
              value: v,
            });
          }
          break;
        }
        case 'input': {
          if (value && value.length > 0) {
            customField.string.push({
              fieldId: id,
              value,
            });
          }
          break;
        }
        case 'text': {
          if (value && value.length > 0) {
            customField.text.push({
              fieldId: id,
              value,
            });
          }
          break;
        }
        case 'number': {
          customField.number.push({
            fieldId: id,
            value,
          });
          break;
        }
        case 'time':
        case 'datetime':
        case 'date': {
          if (value && value.length > 0) {
            if (value[0] && value[1]) {
              if (fieldType === 'time') {
                customField.date_hms.push({
                  fieldId: id,
                  startDate: value[0],
                  endDate: value[1],
                });
              } else {
                customField.date.push({
                  fieldId: id,
                  startDate: value[0],
                  endDate: value[1],
                });
              }
            }
          }
          break;
        }
        default: break;
      }
    } else {
      const value = filter[code];
      otherFilter[code] = value;
    }
  });
  return {
    otherFilter,
    systemFilter,
    customField,
  };
}
