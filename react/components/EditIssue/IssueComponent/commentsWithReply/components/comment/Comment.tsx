import React, { useCallback, useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { stores, Permission } from '@choerodon/boot';
import './Comment.less';
import { IComment } from '@/common/types';
import { issueCommentApi, UComment } from '@/api/IssueComment';
import CommentItem, { ReplyComment } from './CommentItem';
import EditIssueContext from '../../../../stores';

interface Props {
  projectId?: string
  comment: IComment
  onDelete?: Function
  reload: Function
  readonly: boolean
}

const { AppState } = stores;

const Comment: React.FC<Props> = (props) => {
  const { store } = useContext(EditIssueContext);
  const { commentExpandMap, commentReplysMap } = store;
  const { comment, reload, readonly } = props;
  const loginUserId = AppState.userInfo.id;

  const handleFold = useCallback(() => {
    commentExpandMap.set(comment.commentId, false);
  }, [comment.commentId, commentExpandMap]);

  const getReplys = useCallback((id?: string) => {
    issueCommentApi.getReplys(id || comment.commentId).then((res: ReplyComment[]) => {
      commentReplysMap.set(id || comment.commentId, res || []);
      commentExpandMap.set(id || comment.commentId, true);
    });
  }, [comment.commentId, commentExpandMap, commentReplysMap]);

  const onReply = useCallback((id?: string) => {
    const callback = () => {
      getReplys(id);
    };
    reload(callback);
  }, [getReplys, reload]);

  return (
    <div
      className="c7n-comment"
    >
      <Permission
        service={['choerodon.code.project.cooperation.iteration-plan.ps.choerodon.code.agile.project.editissue.pro']}
      >
        {
            (hasPermission: boolean) => (
              <div className="c7n-comment-self">
                <CommentItem
                  isReply={false}
                  {...props}
                  onReply={onReply}
                  onDelete={onReply}
                  onUpdate={onReply}
                  parentId={comment.commentId}
                  hasPermission={hasPermission || String(comment.userId) === String(loginUserId)}
                  readonly={readonly}
                />
                {
                  commentExpandMap.get(comment.commentId) && (
                    <div className="c7n-comment-replys">
                      {
                        (commentReplysMap.get(comment.commentId) || []).map((item: IComment) => (
                          <CommentItem
                            isReply
                            {...props}
                            onReply={onReply}
                            onDelete={onReply}
                            onUpdate={onReply}
                            reload={reload}
                            comment={item}
                            parentId={comment.commentId}
                            hasPermission={hasPermission || String(item.userId) === String(loginUserId)}
                            readonly={readonly}
                          />
                        ))
                      }
                    </div>
                  )
                }
                {
                  comment.replySize > 0 && (
                  <div className="c7n-comment-expand">
                    {
                      commentExpandMap.get(comment.commentId) ? <span role="none" onClick={handleFold}>收起评论</span> : (
                        <span role="none" onClick={() => { getReplys(); }}>
                          {`打开评论(${comment.replySize})`}
                        </span>
                      )
                    }
                  </div>
                  )
                }
              </div>
            )
          }
      </Permission>
    </div>
  );
};

export default observer(Comment);
