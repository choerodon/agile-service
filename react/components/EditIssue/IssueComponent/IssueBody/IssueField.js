import React, { useContext, Fragment } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  FieldAssignee, FieldVersion, FieldStatus, FieldSprint, FieldText,
  FieldReporter, FieldPriority, FieldLabel, FieldFixVersion, FieldPI,
  FieldEpic, FieldDateTime, FieldComponent, FieldTimeTrace, FieldStoryPoint,
  FieldSummary, FieldInput, FieldTeam, FieldProgramSprint,
} from './Field';
import EditIssueContext from '../../stores';
import FieldPro from './Field/FieldPro';
import FieldStartTime from './Field/FieldStartTime';
import FieldEndTime from './Field/FieldEndTime';
import FieldProgramVersion from './Field/FieldProgramVersion';

const hideFields = ['priority', 'component', 'label', 'fixVersion', 'sprint', 'timeTrace', 'assignee'];

const IssueField = observer((props) => {
  const {
    store, applyType, saveFieldVersionRef, saveFieldFixVersionRef, disabled,
  } = useContext(EditIssueContext);
  const renderNormalField = (field) => (<FieldPro {...props} field={field} />);
  const getFieldComponent = (field) => {
    const issue = store.getIssue;
    const activePiTeams = issue.activePiTeams || [];
    const teamIds = activePiTeams.map((team) => team.id);

    const { typeCode } = issue;
    switch (field.fieldCode) {
      case 'assignee':
        return (<FieldAssignee {...props} />);
      case 'influenceVersion':
        return (<FieldVersion {...props} saveRef={saveFieldVersionRef} />);
      case 'status':
        return (<FieldStatus {...props} />);
      case 'sprint':
        if (typeCode !== 'sub_task') {
          return (<FieldSprint {...props} />);
        }
        return (<FieldSprint {...props} disabled />);

      case 'reporter':
        return (<FieldReporter {...props} />);
      case 'priority':
        return (<FieldPriority {...props} />);
      case 'label':
        return (<FieldLabel {...props} />);
      case 'fixVersion':
        return (<FieldFixVersion {...props} saveRef={saveFieldFixVersionRef} />);
      case 'epic': // 包含 feature 当有子项目时 只有特性
        // 子任务、史诗不显示史诗
        if (['issue_epic', 'sub_task'].indexOf(typeCode) === -1) {
          return (<FieldEpic {...props} />);
        }
        return '';
      case 'creationDate':
      case 'lastUpdateDate':
        return (<FieldDateTime {...props} field={field} />);
      case 'component':
        if (typeCode !== 'sub_task') {
          return (<FieldComponent {...props} />);
        }
        return '';
      case 'timeTrace':
        return (<FieldTimeTrace {...props} />);
      case 'pi':
        return (<FieldPI {...props} />);
      case 'benfitHypothesis':
      case 'acceptanceCritera':
        return (<FieldText {...props} field={field} feature />);
      case 'summary':
        return (<FieldSummary {...props} field={field} />);
      case 'epicName':
        return (<FieldInput {...props} field={field} />);
      case 'remainingTime':
      case 'storyPoints':
        return (<FieldStoryPoint {...props} field={field} />);
      case 'subProject':
        return ([
          <FieldTeam {...props} field={field} />,
          <FieldProgramSprint {...props} field={field} key={teamIds} />,
        ]);
      case 'estimatedStartTime':
        return typeCode !== 'issue_epic' && (
          <FieldStartTime {...props} field={field} />
        );
      case 'estimatedEndTime':
        return typeCode !== 'issue_epic' && (
          <FieldEndTime {...props} field={field} />
        );
      case 'programVersion':
        return <FieldProgramVersion {...props} field={field} />;
      default:
        return renderNormalField(field);
    }
  };
  const issue = store.getIssue;
  const { issueId, typeCode } = issue;
  let fields = applyType === 'program' ? toJS(store.customFields).filter((item) => hideFields.indexOf(item.fieldCode) === -1) : toJS(store.customFields);
  // 系统字段单独控制是否显示
  if (typeCode === 'sub_task') {
    fields = fields.filter((field) => ['component', 'epic'].indexOf(field.fieldCode) === -1);
  } else if (typeCode === 'issue_epic') {
    fields = fields.filter((field) => field.fieldCode !== 'epic');
  } else if (typeCode === 'feature') {
    // fields.splice(4, 0, { fieldCode: 'teams', fieldName: '负责团队和冲刺' });
    // fields.splice(4, 0, { fieldCode: 'teamSprint', fieldName: '团队Sprint' });
    fields.splice(4, 0, { fieldCode: 'programVersion', fieldName: '团队Sprint' });
  }
  if (!store.detailShow) {
    fields = fields.slice(0, 4);
  }
  return (
    <div className="c7n-content-wrapper IssueField">
      {issueId ? fields.map((field) => <Fragment key={field.id}>{getFieldComponent(field)}</Fragment>) : ''}
    </div>
  );
});

export default IssueField;
