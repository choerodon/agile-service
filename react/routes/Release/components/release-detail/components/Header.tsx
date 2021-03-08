import { Button } from 'choerodon-ui/pro/lib';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useDetailContainerContext } from '@/components/detail-container/context';
import BaseTag from '@/components/tag/base-tag';
import VERSION_STATUS_TYPE from '@/constants/VERSION_STATUS_TYPE';
import { useReleaseDetailContext } from '../stores';
import Operation from './operation';
import Summary from './summary';
import './Header.less';

const Header: React.FC<{}> = () => {
  const { prefixCls, store, disabled } = useReleaseDetailContext();
  const { close } = useDetailContainerContext();
  const { statusCode, statusName } = store.getCurrentData;
  return (
    <div className={`${prefixCls}-header`}>

      <div className={`${prefixCls}-header-line`}>
        <Summary />
        <BaseTag color={VERSION_STATUS_TYPE[statusCode]?.color} text={statusName} />
      </div>

    </div>
  );
};
export default observer(Header);
