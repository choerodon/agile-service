package io.choerodon.agile.infra.utils;

import io.choerodon.agile.api.vo.ProjectVO;
import io.choerodon.agile.app.service.UserService;
import io.choerodon.agile.infra.dto.ProjectReportReceiverDTO;
import io.choerodon.agile.infra.dto.UserDTO;
import io.choerodon.agile.infra.feign.BaseFeignClient;
import io.choerodon.core.enums.MessageAdditionalType;
import org.apache.commons.collections4.CollectionUtils;
import org.hzero.boot.message.MessageClient;
import org.hzero.boot.message.entity.MessageSender;
import org.hzero.boot.message.entity.Receiver;
import org.hzero.core.base.BaseConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Created by HuangFuqiang@choerodon.io on 2018/10/8.
 * Email: fuqianghuang01@gmail.com
 */
@Component
public class SiteMsgUtil {

    private static Logger LOGGER = LoggerFactory.getLogger(SiteMsgUtil.class);

    private static final String ASSIGNEENAME = "assigneeName";
    private static final String OPERATOR_NAME = "operatorName";
    private static final String SUMMARY = "summary";
    private static final String URL = "url";
    private static final String NOTIFY_TYPE = "agile";
    private static final String PROJECT_NAME = "projectName";
    private static final String USER_NAME = "userName";
    private static final String MSG_TYPE_EMAIL = "EMAIL";
    private static final String MSG_TYPE_WEB = "WEB";
    private static final String MSG_TYPE_WEBHOOK = "WEB_HOOK";

    @Autowired
    private BaseFeignClient baseFeignClient;
    @Autowired
    private UserService userService;
    @Autowired
    private MessageClient messageClient;

    public void issueCreate(List<Long> userIds,String userName, String summary, String url, Long reporterId, Long projectId) {
        ProjectVO projectVO = baseFeignClient.queryProject(projectId).getBody();
        Map<String,String> map = new HashMap<>();
        map.put(ASSIGNEENAME, userName);
        map.put(SUMMARY, summary);
        map.put(URL, url);
        map.put(PROJECT_NAME, projectVO.getName());
        // 设置额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        //发送站内信
        MessageSender messageSender = handlerMessageSender(0L,"ISSUECREATE",userIds,map);
        messageSender.setAdditionalInformation(objectMap);
        messageClient.async().sendMessage(messageSender);
    }

    private MessageSender handlerMessageSender(Long tenantId,String messageCode,List<Long> userIds,Map<String,String> map){
        MessageSender messageSender = new MessageSender();
        messageSender.setTenantId(tenantId);
        messageSender.setMessageCode(messageCode);
        List<Receiver> receivers = new ArrayList<>();
        handleReceiver(receivers,userIds);
        // 设置参数
        messageSender.setArgs(map);
        // 设置接收者
        messageSender.setReceiverAddressList(receivers);
        return messageSender;
    }

    private Map<Long, UserDTO> handleReceiver(List<Receiver> receivers,Collection<Long> userIds){
        if (CollectionUtils.isEmpty(userIds)){
            return new HashMap<>();
        }
        List<UserDTO> users = baseFeignClient.listUsersByIds(userIds.toArray(new Long[]{}), true).getBody();
        if (CollectionUtils.isEmpty(users)){
            return new HashMap<>();
        }
        Map<Long, UserDTO> userDTOMap = users.stream().collect(Collectors.toMap(UserDTO::getId, Function.identity()));
        // 未启用用户则不进行发消息
        for (Map.Entry<Long, UserDTO> entry : userDTOMap.entrySet()) {
            Receiver receiver = new Receiver();
            UserDTO userDTO = entry.getValue();
            receiver.setUserId(userDTO.getId());
            receiver.setEmail(userDTO.getEmail());
            receiver.setPhone(userDTO.getPhone());
            receiver.setTargetUserTenantId(userDTO.getOrganizationId());
            receivers.add(receiver);
        }
        return userDTOMap;
    }

    public void issueAssignee(List<Long> userIds, String assigneeName, String summary, String url, Long projectId, String operatorName) {
        // 设置模板参数
        ProjectVO projectVO = baseFeignClient.queryProject(projectId).getBody();
        Map<String,String> map = new HashMap<>();
        map.put(ASSIGNEENAME, assigneeName);
        map.put(SUMMARY, summary);
        map.put(URL, url);
        map.put(PROJECT_NAME, projectVO.getName());
        map.put(OPERATOR_NAME, operatorName);
        // 额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        //发送站内信
        MessageSender messageSender = handlerMessageSender(0L,"ISSUEASSIGNEE",userIds,map);
        messageSender.setAdditionalInformation(objectMap);
        messageClient.async().sendMessage(messageSender);
    }

    public void issueSolve(List<Long> userIds, String assigneeName, String summary, String url, Long projectId, String operatorName) {
        ProjectVO projectVO = baseFeignClient.queryProject(projectId).getBody();
        Map<String,String> map = new HashMap<>();
        map.put(ASSIGNEENAME, assigneeName);
        map.put(OPERATOR_NAME, operatorName);
        map.put(SUMMARY, summary);
        map.put(URL, url);
        map.put(PROJECT_NAME, projectVO.getName());
        // 额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        //发送站内信
        MessageSender messageSender = handlerMessageSender(0L,"ISSUESOLVE",userIds,map);
        messageSender.setAdditionalInformation(objectMap);
        messageClient.async().sendMessage(messageSender);
    }

    public void sendChangeIssueStatus(Long projectId, Set<Long> userSet, List<String> noticeTypeList, Map<String, String> templateArgsMap){
        MessageSender messageSender = new MessageSender();
        messageSender.setTenantId(BaseConstants.DEFAULT_TENANT_ID);
        messageSender.setMessageCode("ISSUECHANGESTATUS");
        List<Receiver> receiverList = new ArrayList<>();
        Map<Long, UserDTO> userMap = handleReceiver(receiverList, userSet);
        // 设置模板参数
        messageSender.setArgs(templateArgsMap);
        // 设置额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        messageSender.setAdditionalInformation(objectMap);
        if (CollectionUtils.isEmpty(receiverList)) {
            return;
        }
        messageSender.setTypeCodeList(noticeTypeList);
        messageSender.setReceiverAddressList(receiverList);
        messageClient.async().sendMessage(messageSender);
    }

    public void sendProjectReport(Long projectId, List<ProjectReportReceiverDTO> receiverList, String imgData) {
        // 获取接收人, 抄送人
        Map<String, List<ProjectReportReceiverDTO>> group =
                receiverList.stream().collect(Collectors.groupingBy(ProjectReportReceiverDTO::getType));
        List<Long> toList = group.get(ProjectReportReceiverDTO.TYPE_RECEIVER).stream()
                .map(ProjectReportReceiverDTO::getReceiverId).collect(Collectors.toList());
        Assert.notNull(toList, BaseConstants.ErrorCode.DATA_NOT_EXISTS);
        List<Long> ccList = group.getOrDefault(ProjectReportReceiverDTO.TYPE_CC, Collections.emptyList()).stream()
                .map(ProjectReportReceiverDTO::getReceiverId).collect(Collectors.toList());
        List<Receiver> toReceiver = new ArrayList<>();
        List<Receiver> ccReceiver = new ArrayList<>();
        handleReceiver(toReceiver, toList);
        Assert.isTrue(CollectionUtils.isNotEmpty(toList), BaseConstants.ErrorCode.DATA_NOT_EXISTS);
        handleReceiver(ccReceiver, ccList);
        // 设置参数
        Map<String, String> argsMap = new HashMap<>();
        argsMap.put("data", "<img style='width: 780px;' src='"+imgData+"'>" );
        // 设置sender
        MessageSender sender = new MessageSender();
        sender.setMessageCode("PROJECT_REPORT");
        sender.setTenantId(ConvertUtil.getOrganizationId(projectId));
        sender.setReceiverAddressList(toReceiver);
        sender.setCcList(ccReceiver.stream().map(Receiver::getEmail).collect(Collectors.toList()));
        sender.setArgs(argsMap);
        messageClient.async().sendMessage(sender);
    }
    
    public MessageSender issueCreateSender(List<Long> userIds,String userName, String summary, String url, Long projectId) {
        ProjectVO projectVO = baseFeignClient.queryProject(projectId).getBody();
        Map<String,String> map = new HashMap<>();
        map.put(ASSIGNEENAME, userName);
        map.put(SUMMARY, summary);
        map.put(URL, url);
        map.put(PROJECT_NAME, projectVO.getName());
        // 设置额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        //发送站内信
        MessageSender messageSender = handlerMessageSender(0L,"ISSUECREATE",userIds,map);
        messageSender.setAdditionalInformation(objectMap);
        return messageSender;
    }

    public MessageSender issueAssigneeSender(List<Long> userIds, String assigneeName, String summary, String url, Long projectId, String operatorName) {
        // 设置模板参数
        ProjectVO projectVO = baseFeignClient.queryProject(projectId).getBody();
        Map<String,String> map = new HashMap<>();
        map.put(ASSIGNEENAME, assigneeName);
        map.put(SUMMARY, summary);
        map.put(URL, url);
        map.put(PROJECT_NAME, projectVO.getName());
        map.put(OPERATOR_NAME, operatorName);
        // 额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        //发送站内信
        MessageSender messageSender = handlerMessageSender(0L,"ISSUEASSIGNEE",userIds,map);
        messageSender.setAdditionalInformation(objectMap);
        return messageSender;
    }

    public MessageSender issueSolveSender(List<Long> userIds, String assigneeName, String summary, String url, Long projectId, String operatorName) {
        ProjectVO projectVO = baseFeignClient.queryProject(projectId).getBody();
        Map<String,String> map = new HashMap<>();
        map.put(ASSIGNEENAME, assigneeName);
        map.put(OPERATOR_NAME, operatorName);
        map.put(SUMMARY, summary);
        map.put(URL, url);
        map.put(PROJECT_NAME, projectVO.getName());
        // 额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        //发送站内信
        MessageSender messageSender = handlerMessageSender(0L,"ISSUESOLVE",userIds,map);
        messageSender.setAdditionalInformation(objectMap);
        return messageSender;
    }

    public MessageSender sendChangeIssueStatusSender(Long projectId, Set<Long> userSet, List<String> noticeTypeList, Map<String, String> templateArgsMap){
        MessageSender messageSender = new MessageSender();
        messageSender.setTenantId(BaseConstants.DEFAULT_TENANT_ID);
        messageSender.setMessageCode("ISSUECHANGESTATUS");
        List<Receiver> receiverList = new ArrayList<>();
        Map<Long, UserDTO> userMap = handleReceiver(receiverList, userSet);
        // 设置模板参数
        messageSender.setArgs(templateArgsMap);
        // 设置额外参数
        Map<String,Object> objectMap=new HashMap<>();
        objectMap.put(MessageAdditionalType.PARAM_PROJECT_ID.getTypeName(),projectId);
        messageSender.setAdditionalInformation(objectMap);
        if (CollectionUtils.isEmpty(receiverList)) {
            return null;
        }
        messageSender.setTypeCodeList(noticeTypeList);
        messageSender.setReceiverAddressList(receiverList);
        return messageSender;
    }
}
