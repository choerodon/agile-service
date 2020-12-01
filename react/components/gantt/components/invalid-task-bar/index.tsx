import React, {
  useContext, useCallback, useState, useRef,
} from 'react';
import { observer } from 'mobx-react-lite';
import Context from '../../context';
import styles from './index.less';
import { Gantt } from '../../types';
import { ROW_HEIGHT } from '../../constants';
import DragResize from '../drag-resize';

interface TaskBarProps {
  data: Gantt.Bar
}
const barH = 8;
let startX = 0;

const InvalidTaskBar: React.FC<TaskBarProps> = ({ data }) => {
  const { store } = useContext(Context);
  const triggerRef = useRef<HTMLDivElement>(null);
  const {
    translateY, translateX, width, dateTextFormat,
  } = data;
  const [visible, setVisible] = useState(false);
  const { translateX: viewTranslateX } = store;
  const top = translateY;
  const handleMouseEnter = useCallback(() => {
    if (data.stepGesture === 'moving') {
      return;
    }
    startX = triggerRef.current?.getBoundingClientRect()?.left || 0;
    setVisible(true);
  }, [data.stepGesture]);
  const handleMouseLeave = useCallback(() => {
    if (data.stepGesture === 'moving') {
      return;
    }
    setVisible(false);
    store.handleInvalidBarLeave();
  }, [data.stepGesture, store]);
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (data.stepGesture === 'moving') {
      return;
    }
    const pointerX = viewTranslateX + (event.clientX - startX);
    // eslint-disable-next-line no-shadow
    const { left, width } = store.startXRectBar(pointerX);
    store.handleInvalidBarHover(data, left, Math.ceil(width));
  }, [data, store, viewTranslateX]);

  const handleBeforeResize = () => () => {
    store.handleInvalidBarDragStart(data);
  };
  const handleResize = useCallback(({ width: newWidth, x }) => {
    store.updateBarSize(data, { width: newWidth, x });
  }, [data, store]);
  const handleLeftResizeEnd = useCallback(() => {
    store.handleInvalidBarDragEnd(data);
  }, [data, store]);
  const handleAutoScroll = useCallback((delta: number) => {
    store.translateX += delta;
  }, [store]);
  return (
    <DragResize
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      onBeforeResize={handleBeforeResize}
    >
      <div
        ref={triggerRef}
        className={styles['task-row-trigger']}
        style={{
          left: viewTranslateX, transform: `translateY(${top - ((ROW_HEIGHT - barH) / 2)}px`,
        }}
      />
      {visible && (
        <div
          className={styles.block}
          aria-haspopup="true"
          aria-expanded="false"
          style={{
            left: translateX,
            width: Math.ceil(width),
            transform: `translateY(${top}px)`,
            backgroundColor: 'rgb(149, 221, 255)',
            borderColor: 'rgb(100, 199, 254)',
          }}
        >
          <div
            className={styles.date}
            style={{
              right: Math.ceil(width + 6),
            }}
          >
            {dateTextFormat(translateX)}
          </div>
          <div
            className={styles.date}
            style={{
              left: Math.ceil(width + 6),
            }}
          >
            {dateTextFormat(translateX + width)}
          </div>
        </div>
      )}
    </DragResize>
  );
};
export default observer(InvalidTaskBar);
