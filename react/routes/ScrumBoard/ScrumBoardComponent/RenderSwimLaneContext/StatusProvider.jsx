import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Droppable } from 'react-beautiful-dnd';
import ScrumBoardStore from '@/stores/project/scrumBoard/ScrumBoardStore';
import StatusCouldDragOn from './StatusCouldDragOn';
import Card from './Card';
@observer
export default class StatusProvider extends Component {
  getStatus({
    completed, name: statusName, categoryCode, statusId,
  }) {
    const { children, keyId, columnId } = this.props;
    return (
      <div
        key={statusId}
        className="c7n-swimlaneContext-itemBodyStatus"
        onClick={this.handleColumnClick}
        role="none"
      >
        <Droppable
          mode="virtual"
          droppableId={`${statusId}/${columnId}`}
          isDropDisabled={ScrumBoardStore.getCanDragOn.get(statusId)}
          renderClone={(provided, snapshot, rubric) => {
            const { index } = rubric.source;
            const data = ScrumBoardStore.getSwimLaneData[keyId][statusId];
            const issueObj = data[index];
            return (
              <Card
                isDragging={snapshot.isDragging}
                provided={provided}
                key={issueObj.issueId}            
                index={index}
                issue={issueObj}
                completed={completed}
                statusName={statusName}
                categoryCode={categoryCode}      
                style={{ margin: 0 }}
              />
            );
          }}
        >
          {(provided, snapshot) => (
            <React.Fragment>
              <StatusCouldDragOn statusId={statusId} swimlaneId={keyId} />
              <div
                ref={provided.innerRef}
                className={classnames('c7n-swimlaneContext-itemBodyStatus-container', {
                  'c7n-swimlaneContext-itemBodyStatus-dragOver': snapshot.isDraggingOver,
                  'c7n-swimlaneContext-itemBodyStatus-notDragOver': !snapshot.isDraggingOver,
                })}
                {...provided.droppableProps}
              >
                <span
                  className={classnames('c7n-swimlaneContext-itemBodyStatus-container-statusName', {
                    'c7n-swimlaneContext-itemBodyStatus-container-statusName-nameDragOn': snapshot.isDraggingOver,
                    'c7n-swimlaneContext-itemBodyStatus-container-statusName-nameNotDragOn': !snapshot.isDraggingOver,
                  })}
                >
                  {statusName}
                </span>
                {children(keyId, statusId, completed, statusName, categoryCode, snapshot)}
              </div>
            </React.Fragment>
          )}
        </Droppable>
      </div>
    );
  }

  handleColumnClick = () => {
    ScrumBoardStore.resetClickedIssue();
  };

  render() {
    const { statusData } = this.props;
    return statusData.map(status => this.getStatus(status));
  }
}
