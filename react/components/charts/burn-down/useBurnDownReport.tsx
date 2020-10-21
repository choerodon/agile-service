import { useEffect, useState, useCallback } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import moment from 'moment';
import { stores } from '@choerodon/boot';
import { BurnDownProps, IBurndownChartType } from '@/components/charts/burn-down';
import { BurnDownSearchProps } from '@/components/charts/burn-down/search';
import { IBurnDownData } from '@/components/charts/burn-down/utils';
import { reportApi, sprintApi } from '@/api';
import { IQuickSearchValue } from '@/components/quick-search';
import useControlledDefaultValue from '@/hooks/useControlledDefaultValue';
import { getProjectId } from '@/utils/common';

const { AppState } = stores;

export interface BurnDownConfig {
  type?: IBurndownChartType
  restDayShow?: boolean
  sprintId?: string
  quickFilter?: IQuickSearchValue
  projectId?: string
  useCurrentSprint?: boolean
}

function useBurnDownReport(config?: BurnDownConfig, onFinish?: Function): [BurnDownSearchProps, BurnDownProps] {
  const projectId = config?.projectId || getProjectId();
  const [quickFilter, setQuickFilter] = useControlledDefaultValue<IQuickSearchValue>(
    config?.quickFilter || {
      onlyStory: false,
      onlyMe: false,
      quickFilters: [],
      personalFilters: [],
    },
  );
  const [type, setType] = useControlledDefaultValue<IBurndownChartType>(config?.type || 'remainingEstimatedTime');
  const [data, setData] = useState<IBurnDownData>(null);
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [restDayShow, setRestDayShow] = useControlledDefaultValue(
    config?.restDayShow !== undefined
      ? config.restDayShow
      : true,
  );
  const [restDays, setRestDays] = useState<string[]>([]);
  const [sprintId, setSprintId] = useControlledDefaultValue<string | undefined>(config?.sprintId || undefined);
  const [useCurrentSprint, setUseCurrentSprint] = useControlledDefaultValue<boolean>(
    config?.useCurrentSprint !== undefined
      ? config.useCurrentSprint
      : false,
  );
  const [currentSprintId, setCurrentSprintId] = useState<string | undefined>(undefined);
  const handleEmpty = useCallback(() => {
    onFinish && setTimeout(onFinish);
  }, [onFinish]);
  const loadData = useCallback(async () => {
    if ((!useCurrentSprint && sprintId) || (useCurrentSprint && sprintId && currentSprintId === sprintId)) {
      setLoading(true);
      const [burnDownData, resetDaysData] = await Promise.all([reportApi.project(projectId).loadBurnDownCoordinate(sprintId, type, {
        assigneeId: quickFilter.onlyMe ? AppState.getUserId : undefined,
        onlyStory: quickFilter.onlyStory,
        quickFilterIds: quickFilter.quickFilters,
        personalFilterIds: quickFilter.personalFilters,
      }), sprintApi.project(projectId).getRestDays(sprintId)]);
      batchedUpdates(() => {
        setData(burnDownData);
        setRestDays(resetDaysData.map((date) => moment(date).format('YYYY-MM-DD')));
        setLoading(false);
        onFinish && setTimeout(onFinish);
      });
    } else {
      setData(null);
    }
  }, [
    currentSprintId,
    onFinish,
    projectId,
    quickFilter.onlyMe,
    quickFilter.onlyStory,
    quickFilter.personalFilters,
    quickFilter.quickFilters,
    sprintId,
    type,
    useCurrentSprint,
  ]);
  useEffect(() => {
    loadData();
  }, [loadData]);

  const searchProps: BurnDownSearchProps = {
    projectId,
    sprintId,
    setSprintId,
    useCurrentSprint,
    setUseCurrentSprint,
    currentSprintId,
    setCurrentSprintId,
    onEmpty: handleEmpty,
    setEndDate,
    type,
    setType,
    quickFilter,
    setQuickFilter,
    restDayShow,
    setRestDayShow,
  };
  const props: BurnDownProps = {
    loading,
    type,
    data,
    endDate,
    restDayShow,
    restDays,
  };
  return [searchProps, props];
}

export default useBurnDownReport;
