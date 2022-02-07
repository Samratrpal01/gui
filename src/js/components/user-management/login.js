import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { Button } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';

import loginLogo from '../../../assets/img/loginlogo.png';
import { setSnackbar } from '../../actions/appActions';
import { loginUser, logoutUser } from '../../actions/userActions';
import { getToken } from '../../auth';
import { useradmApiUrl } from '../../constants/userConstants';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import { getCurrentUser } from '../../selectors';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormCheckbox from '../common/forms/formcheckbox';
import { MenderTooltipClickable } from '../common/mendertooltip';

import { OAuth2Providers } from './oauth2providers';
import LinedHeader from '../common/lined-header';

const cookies = new Cookies();

export const Login = ({ currentUser, isHosted, loginUser, logoutUser, setSnackbar }) => {
  const [noExpiry] = useState(cookies.get('noExpiry'));
  const [refresh, setRefresh] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const twoFARef = useRef();

  useEffect(() => {
    clearAllRetryTimers(setSnackbar);
    if (getToken()) {
      logoutUser();
    }
    const loginError = cookies.get('error');
    if (loginError) {
      setSnackbar(loginError, 10000);
      cookies.remove('error');
    }
    return () => {
      setSnackbar('');
    };
  }, []);

  useEffect(() => {
    if (currentUser.id) {
      setSnackbar('');
    }
  }, [currentUser]);

  const onLoginClick = loginData =>
    loginUser(loginData).catch(err => {
      // don't reset the state once it was set - thus not setting `has2FA` solely based on the existence of 2fa in the error
      if (err?.error?.includes('2fa')) {
        setHas2FA(true);
      }
    });

  const onSetRef = ref => {
    twoFARef.current = ref;
    setRefresh(!refresh);
  };

  const onOAuthClick = ({ target: { textContent } }) => {
    const providerId = OAuth2Providers.find(provider => provider.name === textContent).id;
    const oauthTimeout = new Date();
    oauthTimeout.setDate(oauthTimeout.getDate() + 7);
    window.localStorage.setItem('oauth', `${oauthTimeout.getTime()}`);
    window.location.replace(`${useradmApiUrl}/oauth2/${providerId}`);
  };

  let twoFAAnchor = {};
  if (twoFARef.current) {
    twoFAAnchor = {
      right: -120,
      top: twoFARef.current.parentElement.parentElement.offsetTop + twoFARef.current.parentElement.parentElement.offsetHeight / 2
    };
  }

  return (
    <div className="flexbox column padding-bottom margin-bottom" id="login-box">
      <h3>Log in</h3>
      <img src={loginLogo} alt="mender-logo" className="margin-bottom-small" />

      {isHosted && (
        <>
          <div className="flexbox centered margin-bottom">Log in with:</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {OAuth2Providers.map(provider => (
              <Button className="oauth-provider" variant="contained" key={provider.id} onClick={onOAuthClick} startIcon={provider.icon}>
                {provider.name}
              </Button>
            ))}
          </div>
          <LinedHeader
            className="margin-top-large"
            heading="or your email address"
            innerStyle={{ padding: 15, top: -24 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}

      <Form showButtons={true} buttonColor="primary" onSubmit={onLoginClick} submitLabel="Log in" submitButtonId="login_button" style={{ maxWidth: 400 }}>
        <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
        <PasswordInput className="margin-bottom-small" id="password" label="Password" required={true} />
        {isHosted ? (
          <div className="flexbox">
            <Link style={{ marginLeft: '4px' }} to="/password">
              Forgot your password?
            </Link>
          </div>
        ) : (
          <div />
        )}
        {has2FA ? (
          <TextInput
            hint="Two Factor Authentication Code"
            label="Two Factor Authentication Code"
            id="token2fa"
            validations="isLength:6,isNumeric"
            required={true}
            setControlRef={onSetRef}
          />
        ) : (
          <div />
        )}
        <FormCheckbox id="noExpiry" label="Stay logged in" checked={noExpiry === 'true'} />
      </Form>
      {isHosted && (
        <>
          {twoFARef.current && (
            <MenderTooltipClickable
              disableHoverListener={false}
              placement="right"
              className="absolute"
              style={twoFAAnchor}
              title={
                <div style={{ maxWidth: 300 }}>
                  Two Factor Authentication is enabled for your account. If you haven&apos;t set up a 3rd party authentication app with a verification code,
                  please contact an administrator.
                </div>
              }
            >
              <HelpIcon />
            </MenderTooltipClickable>
          )}
          <div className="margin-top muted">
            <div className="flexbox centered">
              Don&#39;t have an account?{' '}
              <Link style={{ marginLeft: '4px' }} to="/signup">
                Sign up here
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const actionCreators = { loginUser, logoutUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: getCurrentUser(state),
    isHosted: state.app.features.isHosted
  };
};

export default connect(mapStateToProps, actionCreators)(Login);
