import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import styles from './index.less';

export interface PaneProps {
  title: string
  nav?: React.ReactElement | ((title: string) => React.ReactElement)
  tabKey: React.Key
  active: boolean
  onClose?: () => void
}
export interface Tab extends PaneProps {
  key: React.Key;
  node: React.ReactElement;
}
const Panel: React.FC<PaneProps> = ({
  children, active, tabKey, title, onClose,
}) => {
  const [visited, setVisited] = React.useState(false);
  useEffect(() => {
    if (active) {
      setVisited(true);
    }
  }, [active]);
  return (
    <div className={classNames(styles.panel_item, {
      [styles.panel_hidden]: !active,
    })}
    >
      <div className={styles.panel_header}>
        <div className={styles.panel_title}>{title}</div>
        <Icon
          className={styles.panel_close}
          type="first_page"
          onClick={() => {
            if (onClose) {
              onClose();
            }
          }}
        />
      </div>
      <div className={styles.panel_content}>
        {(active || visited) && children}
      </div>

    </div>
  );
};

export default Panel;
