import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Page, Header, Content, stores, Breadcrumb, Choerodon, Permission,
} from '@choerodon/boot';
import {
  Button, Select, Spin, Icon, Modal, Form, Tooltip,
} from 'choerodon-ui';
import Loading from '@/components/Loading';
import { set } from 'lodash';
import { Modal as ModalPro } from 'choerodon-ui/pro';
import CloseSprint from '@/components/close-sprint';
import {
  sprintApi, issueApi, epicApi, issueTypeApi, statusApi, boardApi,
} from '@/api';
import LINK_URL from '@/constants/LINK_URL';
import to from '@/utils/to';
import { localPageCacheStore } from '@/stores/common/LocalPageCacheStore';
import FilterManage from '@/components/FilterManage';
import ScrumBoardDataController from './ScrumBoardDataController';
import ScrumBoardStore from '../../../stores/project/scrumBoard/ScrumBoardStore';
import StatusColumn from '../ScrumBoardComponent/StatusColumn/StatusColumn';
import './ScrumBoardHome.less';
import IssueDetail from '../ScrumBoardComponent/IssueDetail/IssueDetail';
import NoneSprint from '../ScrumBoardComponent/NoneSprint/NoneSprint';
import '../ScrumBoardComponent/RenderSwimLaneContext/RenderSwimLaneContext.less';
import SwimLane from '../ScrumBoardComponent/RenderSwimLaneContext/SwimLane';
import CSSBlackMagic from '../../../components/CSSBlackMagic/CSSBlackMagic';
import HeaderLine from '../../../components/HeaderLine';
import ScrumBoardFullScreen from '../ScrumBoardComponent/ScrumBoardFullScreen';
import CreateBoard from '../ScrumBoardComponent/CreateBoard';
import CreateIssue from '../ScrumBoardComponent/create-issue';
import ExpandAllButton from '../ScrumBoardComponent/expand-all-button';
import BoardSearch from '../ScrumBoardComponent/board-search';

const { Option } = Select;
const { AppState } = stores;

const style = (swimLaneId) => `
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn {
    background-color: rgba(140, 158, 255, 0.12) !important;
  }
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn > .c7n-swimlaneContext-itemBodyStatus >  .c7n-swimlaneContext-itemBodyStatus-container {
    border-width: 2px;
    border-style: dashed;
    border-color: #26348b;
  }
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn > .c7n-swimlaneContext-itemBodyStatus > .c7n-swimlaneContext-itemBodyStatus-container > .c7n-swimlaneContext-itemBodyStatus-container-statusName {
      visibility: visible !important;
  } 
`;

@Form.create()
@CSSBlackMagic
@inject('AppState', 'HeaderStore')
@observer
class ScrumBoardHome extends Component {
  constructor(props) {
    super(props);
    this.dataConverter = new ScrumBoardDataController();
    this.ref = null;
    this.issueSearchStore = null;
    this.state = {
      updateParentStatus: null,
    };
  }

  componentDidMount() {
    ScrumBoardStore.setSelectedBoardId('');
    const defaultSearchVO = localPageCacheStore.getItem('scrumBoard.searchVO') || {};
    ScrumBoardStore.bindFunction('refresh', (sprintId) => {
      if (!defaultSearchVO.otherArgs || !defaultSearchVO.otherArgs.sprint || defaultSearchVO.otherArgs.sprint.length === 0) {
        // defaultSearchVO.otherArgs.sprint = [sprintId];
        sprintId && set(defaultSearchVO, 'otherArgs.sprint', [sprintId]);
      }
      ScrumBoardStore.setSearchVO(defaultSearchVO);
      this.getBoard(!sprintId);
    });
    // eslint-disable-next-line react/destructuring-assignment
    const { state } = this.props.location;
    if (state && state.issueId) {
      ScrumBoardStore.setClickedIssue(state.issueId);
    }
  }

  componentWillUnmount() {
    this.dataConverter = null;
    ScrumBoardStore.resetDataBeforeUnmount();
  }

  getBoard = async (noRefresh) => {
    const { location } = this.props;
    const url = this.paramConverter(location.search);
    const boardListData = await boardApi.loadAll();
    const statusLinkages = await boardApi.getStatusLinkages();
    ScrumBoardStore.initBoardList(boardListData);
    ScrumBoardStore.setStatusLinkages(statusLinkages);
    const defaultBoard = boardListData.find((item) => item.userDefault) || boardListData[0];
    if (defaultBoard.boardId) {
      ScrumBoardStore.setSelectedBoardId(defaultBoard.boardId);
      noRefresh ? ScrumBoardStore.setSpinIf(false) : this.refresh(defaultBoard, url, boardListData);
    }
  }

  paramConverter = (url) => {
    const reg = /[^?&]([^=&#]+)=([^&#]*)/g;
    const retObj = {};
    url.match(reg).forEach((item) => {
      const [tempKey, paramValue] = item.split('=');
      const paramKey = tempKey[0] !== '&' ? tempKey : tempKey.substring(1);
      Object.assign(retObj, {
        [paramKey]: paramValue,
      });
    });
    return retObj;
  };

  handleClearFilter = () => {
    ScrumBoardStore.clearFilter();
    localPageCacheStore.remove('scrumboard');
    this.refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
  }

  /**
   *完成冲刺
   *
   * @memberof ScrumBoardHome
   */
  handleFinishSprint = async () => {
    const sprintId = ScrumBoardStore.getSprintId;
    const completeMessage = await sprintApi.loadSprintAndCountIssue(sprintId);
    const sprintInfo = completeMessage.sprintNames[0];
    const defaultValuePrompt = undefined; // (sprintId) ? `提示：冲刺${sprintInfo.sprintName}是默认选项，完成后冲刺字段默认值将清空` : undefined;
    CloseSprint({
      completeMessage,
      defaultValuePrompt,
      sprintId,
      afterClose: async () => {
        const axiosGetSprintNotClosed = sprintApi.loadSprints(['sprint_planning', 'started']);
        await axiosGetSprintNotClosed.then((res) => {
          ScrumBoardStore.setSprintNotClosedArray(res);
          ScrumBoardStore.setSelectSprint(undefined);
          ScrumBoardStore.resetCurrentSprintExist();
          this.onSprintChange(undefined);
        });
        this.refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
      },
    });
  };

  changeState = (name, value) => {
    if (name === 'judgeUpdateParent') {
      statusApi.loadTransformStatusByIssue(value.statusId, value.id, value.typeId).then((types) => {
        this.matchStatus(types);
        this.setState({
          [name]: value,
        });
      }).catch(() => {
        Choerodon.prompt('查询状态失败，请重试！');
      });
    }
  };

  onDragStart = (result) => {
    const { headerStyle } = this.props;
    const { draggableId } = result;
    const [SwimLaneId, issueId] = draggableId.split(['/']);
    headerStyle.changeStyle(style(SwimLaneId.replace(/[^\w]/g, '')));
    ScrumBoardStore.setIsDragging(SwimLaneId, true);
  };

  onDragEnd = (result) => {
    const { headerStyle } = this.props;
    const { destination, source, draggableId } = result;
    const [SwimLaneId, issueId] = draggableId.split(['/']);
    const allDataMap = ScrumBoardStore.getAllDataMap;
    ScrumBoardStore.resetCanDragOn();
    ScrumBoardStore.setIsDragging(SwimLaneId, false);
    headerStyle.unMountStyle();
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const [startStatus, startColumn] = source.droppableId.split(['/']);
    const startStatusIndex = source.index;

    const [destinationStatus, destinationColumn] = destination.droppableId.split(['/']);
    const destinationStatusIndex = destination.index;

    const issue = {
      ...allDataMap.get(issueId),
      stayDay: 0,
    };
    const [type, parentId] = SwimLaneId.split('%');

    ScrumBoardStore.updateIssue(issue,
      startStatus,
      startStatusIndex, destinationStatus,
      destinationStatusIndex,
      SwimLaneId).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
        ScrumBoardStore.setSwimLaneData(SwimLaneId,
          startStatus,
          startStatusIndex,
          SwimLaneId, destinationStatus,
          destinationStatusIndex, issue, true);
      } else {
        if (ScrumBoardStore.getSwimLaneCode === 'parent_child' && parentId !== 'other') {
          ScrumBoardStore.judgeMoveParentToDone(destinationStatus, SwimLaneId, parentId, ScrumBoardStore.getStatusMap.get(destinationStatus).categoryCode === 'done');
        }
        if (data.issueId === ScrumBoardStore.getCurrentClickId) {
          ScrumBoardStore.editRef.current.loadIssueDetail();
        }
        if (startColumn !== destinationColumn) {
          ScrumBoardStore.resetHeaderData(startColumn,
            destinationColumn,
            issue.issueTypeVO.typeCode);
        }
        ScrumBoardStore.rewriteObjNumber(data, issueId, issue);
        // ScrumBoardStore.resetHeaderData(startColumn,destinationColumn)
        if (ScrumBoardStore.needRefresh(issue, destinationStatus)) {
          this.refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
        }
      }
    });
    ScrumBoardStore.setSwimLaneData(SwimLaneId, startStatus, startStatusIndex,
      SwimLaneId, destinationStatus, destinationStatusIndex, issue, false);
  };

  handleCreateBoardClick = () => {
    ModalPro.open({
      title: '创建看板',
      drawer: true,
      style: {
        width: 380,
      },
      children: <CreateBoard onCreate={this.getBoard} />,
    });
    // 关掉下拉框
    this.SelectBoard.rcSelect.setOpenState(false);
  }

  renderRemainDate = () => (
    <>
      <Icon type="av_timer" style={{ color: 'rgba(0,0,0,0.6)', marginLeft: 10 }} />
      <span style={{
        paddingLeft: 5,
        marginLeft: 0,
        marginRight: 10,
        color: 'rgba(0,0,0,0.6)',
      }}
      >
        {`${ScrumBoardStore.getDayRemain >= 0 ? `${ScrumBoardStore.getDayRemain} days剩余` : '无剩余时间'}`}
      </span>
    </>
  )

  refresh = (defaultBoard, url, boardListData) => {
    ScrumBoardStore.setSpinIf(true);
    Promise.all([issueTypeApi.loadAllWithStateMachineId(),
      statusApi.loadAllTransformForAllIssueType(defaultBoard.boardId),
      ScrumBoardStore.axiosGetBoardData(defaultBoard.boardId),
      epicApi.loadEpics()]).then(([issueTypes, stateMachineMap, defaultBoardData, epicData]) => {
      this.dataConverter.setSourceData(epicData, defaultBoardData);
      const renderDataMap = new Map([
        ['parent_child', this.dataConverter.getParentWithSubData],
        ['swimlane_epic', this.dataConverter.getEpicData],
        ['assignee', this.dataConverter.getAssigneeData],
        ['swimlane_none', this.dataConverter.getAllData],
        ['undefined', this.dataConverter.getAssigneeData],
      ]);
      const renderData = renderDataMap.get(defaultBoard.userDefaultBoard)();
      const canDragOn = this.dataConverter.getCanDragOn();
      const statusColumnMap = this.dataConverter.getStatusColumnMap();
      const statusMap = this.dataConverter.getStatusMap();
      const mapStructure = this.dataConverter.getMapStructure();
      const allDataMap = this.dataConverter.getAllDataMap(defaultBoard.userDefaultBoard);
      const headerData = this.dataConverter.getHeaderData();
      ScrumBoardStore.scrumBoardInit(
        AppState,
        url,
        boardListData, defaultBoard, defaultBoardData, null,
        issueTypes, stateMachineMap, canDragOn,
        statusColumnMap, allDataMap, mapStructure, statusMap,
        renderData, headerData,
      );
    });
  }

  handleFilterChange = () => {
    this.refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
  }

  handleCreateIssue = () => {
    ScrumBoardStore.setCreateIssueVisible(true);
  };

  handleSaveSearchStore = (data) => {
    this.issueSearchStore = data;
  }

  handleClickFilterManage = () => {
    const filterManageVisible = ScrumBoardStore.getFilterManageVisible;
    ScrumBoardStore.setFilterManageVisible(!filterManageVisible);
  };

  render() {
    const {
      updateParentStatus,
    } = this.state;
    const currentSprintIsDoing = ScrumBoardStore.didCurrentSprintExist && ScrumBoardStore.sprintNotClosedArray.find((item) => item.statusCode === 'started' && item.sprintId === ScrumBoardStore.sprintId);
    return (
      <Page
        className="c7n-scrumboard-page"
      >
        <Header title="活跃冲刺">
          <Select
            ref={(SelectBoard) => { this.SelectBoard = SelectBoard; }}
            className="SelectTheme  autoWidth"
            value={ScrumBoardStore.getSelectedBoard}
            style={{
              marginRight: 15, fontWeight: 500, lineHeight: '28px',
            }}
            dropdownClassName="c7n-scrumboard-page-select-board-dropdown"
            dropdownStyle={{
              width: 200,
            }}
            onChange={(value) => {
              const selectedBoard = ScrumBoardStore.getBoardList.get(value);
              ScrumBoardStore.setSelectedBoard(value);
              ScrumBoardStore.setSwimLaneCode(selectedBoard.userDefaultBoard);
              this.refresh(selectedBoard);
            }}
            footer={(
              <Permission
                service={['choerodon.code.project.cooperation.iteration-plan.ps.board.create']}
              >
                <Button style={{ width: '100%', height: 42, textAlign: 'left' }} onClick={this.handleCreateBoardClick}>创建看板</Button>
              </Permission>
            )}
          >

            {// ScrumBoardStore.getSpinIf
              [...ScrumBoardStore.getBoardList.values()].map((item) => (
                <Option key={item.boardId} value={item.boardId}>
                  <Tooltip title={item.name}>
                    {item.name}
                  </Tooltip>
                </Option>
              ))
            }
          </Select>
          <HeaderLine />
          <Button onClick={this.handleCreateIssue} icon="playlist_add">创建问题</Button>
          <Button
            className="c7n-scrumboard-settingButton"
            funcType="flat"
            icon="settings"
            onClick={() => {
              to(LINK_URL.scrumboardSetting, {
                params: {
                  boardId: ScrumBoardStore.getSelectedBoard,
                },
              });
            }}
          >
            配置看板
          </Button>
          <Button onClick={this.handleClickFilterManage} icon="settings">个人筛选</Button>
          <ExpandAllButton />
          <ScrumBoardFullScreen />
          {
            currentSprintIsDoing && (
              <>
                {this.renderRemainDate()}
                <Permission
                  service={['choerodon.code.project.cooperation.iteration-plan.ps.sprint.finish']}
                >
                  <Button
                    style={{
                      marginLeft: 15,
                    }}
                    icon="alarm_on"
                    onClick={this.handleFinishSprint}
                  >
                    完成冲刺
                  </Button>
                </Permission>
              </>
            )
          }
        </Header>
        <Breadcrumb />
        <Content
          className="c7n-scrumboard-content"
          style={{
            padding: 0,
            display: 'flex',
            overflow: 'hidden',
            borderTop: '1px solid #D8D8D8',
            paddingTop: 16,
          }}
        >
          <div style={{
            flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}
          >
            <BoardSearch onRefresh={this.handleFilterChange} saveStore={this.handleSaveSearchStore} />

            <Loading loading={ScrumBoardStore.getSpinIf} />
            <div className="c7n-scrumboard">
              <div style={{ display: 'table', minWidth: '100%' }}>
                <div className="c7n-scrumboard-header">
                  <StatusColumn />
                </div>
                {this.issueSearchStore && (!ScrumBoardStore.didCurrentSprintExist
                  || ((!ScrumBoardStore.otherIssue || ScrumBoardStore.otherIssue.length === 0)
                    && (!ScrumBoardStore.interconnectedData
                      || ScrumBoardStore.interconnectedData.size === 0))) ? (
                        <NoneSprint
                          doingSprintExist={ScrumBoardStore.didCurrentSprintExist}
                          hasSetFilter={this.issueSearchStore.isHasFilter}
                          filterItems={this.issueSearchStore.currentFlatFilter}
                        />
                  )
                  : (
                    <div
                      className="c7n-scrumboard-content"
                    >
                      <div className="c7n-scrumboard-container">
                        <SwimLane
                          mode={ScrumBoardStore.getSwimLaneCode}
                          allDataMap={this.dataConverter.getAllDataMap()}
                          mapStructure={ScrumBoardStore.getMapStructure}
                          onDragEnd={this.onDragEnd}
                          onDragStart={this.onDragStart}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <IssueDetail
              refresh={this.refresh}
            />
            <CreateIssue refresh={this.refresh} />
            {this.issueSearchStore ? (
              <FilterManage
                visible={ScrumBoardStore.getFilterManageVisible}
                setVisible={() => ScrumBoardStore.setFilterManageVisible(!ScrumBoardStore.getFilterManageVisible)}
                issueSearchStore={this.issueSearchStore}
              />
            ) : null}
          </div>
        </Content>
        {
          ScrumBoardStore.getUpdateParent ? (
            <Modal
              closable={false}
              maskClosable={false}
              title="更新父问题"
              visible={ScrumBoardStore.getUpdateParent}
              onCancel={() => {
                ScrumBoardStore.setUpdateParent(false);
              }}
              onOk={() => {
                // 后端要在后续增加的 parentIssues 上加 objVersionNumber
                const data = {
                  issueId: ScrumBoardStore.getUpdatedParentIssue.issueId,
                  objectVersionNumber: ScrumBoardStore.getUpdatedParentIssue.objectVersionNumber,
                  transformId: updateParentStatus || ScrumBoardStore.getTransformToCompleted[0].id,
                };
                issueApi.updateStatus(data.transformId, data.issueId,
                  data.objectVersionNumber).then((res) => {
                  ScrumBoardStore.setUpdateParent(false);
                  this.refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
                }).catch(() => {
                });
              }}
              disableOk={!ScrumBoardStore.getTransformToCompleted.length}
            >
              <p>
                {'任务'}
                {ScrumBoardStore.getUpdatedParentIssue?.issueNum}
                {'的全部子任务为done'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ marginRight: 20, marginBottom: 0 }}>您是否要更新父问题进行匹配</p>
                <Select
                  style={{
                    width: 250,
                  }}
                  onChange={(value) => {
                    this.setState({
                      updateParentStatus: value,
                    });
                  }}
                  defaultValue={ScrumBoardStore.getTransformToCompleted.length ? ScrumBoardStore.getTransformToCompleted[0].id : '无'}
                >
                  {
                    ScrumBoardStore.getTransformToCompleted.map((item) => (
                      <Option
                        key={item.id}
                        value={item.id}
                      >
                        {item.statusVO.name}
                      </Option>
                    ))
                  }
                </Select>
              </div>
            </Modal>
          ) : null
        }
      </Page>
    );
  }
}
export default ScrumBoardHome;
