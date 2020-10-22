import React, {
  createContext, useMemo, useEffect, useState,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { fieldApi } from '@/api';
import IssueStore, { getSystemFields } from '@/stores/project/issue/IssueStore';
import { useIssueSearchStore } from '@/components/issue-search';
import IssueDataSet from '@/components/issue-table/dataSet';
import { localPageCacheStore } from '@/stores/common/LocalPageCacheStore';
import { transformFilter, handleSelect, handleUnSelect } from './utils';

const Store = createContext();

export default Store;

export const StoreProvider = inject('AppState')(injectIntl(
  (props) => {
    const { intl, children, AppState: { currentMenuType: { id: projectId, organizationId }, userInfo: { id: userId } } } = props;
    const [fields, setFields] = useState([]);
    useEffect(() => {
      const loadData = async () => {
        const Fields = await fieldApi.getFoundationHeader();
        setFields(Fields);
      };
      loadData();
    }, []);
    const issueSearchStore = useIssueSearchStore({
      getSystemFields,
      transformFilter,
      defaultChosenFields: Array.isArray(localPageCacheStore.getItem('issues')) ? new Map(localPageCacheStore.getItem('issues').map((item) => [item.code, item])) : undefined,
    });
    const dataSet = useMemo(() => new DataSet(IssueDataSet({
      intl,
      projectId,
      organizationId,
      issueSearchStore,
      IssueStore,
      events: {
        select: () => handleSelect({ dataSet }, issueSearchStore),
        selectAll: () => handleSelect({ dataSet }, issueSearchStore),
        unSelect: handleUnSelect,
        unSelectAll: handleUnSelect,
        load: () => {
          // 有筛选，自动展开
          if (issueSearchStore.isHasFilter) {
            IssueStore.tableRef.current.tableStore.expandAll();
          }
        },
      },
    })), []);
    IssueStore.dataSet = dataSet;
    /**
    * detail data
    * 详情页数据
    * @param id
    */

    const value = {
      ...props,
      issueSearchStore,
      fields,
      dataSet,
      projectId,
      organizationId,
      userId,
      prefixCls: 'c7n-issue',
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
