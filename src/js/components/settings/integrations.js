import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, MenuItem, Select, TextField } from '@mui/material';

import { changeIntegration, createIntegration, deleteIntegration, getIntegrations } from '../../actions/organizationActions';
import { EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import Confirm from '../common/confirm';
import InfoHint from '../common/info-hint';

const maxWidth = 750;

export const IntegrationConfiguration = ({ integration, onCancel, onDelete, onSave }) => {
  const { credentials = {}, provider } = integration;
  const connectionString = credentials[EXTERNAL_PROVIDER[provider].credentialsAttribute] || '';
  const [connectionConfig, setConnectionConfig] = useState(connectionString);
  const [isEditing, setIsEditing] = useState(!connectionString);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const { credentials = {}, provider } = integration;
    const connectionString = credentials[EXTERNAL_PROVIDER[provider].credentialsAttribute] || '';
    setConnectionConfig(connectionString);
    setIsEditing(!connectionString);
  }, [integration]);

  const onCancelClick = () => {
    setIsEditing(false);
    setConnectionConfig(connectionString);
    onCancel(integration);
  };
  const onDeleteClick = () => setIsDeleting(true);
  const onDeleteConfirm = () => onDelete(integration);
  const onEditClick = () => setIsEditing(true);
  const onSaveClick = () =>
    onSave({
      ...integration,
      credentials: {
        type: EXTERNAL_PROVIDER[provider].credentialsType,
        [EXTERNAL_PROVIDER[provider].credentialsAttribute]: connectionConfig
      }
    });

  const updateConnectionConfig = ({ target: { value = '' } }) => setConnectionConfig(value);

  const { configHint, title } = EXTERNAL_PROVIDER[provider];
  return (
    <>
      <h3 className="margin-bottom-none">{title}</h3>
      <div className="flexbox space-between relative" style={{ alignItems: 'flex-end', maxWidth }}>
        <TextField
          disabled={!isEditing}
          InputLabelProps={{ shrink: !!connectionConfig }}
          label={`${title} connection string`}
          multiline
          onChange={updateConnectionConfig}
          style={{ minWidth: 500, wordBreak: 'break-all' }}
          value={connectionConfig}
        />
        <div className="flexbox">
          {isEditing ? (
            <>
              <Button onClick={onCancelClick} style={{ marginRight: 10 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onSaveClick} disabled={connectionString === connectionConfig}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onEditClick} style={{ marginRight: 10 }}>
                Edit
              </Button>
              <Button onClick={onDeleteClick}>Delete</Button>
            </>
          )}
        </div>
        {isDeleting && (
          <Confirm type="integrationRemoval" classes="confirmation-overlay" action={onDeleteConfirm} cancel={() => setIsDeleting(false)} style={{}} />
        )}
      </div>
      <InfoHint content={configHint} style={{ maxWidth }} />
    </>
  );
};

export const Integrations = ({ integrations = [], changeIntegration, createIntegration, deleteIntegration, getIntegrations }) => {
  const [availableIntegrations, setAvailableIntegrations] = useState([]);
  const [configuredIntegrations, setConfiguredIntegrations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    const { available, needsUpdate } = Object.values(EXTERNAL_PROVIDER).reduce(
      (accu, provider) => {
        const hasIntegrationConfigured = integrations.some(integration => integration.provider == provider.provider);
        if (provider.enabled && !hasIntegrationConfigured) {
          accu.available.push(provider);
        }
        if (hasIntegrationConfigured && availableIntegrations.some(availableIntegration => availableIntegration.provider === provider.provider)) {
          accu.needsUpdate = true;
        }
        return accu;
      },
      { available: [], needsUpdate: !(availableIntegrations.length || integrations.length) }
    );
    if (needsUpdate) {
      setAvailableIntegrations(available);
    }
    setConfiguredIntegrations(integrations);
    setIsCreating(!!integrations.length);
  }, [integrations]);

  useEffect(() => {
    getIntegrations();
  }, []);

  const onConfigureIntegration = ({ target: { value: provider = '' } }) => {
    setCurrentValue(provider);
    setConfiguredIntegrations([{ id: 'new', provider }, ...configuredIntegrations]);
    setIsCreating(true);
  };

  const onCancelClick = ({ connectionString }) => {
    setIsCreating(!!connectionString);
    setCurrentValue('');
    setConfiguredIntegrations(integrations);
  };

  const onSaveClick = integration => {
    if (integration.id === 'new') {
      createIntegration(integration);
    } else {
      changeIntegration(integration);
    }
    setCurrentValue('');
    return setIsCreating(isCreating && !integration.connectionString ? false : isCreating);
  };

  return (
    <div>
      <h2 className="margin-top-small">Integrations</h2>
      {!isCreating && !!availableIntegrations.length && (
        <Select displayEmpty onChange={onConfigureIntegration} value={currentValue} style={{ minWidth: 300 }}>
          <MenuItem value="">Add new integration</MenuItem>
          {availableIntegrations.map(item => (
            <MenuItem key={item.provider} value={item.provider}>
              {item.title}
            </MenuItem>
          ))}
        </Select>
      )}
      {configuredIntegrations.map(integration => (
        <IntegrationConfiguration key={integration.id} integration={integration} onCancel={onCancelClick} onDelete={deleteIntegration} onSave={onSaveClick} />
      ))}
    </div>
  );
};

const actionCreators = { changeIntegration, createIntegration, deleteIntegration, getIntegrations };

const mapStateToProps = state => {
  return {
    integrations: state.organization.externalDeviceIntegrations
  };
};

export default connect(mapStateToProps, actionCreators)(Integrations);
