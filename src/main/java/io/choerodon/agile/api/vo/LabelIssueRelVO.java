package io.choerodon.agile.api.vo;


import io.choerodon.agile.infra.constants.EncryptionConstant;
import io.choerodon.agile.infra.utils.StringUtil;
import io.swagger.annotations.ApiModelProperty;
import org.hzero.starter.keyencrypt.core.Encrypt;

import java.io.Serializable;

/**
 * 敏捷开发Issue标签关联
 *
 * @author dinghuang123@gmail.com
 * @since 2018-05-14 21:31:22
 */
public class LabelIssueRelVO implements Serializable {

    @ApiModelProperty(value = "问题主键id")
    @Encrypt/*(EncryptionConstant.AGILE_ISSUE)*/
    private Long issueId;

    @ApiModelProperty(value = "标签id")
    @Encrypt/*(EncryptionConstant.AGILE_ISSUE_LABEL)*/
    private Long labelId;

    @ApiModelProperty(value = "版本号")
    private Long objectVersionNumber;

    @ApiModelProperty(value = "标签名称")
    private String labelName;

    @ApiModelProperty(value = "项目id")
    private Long projectId;

    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public Long getLabelId() {
        return labelId;
    }

    public void setLabelId(Long labelId) {
        this.labelId = labelId;
    }

    public Long getObjectVersionNumber() {
        return objectVersionNumber;
    }

    public void setObjectVersionNumber(Long objectVersionNumber) {
        this.objectVersionNumber = objectVersionNumber;
    }

    public String getLabelName() {
        return labelName;
    }

    public void setLabelName(String labelName) {
        this.labelName = labelName;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    @Override
    public String toString() {
        return StringUtil.getToString(this);
    }

}