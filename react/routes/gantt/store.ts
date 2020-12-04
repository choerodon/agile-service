/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { createRef } from 'react';
import {
  observable, computed, action, runInAction,
} from 'mobx';
import { Gantt } from '@/components/gantt/types';
import { GanttRef } from '@/components/gantt/Gantt';
// 视图日视图、周视图、月视图、季视图、年视图
export const units = [
  {
    type: 'day',
    label: '日',
  },
  {
    type: 'week',
    label: '周',
  },
  {
    type: 'month',
    label: '月',
  },
  {
    type: 'quarter',
    label: '季',
  },
  {
    type: 'halfYear',
    label: '年',
  },
];
class GanttStore {
  ganttRef = createRef<GanttRef>()

  @observable unit: Gantt.Sight = 'day'

  @observable issueId: string | null = null

  @observable sprintId: string | null = null

  @observable createIssueVisible: boolean = false

  @action
  switchUnit(unit: Gantt.Sight) {
    this.unit = unit;
  }

  @action
  setIssueId(issueId: string | null) {
    this.issueId = issueId;
  }

  @action
  setSprintId(sprintId: string | null) {
    this.sprintId = sprintId;
  }

  @action
  setCreateIssueVisible(createIssueVisible: boolean) {
    this.createIssueVisible = createIssueVisible;
  }
}

export default GanttStore;
