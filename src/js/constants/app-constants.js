module.exports = {
  SELECT_GROUP: 'SELECT_GROUP',
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
  REMOVE_GROUP: 'REMOVE_GROUP',
  ADD_GROUP: 'ADD_GROUP',
  RECEIVE_GROUPS: 'RECEIVE_GROUPS',
  RECEIVE_ALL_DEVICES: 'RECEIVE_ALL_DEVICES',
  RECEIVE_GROUP_DEVICES: 'RECEIVE_GROUP_DEVICES',
  RECEIVE_ADMISSION_DEVICES: 'RECEIVE_ADMISSION_DEVICES',
  SET_TOTAL_DEVICES: 'SET_TOTAL_DEVICES',
  SET_ACCEPTED_DEVICES_COUNT: 'SET_ACCEPTED_DEVICES_COUNT',
  SET_PENDING_DEVICES_COUNT: 'SET_PENDING_DEVICES_COUNT',
  SET_REJECTED_DEVICES_COUNT: 'SET_REJECTED_DEVICES_COUNT',
  SET_PREAUTH_DEVICES_COUNT: 'SET_PREAUTH_DEVICES_COUNT',
  SET_ACCEPTED_DEVICES: 'SET_ACCEPTED_DEVICES',
  SET_PENDING_DEVICES: 'SET_PENDING_DEVICES',
  SET_REJECTED_DEVICES: 'SET_REJECTED_DEVICES',
  SET_PREAUTHORIZED_DEVICES: 'SET_PREAUTHORIZED_DEVICES',
  SET_DEVICE_LIMIT: 'SET_DEVICE_LIMIT',
  SAVE_SCHEDULE: 'SAVE_SCHEDULE',
  REMOVE_DEPLOYMENT: 'REMOVE_DEPLOYMENT',
  SORT_TABLE: 'SORT_TABLE',
  ARTIFACTS_REMOVED_ARTIFACT: 'ARTIFACTS_REMOVED_ARTIFACT',
  ARTIFACTS_SET_ARTIFACT_URL: 'ARTIFACTS_SET_ARTIFACT_URL',
  RECEIVE_ARTIFACTS: 'RECEIVE_ARTIFACTS',
  UPLOAD_ARTIFACT: 'UPLOAD_ARTIFACT',
  UPLOAD_PROGRESS: 'UPLOAD_PROGRESS',
  SET_DEPLOYMENT_ARTIFACT: 'SET_DEPLOYMENT_ARTIFACT',
  RECEIVE_RELEASES: 'RECEIVE_RELEASES',
  RECEIVE_DEPLOYMENTS: 'RECEIVE_DEPLOYMENTS',
  RECEIVE_PENDING_DEPLOYMENTS: 'RECEIVE_PENDING_DEPLOYMENTS',
  RECEIVE_ACTIVE_DEPLOYMENTS: 'RECEIVE_ACTIVE_DEPLOYMENTS',
  RECEIVE_PAST_DEPLOYMENTS: 'RECEIVE_PAST_DEPLOYMENTS',
  INPROGRESS_COUNT: 'INPROGRESS_COUNT',
  SINGLE_DEPLOYMENT: 'SINGLE_DEPLOYMENT',
  SET_LOCAL_STORAGE: 'SET_LOCAL_STORAGE',
  SET_SNACKBAR: 'SET_SNACKBAR',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_SHOW_HELP: 'SET_SHOW_HELP',
  SET_SHOW_ONBOARDING_HELP: 'SET_SHOW_ONBOARDING_HELP',
  SET_SHOW_ONBOARDING_HELP_DIALOG: 'SET_SHOW_ONBOARDING_HELP_DIALOG',
  SET_ONBOARDING_COMPLETE: 'SET_ONBOARDING_COMPLETE',
  SET_SHOW_CONNECT_DEVICE: 'SET_SHOW_CONNECT_DEVICE',
  SET_SHOW_CREATE_ARTIFACT: 'SET_SHOW_CREATE_ARTIFACT',
  SET_CONNECT_DEVICE_PROGRESSED: 'SET_CONNECT_DEVICE_PROGRESSED',
  SET_ORGANIZATION: 'SET_ORGANIZATION',
  SET_FILTER_ATTRIBUTES: 'SET_FILTER_ATTRIBUTES',
  SET_GLOBAL_SETTINGS: 'SET_GLOBAL_SETTINGS',
  // workaround to support showing ungrouped devices, relying on the fact that
  // '*', '|', '=' should not be whitelisted characters in a group name
  UNGROUPED_GROUP: { id: '*|=ungrouped=|*', name: 'Ungrouped' }
};
