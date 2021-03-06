import React, { useRef, useCallback, useEffect } from 'react';
import {
  Button, Icon, Tooltip,
} from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import Commits from '@/components/Commits';
import MergeRequest from '@/components/MergeRequest';
import { useDetailContainerContext } from '@/components/detail-container/context';

const IssueBranch = observer(({
  store, disabled, projectId, reloadIssue, otherProject, outside, programId, applyType, issueId,
}) => {
  const commitsRef = useRef();
  const mergeRequestRef = useRef();
  const { resizeRef } = useDetailContainerContext();
  const refresh = useCallback(() => {
    commitsRef.current?.loadCommits();
    mergeRequestRef.current?.loadMergeRequest();
  }, []);
  useEffect(() => {
    store.setRefreshBranch(refresh);
  }, [refresh, store]);
  useEffect(() => {
    if (resizeRef.current) {
      const maxWidth = window.innerWidth * 0.6;
      if (resizeRef.current.resizable.clientWidth < maxWidth) {
        resizeRef.current.setWidth(maxWidth);
      }
    }
  }, [resizeRef]);
  return (
    <div id="branch">
      <div className="c7n-title-wrapper">
        <div className="c7n-title-left">
          关联分支
        </div>
        {!disabled && (
          <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
            <Tooltip placement="topRight" title="关联分支" getPopupContainer={(triggerNode) => triggerNode.parentNode}>
              <Button style={{ padding: '0 6px' }} className="leftBtn" funcType="flat" onClick={() => store.setLinkBranchShow(true)}>
                <Icon type="add_branch icon" />
              </Button>
            </Tooltip>
            <Tooltip placement="topRight" title="创建分支" getPopupContainer={(triggerNode) => triggerNode.parentNode}>
              <Button style={{ padding: '0 6px' }} className="leftBtn" funcType="flat" onClick={() => store.setCreateBranchShow(true)}>
                <Icon type="playlist_add icon" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
      <Commits
        ref={commitsRef}
        issueId={issueId}
      />
      <div className="c7n-title-wrapper">
        <div className="c7n-title-left">
          合并请求
        </div>
      </div>
      <MergeRequest
        ref={mergeRequestRef}
        issueId={issueId}
      />
    </div>
  );
});

export default IssueBranch;
