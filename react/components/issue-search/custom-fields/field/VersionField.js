import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import SelectVersion from '@/components/select/select-version';

function VersionField({ field, value, onChange }) {
  const [, setValue] = useState(0);
  return (
    <SelectVersion
      hasUnassign
      key={field.code}
      flat
      value={value || []}
      placeholder={field.name}
      multiple
      maxTagCount={3}
      dropdownMatchSelectWidth={false}
      clearButton
      onChange={onChange}
      valueField="versionId"
    />
  );
}
export default observer(VersionField);
