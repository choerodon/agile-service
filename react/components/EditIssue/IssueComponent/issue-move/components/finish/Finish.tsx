import React from 'react';
import { Icon, Row, Col } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { DataSet } from 'choerodon-ui/pro/lib';
import { TypeTag } from '@/components';
import styles from './Finish.less';
import renderField, { IFieldWithValue } from '../confirm-data/renderField';
import { IssueWithSubIssueVOList } from '../confirm-data/Confirm';
import store from '../../store';

interface Props {
  issue: IssueWithSubIssueVOList,
  dataSet: DataSet,
  fieldsWithValue: IFieldWithValue[]
  targetProjectType: 'program' | 'project' | 'subProject'
  targetIssueType: {
    typeCode: string,
    issueTypeId: string
  }
  dataRef: React.MutableRefObject<Map<string, any>>,
}

const Finish: React.FC<Props> = ({
  issue, dataSet, fieldsWithValue, targetProjectType, targetIssueType, dataRef,
}) => {
  const { selfFields, subTaskFields } = store;

  const {
    issueTypeVO, issueNum, summary, typeCode, subIssueVOList,
  } = issue;
  const targetProjectId = dataSet?.current?.get('targetProjectId');
  const issueType = dataSet?.current?.get('issueType');
  return (
    <div className={styles.finish}>
      <div className={styles.tip}>
        <Icon type="report" />
        <p className={styles.tipText}>
          由于目标项目与源项目的字段设置不同，在不同项目之间移动问题项，您可能会丢失部分数据信息。即使您移回源项目，也无法恢复这些数据。
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.contentTip}>
          请确认移动后问题项的信息：
        </div>
        <div className={styles.contentMain}>
          <div className={styles.issueItem}>
            <div className={styles.issueItemHeader}>
              <TypeTag data={issueTypeVO} />
              <span className={styles.issueNum}>{issueNum}</span>
              <span className={styles.summary}>{summary}</span>
            </div>
            <div className={styles.issueItemFields}>
              {
                selfFields.map((selfField) => {
                  const { fieldCode, fieldName } = selfField;
                  return (
                    <Row key={fieldCode} className={styles.fieldRow}>
                      <Col span={8}>
                        <span className={styles.fieldReadOnly}>{fieldName}</span>
                      </Col>
                      <Col span={16}>
                        {renderField({
                          dataSet,
                          issue,
                          field: selfField,
                          fieldsWithValue,
                          targetIssueType,
                          targetProject: {
                            projectId: targetProjectId,
                            projectType: targetProjectType,
                          },
                          dataRef,
                          disabled: true,
                        })}
                      </Col>
                    </Row>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(Finish);
