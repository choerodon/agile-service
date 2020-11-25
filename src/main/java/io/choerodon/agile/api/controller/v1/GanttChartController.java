package io.choerodon.agile.api.controller.v1;

import io.choerodon.agile.api.vo.GanttChartVO;
import io.choerodon.agile.api.vo.SearchVO;
import io.choerodon.agile.app.service.GanttChartService;
import io.choerodon.agile.infra.utils.EncryptionUtils;
import io.choerodon.core.iam.ResourceLevel;
import io.choerodon.mybatis.pagehelper.annotation.SortDefault;
import io.choerodon.mybatis.pagehelper.domain.PageRequest;
import io.choerodon.mybatis.pagehelper.domain.Sort;
import io.choerodon.swagger.annotation.Permission;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.util.List;

/**
 * @author superlee
 * @since 2020-11-24
 */
@RestController
@RequestMapping(value = "/v1/projects/{project_id}/gantt")
public class GanttChartController {

    @Autowired
    private GanttChartService ganttChartService;

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation("查询甘特图列表数据")
    @PostMapping(value = "/list")
    public ResponseEntity<List<GanttChartVO>> list(@ApiIgnore
                                                   @ApiParam(value = "分页信息", required = true)
                                                   @SortDefault(value = "issueId", direction = Sort.Direction.DESC)
                                                           PageRequest pageRequest,
                                                   @ApiParam(value = "项目id", required = true)
                                                   @PathVariable(name = "project_id") Long projectId,
                                                   @ApiParam(value = "查询参数", required = true)
                                                   @RequestBody(required = false) SearchVO searchVO) {
        EncryptionUtils.decryptSearchVO(searchVO);
        return ResponseEntity.ok(ganttChartService.list(projectId, searchVO));
    }
}
