import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Artifacts from '../components/artifacts/artifacts';
import Dashboard from '../components/dashboard/dashboard';
import Deployments from '../components/deployments/deployments';
import Devices from '../components/devices/device-groups';
import Help from '../components/help/help';
import Settings from '../components/settings/settings';
import Login from '../components/login/login';
import Password from '../components/login/password';
import PasswordReset from '../components/login/passwordreset';
import Signup from '../components/login/signup';
import AuditLogs from '../components/auditlogs/auditlogs';
import { DEVICE_STATES } from '../constants/deviceConstants';

const { accepted, pending, preauth, rejected } = DEVICE_STATES;

export const privateRoutes = (
  <Switch>
    <Route exact path="/" component={Dashboard} />
    <Route path="/auditlog/:filters?" component={AuditLogs} />
    <Route path={`/devices/:status(${accepted}|${pending}|${preauth}|${rejected})?/:filters?`} component={Devices} />
    <Route path="/releases/:artifactVersion?" component={Artifacts} />
    <Route path="/deployments/:tab(active|scheduled|finished)?" component={Deployments} />
    <Route path="/settings/:section?" component={Settings} />
    <Route path="/help" component={Help} />
    <Route component={Dashboard} />
  </Switch>
);

export const publicRoutes = (
  <Switch>
    <Route path="/login" component={Login} />
    <Route exact path="/password" component={Password} />
    <Route exact path="/password/:secretHash" component={PasswordReset} />
    <Route path="/signup/:campaign?" component={Signup} />
    <Route component={Login} />
  </Switch>
);
