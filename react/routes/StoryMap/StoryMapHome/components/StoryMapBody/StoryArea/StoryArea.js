import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import StoryRow from './StoryRow';
import StoryMapStore from '../../../../../../stores/project/StoryMap/StoryMapStore';

@observer
class StoryArea extends Component {
  renderWithSwimVersion=() => {
    const { isFullScreen } = StoryMapStore;
    const versionList = isFullScreen ? StoryMapStore.versionList.filter((version) => version.storyNum) : StoryMapStore.versionList;
    return versionList.map((version, index) => <StoryRow rowIndex={index} isLastRow={index === versionList.length - 1} version={version} storyCollapse={version.collapse} />);
  }

  renderWithSwimSprint=() => {
    const { isFullScreen } = StoryMapStore;
    const sprintList = isFullScreen ? StoryMapStore.sprintList.filter((sprint) => sprint.storyNum) : StoryMapStore.sprintList;
    return sprintList.map((sprint, index) => <StoryRow rowIndex={index} isLastRow={index === sprintList.length - 1} sprint={sprint} storyCollapse={sprint.collapse} />);
  }

  renderWithNone=() => <StoryRow isLastRow rowIndex={0} />

  renderStory=() => {
    const { swimLine } = StoryMapStore;
    switch (swimLine) {
      case 'none': {
        return this.renderWithNone();
      }
      case 'version': {
        return this.renderWithSwimVersion();
      }
      case 'sprint': {
        return this.renderWithSwimSprint();
      }
      default: return null;
    }
  }

  render() {
    return this.renderStory();
  }
}

StoryArea.propTypes = {

};

export default StoryArea;
