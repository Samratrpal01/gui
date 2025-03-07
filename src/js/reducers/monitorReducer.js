import { DEVICE_ISSUE_OPTIONS, DEVICE_LIST_DEFAULTS } from '../constants/deviceConstants';
import * as MonitorConstants from '../constants/monitorConstants';

export const initialState = {
  alerts: {
    alertList: { ...DEVICE_LIST_DEFAULTS, total: 0 },
    byDeviceId: {}
  },
  issueCounts: {
    byType: Object.values(DEVICE_ISSUE_OPTIONS).reduce((accu, { key }) => ({ ...accu, [key]: { filtered: 0, total: 0 } }), {})
  },
  settings: {
    global: {
      channels: {
        ...Object.keys(MonitorConstants.alertChannels).reduce((accu, item) => ({ ...accu, [item]: { enabled: true } }), {})
      }
    }
  }
};

const monitorReducer = (state = initialState, action) => {
  switch (action.type) {
    case MonitorConstants.CHANGE_ALERT_CHANNEL:
      return {
        ...state,
        settings: {
          ...state.settings,
          global: {
            ...state.settings.global,
            channels: {
              ...state.settings.global.channels,
              [action.channel]: { enabled: action.enabled }
            }
          }
        }
      };
    case MonitorConstants.RECEIVE_DEVICE_ALERTS:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          byDeviceId: {
            ...state.alerts.byDeviceId,
            [action.deviceId]: {
              ...state.alerts.byDeviceId[action.deviceId],
              alerts: action.alerts
            }
          }
        }
      };
    case MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          byDeviceId: {
            ...state.alerts.byDeviceId,
            [action.deviceId]: {
              ...state.alerts.byDeviceId[action.deviceId],
              latest: action.alerts
            }
          }
        }
      };
    case MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS:
      return {
        ...state,
        issueCounts: {
          ...state.issueCounts,
          byType: {
            ...state.issueCounts.byType,
            [action.issueType]: action.counts
          }
        }
      };
    case MonitorConstants.SET_ALERT_LIST_STATE:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          alertList: action.value
        }
      };

    default:
      return state;
  }
};

export default monitorReducer;
