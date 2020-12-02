/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { createRef } from 'react';
import {
  observable, computed, action, runInAction,
} from 'mobx';
import { debounce, find, throttle } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import weekday from 'dayjs/plugin/weekday';
import { Gantt } from './types';
import {
  ROW_HEIGHT, HEADER_HEIGHT, MIN_VIEW_RATE, TOP_PADDING,
} from './constants';
import {
  flattenDeep, transverseData,
} from './utils';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
dayjs.extend(isLeapYear);

// 视图日视图、周视图、月视图、季视图、年视图
export const viewTypeList: Gantt.SightConfig[] = [
  {
    type: 'day',
    label: '日',
    value: 2880,
  },
  {
    type: 'week',
    label: '周',
    value: 3600,
  },
  {
    type: 'month',
    label: '月',
    value: 14400,
  },
  {
    type: 'quarter',
    label: '季',
    value: 86400,
  },
  {
    type: 'halfYear',
    label: '年',
    value: 115200,
  },
];
function isRestDay(date: string) {
  return [0, 6].includes(dayjs(date).weekday());
}
class GanttStore {
  constructor() {
    this.width = 1320;
    this.height = 418;
    const sightConfig = viewTypeList[0];
    const translateX = dayjs(this.getStartDate()).valueOf() / (sightConfig.value * 1000);
    const bodyWidth = this.width;
    const viewWidth = 704;
    const tableWidth = 500;
    this.viewWidth = viewWidth;
    this.tableWidth = tableWidth;
    this.translateX = translateX;
    this.sightConfig = sightConfig;
    this.bodyWidth = bodyWidth;
  }

  _wheelTimer: NodeJS.Timeout | null

  scrollTimer: number | null

  @observable data: Gantt.Item[] = [];

  @observable columns: Gantt.Column[] = [];

  // @observable dependencies: Gantt.Dependence[] = [{
  //   from: '36',
  //   to: '53',
  // }];
  @observable dependencies: Gantt.Dependence[] = [];

  @observable scrolling = false;

  @observable scrollTop = 0;

  @observable collapse = false;

  @observable tableWidth: number;

  @observable viewWidth: number;

  @observable width: number;

  @observable height: number;

  @observable bodyWidth: number;

  @observable translateX: number;

  @observable sightConfig: Gantt.SightConfig;

  @observable showSelectionIndicator: boolean = false;

  @observable selectionIndicatorTop: number = 0;

  @observable dragging: Gantt.Bar | null = null;

  @observable draggingType: Gantt.MoveType | null = null

  gestureKeyPress: boolean = false;

  mainElementRef = createRef<HTMLDivElement>();

  chartHammer: HammerManager;

  chartElementRef = createRef<HTMLDivElement>();

  isPointerPress: boolean = false;

  startDateKey: string = 'startDate';

  endDateKey: string = 'endDate';

  autoScrollPos: number = 0;

  clientX: number = 0;

  onUpdate: (item: Gantt.Item, startDate: string, endDate: string) => Promise<boolean> = () => Promise.resolve(true);

  isRestDay = isRestDay

  getStartDate() {
    return dayjs().subtract(10, 'day').toString();
  }

  setIsRestDay(func: (date: string) => boolean) {
    this.isRestDay = func || isRestDay;
  }

  @action
  setData(data: Gantt.Item[], startDateKey: string, endDateKey: string) {
    this.startDateKey = startDateKey;
    this.endDateKey = endDateKey;
    this.data = transverseData(data, startDateKey, endDateKey);
  }

  @action
  toggleCollapse() {
    if (this.tableWidth > 0) {
      this.tableWidth = 0;
      this.viewWidth = this.width - this.tableWidth;
    } else {
      this.initWidth();
    }
  }

  @action
  setRowCollapse(item: Gantt.Item, collapsed: boolean) {
    item.collapsed = collapsed;
    // this.barList = this.getBarList();
  }

  @action
  setOnUpdate(onUpdate: (item: Gantt.Item, startDate: string, endDate: string) => Promise<boolean>) {
    this.onUpdate = onUpdate;
  }

  @action
  setColumns(columns: Gantt.Column[]) {
    this.columns = columns;
  }

  @action
  initDragScrollHammer(element: HTMLElement) {
    const hammer = new Hammer(element);
    let { translateX } = this;

    const panStart = () => {
      this.scrolling = true;
      translateX = this.translateX;
    };

    const panMove = (event: HammerInput) => {
      this.translateX = translateX - event.deltaX;
    };

    const panEnd = (event: HammerInput) => {
      this.scrolling = false;
      this.translateX = translateX - event.deltaX;
    };

    hammer.on('panstart', panStart);
    hammer.on('panmove', panMove);
    hammer.on('panend', panEnd);
  }

  @action
  setChartHammer(chartHammer: HammerManager) {
    this.chartHammer = chartHammer;
  }

  @action syncSize(size: {
    width?: number;
    height?: number;
  }) {
    if (!size.height || !size.width) {
      return;
    }
    const { width, height } = size;
    if (this.height !== height) {
      this.height = height;
    }
    if (this.width !== width) {
      this.width = width;
      this.initWidth();
    }
  }

  @action handleResizeTableWidth(width: number) {
    this.tableWidth = width;
    this.viewWidth = this.width - this.tableWidth;
    // const tableMinWidth = 200;
    // const chartMinWidth = 200;
    // if (this.tableWidth + increase >= tableMinWidth && this.viewWidth - increase >= chartMinWidth) {
    //   this.tableWidth += increase;
    //   this.viewWidth -= increase;
    // }
  }

  @action initWidth() {
    this.tableWidth = this.columns.reduce((width, item) => width + item.width, 0);
    this.viewWidth = this.width - this.tableWidth;
    // 表盘宽度不能小于总宽度38%
    if (this.viewWidth < MIN_VIEW_RATE * this.width) {
      this.viewWidth = MIN_VIEW_RATE * this.width;
      this.tableWidth = this.width - this.viewWidth;
    }

    // 图表宽度不能小于 200
    if (this.viewWidth < 200) {
      this.viewWidth = 200;
      this.tableWidth = this.width - this.viewWidth;
    }
  }

  @action switchSight(type: Gantt.Sight) {
    const target = find(viewTypeList, { type });
    if (target) {
      this.sightConfig = target;
      this.translateX = dayjs(this.getStartDate()).valueOf() / (target.value * 1000);
    }
  }

  @action scrollToToday() {
    const translateX = this.todayTranslateX - (this.viewWidth / 2);
    this.translateX = translateX;
  }

  getTranslateXByDate(date: string) {
    return Math.floor(dayjs(date).hour(0).minute(0).second(0)
      .valueOf() / this.pxUnitAmp);
  }

  @computed get todayTranslateX() {
    return Math.floor(dayjs(new Date().valueOf()).hour(0).minute(0).second(0)
      .valueOf() / this.pxUnitAmp);
  }

  @computed get mid() {
    const startAmp = this.pxUnitAmp * this.getTranslateXByDate(this.getStartDate());
    const endAmp = startAmp + this.getDurationAmp();
    return parseInt(String((startAmp + endAmp) / 2), 10);
  }

  @computed get scrollBarWidth() {
    const MIN_WIDTH = 30;
    return Math.max((this.viewWidth / this.scrollWidth) * 160, MIN_WIDTH);
  }

  @computed get scrollLeft() {
    const rate = this.viewWidth / this.scrollWidth;
    const curDate = dayjs(this.translateAmp).toString();
    // 默认滚动条在中间
    const half = (this.viewWidth - this.scrollBarWidth) / 2;
    const viewScrollLeft = half + rate * (this.getTranslateXByDate(curDate) - this.getTranslateXByDate(this.getStartDate()));
    return Math.min(Math.max(viewScrollLeft, 0), this.viewWidth - this.scrollBarWidth);
  }

  @computed get scrollWidth() {
    // 最小宽度
    const init = this.getTranslateXByDate(String(this.mid + this.pxUnitAmp)) - this.getTranslateXByDate(String(this.mid - this.pxUnitAmp));
    return Math.max(Math.abs(this.viewWidth + this.translateX - this.getTranslateXByDate(this.getStartDate())), Math.abs(init));
  }

  // 内容区滚动高度
  @computed get bodyClientHeight() {
    return this.height - HEADER_HEIGHT;
  }

  @computed get getColumnsWidth(): number[] {
    const totalColumnWidth = this.columns.reduce((width, item) => width + item.width, 0);
    if (totalColumnWidth < this.tableWidth) {
      let availableWidth = this.tableWidth;
      const result: number[] = [];
      this.columns.forEach((column, index) => {
        if (index === this.columns.length - 1) {
          result.push(availableWidth);
        } else {
          const width = (this.tableWidth * (column.width / totalColumnWidth));
          result.push(width);
          availableWidth -= width;
        }
      });
      return result;
    }
    return this.columns.map((column) => column.width);
  }

  // 内容区滚动区域域高度
  @computed get bodyScrollHeight() {
    let height = this.getBarList.length * ROW_HEIGHT + TOP_PADDING;
    if (height < this.bodyClientHeight) {
      height = this.bodyClientHeight;
    }
    return height;
  }

  @computed get pxUnitAmp() {
    return this.sightConfig.value * 1000;
  }

  /**
   * 时间起始偏移量
   */
  @computed get translateAmp() {
    const { translateX } = this;
    return this.pxUnitAmp * translateX;
  }

  getDurationAmp() {
    const clientWidth = this.viewWidth;
    return this.pxUnitAmp * clientWidth;
  }

  getMajorList(): Gantt.Major[] {
    const majorFormatMap: { [key in Gantt.Sight]: string } = {
      day: 'YYYY年 MM月',
      week: 'YYYY年 MM月',
      month: 'YYYY年',
      quarter: 'YYYY年',
      halfYear: 'YYYY年',
    };
    const { translateAmp } = this;
    const endAmp = translateAmp + this.getDurationAmp();
    const { type } = this.sightConfig;
    const format = majorFormatMap[type];

    const getNextDate = (start: Dayjs) => {
      if (type === 'day' || type === 'week') {
        return start.add(1, 'month');
      }
      return start.add(1, 'year');
    };

    const getStart = (date: Dayjs) => {
      if (type === 'day' || type === 'week') {
        return date.startOf('month');
      }
      return date.startOf('year');
    };

    const getEnd = (date: Dayjs) => {
      if (type === 'day' || type === 'week') {
        return date.endOf('month');
      }
      return date.endOf('year');
    };

    // 初始化当前时间
    let curDate = dayjs(translateAmp);
    const dateMap = new Map<string, Gantt.MajorAmp>();

    // 对可视区域内的时间进行迭代
    while (curDate.isBetween(translateAmp - 1, endAmp + 1)) {
      const majorKey = curDate.format(format);

      let start = curDate;
      const end = getEnd(start);
      if (dateMap.size !== 0) {
        start = getStart(curDate);
      }

      if (!dateMap.has(majorKey)) {
        dateMap.set(majorKey, {
          label: majorKey,
          startDate: start,
          endDate: end,
        });
      }

      // 获取下次迭代的时间
      start = getStart(curDate);
      curDate = getNextDate(start);
    }

    return this.majorAmp2Px([...dateMap.values()]);
  }

  majorAmp2Px(ampList: Gantt.MajorAmp[]) {
    const { pxUnitAmp } = this;
    const list = ampList.map((item) => {
      const { startDate } = item;
      const { endDate } = item;
      const { label } = item;
      const left = (startDate.valueOf() / pxUnitAmp);
      const width = (endDate.valueOf() - startDate.valueOf()) / pxUnitAmp;

      return {
        label,
        left,
        width,
      };
    });
    return list;
  }

  getMinorList(): Gantt.Minor[] {
    const minorFormatMap = {
      day: 'YYYY-MM-D',
      week: 'YYYY-w周', // format W 不知道为什么不支持周，文档却说支持,
      month: 'YYYY-MM月',
      quarter: 'YYYY-第Q季',
      halfYear: 'YYYY-',
    };
    const fstHalfYear = [0, 1, 2, 3, 4, 5];

    const startAmp = this.translateAmp;
    const endAmp = startAmp + this.getDurationAmp();
    const format = minorFormatMap[this.sightConfig.type];

    const getNextDate = (start: Dayjs) => {
      const map = {
        day() {
          return start.add(1, 'day');
        },
        week() {
          return start.add(1, 'week');
        },
        month() {
          return start.add(1, 'month');
        },
        quarter() {
          return start.add(1, 'quarter');
        },
        halfYear() {
          return start.add(6, 'month');
        },
      };

      return (map[this.sightConfig.type])();
    };
    const setStart = (date: Dayjs) => {
      const map = {
        day() {
          return date.startOf('day');
        },
        week() {
          return date.weekday(1).hour(0).minute(0).second(0);
        },
        month() {
          return date.startOf('month');
        },
        quarter() {
          return date.startOf('quarter');
        },
        halfYear() {
          if (fstHalfYear.includes(date.month())) {
            return date.month(0).startOf('month');
          }
          return date.month(6).startOf('month');
        },
      };

      return (map[this.sightConfig.type])();
    };
    const setEnd = (start: Dayjs) => {
      const map = {
        day() {
          return start.endOf('day');
        },
        week() {
          return start.weekday(7).hour(23).minute(59).second(59);
        },
        month() {
          return start.endOf('month');
        },
        quarter() {
          return start.endOf('quarter');
        },
        halfYear() {
          if (fstHalfYear.includes(start.month())) {
            return start.month(5).endOf('month');
          }
          return start.month(11).endOf('month');
        },
      };

      return (map[this.sightConfig.type])();
    };
    const getMinorKey = (date: Dayjs) => {
      if (this.sightConfig.type === 'halfYear') {
        return date.format(format) + (fstHalfYear.includes(date.month()) ? '上半年' : '下半年');
      }

      return date.format(format);
    };

    // 初始化当前时间
    let curDate = dayjs(startAmp);
    const dateMap = new Map<string, Gantt.MinorAmp>();

    while (curDate.isBetween(startAmp - 1, endAmp + 1)) {
      const minorKey = getMinorKey(curDate);

      const start = setStart(curDate);
      const end = setEnd(start);
      if (!dateMap.has(minorKey)) {
        dateMap.set(minorKey, {
          label: minorKey.split('-').pop() as string,
          startDate: start,
          endDate: end,
        });
      }

      curDate = getNextDate(start);
    }

    return this.minorAmp2Px([...dateMap.values()]);
  }

  startXRectBar = (startX: number) => {
    let date = dayjs(startX * this.pxUnitAmp);
    const dayRect = () => {
      const stAmp = date.startOf('day');
      const endAmp = date.endOf('day');
      // @ts-ignore
      const left = stAmp / this.pxUnitAmp;
      // @ts-ignore
      const width = (endAmp - stAmp) / this.pxUnitAmp;

      return {
        left,
        width,
      };
    };
    const weekRect = () => {
      // week 注意周日为每周第一天 ????????
      if (date.weekday() === 0) {
        date = date.add(-1, 'week');
      }
      const left = date.weekday(1).startOf('day').valueOf() / this.pxUnitAmp;
      const width = (7 * 24 * 60 * 60 * 1000 - 1000) / this.pxUnitAmp;

      return {
        left,
        width,
      };
    };
    const monthRect = () => {
      const stAmp = date.startOf('month').valueOf();
      const endAmp = date.endOf('month').valueOf();
      const left = stAmp / this.pxUnitAmp;
      const width = (endAmp - stAmp) / this.pxUnitAmp;

      return {
        left,
        width,
      };
    };

    const map = {
      day: dayRect,
      week: weekRect,
      month: weekRect,
      quarter: monthRect,
      halfYear: monthRect,
    };

    return map[this.sightConfig.type]();
  }

  minorAmp2Px(ampList: Gantt.MinorAmp[]): Gantt.Minor[] {
    const { pxUnitAmp } = this;
    const list = ampList.map((item) => {
      const startDate = item.startDate.hour(0).minute(0).second(0);
      const endDate = item.endDate.hour(23).minute(59).second(59);

      const { label } = item;
      const left = Math.ceil(startDate.valueOf() / pxUnitAmp);
      const width = Math.ceil((endDate.valueOf() - startDate.valueOf()) / pxUnitAmp);

      let isWeek = false;
      if (this.sightConfig.type === 'day') {
        isWeek = this.isRestDay(startDate.toString());
      }
      return {
        label,
        left,
        width,
        isWeek,
        key: startDate.format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    return list;
  }

  getTaskBarThumbVisible(barInfo: Gantt.Bar) {
    const { width, translateX: barTranslateX, invalidDateRange } = barInfo;
    if (invalidDateRange) {
      return false;
    }
    const rightSide = this.translateX + this.viewWidth;
    const right = barTranslateX;

    return barTranslateX + width < this.translateX || right - rightSide > 0;
  }

  scrollToBar(barInfo: Gantt.Bar, type: 'left' | 'right') {
    const { translateX: barTranslateX, width } = barInfo;
    const translateX1 = this.translateX + (this.viewWidth / 2);
    const translateX2 = barTranslateX + width;

    const diffX = Math.abs(translateX2 - translateX1);
    let translateX = this.translateX + diffX;

    if (type === 'left') {
      translateX = this.translateX - diffX;
    }

    this.translateX = translateX;
  }

  @computed get getBarList(): Gantt.Bar[] {
    const { pxUnitAmp, data } = this;
    const minStamp = 11 * pxUnitAmp;
    const height = 8;
    const baseTop = 14;
    const topStep = 28;

    // TODO 后期需优化 增加上周下周等内容
    const dateTextFormat = (startX: number) => dayjs(startX * pxUnitAmp).format('YYYY-MM-DD');
    const _dateFormat = (date: string) => {
      if (!date) return '待设置';
      return dayjs(date).format('YYYY年MM月DD日');
    };

    // 获取鼠标位置所在bar大小及位置
    const startXRectBar = (startX: number) => {
      let date = dayjs(startX * pxUnitAmp);
      const dayRect = () => {
        const stAmp = date.startOf('day');
        const endAmp = date.endOf('day');
        // @ts-ignore
        const left = stAmp / pxUnitAmp;
        // @ts-ignore
        const width = (endAmp - stAmp) / pxUnitAmp;

        return {
          left,
          width,
        };
      };
      const weekRect = () => {
        // week 注意周日为每周第一天 ????????
        if (date.weekday() === 0) {
          date = date.add(-1, 'week');
        }

        const left = date.weekday(1).startOf('day').valueOf() / pxUnitAmp;
        const width = (7 * 24 * 60 * 60 * 1000 - 1000) / pxUnitAmp;

        return {
          left,
          width,
        };
      };
      const monthRect = () => {
        const stAmp = date.startOf('month').valueOf();
        const endAmp = date.endOf('month').valueOf();
        const left = stAmp / pxUnitAmp;
        const width = (endAmp - stAmp) / pxUnitAmp;

        return {
          left,
          width,
        };
      };

      const map = {
        day: dayRect,
        week: weekRect,
        month: weekRect,
        quarter: monthRect,
        halfYear: monthRect,
      };

      return map[this.sightConfig.type]();
    };
    const flattenData = flattenDeep(data);
    const barList = flattenData.map((item: any, index) => {
      const valid = item.startDate && item.endDate;
      let startAmp = dayjs(item.startDate || 0).startOf('day').valueOf();
      let endAmp = dayjs(item.endDate || 0).add(1, 'day').startOf('day').valueOf();

      // 开始结束日期相同默认一天
      if (Math.abs(endAmp - startAmp) < minStamp) {
        startAmp = dayjs(item.startDate || 0).startOf('day').valueOf();
        endAmp = dayjs(item.endDate || 0).add(1, 'day').startOf('day').add(minStamp, 'millisecond')
          .valueOf();
      }

      const width = valid ? (endAmp - startAmp) / pxUnitAmp : 0;
      const translateX = valid ? startAmp / pxUnitAmp : 0;
      const translateY = baseTop + index * topStep;
      const { _parent } = item;
      const bar = {
        task: item,
        translateX,
        translateY,
        width,
        height,
        label: item.content,
        stepGesture: 'end', // start(开始）、moving(移动)、end(结束)
        invalidDateRange: !item.endDate || !item.startDate, // 是否为有效时间区间
        dateTextFormat, // TODO 日期格式化函数 后期根据当前时间格式化为上周下周,
        startXRectBar, // 鼠标位置 获取创建bar位置及大小
        // setShadowShow,
        // setInvalidTaskBar,
        // getHovered,
        loading: false,
        _group: item.group,
        _collapsed: item.collapsed, // 是否折叠
        _depth: item._depth, // 表示子节点深度
        _index: item._index, // 任务下标位置
        _parent, // 原任务数据
        _childrenCount: !item.children ? 0 : item.children.length, // 子任务
        _dateFormat,
      };
      item._bar = bar;
      return bar;
    });
    // 进行展开扁平
    return observable(barList);
  }

  @action
  handleWheel = (event: WheelEvent) => {
    if (event.deltaX !== 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this._wheelTimer) clearTimeout(this._wheelTimer);
    // 水平滚动
    if (Math.abs(event.deltaX) > 0) {
      this.scrolling = true;
      this.translateX += event.deltaX;
    }
    this._wheelTimer = setTimeout(() => {
      this.scrolling = false;
    }, 100);
  }

  handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop } = event.currentTarget;
    this.scrollY(scrollTop);
  }

  scrollY = throttle((scrollTop: number) => {
    this.scrollTop = scrollTop;
  }, 100)

  // 虚拟滚动
  @computed get getVisibleRows() {
    const visibleHeight = this.bodyClientHeight;
    // 多渲染几个，减少空白
    const visibleRowCount = Math.ceil(visibleHeight / ROW_HEIGHT) + 10;

    const start = Math.max(Math.ceil(this.scrollTop / ROW_HEIGHT) - 5, 0);
    return {
      start,
      count: visibleRowCount,
    };
  }

  handleMouseMove = debounce((event) => {
    if (!this.isPointerPress) {
      this.showSelectionBar(event);
    }
  }, 5)

  handleMouseLeave() {
    this.showSelectionIndicator = false;
  }

  @action
  showSelectionBar(event: MouseEvent) {
    const scrollTop = this.mainElementRef.current?.scrollTop || 0;
    const { top } = this.mainElementRef.current?.getBoundingClientRect() || { top: 0 };
    // 内容区高度
    const contentHeight = this.getBarList.length * ROW_HEIGHT;
    const offsetY = event.clientY - top + scrollTop;
    if (offsetY - contentHeight > TOP_PADDING) {
      this.showSelectionIndicator = false;
    } else {
      const top = Math.floor((offsetY - TOP_PADDING) / ROW_HEIGHT) * ROW_HEIGHT + TOP_PADDING;
      this.showSelectionIndicator = true;
      this.selectionIndicatorTop = top;
    }
  }

  getHovered = (top: number) => {
    const baseTop = top - (top % ROW_HEIGHT);
    const isShow = (this.selectionIndicatorTop >= baseTop && this.selectionIndicatorTop <= baseTop + ROW_HEIGHT);
    return isShow;
  }

  @action
  handleDragStart(barInfo: Gantt.Bar, type: Gantt.MoveType) {
    this.dragging = barInfo;
    this.draggingType = type;
    barInfo.stepGesture = 'start';
    this.isPointerPress = true;
  }

  @action
  handleDragEnd() {
    if (this.dragging) {
      this.dragging.stepGesture = 'end';
      this.dragging = null;
    }
    this.draggingType = null;
    this.isPointerPress = false;
  }

  @action
  handleInvalidBarLeave() {
    this.handleDragEnd();
  }

  @action
  handleInvalidBarHover(barInfo: Gantt.Bar, left: number, width: number) {
    barInfo.translateX = left;
    barInfo.width = width;
    // 只能向右拖动
    this.handleDragStart(barInfo, 'right');
  }

  @action
  handleInvalidBarDragStart(barInfo: Gantt.Bar) {
    // 只能向右拖动
    barInfo.stepGesture = 'moving';
  }

  @action
  handleInvalidBarDragEnd(barInfo: Gantt.Bar, oldSize: { width: number, x: number }) {
    barInfo.invalidDateRange = false;
    this.handleDragEnd();
    this.updateTaskDate(barInfo, oldSize);
  }

  @action
  updateBarSize(barInfo: Gantt.Bar, { width, x }: { width: number, x: number }) {
    barInfo.width = width;
    barInfo.translateX = x;
  }

  /**
     * 更新时间
     */
  @action
  async updateTaskDate(barInfo: Gantt.Bar, oldSize: { width: number, x: number }) {
    const { translateX, width, task } = barInfo;
    const startDate = dayjs(translateX * this.pxUnitAmp).hour(9).format('YYYY-MM-DD HH:mm:ss');
    const endDate = dayjs((translateX + width) * this.pxUnitAmp).subtract(1).hour(18).minute(0)
      .second(0)
      .format('YYYY-MM-DD HH:mm:ss');
    const oldStartDate = barInfo.task.startDate;
    const oldEndDate = barInfo.task.endDate;
    if (startDate === oldStartDate && endDate === oldEndDate) {
      return;
    }
    runInAction(() => {
      barInfo.loading = true;
    });
    const success = await this.onUpdate(task, startDate, endDate);
    if (success) {
      runInAction(() => {
        task.startDate = startDate;
        task.endDate = endDate;
        task[this.startDateKey] = startDate;
        task[this.endDateKey] = endDate;
      });
    } else {
      barInfo.width = oldSize.width;
      barInfo.translateX = oldSize.x;
    }
  }
}

export default GanttStore;
