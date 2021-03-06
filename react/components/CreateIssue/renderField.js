import React from 'react';

import {
  Select, Input, InputNumber,
  Checkbox, TimePicker, Row, Col, Radio, DatePicker,
} from 'choerodon-ui';
import moment from 'moment';
import SelectUser from '@/components/select/select-user-old';
import { MAX_NUMBER_VALUE, MAX_NUMBER_STEP, MAX_FLOAT_BITE } from '@/constants/MAX_VALUE';

const { TextArea } = Input;
const { Option } = Select;
export default function renderField(field) {
  const {
    fieldOptions, fieldType, required, fieldName,
  } = field;
  if (fieldType === 'radio') {
    if (fieldOptions && fieldOptions.length > 0) {
      return (
        <Radio.Group
          label={fieldName}
        >
          {fieldOptions && fieldOptions.length > 0
            && fieldOptions.filter((option) => option.enabled).map((item) => (
              <Radio
                className="radioStyle"
                value={item.id}
                key={item.id}
              >
                {item.value}
              </Radio>
            ))}
        </Radio.Group>
      );
    }
    return (
      <Radio.Group
        label={fieldName}
      >
        <span style={{ color: '#D50000' }}>暂无选项，请联系管理员</span>
      </Radio.Group>
    );
  } if (field.fieldType === 'checkbox') {
    if (fieldOptions && fieldOptions.length > 0) {
      return (
        <Checkbox.Group
          label={fieldName}
        >
          <Row>
            {fieldOptions && fieldOptions.length > 0
              && fieldOptions.filter((option) => option.enabled).map((item) => (
                <Col
                  span={24}
                  key={item.id}
                >
                  <Checkbox
                    value={item.id}
                    key={item.id}
                    className="checkboxStyle"
                  >
                    {item.value}
                  </Checkbox>
                </Col>
              ))}
          </Row>
        </Checkbox.Group>
      );
    }
    return (
      <Checkbox.Group
        label={fieldName}
      >
        <span style={{ color: '#D50000' }}>暂无选项，请联系管理员</span>
      </Checkbox.Group>
    );
  } if (field.fieldType === 'time') {
    return (
      <TimePicker
        label={fieldName}
        placeholder={fieldName}
        style={{ display: 'block', width: '100%' }}
        defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}
        allowEmpty={!required}
      />
    );
  } if (field.fieldType === 'datetime') {
    return (
      <DatePicker
        showTime
        label={fieldName}
        placeholder={fieldName}
        format="YYYY-MM-DD HH:mm:ss"
        style={{ display: 'block' }}
        allowClear={!required}
      />
    );
  } if (field.fieldType === 'date') {
    return (
      <DatePicker
        label={fieldName}
        placeholder={fieldName}
        format="YYYY-MM-DD"
        style={{ display: 'block' }}
        allowClear={!required}
      />
    );
  } if (field.fieldType === 'single') {
    return (
      <Select
        filter
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        label={fieldName}
        allowClear={!required}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}

      >
        {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.filter((option) => option.enabled).map((item) => (
            <Option
              value={item.id}
              key={item.id}
            >
              {item.value}
            </Option>
          ))}
      </Select>
    );
  } if (field.fieldType === 'multiple') {
    return (
      <Select
        filter
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        label={fieldName}
        mode="multiple"
        getPopupContainer={(triggerNode) => triggerNode.parentNode}

      >
        {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.filter((option) => option.enabled).map((item) => (
            <Option
              value={item.id}
              key={item.id}
            >
              {item.value}
            </Option>
          ))}
      </Select>
    );
  } if (field.fieldType === 'number') {
    return (
      <InputNumber
        label={fieldName}
        step={field.extraConfig ? MAX_NUMBER_STEP : 1}
        precision={field.extraConfig ? MAX_FLOAT_BITE : undefined}
        max={MAX_NUMBER_VALUE}
      />
    );
  } if (field.fieldType === 'text') {
    return (
      <TextArea
        autosize
        label={fieldName}
        maxLength={255}
      />
    );
  } if (['member', 'multiMember'].includes(field.fieldType)) {
    return (
      <SelectUser
        label={fieldName}
        allowClear
        mode={field.fieldType === 'multiMember' ? 'multiple' : undefined}
        extraOption={field.fieldType === 'multiMember' ? field.defaultValueObjs : field.defaultValueObj}
        className="multiMemberSelect"
      />
    );
  }
  return (
    <Input
      label={fieldName}
      maxLength={100}
    />
  );
}
