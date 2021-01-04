import { IFieldOptionProps } from '@/api';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import moment from 'moment';
import { toJS } from 'mobx';

function transformDefaultValue({
  fieldType, defaultValue, defaultValueObj, fieldOptions, optionKey = 'id',
}: { fieldType: string, defaultValue: any, defaultValueObj?: any, fieldOptions?: Array<IFieldOptionProps> | null, optionKey?: 'tempKey' | 'id' }) {
  if (!defaultValue && !defaultValueObj) {
    return defaultValue;
  }
  switch (fieldType) {
    case 'datetime':
      return moment(defaultValue, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    case 'time':
      return moment(defaultValue, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss');
    case 'date':
      return moment(defaultValue, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
    case 'multiple':
    case 'checkbox':
    case 'single':
    case 'radio': {
      const valueArr = String(defaultValue).split(',');
      return fieldOptions?.filter((option) => valueArr.some((v) => v === option[optionKey])).map((item) => item.value).join(',') || defaultValue;
    }
    case 'member': {
      const { realName } = defaultValueObj || {};
      return realName || defaultValue;
    }
    default:
      return defaultValue;
  }
}
function beforeSubmitTransform(item: Record, optionKey = 'id') {
  let fieldOptions = item.get('fieldOptions') as Array<any> | undefined;
  const defaultValue = toJS(item.get('defaultValue'));
  const fieldType = item.get('fieldType');
  if (fieldOptions && !defaultValue) {
    fieldOptions = fieldOptions.map((option) => ({ ...option, isDefault: false }));
  } else if (fieldOptions && ['radio', 'single', 'checkbox', 'multiple'].includes(fieldType)) {
    const searchDefaultArr = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    fieldOptions = fieldOptions.map((option) => {
      if (searchDefaultArr.includes(option[optionKey])) {
        return ({ ...option, isDefault: true });
      }
      return ({ ...option, isDefault: false });
    });
  }
  return {
    defaultValue: typeof (defaultValue) === 'undefined' || defaultValue === null ? '' : String(defaultValue),
    fieldOptions,
    extraConfig: item.get('extraConfig'),
  };
}
export { transformDefaultValue, beforeSubmitTransform };
