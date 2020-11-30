package io.choerodon.agile.app.service.impl;

import io.choerodon.agile.api.vo.*;
import io.choerodon.agile.app.assembler.BoardAssembler;
import io.choerodon.agile.app.service.*;
import io.choerodon.agile.infra.dto.UserMessageDTO;
import io.choerodon.agile.infra.dto.business.IssueDTO;
import io.choerodon.agile.infra.mapper.IssueMapper;
import io.choerodon.agile.infra.utils.ConvertUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author superlee
 * @since 2020-11-24
 */
@Service
public class GanttChartServiceImpl implements GanttChartService {

    @Autowired
    private IssueService issueService;
    @Autowired
    private BoardAssembler boardAssembler;
    @Autowired
    private IssueMapper issueMapper;
    @Autowired
    private IssueTypeService issueTypeService;
    @Autowired
    private UserService userService;
    @Autowired
    private StatusService statusService;

    @Override
    public List<GanttChartVO> listByTask(Long projectId, SearchVO searchVO) {
        Boolean condition = issueService.handleSearchUser(searchVO, projectId);
        if (condition) {
            String filterSql;
            List<Long> quickFilterIds = searchVO.getQuickFilterIds();
            if (!ObjectUtils.isEmpty(quickFilterIds)) {
                filterSql = issueService.getQuickFilter(quickFilterIds);
            } else {
                filterSql = null;
            }
            boardAssembler.handleOtherArgs(searchVO);
//            Map<String, String> order = new HashMap<>(1);
//            order.put("issueId", "issue_issue_id");
//            String orderStr = PageableHelper.getSortSql(PageUtil.sortResetOrder(sort, null, order));
            List<IssueDTO> issues = issueMapper.queryIssueIdsListWithSub(projectId, searchVO, filterSql, searchVO.getAssigneeFilterIds(), null);
            List<Long> issueIds = issues.stream().map(IssueDTO::getIssueId).collect(Collectors.toList());
            if (!ObjectUtils.isEmpty(issueIds)) {
                Set<Long> childrenIds = issueMapper.queryChildrenIdByParentId(issueIds, projectId, searchVO, filterSql, searchVO.getAssigneeFilterIds());
                List<IssueDTO> issueDTOList = issueMapper.queryIssueListWithSubByIssueIds(issueIds, childrenIds, false);
                List<GanttChartVO> result = buildFromIssueDto(issueDTOList, projectId);
                return result;
            } else {
                return new ArrayList<>();
            }
        } else {
            return new ArrayList<>();
        }
    }

    @Override
    public List<GanttChartTreeVO> listByUser(Long projectId, SearchVO searchVO) {
        List<GanttChartVO> ganttChartList = listByTask(projectId, searchVO);
        List<GanttChartVO> unassigned = new ArrayList<>();
        Map<String, List<GanttChartVO>> map = new HashMap<>();
        ganttChartList.forEach(g -> {
            UserMessageDTO user = g.getAssignee();
            if (ObjectUtils.isEmpty(user)) {
                unassigned.add(g);
            } else {
                String name = user.getName();
                List<GanttChartVO> ganttCharts = map.get(name);
                if (ganttCharts == null) {
                    ganttCharts = new ArrayList<>();
                    map.put(name, ganttCharts);
                }
                ganttCharts.add(g);
            }
        });
        List<GanttChartTreeVO> result = new ArrayList<>();
        map.forEach((k, v) -> {
            GanttChartTreeVO ganttChartTreeVO = new GanttChartTreeVO();
            ganttChartTreeVO.setSummary(k);
            ganttChartTreeVO.setGroup(true);
            ganttChartTreeVO.setChildren(toTree(v));
            result.add(ganttChartTreeVO);
        });
        GanttChartTreeVO unassignedVO = new GanttChartTreeVO();
        unassignedVO.setSummary("未分配");
        unassignedVO.setGroup(true);
        unassignedVO.setChildren(toTree(unassigned));
        result.add(unassignedVO);
        return result;
    }

    private List<GanttChartVO> toTree(List<GanttChartVO> ganttChartList) {
        List<GanttChartVO> result = new ArrayList<>();
        Map<Long, GanttChartVO> map = new HashMap<>();
        List<GanttChartVO> rootNodes = new ArrayList<>();
        ganttChartList.forEach(g -> map.put(g.getIssueId(), g));
        ganttChartList.forEach(g -> {
            Long parentId = g.getParentId();
            if (parentId == null
                    || map.get(parentId) == null) {
                rootNodes.add(g);
            } else {
                GanttChartVO parent = map.get(parentId);
                List<GanttChartVO> children = parent.getChildren();
                if (children == null) {
                    children = new ArrayList<>();
                    parent.setChildren(children);
                }
                children.add(g);
            }
        });
        result.addAll(rootNodes);
        return result;
    }

    private List<GanttChartVO> buildFromIssueDto(List<IssueDTO> issueList, Long projectId) {
        Long organizationId = ConvertUtil.getOrganizationId(projectId);
        Map<Long, IssueTypeVO> issueTypeDTOMap = issueTypeService.listIssueTypeMap(organizationId);
        Map<Long, StatusVO> statusMap = statusService.queryAllStatusMap(organizationId);
        Set<Long> userIds = new HashSet<>();
        for (IssueDTO dto : issueList) {
            if (!ObjectUtils.isEmpty(dto.getReporterId()) && !Objects.equals(0L, dto.getReporterId())) {
                userIds.add(dto.getReporterId());
            }
            if (!ObjectUtils.isEmpty(dto.getAssigneeId()) && !Objects.equals(0L, dto.getAssigneeId())) {
                userIds.add(dto.getAssigneeId());
            }
        }
        Map<Long, UserMessageDTO> usersMap = userService.queryUsersMap(new ArrayList<>(userIds), true);
        List<GanttChartVO> result = new ArrayList<>(issueList.size());
        issueList.forEach(i -> {
            GanttChartVO ganttChart = new GanttChartVO();
            result.add(ganttChart);
            BeanUtils.copyProperties(i, ganttChart);
            ganttChart.setIssueTypeVO(issueTypeDTOMap.get(i.getIssueTypeId()));
            ganttChart.setStatusVO(statusMap.get(i.getStatusId()));
            Long assigneeId = i.getAssigneeId();
            if (!ObjectUtils.isEmpty(assigneeId)) {
                UserMessageDTO assignee = usersMap.get(assigneeId);
                if (!ObjectUtils.isEmpty(assignee)) {
                    ganttChart.setAssignee(assignee);
                }
            }
            setParentId(ganttChart, i);
        });
        return result;
    }

    private void setParentId(GanttChartVO ganttChartVO, IssueDTO dto) {
        Long relateIssueId = dto.getRelateIssueId();
        Long parentIssueId = dto.getParentIssueId();
        if (!ObjectUtils.isEmpty(relateIssueId) && !Objects.equals(0L, relateIssueId)) {
            ganttChartVO.setParentId(relateIssueId);
            return;
        }
        if (!ObjectUtils.isEmpty(parentIssueId) && !Objects.equals(0L, parentIssueId)) {
            ganttChartVO.setParentId(parentIssueId);
        }
    }
}