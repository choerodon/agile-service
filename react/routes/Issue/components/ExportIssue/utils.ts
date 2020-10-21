import { IExportSearch } from '@/api';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';

function transformSystemFilter(data: any): Omit<IExportSearch, 'exportFieldCodes'> {
  const {
    issueTypeId,
    assigneeId,
    statusId,
    priorityId,
    issueIds,
    quickFilterIds,
    createDate = [],
    updateDate = [],
    contents,
    component,
    epic,
    feature,
    label,
    reporterIds,
    sprint,
    summary,
    version,
  } = data;
  return {
    advancedSearchArgs: {
      issueTypeId,
      reporterIds,
      statusId,
      priorityId,
    },
    otherArgs: {
      assigneeId,
      issueIds,
      component,
      epic,
      feature,
      label,
      sprint,
      summary,
      version,
    },
    searchArgs: {
      createStartDate: createDate[0],
      createEndDate: createDate[1],
      updateStartDate: updateDate[0],
      updateEndDate: updateDate[1],
    },
    quickFilterIds,
    contents,
  };
}

const getExportFieldCodes = (data: Array<any>) => {
  const fieldTransform = {
    issueNum: 'issueNum',
    issueId: 'summary',
    //  "description":
    issueTypeId: 'typeName',
    //  "projectName":
    assigneeId: 'assigneeName',
    // "assigneeRealName":
    reporterId: 'reporterName',
    //  "reporterRealName":
    //   "resolution":
    statusId: 'statusName',
    issueSprintVOS: 'sprintName',
    // "creationDate":
    lastUpdateDate: 'lastUpdateDate',
    priorityId: 'priorityName',
    //  "subTask":
    //  "remainingTime":
    version: 'versionName',
    epic: 'epicName',
    label: 'labelName',
    storyPoints: 'storyPoints',
    component: 'componentName',
  };
  // @ts-ignore
  return data.map((code: string) => fieldTransform[code] || code);
};

function getFilterFormSystemFields(): FieldProps[] {
  return ([{
    name: 'statusId',
    label: '状态',
    valueField: 'id',
    textField: 'name',
  }, {
    name: 'sprint',
    label: '冲刺',
    required: true,
    valueField: 'sprintId',
    textField: 'sprintName',
  }, {
    name: 'issueTypeId',
    label: '问题类型',
    valueField: 'id',
    textField: 'name',
  },
  {
    name: 'feature',
    label: '特性',
    valueField: 'issueId',
    textField: 'summary',
  },
  {
    name: 'epic',
    label: '所属史诗',
    valueField: 'issueId',
    textField: 'epicName',
  },
  {
    name: 'priorityId',
    label: '优先级',
    valueField: 'id',
    textField: 'name',
  }, {
    name: 'label',
    label: '标签',
    valueField: 'labelId',
    textField: 'labelName',
  }, {
    name: 'component',
    label: '模块',
    valueField: 'componentId',
    textField: 'name',
  }, {
    name: 'version',
    label: '版本',
    valueField: 'versionId',
    textField: 'name',
  }]);
}
export {
  getExportFieldCodes, getFilterFormSystemFields, transformSystemFilter as getTransformSystemFilter,
};
