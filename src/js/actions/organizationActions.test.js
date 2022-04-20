import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import AppConstants from '../constants/appConstants';
import { EXTERNAL_PROVIDER } from '../constants/deviceConstants';
import OrganizationConstants from '../constants/organizationConstants';
import {
  cancelRequest,
  cancelUpgrade,
  changeIntegration,
  confirmCardUpdate,
  completeUpgrade,
  createIntegration,
  createOrganizationTrial,
  deleteIntegration,
  getAuditLogs,
  getAuditLogsCsvLink,
  getCurrentCard,
  getIntegrations,
  getUserOrganization,
  requestPlanChange,
  sendSupportMessage,
  startCardUpdate,
  startUpgrade,
  setAuditlogsState
} from './organizationActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const expectedDeviceProviders = [
  { id: 1, provider: EXTERNAL_PROVIDER['iot-hub'].provider, something: 'something', connection_string: 'something_else' },
  { id: 2, provider: 'aws', something: 'new' }
];

/* eslint-disable sonarjs/no-identical-functions */
describe('organization actions', () => {
  it('should handle different error message formats', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Deactivation request was sent successfully'
        }
      }
    ];
    await store.dispatch(cancelRequest(defaultState.organization.organization.id, 'testReason')).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle trial creation', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [];
    await store
      .dispatch(
        createOrganizationTrial({
          email: 'test@test.com',
          organization: 'test',
          plan: 'os',
          tos: true,
          marketing: true,
          'g-recaptcha-response': 'test'
        })
      )
      .then(token => {
        expect(token).toBeTruthy();
        expect(store.getActions()).toHaveLength(expectedActions.length);
      });
  });

  it('should handle credit card details retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.RECEIVE_CURRENT_CARD,
        card: defaultState.organization.card
      }
    ];
    await store.dispatch(getCurrentCard()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle organization retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.SET_ORGANIZATION,
        organization: defaultState.organization.organization
      }
    ];
    await store.dispatch(getUserOrganization()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle support request sending', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Your request was sent successfully'
        }
      }
    ];
    await store.dispatch(sendSupportMessage({ body: 'test', subject: 'testsubject' })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle schema based support request sending', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Your request was sent successfully'
        }
      }
    ];
    await store
      .dispatch(
        requestPlanChange(defaultState.organization.organization.id, {
          current_plan: 'Basic',
          requested_plan: 'Enterprise',
          current_addons: 'something,extra',
          requested_addons: 'something,extra,special',
          user_message: 'more please'
        })
      )
      .then(() => {
        const storeActions = store.getActions();
        expect(storeActions).toHaveLength(expectedActions.length);
        expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
      });
  });

  it('should handle account upgrade init', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(startUpgrade(defaultState.organization.organization.id)).then(secret => {
      expect(store.getActions()).toHaveLength(0);
      expect(secret).toEqual('testSecret');
    });
  });

  it('should handle account upgrade cancelling', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(cancelUpgrade(defaultState.organization.organization.id)).then(() => expect(store.getActions()).toHaveLength(0));
  });

  it('should handle account upgrade completion', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        organization: defaultState.organization.organization,
        type: OrganizationConstants.SET_ORGANIZATION
      }
    ];
    await store.dispatch(completeUpgrade(defaultState.organization.organization.id, 'enterprise')).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle confirm card update initialization', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        intentId: 'testIntent',
        type: OrganizationConstants.RECEIVE_SETUP_INTENT
      }
    ];
    await store.dispatch(startCardUpdate()).then(secret => {
      const storeActions = store.getActions();
      expect(secret).toEqual('testSecret');
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle confirm card update confirmation', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Payment card was updated successfully'
        }
      },
      {
        type: OrganizationConstants.RECEIVE_SETUP_INTENT,
        intentId: null
      }
    ];
    const request = store.dispatch(confirmCardUpdate());
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);

      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle auditlog retrieval', async () => {
    const store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasAuditlogs: true
        }
      }
    });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.RECEIVE_AUDIT_LOGS,
        events: defaultState.organization.auditlog.events,
        total: defaultState.organization.auditlog.selectionState.total
      }
    ];
    const request = store.dispatch(getAuditLogs({ page: 1, perPage: 20 }));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow deployment state tracking', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(setAuditlogsState({ page: 1, sorting: 'something' }));
    const expectedActions = [
      {
        type: OrganizationConstants.SET_AUDITLOG_STATE,
        state: {
          ...defaultState.organization.auditlog.selectionState,
          sorting: 'something'
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should handle csv information download', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const request = store.dispatch(getAuditLogsCsvLink());
    expect(request).resolves.toBeTruthy();
    await request.then(link => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(0);
      expect(link).toEqual('/api/management/v1/auditlogs/logs/export?limit=20000&sort=desc');
    });
  });
  it('should allow initializing external device providers', async () => {
    const store = mockStore({
      ...defaultState,
      organization: {
        ...defaultState.organization,
        externalDeviceIntegrations: [
          { id: 1, something: 'something' },
          { id: 2, provider: 'aws', something: 'new' }
        ]
      }
    });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The integration was set up successfully' } },
      {
        type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS,
        value: expectedDeviceProviders
      }
    ];
    const request = store.dispatch(createIntegration({ connection_string: 'testString', provider: 'iot-hub' }));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow configuring external device providers', async () => {
    const store = mockStore({
      ...defaultState,
      organization: {
        ...defaultState.organization,
        externalDeviceIntegrations: [
          { id: 1, something: 'something' },
          { id: 2, provider: 'aws', something: 'new' }
        ]
      }
    });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The integration was updated successfully' } },
      {
        type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS,
        value: expectedDeviceProviders
      }
    ];
    const request = store.dispatch(changeIntegration({ connection_string: 'testString2', id: 1, provider: 'iot-hub' }));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow retrieving external device providers', async () => {
    const store = mockStore({
      ...defaultState,
      organization: {
        ...defaultState.organization,
        externalDeviceIntegrations: [
          { id: 1, something: 'something' },
          { id: 2, provider: 'aws', something: 'new' }
        ]
      }
    });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS,
        value: expectedDeviceProviders
      }
    ];
    const request = store.dispatch(getIntegrations());
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow deleting external device provider configurations', async () => {
    const store = mockStore({ ...defaultState, externalDeviceIntegrations: [{ id: 1, something: 'something' }] });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      { type: AppConstants.SET_SNACKBAR, snackbar: { message: 'The integration was removed successfully' } },
      { type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, value: [] }
    ];
    const request = store.dispatch(deleteIntegration({ id: 1 }));
    expect(request).resolves.toBeTruthy();
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});
