/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import {
  Page, Header, Content, stores, Breadcrumb,
} from '@choerodon/boot';
import {
  Button, Table, Select, Icon, Spin,
} from 'choerodon-ui';
import to, { linkUrl } from '@/utils/to';
import LINK_URL from '@/constants/LINK_URL';
import pic from '../../../../assets/image/emptyChart.svg';
import SwithChart from '../../Component/switchChart';
import VS from '../../../../stores/project/velocityChart';
import EmptyBlock from '../../../../components/EmptyBlock';
import './VelocityChart.less';

const { AppState } = stores;
const { Option } = Select;

@observer
class VelocityChart extends Component {
  componentDidMount() {
    VS.setCurrentUnit('story_point');
    VS.loadChartAndTableData();
  }

  componentWillUnmount() {
    VS.setChartData([]);
    VS.setTableData([]);
  }

  getOption() {
    let unit = '';
    if (VS.currentUnit === 'story_point') {
      unit = '点';
    }

    if (VS.currentUnit === 'issue_count') {
      unit = '个';
    }

    if (VS.currentUnit === 'remain_time') {
      unit = '小时';
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          let content = '';
          if (params && params.length) {
            content = `<div>${params[0].axisValue}</div>`;
            params.forEach((param) => {
              content += `<div style="font-size: 11px"><div style="display:inline-block; width: 10px; height: 10px; margin-right: 3px; border-radius: 50%; background:${param.color}"></div>${param.seriesName}：${param.value}${param.value ? unit : ''}</div>`;
            });
          }
          return content;
        },
      },
      legend: {
        orient: 'horizontal',
        x: 'right',
        y: 0,
        padding: [0, 50, 0, 0],
        itemWidth: 14,
        data: [
          {
            name: '预估',
            icon: 'rectangle',
          },
          {
            name: '已完成',
            icon: 'rectangle',
          },
        ],
      },
      grid: {
        top: '30',
        left: 0,
        right: '50',
        containLabel: true,
      },
      calculable: true,
      xAxis: {
        name: '冲刺',
        type: 'category',
        boundaryGap: true,
        nameTextStyle: {
          color: '#000',
        },
        axisTick: { show: false },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisLabel: {
          show: true,
          // interval: VS.getChartDataX.length >= 16 ? 5 : 0,
          interval: 0,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
          },
          formatter(value, index) {
            if (value.length > 10) {
              return `${value.slice(0, 11)}...`;
            }
            return value;
          },
        },
        splitLine: {
          show: false,
          onGap: false,
          interval: 0,
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
        data: VS.getChartDataX,
      },
      yAxis: {
        name: VS.getChartYAxisName,
        type: 'value',

        nameTextStyle: {
          color: '#000',
        },
        axisTick: { show: false },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },

        axisLabel: {
          show: true,
          interval: 'auto',
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 1,
          },
        },
      },
      dataZoom: [{
        startValue: VS.getChartDataX[0],
        endValue: VS.getChartDataX[8],
        zoomLock: true,
        type: 'slider',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '100%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
      }],
      series: [
        {
          name: '预估',
          type: 'bar',
          itemStyle: {
            color: '#d3d3d3',
          },
          data: VS.getChartDataYCommitted,
          emphasis: {
            itemStyle: {
              color: '#e0e0e0',
            },
          },
        },
        {
          name: '已完成',
          type: 'bar',
          data: VS.getChartDataYCompleted,
          itemStyle: {
            color: '#00bfa5',
          },
          lineStyle: {
            type: 'dashed',
            color: 'grey',
          },
          emphasis: {
            itemStyle: {
              color: '#35e6ce',
            },
          },
        },
      ],
    };
  }

  getTableValue(record, type) {
    const currentUnit = VS.beforeCurrentUnit;
    const CAMEL = {
      story_point: 'StoryPoints',
      remain_time: 'RemainTime',
      issue_count: 'IssueCount',
    };
    const currentProp = `${type}${CAMEL[currentUnit]}`;
    if (currentUnit === 'remain_time') {
      return this.transformRemainTime(record[currentProp]);
    }
    return record[currentProp] || 0;
  }

  refresh() {
    VS.loadChartAndTableData();
  }

  handleChangeCurrentUnit(unit) {
    VS.setCurrentUnit(unit);
    VS.loadChartData(unit);
  }

  transformRemainTime(remainTime, type) {
    if (!remainTime) {
      return '0';
    }
    let time = remainTime * 1;
    const w = Math.floor(time / 40);
    time -= 40 * w;
    const d = Math.floor(time / 8);
    time -= 8 * d;
    return `${w ? `${w}周 ` : ''}${d ? `${d}天 ` : ''}${time ? `${time}小时 ` : ''}`;
  }

  renderTable() {
    let unit = '';
    if (VS.currentUnit === 'story_point') {
      unit = '(点)';
    }

    if (VS.currentUnit === 'issue_count') {
      unit = '(个)';
    }

    const column = [
      {
        width: '33%',
        // width: 65,
        title: '冲刺',
        dataIndex: 'sprintName',
        render: (sprintName, record) => (
          <span
            className="primary"
            style={{
              display: 'inline-block',
              minWidth: '65px',
              cursor: 'pointer',
            }}
            role="none"
            onClick={() => {
              to(LINK_URL.workListIssue, {
                params: {
                  paramType: 'sprint',
                  paramId: record.sprintId,
                  paramName: `${sprintName}下的问题`,
                },
              });
            }}
          >
            {sprintName}
          </span>
        ),
      },
      {
        width: '33%',
        title: `预估${unit && unit}`,
        dataIndex: 'committedRemainTime',
        render: (committedRemainTime, record) => (
          <span style={{
            display: 'inline-block',
            minWidth: '100px',
          }}
          >
            {/* {this.transformRemainTime(committedRemainTime)} */}
            {this.getTableValue(record, 'committed')}
          </span>
        ),
      },
      {
        width: '33%',
        title: `已完成${unit && unit}`,
        dataIndex: 'completedRemainTime',
        render: (completedRemainTime, record) => (
          <span style={{
            display: 'inline-block',
            minWidth: '25px',
          }}
          >
            {/* {this.transformRemainTime(completedRemainTime)} */}
            {this.getTableValue(record, 'completed')}
          </span>
        ),
      },
    ];
    return (
      <Table
        rowKey={(record) => record.sprintId}
        dataSource={VS.chartData}
        columns={column}
        filterBar={false}
        pagination={false}
        scroll={{ x: true }}
        loading={VS.tableLoading}
      />
    );
  }

  render() {
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-velocity" service={['choerodon.code.project.operation.chart.ps.choerodon.code.project.operation.chart.ps.velocity_chart']}>
        <Header
          title="迭代速度图"
          backPath={linkUrl(LINK_URL.report)}
        >
          <SwithChart current="velocityChart" />
          <Button funcType="flat" onClick={() => this.refresh()}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Breadcrumb title="迭代速度图" />
        <Content>
          {!(!VS.chartLoading && !VS.getChartDataX.length) ? (
            <div>
              <Select
                style={{ width: 512 }}
                label="单位选择"
                value={VS.currentUnit}
                onChange={(unit) => this.handleChangeCurrentUnit(unit)}
              >
                <Option key="story_point" value="story_point">
                  故事点
                </Option>
                <Option key="issue_count" value="issue_count">
                  问题计数
                </Option>
                <Option key="remain_time" value="remain_time">
                  剩余时间
                </Option>
              </Select>
              <Spin spinning={VS.chartLoading}>
                <ReactEcharts
                  className="c7n-chart"
                  option={this.getOption()}
                />
              </Spin>
              {this.renderTable()}
            </div>
          ) : (
            <EmptyBlock
              style={{ marginTop: 40 }}
              textWidth="auto"
              pic={pic}
              title="当前项目无可用冲刺"
              des={(
                <div>
                  <span>请在</span>
                  <span
                    className="primary"
                    style={{ margin: '0 5px', cursor: 'pointer' }}
                    role="none"
                    onClick={() => {
                      to(LINK_URL.workListBacklog);
                    }}
                  >
                    待办事项
                  </span>
                  <span>中创建一个冲刺</span>
                </div>
                )}
            />
          )}
        </Content>
      </Page>
    );
  }
}

export default VelocityChart;
