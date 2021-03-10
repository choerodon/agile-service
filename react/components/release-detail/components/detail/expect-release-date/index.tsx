import React from 'react';
import { observer } from 'mobx-react-lite';
import { DatePicker } from 'choerodon-ui/pro/lib';
import TextEditToggle from '@/components/TextEditTogglePro';
import Field from '../field';
import { useReleaseDetailContext } from '../../../stores';

interface Props {

}
const BusinessValue: React.FC<Props> = () => {
  const { disabled, store } = useReleaseDetailContext();
  const { expectReleaseDate } = store.getCurrentData;
  return (

    <Field label="预计发布时间">
      <TextEditToggle
        onSubmit={(value: string) => {
          store.update('expectReleaseDate', value);
        }}
        disabled={disabled}
        initValue={expectReleaseDate}
        submitTrigger={['blur', 'change']}
        editor={() => (
          <DatePicker style={{ width: '100%' }} />
        )}
      >
        {expectReleaseDate || '无'}
      </TextEditToggle>
    </Field>
  );
};

export default observer(BusinessValue);