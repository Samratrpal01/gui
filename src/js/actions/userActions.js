import Cookies from 'universal-cookie';

import { commonErrorFallback, commonErrorHandler, setSnackbar } from './appActions';
import GeneralApi from '../api/general-api';
import UsersApi from '../api/users-api';
import AppConstants from '../constants/appConstants';
import OnboardingConstants from '../constants/onboardingConstants';
import UserConstants, { OWN_USER_ID, twoFAStates } from '../constants/userConstants';
import { getCurrentUser, getOnboardingState, getUserSettings } from '../selectors';
import { cleanUp, logout } from '../auth';
import { extractErrorMessage, hashString, preformatWithRequestID } from '../helpers';
import { clearAllRetryTimers } from '../utils/retrytimer';

const cookies = new Cookies();
const { emptyRole, rolesByName, useradmApiUrl } = UserConstants;

const handleLoginError = (err, has2FA) => dispatch => {
  const errorText = extractErrorMessage(err);
  const is2FABackend = errorText.includes('2fa');
  if (is2FABackend && !has2FA) {
    return Promise.reject({ error: '2fa code missing' });
  }
  const twoFAError = is2FABackend ? ' and verification code' : '';
  const errorMessage = `There was a problem logging in. Please check your email${
    twoFAError ? ',' : ' and'
  } password${twoFAError}. If you still have problems, contact an administrator.`;
  return Promise.reject(dispatch(setSnackbar(preformatWithRequestID(err.response, errorMessage), null, 'Copy to clipboard')));
};

/*
  User management
*/
export const loginUser = userData => dispatch =>
  UsersApi.postLogin(`${useradmApiUrl}/auth/login`, userData)
    .catch(err => {
      cleanUp();
      return Promise.resolve(dispatch(handleLoginError(err, userData['token2fa'])));
    })
    .then(res => {
      const token = res.text;
      if (!token) {
        return;
      }
      let options = { sameSite: 'strict', secure: true, path: '/' };
      if (userData.hasOwnProperty('noExpiry')) {
        // set no expiry as cookie to remember checkbox value, even though this is set, maxAge takes precedent if present
        options = { ...options, expires: new Date('2500-12-31') };
        cookies.set('noExpiry', userData.noExpiry.toString(), options);
      } else {
        options = { ...options, maxAge: 900 };
      }

      // save token as cookie
      // set maxAge if noexpiry checkbox not checked
      cookies.set('JWT', token, options);

      window.sessionStorage.removeItem('pendings-redirect');
      window.location.replace('#/');
      return Promise.all([dispatch({ type: UserConstants.SUCCESSFULLY_LOGGED_IN, value: token }), dispatch(getUser(OWN_USER_ID))]);
    });

export const logoutUser = reason => (dispatch, getState) => {
  if (getState().releases.uploadProgress) {
    return Promise.reject();
  }
  let tasks = [dispatch({ type: UserConstants.USER_LOGOUT })];
  return GeneralApi.post(`${useradmApiUrl}/auth/logout`).finally(() => {
    clearAllRetryTimers(setSnackbar);
    if (reason) {
      tasks.push(dispatch(setSnackbar(reason)));
    }
    logout();
    return Promise.all(tasks);
  });
};

export const passwordResetStart = email => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/auth/password-reset/start`, { email: email }).catch(err =>
    commonErrorHandler(err, `The password reset request cannot be processed:`, dispatch, undefined, true)
  );

export const passwordResetComplete = (secretHash, newPassword) => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/auth/password-reset/complete`, { secret_hash: secretHash, password: newPassword }).catch(err => {
    let status = ((err || {}).res || {}).status,
      errorMsg;
    if (status == 400) {
      errorMsg = 'the link you are using expired or the request is not valid, please try again.';
    } else {
      errorMsg = (err || {}).error;
    }
    dispatch(setSnackbar('The password reset request cannot be processed: ' + errorMsg));
    return Promise.reject(err);
  });

export const verifyEmailStart = () => (dispatch, getState) =>
  GeneralApi.post(`${useradmApiUrl}/auth/verify-email/start`, { email: getCurrentUser(getState()).email })
    .catch(err => commonErrorHandler(err, 'An error occured starting the email verification process:', dispatch))
    .finally(() => Promise.resolve(dispatch(getUser(OWN_USER_ID))));

export const setAccountActivationCode = code => dispatch => Promise.resolve(dispatch({ type: UserConstants.RECEIVED_ACTIVATION_CODE, code }));

export const verifyEmailComplete = secret => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/auth/verify-email/complete`, { secret_hash: secret })
    .catch(err => commonErrorHandler(err, 'An error occured completing the email verification process:', dispatch))
    .finally(() => Promise.resolve(dispatch(getUser(OWN_USER_ID))));

export const verify2FA = tfaData => dispatch =>
  UsersApi.putVerifyTFA(`${useradmApiUrl}/2faverify`, tfaData)
    .then(() => Promise.resolve(dispatch(getUser(OWN_USER_ID))))
    .catch(err =>
      commonErrorHandler(err, 'An error occured validating the verification code: failed to verify token, please try again.', dispatch, undefined, true)
    );

export const getUserList = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/users`)
    .then(res => {
      const users = res.data.reduce((accu, item) => {
        accu[item.id] = item;
        return accu;
      }, {});
      return dispatch({ type: UserConstants.RECEIVED_USER_LIST, users });
    })
    .catch(err => commonErrorHandler(err, `Users couldn't be loaded.`, dispatch, commonErrorFallback));

export const getUser = id => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/users/${id}`).then(({ data: user }) =>
    Promise.all([
      dispatch({ type: UserConstants.RECEIVED_USER, user }),
      dispatch(setHideAnnouncement(false, user.id)),
      dispatch(updateUserColumnSettings(undefined, user.id)),
      user
    ])
  );

export const updateUserColumnSettings = (columns, currentUserId) => (dispatch, getState) => {
  const userId = currentUserId ?? getCurrentUser(getState()).id;
  const storageKey = `${userId}-column-widths`;
  let customColumns = [];
  if (!columns) {
    try {
      customColumns = JSON.parse(window.localStorage.getItem(storageKey)) || customColumns;
    } catch {
      // most likely the column info doesn't exist yet or is lost - continue
    }
  } else {
    customColumns = columns;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(customColumns));
  return Promise.resolve(dispatch({ type: UserConstants.SET_CUSTOM_COLUMNS, value: customColumns }));
};

const actions = {
  create: {
    successMessage: 'The user was created successfully.',
    errorMessage: 'creating'
  },
  edit: {
    successMessage: 'The user has been updated.',
    errorMessage: 'editing'
  },
  remove: {
    successMessage: 'The user was removed from the system.',
    errorMessage: 'removing'
  }
};

const userActionErrorHandler = (err, type, dispatch) => commonErrorHandler(err, `There was an error ${actions[type].errorMessage} the user.`, dispatch);

export const createUser = userData => dispatch =>
  GeneralApi.post(`${useradmApiUrl}/users`, userData)
    .then(() =>
      Promise.all([
        dispatch({ type: UserConstants.CREATED_USER, user: userData }),
        dispatch(getUserList()),
        dispatch(setSnackbar(actions.create.successMessage))
      ])
    )
    .catch(err => userActionErrorHandler(err, 'create', dispatch));

export const removeUser = userId => dispatch =>
  GeneralApi.delete(`${useradmApiUrl}/users/${userId}`)
    .then(() =>
      Promise.all([dispatch({ type: UserConstants.REMOVED_USER, userId }), dispatch(getUserList()), dispatch(setSnackbar(actions.remove.successMessage))])
    )
    .catch(err => userActionErrorHandler(err, 'remove', dispatch));

export const editUser = (userId, userData) => (dispatch, getState) =>
  GeneralApi.put(`${useradmApiUrl}/users/${userId}`, userData)
    .then(() =>
      Promise.all([
        dispatch({ type: UserConstants.UPDATED_USER, userId: userId === UserConstants.OWN_USER_ID ? getState().users.currentUser : userId, user: userData }),
        dispatch(setSnackbar(actions.edit.successMessage))
      ])
    )
    .catch(err => userActionErrorHandler(err, 'edit', dispatch));

export const enableUser2fa =
  (userId = OWN_USER_ID) =>
  dispatch =>
    GeneralApi.post(`${useradmApiUrl}/users/${userId}/2fa/enable`)
      .catch(err => commonErrorHandler(err, `There was an error enabling Two Factor authentication for the user.`, dispatch))
      .then(() => Promise.resolve(dispatch(getUser(userId))));

export const disableUser2fa =
  (userId = OWN_USER_ID) =>
  dispatch =>
    GeneralApi.post(`${useradmApiUrl}/users/${userId}/2fa/disable`)
      .catch(err => commonErrorHandler(err, `There was an error disabling Two Factor authentication for the user.`, dispatch))
      .then(() => Promise.resolve(dispatch(getUser(userId))));

export const getRoles = () => (dispatch, getState) =>
  GeneralApi.get(`${useradmApiUrl}/roles`)
    .then(({ data: roles }) => {
      const rolesState = getState().users.rolesById;
      const rolesById = roles.reduce((accu, role) => {
        const { allowUserManagement, groups } = role.permissions.reduce(
          (accu, permission) => {
            if (permission.action === rolesByName.deploymentCreation.action && permission.object.type === rolesByName.deploymentCreation.object.type) {
              accu.groups.push(permission.object.value);
            }
            if (
              role.name === rolesByName.admin ||
              (permission.action == rolesByName.userManagement.action &&
                permission.object.type == rolesByName.userManagement.object.type &&
                permission.object.value == rolesByName.userManagement.object.value)
            ) {
              accu.allowUserManagement = true;
            }
            return accu;
          },
          { allowUserManagement: false, groups: [] }
        );
        accu[role.name] = {
          ...emptyRole,
          ...rolesState[role.name],
          groups,
          description: rolesState[role.name] && rolesState[role.name].description ? rolesState[role.name].description : role.description,
          editable: rolesState[role.name] && typeof rolesState[role.name].editable !== 'undefined' ? rolesState[role.name].editable : true,
          title: rolesState[role.name] && rolesState[role.name].title ? rolesState[role.name].title : role.name,
          permissions: role.permissions,
          allowUserManagement: allowUserManagement
        };
        return accu;
      }, {});
      return dispatch({ type: UserConstants.RECEIVED_ROLES, rolesById });
    })
    .catch(() => console.log('Role retrieval failed - likely accessing a non-RBAC backend'));

const transformRoleDataToRole = roleData => {
  let permissions = roleData.groups.reduce(
    (accu, group) => [
      ...accu,
      { ...rolesByName.deploymentCreation, object: { ...rolesByName.deploymentCreation.object, value: group } },
      { ...rolesByName.groupAccess, object: { ...rolesByName.groupAccess.object, value: group } }
    ],
    []
  );
  if (roleData.allowUserManagement) {
    permissions.push(rolesByName.userManagement);
  }
  return {
    name: roleData.name,
    description: roleData.description,
    permissions
  };
};

export const createRole = roleData => dispatch => {
  const role = transformRoleDataToRole(roleData);
  return GeneralApi.post(`${useradmApiUrl}/roles`, role)
    .then(() => Promise.all([dispatch({ type: UserConstants.CREATED_ROLE, role: { ...emptyRole, ...role }, roleId: role.name }), dispatch(getRoles())]))
    .catch(err => commonErrorHandler(err, `There was an error creating the role:`, dispatch));
};

export const editRole = roleData => dispatch => {
  const role = transformRoleDataToRole(roleData);
  const roleId = role.name;
  return GeneralApi.put(`${useradmApiUrl}/roles/${roleId}`, role)
    .then(() => Promise.all([dispatch({ type: UserConstants.UPDATED_ROLE, role: { ...emptyRole, ...role }, roleId }), dispatch(getRoles())]))
    .catch(err => commonErrorHandler(err, `There was an error editing the role:`, dispatch));
};

export const removeRole = roleId => dispatch =>
  GeneralApi.delete(`${useradmApiUrl}/roles/${roleId}`)
    .then(() => Promise.all([dispatch({ type: UserConstants.REMOVED_ROLE, roleId }), dispatch(getRoles())]))
    .catch(err => commonErrorHandler(err, `There was an error removing the role:`, dispatch));

/*
  Global settings
*/
export const getGlobalSettings = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/settings`).then(({ data: settings }) => {
    window.sessionStorage.setItem(UserConstants.settingsKeys.initialized, true);
    return Promise.resolve(dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings }));
  });

export const saveGlobalSettings =
  (settings, beOptimistic = false, notify = false) =>
  (dispatch, getState) => {
    if (!window.sessionStorage.getItem(UserConstants.settingsKeys.initialized) && !beOptimistic) {
      return;
    }
    let updatedSettings = { ...getState().users.globalSettings, ...settings };
    if (getCurrentUser(getState()).verified) {
      updatedSettings['2fa'] = twoFAStates.enabled;
    } else {
      delete updatedSettings['2fa'];
    }
    let tasks = [dispatch({ type: UserConstants.SET_GLOBAL_SETTINGS, settings: updatedSettings })];
    return GeneralApi.post(`${useradmApiUrl}/settings`, updatedSettings)
      .then(() => {
        if (notify) {
          tasks.push(dispatch(setSnackbar('Settings saved successfully')));
        }
        return Promise.all(tasks);
      })
      .catch(err => {
        if (beOptimistic) {
          return Promise.all([tasks]);
        }
        console.log(err);
        return commonErrorHandler(err, `The settings couldn't be saved.`, dispatch);
      });
  };

export const saveUserSettings = settings => (dispatch, getState) => {
  if (!getState().users.currentUser) {
    return Promise.resolve();
  }
  const userSettings = getUserSettings(getState());
  const updatedSettings = {
    [getState().users.currentUser]: {
      ...userSettings,
      ...settings
    }
  };
  return dispatch(saveGlobalSettings(updatedSettings));
};

export const get2FAQRCode = () => dispatch =>
  GeneralApi.get(`${useradmApiUrl}/2faqr`).then(res => dispatch({ type: UserConstants.RECEIVED_QR_CODE, value: res.data.qr }));

/*
  Onboarding
*/
export const setShowHelptips = show => (dispatch, getState) => {
  let tasks = [dispatch({ type: UserConstants.SET_SHOW_HELP, show }), dispatch(saveUserSettings({ showHelptips: show }))];
  if (!getOnboardingState(getState()).complete) {
    tasks.push(dispatch({ type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show }));
  }
  return Promise.all(tasks);
};

export const toggleHelptips = () => (dispatch, getState) => {
  const showHelptips = getUserSettings(getState()).showHelptips;
  return dispatch(setShowHelptips(!showHelptips));
};

export const setShowConnectingDialog = show => dispatch => dispatch({ type: UserConstants.SET_SHOW_CONNECT_DEVICE, show: Boolean(show) });

export const setHideAnnouncement = (shouldHide, userId) => (dispatch, getState) => {
  const currentUserId = userId || getCurrentUser(getState()).id;
  const hash = getState().app.hostedAnnouncement ? hashString(getState().app.hostedAnnouncement) : '';
  const announceCookie = cookies.get(`${currentUserId}${hash}`);
  if (shouldHide || (hash.length && typeof announceCookie !== 'undefined')) {
    cookies.set(`${currentUserId}${hash}`, true, { maxAge: 604800 });
    return Promise.resolve(dispatch({ type: AppConstants.SET_ANNOUNCEMENT, announcement: undefined }));
  }
  return Promise.resolve();
};
