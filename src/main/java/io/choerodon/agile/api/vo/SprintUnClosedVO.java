package io.choerodon.agile.api.vo;

import io.choerodon.agile.infra.constants.EncryptionConstant;
import io.swagger.annotations.ApiModelProperty;
import org.hzero.starter.keyencrypt.core.Encrypt;

/**
 * Created by HuangFuqiang@choerodon.io on 2018/8/23.
 * Email: fuqianghuang01@gmail.com
 */
public class SprintUnClosedVO {

    @ApiModelProperty(value = "冲刺id")
    @Encrypt/*(EncryptionConstant.AGILE_SPRINT)*/
    private Long sprintId;

    @ApiModelProperty(value = "冲刺名称")
    private String sprintName;

    public Long getSprintId() {
        return sprintId;
    }

    public void setSprintId(Long sprintId) {
        this.sprintId = sprintId;
    }

    public String getSprintName() {
        return sprintName;
    }

    public void setSprintName(String sprintName) {
        this.sprintName = sprintName;
    }
}
