import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui';
import { stores } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';
import WYSIWYGEditor from '@/components/CKEditor';
import WYSIWYGViewer from '@/components/CKEditorViewer';
import DatetimeAgo from '@/components/CommonComponent/DatetimeAgo';
import './Comment.less';
import { IComment } from '@/common/types';
import { issueCommentApi, UComment, IReplyCreate } from '@/api/IssueComment';
import UserTag from '@/components/tag/user-tag';
import openDeleteModal from '../deleteComment';

export interface ReplyComment extends IComment {
  replyToUserId: string
  replyToUserName: string
  replyToUserRealName: string
  replyToUserLoginName: string
  replyToUserImageUrl: string
}

interface Props {
  projectId?: string
  hasPermission: boolean
  comment: IComment | ReplyComment
  onDelete: Function
  onUpdate: Function
  onReply: Function
  isReply: boolean
  parentId: string
  reload: Function
  readonly: boolean
}
const { AppState } = stores;

const CommentItem: React.FC<Props> = ({
  hasPermission, comment, onDelete, onUpdate, onReply, projectId, isReply, parentId, reload, readonly,
}) => {
  const loginUserId = AppState.userInfo.id;
  const isSelf = String(comment.userId) === String(loginUserId);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>('');
  const [replying, setReplying] = useState(false);
  const [replyValue, setReplyValue] = useState<string>('');
  useEffect(() => {
    const delta = comment.commentText;
    setValue(delta);
  }, [comment.commentText]);

  // 校验评论是否为空
  function verifyComment(delta: string) {
    return delta.length > 0;
  }

  const newReply = useCallback((commit: IReplyCreate) => {
    issueCommentApi.project(projectId).createReply(commit).then(() => {
      if (onReply) {
        onReply();
      }
    });
  }, [onReply, projectId]);

  const handleReply = useCallback(async () => {
    if (replyValue && verifyComment(replyValue)) {
      try {
        const commentText = replyValue;
        newReply({
          // @ts-ignore
          issueId: comment.issueId,
          parentId,
          // @ts-ignore
          replyToUserId: comment.userId,
          commentText,
        });
        setReplying(false);
        setReplyValue('');
      } catch {
        //
      }
    } else {
      setReplying(false);
      setReplyValue('');
    }
  }, [comment.issueId, comment.userId, newReply, parentId, replyValue]);

  const updateComment = useCallback((ucomment: UComment) => {
    issueCommentApi.project(projectId).update(ucomment, isSelf).then(() => {
      setEditing(false);
      setValue('');
      if (onUpdate) {
        onUpdate();
      }
    });
  }, [isSelf, onUpdate, projectId]);

  const handleUpdate = useCallback(async (delta: string) => {
    const commentText = value;
    updateComment({
      commentId: comment.commentId,
      objectVersionNumber: comment.objectVersionNumber,
      commentText,
    });
    setEditing(false);
  }, [comment.commentId, comment.objectVersionNumber, updateComment, value]);

  const handleClickDltBtn = useCallback(() => {
    openDeleteModal({
      comment, isReply, projectId, onDelete, parentId, reload,
    });
  }, [comment, isReply, onDelete, parentId, projectId, reload]);

  const canEditOrDelete = hasPermission;

  const handleChange = useCallback((delta: string) => {
    setValue(delta);
  }, []);

  const handleClickReply = useCallback(() => {
    if (editing) {
      setEditing(false);
      const delta = comment.commentText;
      setValue(delta);
    }

    setReplying(true);
  }, [comment.commentText, editing]);

  const handleReplyChange = useCallback((delta: string) => {
    setReplyValue(delta);
  }, []);

  return (
    <>
      <div className={`c7n-comment-item  ${isReply ? 'c7n-comment-reply' : ''}`}>
        <div className="line-justify">
          <div className="c7n-title-commit" style={{ flex: 1 }}>
            <UserTag
              data={{
                // id: comment.userId,
                tooltip: comment.userName,
                realName: comment.userRealName,
                loginName: comment.userLoginName,
                imageUrl: comment.userImageUrl,
              }}
              textStyle={{ color: '#3f51b5' }}
            />
            {
              isReply && (
                <div className="c7n-title-commit-to">
                  <span style={{
                    marginRight: 12,
                    color: 'rgba(0, 0, 0, 0.65)',
                  }}
                  >
                    回复
                  </span>
                  <UserTag
                    data={{
                      // id: comment.replyToUserId,
                      tooltip: (comment as ReplyComment).replyToUserName,
                      realName: (comment as ReplyComment).replyToUserRealName,
                      loginName: (comment as ReplyComment).replyToUserLoginName,
                      imageUrl: (comment as ReplyComment).replyToUserImageUrl,
                    }}
                    textStyle={{ color: '#3f51b5' }}
                  />
                </div>
              )
            }
            <div style={{ color: 'rgba(0, 0, 0, 0.65)', marginLeft: 15 }}>
              <DatetimeAgo
                date={comment.lastUpdateDate}
              />
            </div>
          </div>
          <div className="c7n-action">
            {
              !readonly && (
                <Icon type="message_notification" onClick={handleClickReply} />
              )
            }
            {
              !readonly && hasPermission && (
                <Icon
                  type="mode_edit mlr-3 pointer"
                  onClick={() => {
                    if (canEditOrDelete) {
                      if (replying) {
                        setReplying(false);
                        setReplyValue('');
                      }
                      setEditing(true);
                    }
                  }}
                />
              )
            }

            {
              !readonly && hasPermission && (
                <Icon
                  type="delete_forever mlr-3 pointer"
                  onClick={handleClickDltBtn}
                />
              )
            }
          </div>
        </div>
        {
          editing ? (
            <div className="c7n-conent-commit" style={{ marginTop: 10 }}>
              <WYSIWYGEditor
                autoFocus
                footer
                value={value}
                onChange={handleChange}
                style={{ height: 200, width: '100%' }}
                onCancel={() => {
                  setEditing(false);
                }}
                onOk={handleUpdate}
              />
            </div>
          ) : (
            <div style={{ marginTop: 10, paddingLeft: 23 }}>
              <WYSIWYGViewer value={comment.commentText} />
            </div>
          )
        }
      </div>
      {
        replying && (
          <div className="c7n-comment-reply">
            <WYSIWYGEditor
              autoFocus
              footer
              value={replyValue}
              onChange={handleReplyChange}
              style={{ height: 200, width: '100%' }}
              onCancel={() => {
                setReplying(false);
                setReplyValue('');
              }}
              onOk={handleReply}
              okText="回复"
            />
          </div>
        )
      }
    </>
  );
};

export default observer(CommentItem);
