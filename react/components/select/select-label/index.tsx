import React, { useMemo, forwardRef } from 'react';
import { Select } from 'choerodon-ui/pro';
import useSelect, { SelectConfig } from '@/hooks/useSelect';
import { issueLabelApi } from '@/api';
import { SelectProps } from 'choerodon-ui/pro/lib/select/Select';
import { ILabel } from '@/common/types';
import FlatSelect from '@/components/flat-select';

interface Props extends Partial<SelectProps> {
  dataRef?: React.RefObject<Array<any>>
  valueField?: string
  afterLoad?: (sprints: ILabel[]) => void
  flat?:boolean
}

const SelectLabel: React.FC<Props> = forwardRef(({
  dataRef, valueField, afterLoad, flat, ...otherProps
}, ref: React.Ref<Select>) => {
  const config = useMemo((): SelectConfig => ({
    name: 'label',
    textField: 'labelName',
    valueField: valueField || 'labelName',
    request: () => issueLabelApi.loads(),
    middleWare: (data: ILabel[]) => {
      if (dataRef) {
        Object.assign(dataRef, {
          current: data,
        });
      }
      if (afterLoad) {
        afterLoad(data);
      }
      return data;
    },
    paging: false,
  }), []);
  const props = useSelect(config);
  const Component = flat ? FlatSelect : Select;

  return (
    <Component
      ref={ref}
      multiple
      combo
      {...props}
      {...otherProps}
    />
  );
});
export default SelectLabel;
