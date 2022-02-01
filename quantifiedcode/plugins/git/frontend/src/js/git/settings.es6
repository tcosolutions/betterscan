import $ from "jquery"
import Constants from "git/constants"
import NewProject from "git/components/_new"
import ProjectSettings from "git/components/_settings"
import SnapshotSelector from "git/components/_snapshot_selector"

var settings = {
    providers : {
      'project.snapshot' : [
          {
            name: 'Git',
            source: 'git',
            component: SnapshotSelector
          }
      ],
      'project.new' : [
          {
            title : 'Git',
            name : 'git',
            component : NewProject
          }
      ],
      'project.settings' : [
        {
        icon: 'mark-git',
        title : "Git",
        name : "git",
        component : ProjectSettings
        }
      ],
    },
    'sourceSettings' : {
        git : {
            editNameDisabled: false,
            editDescriptionDisabled: false,
            editPrivacyDisabled: false
        }
    }
}

export default settings
