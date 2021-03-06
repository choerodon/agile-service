package io.choerodon.agile.infra.feign.fallback;

import io.choerodon.agile.infra.feign.DevopsFeignClient;
import io.choerodon.core.exception.CommonException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * @author superlee
 * @since 2021-03-12
 */
@Component
public class DevopsFeignClientFallback implements DevopsFeignClient {
    @Override
    public ResponseEntity<String> listAppService(Long projectId, int page, int size, boolean checkMember) {
        throw new CommonException("error.devops.listAppService");
    }
}
