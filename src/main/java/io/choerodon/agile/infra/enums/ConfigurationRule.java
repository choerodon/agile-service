package io.choerodon.agile.infra.enums;

import org.apache.commons.lang3.StringUtils;

/**
 * 页面规则 常量类
 * @author jiaxu.cui@hand-china.com 2020/9/23 下午2:36
 */
public class ConfigurationRule{
    
    public static final String TEMPLATE_LINK_TABLE_SQL = " issue_id %s ( SELECT issue_id FROM %s %s ) ";
    public static final String TEMPLATE_IN_SQL = " %s IN ( %s ) ";
    public static final String TEMPLATE_LIKE_VALUE_SQL = " '%%%s%%' ";
    public static final String TEMPLATE_SQL_WHERE = " WHERE ";
    public static final String TEMPLATE_SQL_AND = " AND ";
    public static final String TEMPLATE_CONDITION_SQL = " %s %s %s ";
    public static final String TEMPLATE_UNIX_TIMESTAMP_EXPRESS = " UNIX_TIMESTAMP(%s) ";
    public static final String TEMPLATE_TIME_FIELD_EXPRESS = " TIME(DATE_FORMAT(%s, '%%H:%%i:%%s')) ";
    public static final String TEMPLATE_TIME_VALUE_EXPRESS = " TIME(%s) ";
    public static final String TEMPLATE_NOW_EXPRESS = "NOW()";
    public static final String TEMPLATE_CUSTOM_SQL = " issue_id %s ( select ffv.instance_id from fd_field_value ffv where ffv.project_id = %s and ffv.field_id = %s %s ) ";
    
    public static boolean isSqlVar(String express){
        return StringUtils.equalsAnyIgnoreCase(express, TEMPLATE_NOW_EXPRESS);
    }
    
    
    public enum FieldTableMapping {

        component("component_id","agile_component_issue_rel"),
        fix_version("version_id","agile_version_issue_rel"),
        influence_version("version_id","agile_version_issue_rel"),
        label("label_id","agile_label_issue_rel"),
        sprint("sprint_id","agile_issue_sprint_rel"),
        issue("issue","agile_issue")
        ;

        FieldTableMapping(String field, String table) {
            this.field = field;
            this.table = table;
        }

        private String table;
        
        private String field;

        public String getTable() {
            return table;
        }

        public String getField() {
            return field;
        }

        public static FieldTableMapping matches(String name){
            for (FieldTableMapping value : FieldTableMapping.values()) {
                if (StringUtils.equals(value.name(), name)){
                    return value;
                }
            }
            return issue;
        }

        public static FieldTableMapping matchesField(String field){
            for (FieldTableMapping value : FieldTableMapping.values()) {
                if (StringUtils.equals(value.getField(), field)){
                    return value;
                }
            }
            return issue;
        }
    }

    public enum OpSqlMapping {
        in("IN"),
        not_in("NOT IN"),
        is("IS"){
            @Override
            public OpSqlMapping withField(String field) {
                if (StringUtils.equalsAny(field, "version_id", "component_id", "label_id", "sprint_id")){
                    return not_in;
                }
                return this;
            }
        },
        is_not("IS NOT"){
            @Override
            public OpSqlMapping withField(String field) {
                if (StringUtils.equalsAny(field, "version_id", "component_id", "label_id", "sprint_id")){
                    return in;
                }
                return this;
            }
        },
        eq("="),
        not_eq("!="),
        gt(">"),
        lt("<"),
        gte(">="),
        lte("<="),
        like("LIKE"),
        not_like("NOT LIKE"),
        and("AND"),
        or("OR");
        
        OpSqlMapping(String sqlOp) {
            this.sqlOp = sqlOp;
        }
        
        private String sqlOp;
        
        public String getSqlOp() {
            return sqlOp;
        }

        public OpSqlMapping withField(String field){
            return this;
        }
        
        public static boolean isCollOp(String op){
            boolean flag = false;
            if (OpSqlMapping.in.name().equals(op)){
                flag = true;
            }
            if (OpSqlMapping.not_in.name().equals(op)){
                flag = true;
            }
            if (OpSqlMapping.is.name().equals(op)){
                flag = true;
            }
            if (OpSqlMapping.is_not.name().equals(op)){
                flag = true;
            }
            return flag;
        }

        public static OpSqlMapping getPreOp(String op){
            if (OpSqlMapping.not_in.name().equals(op) || OpSqlMapping.is.name().equals(op) || OpSqlMapping.not_like.name().equals(op)){
                return OpSqlMapping.not_in;
            }else {
                return OpSqlMapping.in;
            }
        }

        public static boolean isLike(String op){
            if (OpSqlMapping.like.name().equals(op) || OpSqlMapping.not_like.name().equals(op)){
                return true;
            }else {
                return false;
            }
        }

        public static boolean isNullKey(String op){
            if (OpSqlMapping.is.name().equals(op) || OpSqlMapping.is_not.name().equals(op)){
                return true;
            }else {
                return false;
            }
        }
    }
}

