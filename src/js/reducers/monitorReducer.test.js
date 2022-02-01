import reducer, { initialState } from './monitorReducer';
import MonitorConstants from '../constants/monitorConstants';
import { defaultState } from '../../../tests/mockData';
import { DEVICE_ISSUE_OPTIONS } from '../constants/deviceConstants';

describe('monitor reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle CHANGE_ALERT_CHANNEL', async () => {
    expect(
      reducer(undefined, { type: MonitorConstants.CHANGE_ALERT_CHANNEL, channel: MonitorConstants.alertChannels.email, enabled: false }).settings.global
        .channels[MonitorConstants.alertChannels.email].enabled
    ).toEqual(false);
    expect(
      reducer(initialState, { type: MonitorConstants.CHANGE_ALERT_CHANNEL, channel: MonitorConstants.alertChannels.email, enabled: true }).settings.global
        .channels[MonitorConstants.alertChannels.email].enabled
    ).toEqual(true);
  });
  it('should handle RECEIVE_DEVICE_ALERTS', async () => {
    expect(
      reducer(undefined, { type: MonitorConstants.RECEIVE_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [] }).alerts.byDeviceId[
        defaultState.devices.byId.a1.id
      ].alerts
    ).toEqual([]);

    expect(
      reducer(initialState, { type: MonitorConstants.RECEIVE_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [123, 456] }).alerts.byDeviceId[
        defaultState.devices.byId.a1.id
      ].alerts
    ).toEqual([123, 456]);
  });
  it('should handle RECEIVE_LATEST_DEVICE_ALERTS', async () => {
    expect(
      reducer(undefined, { type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [] }).alerts.byDeviceId[
        defaultState.devices.byId.a1.id
      ].latest
    ).toEqual([]);

    expect(
      reducer(initialState, { type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS, deviceId: defaultState.devices.byId.a1.id, alerts: [123, 456] }).alerts
        .byDeviceId[defaultState.devices.byId.a1.id].latest
    ).toEqual([123, 456]);
  });
  it('should handle RECEIVE_DEVICE_ISSUE_COUNTS', async () => {
    expect(
      reducer(undefined, {
        type: MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS,
        issueType: DEVICE_ISSUE_OPTIONS.monitoring.key,
        counts: { filtered: 1, total: 3 }
      }).issueCounts.byType[DEVICE_ISSUE_OPTIONS.monitoring.key]
    ).toEqual({ filtered: 1, total: 3 });

    expect(
      reducer(initialState, {
        type: MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS,
        issueType: DEVICE_ISSUE_OPTIONS.monitoring.key,
        counts: { total: 3 }
      }).issueCounts.byType[DEVICE_ISSUE_OPTIONS.monitoring.key]
    ).toEqual({ total: 3 });
  });
  it('should handle SET_ALERT_LIST_STATE', async () => {
    expect(reducer(undefined, { type: MonitorConstants.SET_ALERT_LIST_STATE, value: { total: 3 } }).alerts.alertList).toEqual({ total: 3 });
    expect(reducer(initialState, { type: MonitorConstants.SET_ALERT_LIST_STATE, value: 'something' }).alerts.alertList).toEqual('something');
  });
});
