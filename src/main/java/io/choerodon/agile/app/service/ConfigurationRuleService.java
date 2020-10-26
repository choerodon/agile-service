package io.choerodon.agile.app.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import io.choerodon.agile.api.vo.ConfigurationRuleVO;
import io.choerodon.core.domain.Page;
import io.choerodon.mybatis.pagehelper.domain.PageRequest;

/**
 * 服务接口
 *
 * @author jiaxu.cui@hand-china.com
 * @date 2020-09-23 09:29:15
 */
public interface ConfigurationRuleService {
    ConfigurationRuleVO create(Long projectId, ConfigurationRuleVO ConfigurationRuleVO);

    ConfigurationRuleVO update(Long projectId, Long ruleId, ConfigurationRuleVO ConfigurationRuleVO);

    void deleteById(Long projectId, Long filterId);

    ConfigurationRuleVO queryById(Long projectId, Long filterId);

    /**
     * 分页搜索过滤条件
     *
     * @param projectId projectId
     * @return ConfigurationRuleVO
     */
    Page<ConfigurationRuleVO> listByProjectId(ConfigurationRuleVO configurationRuleVO, PageRequest pageRequest);

    /**
     * 获取ruleList对应的接收人和抄送人
     * @param ruleIdList ruleIdList
     * @return map
     */
    Map<Long, ConfigurationRuleVO> selectRuleALLReceiver(List<Long> ruleIdList);
    
    void changeRuleEnabled(Long projectId, Long ruleId, boolean enabled);

    boolean checkUniqueName(Long projectId, Long ruleId, String name);

    String generateSqlQuery(ConfigurationRuleVO configurationRuleVO);

    /**
     * 筛选出检测更新字段受页面规则限制的规则
     * @param sourceList 页面规则
     * @param fieldList 更新字段
     * @param allFieldCheck 是否是全字段检测
     * @return 仅对更新字段检测的规则集合
     */
    List<ConfigurationRuleVO> processRule(List<ConfigurationRuleVO> sourceList, Set<String> fieldList, boolean allFieldCheck);
}

