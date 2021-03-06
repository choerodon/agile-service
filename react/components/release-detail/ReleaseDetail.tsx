import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Container from './Container';
import './index.less';
import { useReleaseDetailContext } from './stores';

const ReleaseDetail: React.FC = () => {
  const {
    store, id,
  } = useReleaseDetailContext();
  useEffect(() => {
    id && store.select(id);
  }, [id, store]);
  return (
    <>
      {store.getVisible && <Container key="release-detail" />}
    </>

  );
};
export default observer(ReleaseDetail);
