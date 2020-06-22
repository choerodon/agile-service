package io.choerodon.agile.api.vo;

import io.choerodon.agile.infra.constants.EncryptionConstant;
import io.choerodon.agile.infra.utils.StringUtil;
import io.swagger.annotations.ApiModelProperty;
import org.hzero.starter.keyencrypt.core.Encrypt;

/**
 * @author dinghuang123@gmail.com
 * @since 2018/7/5
 */
public class IssueTransformSubTask {

    @ApiModelProperty(value = "问题主键id")
    @Encrypt/*(EncryptionConstant.AGILE_ISSUE)*/
    private Long issueId;

    @ApiModelProperty(value = "父任务id")
    @Encrypt/*(EncryptionConstant.AGILE_ISSUE)*/
    private Long parentIssueId;

    @ApiModelProperty(value = "状态id")
    @Encrypt/*(EncryptionConstant.FD_STATUS)*/
    private Long statusId;

    @ApiModelProperty(value = "版本号")
    private Long objectVersionNumber;

    @ApiModelProperty(value = "问题类型id")
    @Encrypt/*(EncryptionConstant.FD_ISSUE_TYPE)*/
    private Long issueTypeId;

    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public Long getParentIssueId() {
        return parentIssueId;
    }

    public void setParentIssueId(Long parentIssueId) {
        this.parentIssueId = parentIssueId;
    }

    public Long getStatusId() {
        return statusId;
    }

    public void setStatusId(Long statusId) {
        this.statusId = statusId;
    }

    public Long getObjectVersionNumber() {
        return objectVersionNumber;
    }

    public void setObjectVersionNumber(Long objectVersionNumber) {
        this.objectVersionNumber = objectVersionNumber;
    }

    public Long getIssueTypeId() {
        return issueTypeId;
    }

    public void setIssueTypeId(Long issueTypeId) {
        this.issueTypeId = issueTypeId;
    }

    @Override
    public String toString() {
        return StringUtil.getToString(this);
    }
}
