import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tooltip } from 'choerodon-ui';
import SelectPI from '@/components/select/select-pi';
import TextEditToggle from '@/components/TextEditTogglePro';
import { piApi } from '@/api';
import { IsInProgramStore } from '@/exports';

@observer
class FieldPI extends Component {
  updateIssuePI = async (value) => {
    const {
      store, onUpdate, reloadIssue,
    } = this.props;
    const issue = store.getIssue;
    const { issueId, activePi } = issue;
    const { id } = activePi || {};
    await piApi.addFeatures([issueId], id || 0, value || 0);
    if (onUpdate) {
      onUpdate();
    }
    await reloadIssue(issueId);
  }

  render() {
    const { store, hasPermission, disabled } = this.props;
    const issue = store.getIssue;
    const { activePi, closePi } = issue;
    const {
      name, code, id, statusCode,
    } = activePi || {};
    const field = store.getFieldByCode('pi');
    const required = field?.required;
    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper">
          <span className="c7n-property">
            PI
          </span>
        </div>
        <div className="c7n-value-wrapper">
          <TextEditToggle // IsInProgramStore
            disabled={(disabled) || (!IsInProgramStore.isOwner && !hasPermission && statusCode === 'doing')}
            onSubmit={this.updateIssuePI}
            initValue={id}
            editor={({ submit }) => (
              <SelectPI
                required={required}
                statusList={['todo', 'doing']}
                multiple={false}
                allowClear
                onChange={submit}
                disabledCurrentPI={!IsInProgramStore.isOwner && !hasPermission}
              />
            )}
          >
            <Tooltip
              placement="top"
              title={`该特性经历PI数${closePi.length + (id ? 1 : 0)}`}
            >
              <div>
                {
                    !closePi.length && !id ? '无' : (
                      <div>
                        <div>
                          {closePi.map((p) => `${p.code}-${p.name}`).join(' , ')}
                        </div>
                        {
                          id && (
                            <div
                              style={{
                                color: '#4d90fe',
                                fontSize: '13px',
                                lineHeight: '20px',
                                display: 'inline-block',
                                marginTop: closePi.length ? 5 : 0,
                              }}
                            >
                              {`${code}-${name}`}
                            </div>
                          )
                        }
                      </div>
                    )
                  }
              </div>
            </Tooltip>
          </TextEditToggle>
        </div>
      </div>
    );
  }
}

export default FieldPI;
