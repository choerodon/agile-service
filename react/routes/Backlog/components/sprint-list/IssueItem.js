import React, { memo, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Tooltip } from 'choerodon-ui';
import classnames from 'classnames';
import moment from 'moment';
import useIsInProgram from '@/hooks/useIsInProgram';
import TypeTag from '@/components/TypeTag';
import StatusTag from '@/components/StatusTag';
import PriorityTag from '@/components/PriorityTag';
import BacklogStore from '@/stores/project/backlog/BacklogStore';

import './IssueItem.less';
import UserTag from '@/components/tag/user-tag';

const prefix = 'c7n-backlog-issue';
function DraggingNum({ num }) {
  return (
    <div style={{
      position: 'absolute',
      width: 20,
      height: 20,
      background: 'red',
      textAlign: 'center',
      color: 'white',
      borderRadius: '50%',
      top: 0,
      left: 0,
    }}
    >
      {num}
    </div>
  );
}
function getStyle({ draggableStyle, virtualStyle, isDragging }) {
  const combined = {
    ...virtualStyle,
    ...draggableStyle,
  };
  return combined;
}
const Item = memo(({ issue, draggingNum }) => {
  const { isShowFeature } = useIsInProgram(); // 由后端判断是否显示特性
  const { estimatedEndTime, statusVO } = issue;
  let delayDays = 0;
  if (estimatedEndTime) {
    delayDays = moment().diff(moment(estimatedEndTime), 'days', true);
  }
  return (
    <>
      {draggingNum && (<DraggingNum num={draggingNum} />)}
      <div
        className={`${prefix}-left`}
      >
        <TypeTag
          data={issue.issueTypeVO}
        />

        <div className={`${prefix}-issueNum`} style={{ textDecoration: issue.statusVO && issue.statusVO.completed ? 'line-through' : 'none' }}>
          {`${issue.issueNum}`}
        </div>
        <Tooltip title={issue.summary} placement="topLeft">
          <div className={`${prefix}-summary`}>{issue.summary}</div>
        </Tooltip>
      </div>
      <div
        className={`${prefix}-right`}
      >
        {
          !statusVO.completed && estimatedEndTime && (
            delayDays > 0 || (delayDays >= -1 && delayDays < 0)) && (
            <div className={`${prefix}-${delayDays > 0 ? 'delay' : 'soonDelay'}`}>
              {
              delayDays > 0 ? `延期${Math.ceil(delayDays)}天` : '即将到期'
            }
            </div>
          )
        }
        {issue.versionNames && issue.versionNames.length > 0 ? (
          <Tooltip title={`版本: ${issue.versionNames.join(', ')}`}>
            <span className={`${prefix}-version`}>
              {issue.versionNames.join(', ')}
            </span>
          </Tooltip>
        ) : ''}
        {!isShowFeature && issue.epicName ? (
          <Tooltip title={`史诗: ${issue.epicName}`}>
            <span
              className={`${prefix}-epic`}
              style={{
                color: issue.color || issue.epicColor,
                border: `1px solid ${issue.color || issue.epicColor}`,
              }}
            >
              {issue.epicName}
            </span>
          </Tooltip>
        ) : ''}
        {isShowFeature && issue.featureName ? (
          <Tooltip title={`特性: ${issue.featureName}`}>
            <span
              className={`${prefix}-feature`}
              style={{
                color: issue.featureColor || BacklogStore.randomFeatureColor[issue.featureName] || issue.color,
                border: `1px solid ${issue.featureColor || BacklogStore.randomFeatureColor[issue.featureName] || issue.color}`,
              }}
            >
              {issue.featureName}
            </span>
          </Tooltip>
        ) : ''}
        {issue.assigneeId && (
          <UserTag
            data={{
              id: issue.assigneeId,
              loginName: issue.assigneeLoginName,
              realName: issue.assigneeRealName,
              tooltip: issue.assigneeName,
              imageUrl: issue.imageUrl,
            }}
          />
        )}
        <Tooltip title={`状态: ${issue.statusVO ? issue.statusVO.name : ''}`}>
          <div className={`${prefix}-status`}>
            <StatusTag
              data={issue.statusVO}
            />
          </div>
        </Tooltip>
        <Tooltip title={`优先级: ${issue.priorityVO ? issue.priorityVO.name : ''}`}>
          <PriorityTag priority={issue.priorityVO} />
        </Tooltip>
        <Tooltip title={`故事点: ${issue.storyPoints}`}>
          <div
            className={classnames(`${prefix}-storyPoint`, {
              visible: issue.storyPoints && issue.issueTypeVO && issue.issueTypeVO.typeCode === 'story',
            })}
          >
            {issue.storyPoints}
          </div>
        </Tooltip>
      </div>
    </>
  );
});

function IssueItem({
  provided, style, issue = {}, isDragging, sprintId,
}) {
  const selected = BacklogStore.getMultiSelected && BacklogStore.getMultiSelected.get(issue.issueId);
  const draggingNum = BacklogStore.getIsDragging === issue.issueId && BacklogStore.getMultiSelected.size > 0 ? BacklogStore.getMultiSelected.size : undefined;
  return (
    <div
      role="none"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle({
        draggableStyle: provided.draggableProps.style,
        virtualStyle: style,
        isDragging,
      })}
      className={`${prefix} ${selected ? `${prefix}-selected` : ''}`}
      onClick={(e) => { BacklogStore.handleIssueClick(e, issue, String(sprintId)); }}
    >
      <Item issue={issue} draggingNum={draggingNum} />
    </div>
  );
}

export default observer(IssueItem);
