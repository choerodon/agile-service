package io.choerodon.agile.app.service;

import io.choerodon.agile.api.vo.FieldTableVO;
import io.choerodon.agile.api.vo.PageConfigFieldEditedVO;
import io.choerodon.agile.infra.dto.ObjectSchemeFieldDTO;
import io.choerodon.agile.infra.dto.StarBeaconDTO;
import org.apache.commons.collections.map.MultiKeyMap;

import java.util.List;
import java.util.Map;

/**
 * @author zhaotianxin
 * @date 2020-09-22 16:27
 */
public interface BacklogExpandService {
    /**
     * 删除issue和backlog的关联关系
      * @param issueId
     */
   void deleteIssueBacklogRel(Long issueId);

    /**
     * 自动变更backlog的状态
     * @param issueId
     * @param projectId
     * @param organizationId
     */
   void changeDetection(Long issueId,Long projectId,Long organizationId);

    /**
     * 是否启用需求池
     * @param projectId
     * @return
     */
   Boolean enabled(Long projectId);

    /**
     * 查询需求的页面字段
     * @param issueType
     * @return
     */
   Map<String, PageConfigFieldEditedVO> fieldEdited(String issueType);

    /**
     * 返回需求的context
     * @param code
     * @return
     */
   String getSystemFieldContext(String code);

    /**
     * 处理需求的字段
     * @param editPageId
     * @param dataMap
     * @param rankMap
     * @param fields
     */
    void processBacklogFields(Long editPageId, MultiKeyMap dataMap, MultiKeyMap rankMap, List<ObjectSchemeFieldDTO> fields);

    /**
     * 初始化需求的maxNum
     * @param projectId
     * @param maxNum
     */
    void initBacklogMaxNum(Long projectId, Long maxNum);

    /**
     * 获取需求字段与表名的映射
     * @return list
     */
    List<FieldTableVO> getBacklogField();

    /**
     * 判断需求是否存在
     * @param starBeaconDTO
     */
    void selectBacklogByStar(StarBeaconDTO starBeaconDTO);

    /**
     * 删除项目群版本和需求的关联关系
     * @param programId
     * @param organizationId
     * @param programVersionId
     * @param targetProgramVersion
     */
    void deleteVersionBacklogRelByProgramVersionId(Long programId,Long organizationId,Long programVersionId, Long targetProgramVersion);

    /**
     * 发布项目群版本时,将关联的需求置为已发布
     * @param programId
     * @param organizationId
     * @param programVersionId
     */
    void releaseProgramVersion(Long programId,Long organizationId,Long programVersionId);
}
