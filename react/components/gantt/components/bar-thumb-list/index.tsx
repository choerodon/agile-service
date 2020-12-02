/* eslint-disable no-underscore-dangle */
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import TaskBarThumb from '../task-bar-thumb';
import Context from '../../context';

const BarThumbList: React.FC = () => {
  const { store } = useContext(Context);
  const barList = store.getBarList;
  const { count, start } = store.getVisibleRows;
  return (
    <>
      {barList.slice(start, start + count).map((bar, index) => {
        const rowIndex = index + start;
        if (store.getTaskBarThumbVisible(bar)) {
          return (
            <TaskBarThumb
              data={bar}
              key={`${bar.label}-${rowIndex}`}
            />
          );
        }
        return null;
      })}
    </>
  );
};
export default observer(BarThumbList);
