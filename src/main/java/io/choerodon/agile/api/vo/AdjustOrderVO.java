package io.choerodon.agile.api.vo;

import io.choerodon.agile.infra.constants.EncryptionConstant;
import io.swagger.annotations.ApiModelProperty;
import org.hzero.starter.keyencrypt.core.Encrypt;

/**
 * @author shinan.chen
 * @since 2019/4/2
 */
public class AdjustOrderVO {
    @ApiModelProperty(value = "是否拖动到第一个")
    private Boolean before;
    @ApiModelProperty(value = "当前移动的字段id")
    @Encrypt/*(EncryptionConstant.FD_OBJECT_SCHEME_FIELD)*/
    private Long currentFieldId;
    @ApiModelProperty(value = "before：true，在当前移动的值之后，false，在当前移动的值之前")
    @Encrypt/*(EncryptionConstant.FD_OBJECT_SCHEME_FIELD)*/
    private Long outsetFieldId;

    public Boolean getBefore() {
        return before;
    }

    public void setBefore(Boolean before) {
        this.before = before;
    }

    public Long getCurrentFieldId() {
        return currentFieldId;
    }

    public void setCurrentFieldId(Long currentFieldId) {
        this.currentFieldId = currentFieldId;
    }

    public Long getOutsetFieldId() {
        return outsetFieldId;
    }

    public void setOutsetFieldId(Long outsetFieldId) {
        this.outsetFieldId = outsetFieldId;
    }
}
