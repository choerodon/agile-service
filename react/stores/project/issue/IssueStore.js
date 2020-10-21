/* eslint-disable camelcase */
import {
  observable, action, computed, toJS,
} from 'mobx';
import { debounce } from 'lodash';
import IsInProgramStore from '@/stores/common/program/IsInProgramStore';
import { fieldApi, personalFilterApi } from '@/api';

export const isFilterSame = (obj, obj2) => {
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
export function flattenObject(object) {
  const result = {};
  for (const [key, value] of Object.entries(object || {})) {
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
export function getSystemFields() {
  const systemFields = [{
    code: 'issueIds',
    name: 'issueId',
    defaultShow: true,
    noDisplay: true, // 不需要展示，仅作为一个筛选项
  }, {
    code: 'quickFilterIds',
    name: '快速筛选',
    defaultShow: true,
    noDisplay: true,
  }, {
    code: 'contents',
    name: '概要',
    defaultShow: true,
    noDisplay: true,
  }, {
    code: 'issueTypeId',
    name: '问题类型',
    defaultShow: true,
    fieldType: 'multiple',
  }, {
    code: 'statusId',
    name: '状态',
    defaultShow: true,
    fieldType: 'multiple',
  }, {
    code: 'assigneeId',
    name: '经办人',
    defaultShow: true,
    fieldType: 'member',
  }, {
    code: 'reporterIds',
    name: '报告人',
    defaultShow: false,
    fieldType: 'member',
  }, {
    code: 'sprint',
    name: '冲刺',
    defaultShow: true,
    fieldType: 'multiple',
  }, {
    code: 'component',
    name: '模块',
    defaultShow: false,
    fieldType: 'multiple',
  }, {
    code: 'label',
    name: '标签',
    defaultShow: false,
    fieldType: 'multiple',
  }, {
    code: 'priorityId',
    name: '优先级',
    defaultShow: true,
    fieldType: 'multiple',
  }, {
    code: 'version',
    name: '版本',
    defaultShow: false,
    fieldType: 'multiple',
  }, {
    code: 'epic',
    name: '史诗',
    defaultShow: !IsInProgramStore.isInProgram,
    fieldType: 'multiple',
  }, {
    code: 'feature',
    name: '特性',
    defaultShow: true,
    fieldType: 'multiple',
  }, {
    code: 'createDate',
    name: '创建时间',
    defaultShow: false,
    fieldType: 'datetime',
  }, {
    code: 'updateDate',
    name: '更新时间',
    defaultShow: false,
    fieldType: 'datetime',
  }];
  return IsInProgramStore.isInProgram ? systemFields : systemFields.filter((f) => f.code !== 'feature');
}

class IssueStore {
  // 当前加载状态
  @observable loading = false;

  // 创建问题窗口是否展开
  @observable createFlag = false;

  // 问题详情是否展开
  @observable expand = false;

  // 当前选中 Issue 详细信息
  @observable selectedIssue = {};

  // 筛选列表是否显示
  @observable filterListVisible = false;

  @computed get getFilterListVisible() {
    return this.filterListVisible;
  }

  @action setFilterListVisible(data) {
    this.filterListVisible = data;
  }

  @observable updateFilterName = '';

  @computed get getUpdateFilterName() {
    return this.updateFilterName;
  }

  @action setUpdateFilterName(data) {
    this.updateFilterName = data;
  }

  // 控制保存模态框是否显示
  @observable saveFilterVisible = false;

  @computed get getSaveFilterVisible() {
    return this.saveFilterVisible;
  }

  @action setSaveFilterVisible(data) {
    this.saveFilterVisible = data;
  }

  // 控制导出模态框是否显示
  @observable exportModalVisible = false;

  @computed get getExportModalVisible() {
    return this.exportModalVisible;
  }

  @action setExportModalVisible(visible) {
    this.exportModalVisible = visible;
  }

  // 我的筛选列表
  @observable myFilters = [];

  @computed get getMyFilters() {
    return toJS(this.myFilters);
  }

  @action setMyFilters(data) {
    this.myFilters = data;
  }

  @observable projectInfo = {};

  @computed get getProjectInfo() {
    return toJS(this.projectInfo);
  }

  @action setProjectInfo(data) {
    this.projectInfo = data;
  }

  @observable selectedMyFilterInfo = {};

  @computed get getSelectedMyFilterInfo() {
    return this.selectedMyFilterInfo;
  }

  @observable editFilterInfo = [];

  @computed get getEditFilterInfo() {
    return toJS(this.editFilterInfo);
  }

  @action setEditFilterInfo(data) {
    this.editFilterInfo = data;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @computed get getLoading() {
    return toJS(this.loading);
  }

  @action createQuestion(data) {
    this.createFlag = data;
  }

  @computed get getCreateQuestion() {
    return this.createFlag;
  }

  @action setClickedRow(data) {
    this.selectedIssue = data.selectedIssue;
    this.expand = data.expand;
  }

  @computed get getSelectedIssue() {
    return toJS(this.selectedIssue);
  }

  @action setSelectedIssue(data) {
    this.selectedIssue = data;
  }

  @computed get getExpand() {
    return toJS(this.expand);
  }

  setTableRef(tableRef) {
    this.tableRef = tableRef;
  }

  query = debounce(() => {
    this.dataSet.query();
  }, 300);
}

export default new IssueStore();
