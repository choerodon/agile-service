import React, { useContext, useMemo, useCallback } from 'react';
import {
  Select, Icon, Tooltip,
} from 'choerodon-ui';
import { stores } from '@choerodon/boot';
import { find, remove } from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';
import { SelectMode } from 'choerodon-ui/lib/select/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { LabeledValue } from 'choerodon-ui/lib/select';
import { flattenObject, isFilterSame } from './utils';
import IssueSearchContext from './context';
import SummaryField from './custom-fields/field/SummaryField';
import CustomFields from './custom-fields';
import { getSelectStyle } from './custom-fields/utils';
import useQuickFilters from './useQuickFilters';
import ListenSearchSize from './ListenSearchSize';

const { AppState } = stores;
const { Option, OptGroup } = Select;

const SearchArea: React.FC = () => {
  const prefixCls = 'c7n-issue';
  const {
    store, onClear, urlFilter, onClickSaveFilter,
  } = useContext(IssueSearchContext);
  const { data: quickFilters } = useQuickFilters();
  const {
    isHasFilter, chosenFields, overflowLine, folded,
  } = store;
  const myFilters = store.getMyFilters;
  const selectedQuickFilterIds = chosenFields.get('quickFilterIds') ? toJS(chosenFields.get('quickFilterIds')?.value) : undefined;
  const getSelectedQuickFilters = () => (selectedQuickFilterIds || []).map((id: string) => {
    const target = find(quickFilters, { filterId: id });
    return target ? { key: `quick|${target.filterId}`, label: target.name } : {};
  });
  const selectedQuickFilters: LabeledValue[] = getSelectedQuickFilters();
  const userId = String(AppState.userInfo.id);
  const reset = () => {
    onClear();
    store.clearAllFilter();
    store.query();
  };
  const handleSelect = (v: LabeledValue) => {
    const { key: k } = v;
    const [type, id] = k.split('|');
    if (type === 'quick') {
      const newSelectedQuickFilters = [...selectedQuickFilters, v];
      const quickFilterIds = newSelectedQuickFilters.map((filter) => filter.key.split('|')[1]);
      store.handleFilterChange('quickFilterIds', quickFilterIds);
    } else if (type === 'my') {
      const targetMyFilter = find(myFilters, { filterId: id });
      const filterObject = flattenObject(JSON.parse(targetMyFilter?.filterJson || '{}'));
      // 先清除筛选
      store.clearAllFilter();
      for (const [key, value] of Object.entries(filterObject)) {
        // 自定义字段保存的时候只保存了id，这里要找到code
        if (value.isCustom) {
          const code = store.getFieldCodeById(key);
          if (code) {
            store.handleFilterChange(code, value.value);
          }
        } else if (key === 'createEndDate' || key === 'createStartDate') {
          store.handleFilterChange('createDate', [filterObject.createStartDate, filterObject.createEndDate]);
        } else if (key === 'updateEndDate' || key === 'updateStartDate') {
          store.handleFilterChange('updateDate', [filterObject.updateStartDate, filterObject.updateEndDate]);
        } else {
          store.handleFilterChange(key, value);
        }
      }
      if (folded) {
        store.setFolded(false);
      }
    } else if (type === 'commonly') {
      if (id === 'onlyMe') {
        store.handleFilterChange('assigneeId', [userId]);
      } else if (id === 'starBeacon') {
        store.handleFilterChange('starBeacon', true);
        store.handleFilterChange('userId', userId);
      }
    }
  };
  const handleDeselect = (v: LabeledValue) => {
    // clear
    if (!v) {
      reset();
      return;
    }
    const { key } = v;
    const [type, id] = key.split('|');
    if (type === 'quick') {
      remove(selectedQuickFilters, { key });
    } else if (type === 'my') {
      store.clearAllFilter();
      store.query();
    } else if (type === 'commonly') {
      if (id === 'onlyMe') {
        store.handleFilterChange('assigneeId', []);
      } else if (id === 'starBeacon') {
        store.handleFilterChange('starBeacon', undefined);
        store.handleFilterChange('userId', undefined);
      }
    }
    const quickFilterIds = selectedQuickFilters.map((filter) => filter.key.split('|')[1]);
    store.handleFilterChange('quickFilterIds', quickFilterIds);
  };
  const findSameFilter = () => {
    const currentFilterDTO = store.getCustomFieldFilters()
      ? flattenObject(store.getCustomFieldFilters()) : {};
    // console.log(currentFilterDTO);
    // 找到与当前筛选相同条件的我的筛选
    const targetMyFilter = find(myFilters,
      (filter) => isFilterSame(flattenObject(JSON.parse(filter.filterJson)), currentFilterDTO));
    return targetMyFilter;
  };
  const getMyFilterSelectValue = () => {
    const targetMyFilter = findSameFilter();

    const currentFilterDTO = store.getCustomFieldFilters();
    const onlyMe = currentFilterDTO.otherArgs.assigneeId && currentFilterDTO.otherArgs.assigneeId.length === 1 && currentFilterDTO.otherArgs.assigneeId[0] === userId;
    const { starBeacon } = currentFilterDTO.otherArgs;
    const result = [...selectedQuickFilters];
    if (targetMyFilter) {
      result.push(
        { key: `my|${targetMyFilter.filterId}`, label: targetMyFilter.name },
      );
    }
    if (onlyMe) {
      result.push(
        { key: 'commonly|onlyMe', label: '仅我的问题' },
      );
    }
    if (starBeacon) {
      result.push(
        { key: 'commonly|starBeacon', label: '我的关注' },
      );
    }
    return result;
  };
  const handleInputChange = (value: string) => {
    if (value) {
      store.handleFilterChange('contents', [value]);
    } else {
      store.handleFilterChange('contents', []);
    }
    store.handleFilterChange('issueIds', []);
  };
  const handleClickExpandFilter = useCallback(() => {
    store.setFolded(!folded);
  }, [folded, store]);

  const myFilterSelectValue = getMyFilterSelectValue();
  const hasSummaryField = useMemo(() => store.getAllFields.some((f) => f.code === 'contents'), [store.getAllFields]);
  const hasQuickFilterField = useMemo(() => store.getAllFields.some((f) => f.code === 'quickFilterIds'), [store.getAllFields]);
  const renderSearch = () => (
    <>
      {hasSummaryField && (
        <div style={{ marginTop: 4 }}>
          <SummaryField
            onChange={handleInputChange}
            value={store.getFilterValueByCode('contents') ? store.getFilterValueByCode('contents')[0] : undefined}
          />
        </div>
      )}
      <div className={`${prefixCls}-search-left`}>
        <CustomFields>
          {hasQuickFilterField ? (
            <div style={{ margin: '4px 5px' }}>
              <Select
                mode={'multiple' as SelectMode}
                showCheckAll={false}
                allowClear
                className="SelectTheme"
                dropdownMatchSelectWidth={false}
                placeholder="快速筛选"
                maxTagCount={0}
                labelInValue
                maxTagPlaceholder={(ommittedValues: LabeledValue[]) => `${ommittedValues.map((item) => item.label).join(', ')}`}
                style={{ ...getSelectStyle({ name: '快速筛选' }, myFilterSelectValue), height: 34 }}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                onClear={() => {
                  reset();
                }}
                value={myFilterSelectValue}
              >
                <OptGroup key="commonly" label="常用选项">
                  <Option value="commonly|onlyMe">仅我的问题</Option>
                  <Option value="commonly|starBeacon">我的关注</Option>
                </OptGroup>
                <OptGroup key="quick" label="快速筛选">
                  {quickFilters.map((filter) => (
                    <Option value={`quick|${filter.filterId}`}>{filter.name}</Option>
                  ))}
                </OptGroup>
                <OptGroup key="my" label="我的筛选">
                  {
                    myFilters.map((filter) => (
                      <Option value={`my|${filter.filterId}`}>{filter.name}</Option>
                    ))
                  }
                </OptGroup>
              </Select>
            </div>
          ) : null}
        </CustomFields>
      </div>
      <div className={`${prefixCls}-search-right`}>
        {isHasFilter && !folded && (
          <Button
            onClick={reset}
            funcType={'flat' as FuncType}
            className={`${prefixCls}-search-right-btn`}
          >
            重置
          </Button>
        )}
        {onClickSaveFilter && !findSameFilter() && isHasFilter && !folded && (
          <Button
            onClick={onClickSaveFilter}
            funcType={'flat' as FuncType}
            className={`${prefixCls}-search-right-btn ${prefixCls}-search-right-saveBtn`}
          >
            保存筛选
          </Button>
        )}
        {
          (overflowLine || folded === true) && (
            <Tooltip title={folded ? '展开筛选' : '折叠筛选'}>
              <Button
                onClick={handleClickExpandFilter}
                funcType={'flat' as FuncType}
                className={`${prefixCls}-search-right-btn`}
              >
                <Icon type={folded ? 'expand_more' : 'expand_less'} />
              </Button>
            </Tooltip>
          )
        }
      </div>
    </>
  );
  const renderUrlFilter = () => (
    <>
      <div className={`${prefixCls}-search-left`}>
        <div className={`${prefixCls}-search-urlFilter`}>
          <Icon type="search" />
          <div className={`${prefixCls}-search-urlFilter-item`}>{urlFilter}</div>
        </div>
      </div>
      <div className={`${prefixCls}-search-right`}>
        <Button onClick={reset} funcType={'flat' as FuncType} color={'blue' as ButtonColor}>重置</Button>
      </div>
    </>
  );
  return (
    <div
      className={`${prefixCls}-search`}
      style={{
        height: folded ? 48 : 'unset',
        overflowY: 'hidden',
      }}
    >
      <ListenSearchSize />
      {urlFilter ? renderUrlFilter() : renderSearch()}
    </div>
  );
};
export default observer(SearchArea);
