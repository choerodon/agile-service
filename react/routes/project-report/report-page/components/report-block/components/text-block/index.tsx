import React, { useCallback, useEffect } from 'react';
import WYSIWYGViewer from '@/components/WYSIWYGViewer';
import { IReportTextBlock } from '@/routes/project-report/report-page/store';
import { useTaskContext } from '@/routes/project-report/report-preview/taskContext';

interface Props {
  data: IReportTextBlock
}
const TextBlock: React.FC<Props> = ({ data: { content, key } }) => {
  const { register, finish } = useTaskContext();
  register(`text-${key}`);
  const onFinish = useCallback(() => {
    finish(`text-${key}`);
  }, [finish, key]);
  useEffect(() => {
    onFinish();
  }, [onFinish]);
  return (
    <div style={{ padding: '10px 26px' }}>
      <WYSIWYGViewer data={content} />
    </div>
  );
};

export default TextBlock;
