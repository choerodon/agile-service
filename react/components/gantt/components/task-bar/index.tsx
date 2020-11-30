import React, {
  useContext, useMemo, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import dayjs from 'dayjs';
import Context from '../../context';
import styles from './index.less';
import { Gantt } from '../../types';
import { ROW_HEIGHT } from '../../constants';
import DragResize from '../drag-resize';

interface TaskBarProps {
  data: Gantt.Bar
}
const height = 8;
const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  e.stopPropagation();
};
const TaskBar: React.FC<TaskBarProps> = ({ data }) => {
  const { store, getBarColor } = useContext(Context);
  const {
    width, translateX, translateY, invalidDateRange, stepGesture, label, dateTextFormat, task,
  } = data;
  // TODO 优化hover判断性能
  const { selectionIndicatorTop } = store;
  const showDragBar = useMemo(() => {
    const baseTop = translateY - (translateY % ROW_HEIGHT);
    const isShow = (selectionIndicatorTop >= baseTop && selectionIndicatorTop <= baseTop + ROW_HEIGHT);
    return isShow;
  }, [selectionIndicatorTop, translateY]);
  const handleBarPress = useCallback(() => {
    store.shadowGestureBarPress(data);
  }, [data, store]);
  const handleBarPressUp = useCallback(() => {
    store.shadowGestureBarPressUp();
  }, [store]);
  const handleLeftDown = useCallback((event: React.MouseEvent) => {
    store.shadowGesturePress(event, 'left', data);
  }, [data, store]);
  const handleRightDown = useCallback((event: React.MouseEvent) => {
    store.shadowGesturePress(event, 'right', data);
  }, [data, store]);
  const themeColor = useMemo(() => {
    if (translateX + width >= dayjs().valueOf() / store.pxUnitAmp) {
      return ['#95DDFF', '#64C7FE'];
    }
    return ['#FD998F', '#F96B5D'];
  }, [store.pxUnitAmp, translateX, width]);
  // eslint-disable-next-line no-shadow
  const handleResize = useCallback(({ width, x }) => {
    // eslint-disable-next-line no-param-reassign
    data.width = width;
    // eslint-disable-next-line no-param-reassign
    data.translateX = x;
  }, [data]);
  const handleLeftResizeEnd = useCallback(() => {
    store.updateTaskDate(data);
  }, [data, store]);
  const handleAutoScroll = useCallback((delta: number) => {
    store.translateX += delta;
  }, [store]);

  return (
    <div
      role="none"
      className={classNames(styles['task-bar'], {
        [styles['invalid-date-range']]: invalidDateRange,
        [styles.overdue]: !invalidDateRange,
      })}
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
      }}
      onClick={handleClick}
    >
      <div>
        {showDragBar && (
          <>
            {/* {stepGesture !== 'moving' && (
              <div className={styles['dependency-handle']} style={{ left: -34, width: 12 }}>
                <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1">
                  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <circle className={styles.outer} stroke="#87D2FF" fill="#FFFFFF" cx="6" cy="6" r="5.5" />
                    <circle className={styles.inner} fill="#87D2FF" cx="6" cy="6" r="2" />
                  </g>
                </svg>
              </div>
            )}
            {stepGesture !== 'moving' && (
              <div className={classNames(styles['dependency-handle'], styles.right)} style={{ left: width + 28, width: 12 }}>
                <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1">
                  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <circle className={styles.outer} stroke="#87D2FF" fill="#FFFFFF" cx="6" cy="6" r="5.5" />
                    <circle className={styles.inner} fill="#87D2FF" cx="6" cy="6" r="2" />
                  </g>
                </svg>
              </div>
            )} */}
            <DragResize
              className={classNames(styles['resize-handle'], styles.left)}
              style={{ left: -14 }}
              onResize={handleResize}
              onResizeEnd={handleLeftResizeEnd}
              defaultSize={{
                x: translateX,
                width,
              }}
              minWidth={30}
              grid={30}
              type="left"
              scroller={store.chartElementRef.current || undefined}
              onAutoScroll={handleAutoScroll}
            />
            <DragResize
              className={classNames(styles['resize-handle'], styles.right)}
              style={{ left: width + 2 }}
              onResize={handleResize}
              onResizeEnd={handleLeftResizeEnd}
              defaultSize={{
                x: translateX,
                width,
              }}
              minWidth={30}
              grid={30}
              type="right"
              scroller={store.chartElementRef.current || undefined}
              onAutoScroll={handleAutoScroll}
            />
            <div className={classNames(styles['resize-bg'], styles.compact)} style={{ width: width + 30, left: -14 }} />
          </>
        )}
        <DragResize
          className={styles.bar}
          onResize={handleResize}
          onResizeEnd={handleLeftResizeEnd}
          defaultSize={{
            x: translateX,
            width,
          }}
          minWidth={30}
          grid={30}
          type="move"
          scroller={store.chartElementRef.current || undefined}
          onAutoScroll={handleAutoScroll}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            width={width + 1}
            height={height + 1}
            viewBox={`0 0 ${width + 1} ${height + 1}`}
          >
            <path
              fill={task.backgroundColor || (getBarColor && getBarColor(task).backgroundColor) || themeColor[0]}
              stroke={task.borderColor || (getBarColor && getBarColor(task).borderColor) || themeColor[1]}
              d={`
              M${width - 2},0.5
              l-${width - 5},0
              c-0.41421,0 -0.78921,0.16789 -1.06066,0.43934
              c-0.27145,0.27145 -0.43934,0.64645 -0.43934,1.06066
              l0,5.3
            
              c0.03256,0.38255 0.20896,0.724 0.47457,0.97045
              c0.26763,0.24834 0.62607,0.40013 1.01995,0.40013
              l4,0

              l${width - 12},0
            
              l4,0
              c0.41421,0 0.78921,-0.16789 1.06066,-0.43934
              c0.27145,-0.27145 0.43934,-0.64645 0.43934,-1.06066
          
              l0,-5.3
              c-0.03256,-0.38255 -0.20896,-0.724 -0.47457,-0.97045
              c-0.26763,-0.24834 -0.62607,-0.40013 -1.01995,-0.40013z
            `}
              className={styles.default}
            />
          </svg>
        </DragResize>
      </div>
      {stepGesture !== 'moving' && <div className={styles.label} style={{ left: width + 45 }}>{label}</div>}
      {stepGesture === 'moving' && (
        <>
          <div className={styles['date-text']} style={{ left: width + 16 }}>{dateTextFormat(translateX + width)}</div>
          <div className={styles['date-text']} style={{ right: width + 16 }}>{dateTextFormat(translateX)}</div>
        </>
      )}
    </div>
  );
};
export default observer(TaskBar);
