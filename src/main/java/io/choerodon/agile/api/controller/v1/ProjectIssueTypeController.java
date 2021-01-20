package io.choerodon.agile.api.controller.v1;

import io.choerodon.agile.api.vo.IssueTypeSearchVO;
import io.choerodon.agile.api.vo.IssueTypeVO;
import io.choerodon.agile.app.service.IssueTypeService;
import io.choerodon.core.domain.Page;
import io.choerodon.core.iam.ResourceLevel;
import io.choerodon.mybatis.pagehelper.annotation.SortDefault;
import io.choerodon.mybatis.pagehelper.domain.PageRequest;
import io.choerodon.mybatis.pagehelper.domain.Sort;
import io.choerodon.swagger.annotation.Permission;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.hzero.starter.keyencrypt.core.Encrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;

/**
 * @author superlee
 * @since 2021-01-18
 */
@RestController
@RequestMapping(value = "/v1/projects/{project_id}/issue_type")
public class ProjectIssueTypeController {

    @Autowired
    private IssueTypeService issueTypeService;

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "项目层分页查询问题类型列表")
    @PostMapping("/list")
    public ResponseEntity<Page<IssueTypeVO>> queryIssueTypeList(@ApiIgnore
                                                                @SortDefault(value = "id", direction = Sort.Direction.DESC) PageRequest pageRequest,
                                                                @ApiParam(value = "项目id", required = true)
                                                                @PathVariable("project_id") Long projectId,
                                                                @RequestParam Long organizationId,
                                                                @ApiParam(value = "issueTypeSearch", required = true)
                                                                @RequestBody IssueTypeSearchVO issueTypeSearchVO) {
        return ResponseEntity.ok(issueTypeService.pagedQuery(pageRequest, organizationId, projectId, issueTypeSearchVO));
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "项目层创建问题类型")
    @PostMapping
    public ResponseEntity<IssueTypeVO> create(@PathVariable("project_id") Long projectId,
                                              @RequestParam Long organizationId,
                                              @RequestBody @Valid IssueTypeVO issueTypeVO) {
        return ResponseEntity.ok(issueTypeService.create(organizationId, projectId, issueTypeVO));
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "项目层查询问题类型详情")
    @GetMapping("/{id}")
    public ResponseEntity<IssueTypeVO> query(@ApiParam(value = "项目id", required = true)
                                             @PathVariable("project_id") Long projectId,
                                             @PathVariable("id") @Encrypt Long issueTypeId,
                                             @RequestParam Long organizationId) {
        return ResponseEntity.ok(issueTypeService.query(organizationId, projectId, issueTypeId));
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "项目层修改问题类型")
    @PutMapping(value = "/{id}")
    public ResponseEntity<IssueTypeVO> update(@PathVariable("project_id") Long projectId,
                                              @PathVariable("id") @Encrypt Long issueTypeId,
                                              @RequestParam Long organizationId,
                                              @RequestBody @Valid IssueTypeVO issueTypeVO) {
        issueTypeVO.setId(issueTypeId);
        issueTypeVO.setOrganizationId(organizationId);
        issueTypeVO.setProjectId(projectId);
        return new ResponseEntity<>(issueTypeService.update(issueTypeVO), HttpStatus.OK);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "校验问题类型名字是否未被使用")
    @GetMapping(value = "/check_name")
    public ResponseEntity<Boolean> checkName(@PathVariable("project_id") Long projectId,
                                             @RequestParam("name") String name,
                                             @RequestParam(value = "id", required = false) @Encrypt Long id,
                                             @RequestParam Long organizationId) {
        return new ResponseEntity<>(issueTypeService.checkName(organizationId, projectId, name, id), HttpStatus.OK);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "删除问题类型")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity delete(@PathVariable("project_id") Long projectId,
                                 @PathVariable("id") @Encrypt Long issueTypeId,
                                 @RequestParam Long organizationId) {
        issueTypeService.delete(organizationId, projectId, issueTypeId);
        return new ResponseEntity(HttpStatus.OK);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "校验问题类型是否可以被禁用")
    @GetMapping(value = "/{id}/can_disable")
    public ResponseEntity<Boolean> canDisable(@PathVariable("project_id") Long projectId,
                                              @PathVariable("id") @Encrypt Long issueTypeId,
                                              @RequestParam Long organizationId) {
        return new ResponseEntity<>(issueTypeService.canDisable(organizationId, projectId, issueTypeId), HttpStatus.OK);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "更新问题类型启停用")
    @GetMapping(value = "/{id}/update_enabled")
    public ResponseEntity updateEnabled(@PathVariable("project_id") Long projectId,
                                        @RequestParam Long organizationId,
                                        @PathVariable(value = "id") @Encrypt Long issueTypeId,
                                        @RequestParam Boolean enabled) {
        issueTypeService.updateEnabled(organizationId, projectId, issueTypeId, enabled);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
