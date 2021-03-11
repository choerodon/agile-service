import React from 'react';
import useProjectIssueTypes from '@/hooks/data/useProjectIssueTypes';
import useDefaultPriority from '@/hooks/useDefaultPriority';
import { IsInProgram } from '@/hooks/useIsInProgram';
import QuickCreateIssue from './QuickCreateIssue';

const QuickCreateIssueWithProvider = (props) => {
  const { data: issueTypes } = useProjectIssueTypes({ onlyEnabled: true });
  const [defaultPriority] = useDefaultPriority();

  return (
    <IsInProgram>
      {
        ({ isInProgram }) => (
          <QuickCreateIssue
            defaultPriority={defaultPriority}
            issueTypes={(issueTypes || []).filter(({ typeCode }) => !['issue_epic', 'feature', 'sub_task'].includes(typeCode))}
            isInProgram={isInProgram}
            {...props}
          />
        )
      }
    </IsInProgram>

  );
};
export default QuickCreateIssueWithProvider;
