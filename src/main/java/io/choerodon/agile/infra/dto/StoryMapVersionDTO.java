package io.choerodon.agile.infra.dto;

import io.choerodon.agile.infra.constants.EncryptionConstant;
import org.hzero.starter.keyencrypt.core.Encrypt;

/**
 * Created by HuangFuqiang@choerodon.io on 2019/6/6.
 * Email: fuqianghuang01@gmail.com
 */
public class StoryMapVersionDTO {

    @Encrypt/*(EncryptionConstant.FD_PRODUCT_VERSION)*/
    private Long versionId;

    private String name;

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
