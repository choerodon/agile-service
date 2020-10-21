/* eslint-disable camelcase */
import { isEmpty, isEqual, pick } from 'lodash';

export const isFilterSame = (obj: { [key: string]: any }, obj2: { [key: string]: any }): boolean => {
  // 过滤掉 [] null '' 那些不起作用的属性
  const keys1 = Object.keys(obj).filter((k) => !isEmpty(obj[k]));
  const keys2 = Object.keys(obj2).filter((k) => !isEmpty(obj2[k]));
  return isEqual(pick(obj, keys1), pick(obj2, keys2));
};
/**
 * 对象扁平化 {a:{b:'v'}}  = >  {b:'v'}
 *
 * @param {*} object
 */
export function flattenObject(object: Object): { [key: string]: any } {
  const result: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(object)) {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      Object.assign(result, flattenObject(value));
    } else {
      result[key] = value;
    }
  }
  const {
    date = [],
    date_hms = [],
    number = [],
    option = [],
    string = [],
    text = [],
  } = result;
  [...date, ...date_hms].forEach((d) => {
    result[d.fieldId] = { isCustom: true, value: [d.startDate, d.endDate] };
  });
  [...number, ...option, ...string, ...text].forEach((d) => {
    result[d.fieldId] = { isCustom: true, value: d.value };
  });

  delete result.date;
  delete result.date_hms;
  delete result.number;
  delete result.option;
  delete result.string;
  delete result.text;
  return result;
}
