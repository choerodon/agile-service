package io.choerodon.agile.api.controller.v1;

import io.choerodon.agile.api.vo.FileOperationHistoryVO;
import io.choerodon.agile.api.vo.SearchVO;
import io.choerodon.agile.app.service.ExcelService;

import io.choerodon.agile.infra.utils.EncryptionUtils;
import io.choerodon.agile.infra.utils.ExcelUtil;
import io.choerodon.core.iam.ResourceLevel;
import io.choerodon.mybatis.pagehelper.annotation.SortDefault;
import io.choerodon.mybatis.pagehelper.domain.PageRequest;
import io.choerodon.mybatis.pagehelper.domain.Sort;
import io.choerodon.swagger.annotation.Permission;
import io.choerodon.core.exception.CommonException;
import io.choerodon.core.oauth.DetailsHelper;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.hzero.starter.keyencrypt.core.Encrypt;
import org.hzero.starter.keyencrypt.core.EncryptContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Optional;

/**
 * Created by HuangFuqiang@choerodon.io on 2019/2/25.
 * Email: fuqianghuang01@gmail.com
 */
@RestController
@RequestMapping(value = "/v1/projects/{project_id}/excel")
public class ExcelController {

    @Autowired
    private ExcelService excelService;

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation("下载导入模版")
    @GetMapping(value = "/download")
    public void download(@ApiParam(value = "项目id", required = true)
                         @PathVariable(name = "project_id") Long projectId,
                             @ApiParam(value = "组织id", required = true)
                         @RequestParam Long organizationId,
                             HttpServletRequest request,
                             HttpServletResponse response) {
        excelService.download(projectId, organizationId, request, response);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation("导入issue")
    @PostMapping(value = "/import")
    public ResponseEntity batchImport(@ApiParam(value = "项目id", required = true)
                                      @PathVariable(name = "project_id") Long projectId,
                                      @ApiParam(value = "组织id", required = true)
                                      @RequestParam Long organizationId,
                                      @ApiParam(value = "导入文件", required = true)
                                      @RequestParam("file") MultipartFile file) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        excelService.batchImport(projectId, organizationId, userId, ExcelUtil.getWorkbookFromMultipartFile(ExcelUtil.Mode.XSSF, file));
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation("取消导入")
    @PutMapping(value = "/cancel")
    public ResponseEntity cancelImport(@ApiParam(value = "项目id", required = true)
                                       @PathVariable(name = "project_id") Long projectId,
                                       @ApiParam(value = "file history id", required = true)
                                       @RequestParam @Encrypt Long id,
                                       @ApiParam(value = "objectVersionNumber", required = true)
                                       @RequestParam Long objectVersionNumber) {
        excelService.cancelImport(projectId, id, objectVersionNumber);
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }

    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation("查询最近的上传/下载记录")
    @GetMapping(value = "/latest")
    public ResponseEntity<FileOperationHistoryVO> queryLatestRecode(@ApiParam(value = "项目id", required = true)
                                                                     @PathVariable(name = "project_id") Long projectId,
                                                                    @RequestParam String action) {
        return Optional.ofNullable(excelService.queryLatestRecode(projectId, action))
                .map(result -> new ResponseEntity<>(result, HttpStatus.OK))
                .orElseThrow(() -> new CommonException("error.ImportHistoryRecode.get"));
    }

    @ResponseBody
    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation("导出issue列表")
    @PostMapping(value = "/export")
    public void exportIssues(@ApiIgnore
                             @ApiParam(value = "分页信息", required = true)
                             @SortDefault(value = "issueId", direction = Sort.Direction.DESC)
                                     PageRequest pageRequest,
                             @ApiParam(value = "项目id", required = true)
                             @PathVariable(name = "project_id") Long projectId,
                             @ApiParam(value = "组织id", required = true)
                             @RequestParam Long organizationId,
                             @ApiParam(value = "查询参数", required = true)
                             @RequestBody(required = false) SearchVO searchVO,
                             HttpServletRequest request,
                             HttpServletResponse response) {
        EncryptionUtils.decryptSearchVO(searchVO);
        excelService.asyncExportIssues(projectId, searchVO, request, response, organizationId, pageRequest.getSort(), (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes());
    }

}
