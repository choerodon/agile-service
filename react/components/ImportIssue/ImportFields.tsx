import React, {
  useMemo, useEffect, useImperativeHandle, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { SelectBox, DataSet } from 'choerodon-ui/pro';
import { fieldApi } from '@/api';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { includes } from 'lodash';
import { getApplyType } from '@/utils/common';
import useIsInProgram from '@/hooks/useIsInProgram';
import styles from './ImportFields.less';

const programImportRequiresFields = ['issueType', 'summary', 'description', 'reporter', 'epic', 'epicName', 'pi'];
const projectImportRequiresFields = ['issueType', 'parentIssue', 'epic', 'component', 'sprint', 'summary', 'description', 'epicName', 'assignee', 'reporter', 'priority', 'remainingTime', 'storyPoints', 'linkIssue'];
const subProjectImportRequiredFields = ['issueType', 'parentIssue', 'feature', 'component', 'sprint', 'summary', 'description', 'assignee', 'reporter', 'priority', 'remainingTime', 'storyPoints', 'linkIssue'];

const programSystemFields = [
  { code: 'issueType', title: '类型' },
  { code: 'summary', title: '概要' },
  { code: 'description', title: '描述' },
  { code: 'reporter', title: '报告人' },
  { code: 'epic', title: '所属史诗' },
  { code: 'epicName', title: '史诗名称' },
  { code: 'pi', title: 'PI' },
  { code: 'subProject', title: '负责的子项目' },
  { code: 'estimatedStartTime', title: '预计开始时间' },
  { code: 'estimatedEndTime', title: '预计结束时间' },
  { code: 'benfitHypothesis', title: '特性价值' },
  { code: 'acceptanceCritera', title: '验收标准' },
  { code: 'programVersion', title: '版本' },
];

const projectSystemFields = [
  { code: 'issueType', title: '类型' },
  { code: 'summary', title: '概要' },
  { code: 'description', title: '描述' },
  { code: 'parentIssue', title: '父级故事/任务/缺陷' },
  { code: 'assignee', title: '经办人' },
  { code: 'reporter', title: '报告人' },
  { code: 'priority', title: '优先级' },
  { code: 'epic', title: '故事所属史诗' },
  { code: 'component', title: '模块' },
  { code: 'sprint', title: '冲刺' },
  { code: 'epicName', title: '史诗名称' },
  { code: 'remainingTime', title: '预估时间' },
  { code: 'storyPoints', title: '故事点' },
  { code: 'linkIssue', title: '关联问题' },
  { code: 'fixVersion', title: '版本' },
  { code: 'label', title: '标签' },
  { code: 'estimatedStartTime', title: '预计开始时间' },
  { code: 'estimatedEndTime', title: '预计结束时间' },
  { code: 'mainResponsible', title: '主要负责人' },
  { code: 'environment', title: '环境' },
];

const subProjectSystemFields = [
  { code: 'issueType', title: '类型' },
  { code: 'summary', title: '概要' },
  { code: 'description', title: '描述' },
  { code: 'parentIssue', title: '父级故事/任务/缺陷' },
  { code: 'feature', title: '故事所属特性' },
  { code: 'component', title: '模块' },
  { code: 'sprint', title: '冲刺' },
  { code: 'assignee', title: '经办人' },
  { code: 'reporter', title: '报告人' },
  { code: 'priority', title: '优先级' },
  { code: 'remainingTime', title: '预估时间' },
  { code: 'storyPoints', title: '故事点' },
  { code: 'linkIssue', title: '关联问题' },
  { code: 'fixVersion', title: '版本' },
  { code: 'label', title: '标签' },
  { code: 'estimatedStartTime', title: '预计开始时间' },
  { code: 'estimatedEndTime', title: '预计结束时间' },
  { code: 'mainResponsible', title: '主要负责人' },
  { code: 'environment', title: '环境' },
];

interface Props {
  importFieldsRef: React.MutableRefObject<{fields: string[]}>,
}

const ImportFields: React.FC<Props> = ({ importFieldsRef }) => {
  const { isInProgram, loading } = useIsInProgram();
  const [updateCount, setUpdateCount] = useState<number>(0);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<{code: string, title: string}[]>([]);
  const applyType = getApplyType();
  useEffect(() => {
    if (!loading) {
      if (applyType === 'program') {
        setRequiredFields(programImportRequiresFields);
        setSystemFields(programSystemFields);
      } else if (isInProgram) {
        setRequiredFields(subProjectImportRequiredFields);
        setSystemFields(subProjectSystemFields);
      } else {
        setRequiredFields(projectImportRequiresFields);
        setSystemFields(projectSystemFields);
      }
    }
  }, [applyType, isInProgram, loading]);

  const fieldsOptionDataSet = useMemo(() => new DataSet({
    paging: false,
    events: {
      load: () => {
        setUpdateCount((count) => count + 1);
      },
    },
  }), []);

  const chooseDataSet = useMemo(() => new DataSet({
    autoQuery: true,
    fields: [{
      name: 'fields',
      type: 'string' as FieldType,
      textField: 'title',
      valueField: 'code',
      multiple: true,
      options: fieldsOptionDataSet,
    }],
    data: [{
      fields: requiredFields,
    }],
    events: {
      update: () => {
        setUpdateCount((count) => count + 1);
      },
    },
  }), [fieldsOptionDataSet, requiredFields]);

  useEffect(() => {
    const loadData = async () => {
      const fields = await fieldApi.getFoundationHeader();
      fieldsOptionDataSet.loadData([...(systemFields.map((item) => ({ ...item, system: true }))), ...fields]);
    };

    if (systemFields && systemFields.length) {
      loadData();
    }
  }, [chooseDataSet, fieldsOptionDataSet, systemFields]);

  useImperativeHandle(importFieldsRef, () => ({
    fields: (chooseDataSet?.current?.get('fields') || requiredFields).filter((code: string) => !includes(['linkIssue', 'parentIssue'], code)),
    allFields: fieldsOptionDataSet.toData(),
  }));

  return (
    <div className={styles.importFields}>
      <div className={styles.importFields_title}>选择字段</div>
      <div className={styles.importFields_content}>
        <SelectBox
          dataSet={chooseDataSet}
          name="fields"
          onOption={({ record }) => ({
            disabled: includes(requiredFields, record.get('code')),
          })}
        />
      </div>
    </div>
  );
};

export default observer(ImportFields);
