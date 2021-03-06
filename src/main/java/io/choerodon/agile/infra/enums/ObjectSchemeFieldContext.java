package io.choerodon.agile.infra.enums;

import io.choerodon.agile.app.service.AgilePluginService;
import io.choerodon.agile.app.service.BacklogExpandService;
import io.choerodon.agile.infra.utils.SpringBeanUtil;
import io.choerodon.core.exception.CommonException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author shinan.chen
 * @since 2019/3/29
 */
public class ObjectSchemeFieldContext {
    private ObjectSchemeFieldContext() {
    }

    public static final String GLOBAL = "global";

    public static final String STORY = "story";

    public static final String EPIC = "issue_epic";

    public static final String BUG = "bug";

    public static final String TASK = "task";

    public static final String SUB_TASK = "sub_task";

    public static final String FEATURE = "feature";

    public static final String BACKLOG = "backlog";

    public static final String[] ISSUE_TYPES = {STORY, EPIC, BUG, TASK, SUB_TASK};

    public static final String[] FIX_DATA_ISSUE_TYPES = {STORY, EPIC, BUG, TASK, SUB_TASK};

    public static final List<String> ISSUE_TYPES_LIST = Arrays.asList(ISSUE_TYPES);

    public static final List<String> NORMAL_PROJECT = Arrays.asList(STORY, EPIC, BUG, TASK, SUB_TASK);

    public static void isIllegalContexts(String[] context) {
        for (String str : context) {
            if (!getIssueTye().contains(str)) {
                throw new CommonException("error.context.illegal");
            }
        }
    }

    public static List<String> getIssueTye(){
        List<String> list = new ArrayList<>(Arrays.asList(ISSUE_TYPES));
        AgilePluginService agilePluginService = SpringBeanUtil.getExpandBean(AgilePluginService.class);
        if (agilePluginService != null) {
            list.add(FEATURE);
        }
        BacklogExpandService backlogExpandService = SpringBeanUtil.getExpandBean(BacklogExpandService.class);
        if (backlogExpandService != null) {
            list.add(BACKLOG);
        }
        return list;
    }

    public static List<String> fixDataIssueType(){
        List<String> list = new ArrayList<>(Arrays.asList(FIX_DATA_ISSUE_TYPES));
        AgilePluginService agilePluginService = SpringBeanUtil.getExpandBean(AgilePluginService.class);
        if (agilePluginService != null) {
            list.add(FEATURE);
        }
        return list;
    }

    public static void isIllegalIssueTypes(String[] context) {
        for (String str : context) {
            if (!getIssueTye().contains(str)) {
                throw new CommonException("error.context.illegal");
            }
        }
    }

    public static void isIllegalIssueType(String issueType) {
        if (!getIssueTye().contains(issueType)) {
            throw new CommonException("error.issue.type.illegal");
        }
    }

    public static boolean isGlobal(String[] context) {
        for (String str : context) {
            if (GLOBAL.equals(str)) {
                return true;
            }
        }
        return false;
    }
}
