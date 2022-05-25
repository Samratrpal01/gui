import React, { useState } from 'react';
import moment from 'moment';

import { FormControl, ListSubheader, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/lab';

import PhaseSettings from './phasesettings';
import EnterpriseNotification from '../../common/enterpriseNotification';

const styles = {
  textField: {
    minWidth: 400
  },
  infoStyle: {
    minWidth: 400,
    borderBottom: 'none'
  },
  pickerStyle: {
    width: 'min-content'
  }
};

const renderInput = params => <TextField {...params} />;

export const ScheduleRollout = props => {
  const { setDeploymentSettings, deploymentObject = {}, disableSchedule, isEnterprise, plan, previousPhases = [] } = props;

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { deploymentDeviceCount = 0, deploymentDeviceIds = [], filterId, phases = [] } = deploymentObject;

  const handleStartTimeChange = value => {
    // if there is no existing phase, set phase and start time
    if (!phases.length) {
      setDeploymentSettings({ ...deploymentObject, phases: [{ batch_size: 100, start_ts: value, delay: 0 }] });
    } else {
      //if there are existing phases, set the first phases to the new start time and adjust later phases in different function
      let newPhases = phases;
      newPhases[0].start_ts = value;
      setDeploymentSettings({ ...deploymentObject, phases: newPhases });
    }
  };

  const handleStartChange = event => {
    // To be used with updated datetimepicker to open programmatically
    if (event.target.value) {
      setIsPickerOpen(true);
    } else {
      handleStartTimeChange();
    }
  };

  const handlePatternChange = ({ target: { value } }) => {
    let updatedPhases = [];
    // check if a start time already exists from props and if so, use it
    const phaseStart = phases.length ? { start_ts: phases[0].start_ts } : {};
    // if setting new custom pattern we use default 2 phases
    // for small groups get minimum batch size containing at least 1 device
    const minBatch = deploymentDeviceCount < 10 && !filterId ? Math.ceil((1 / deploymentDeviceCount) * 100) : 10;
    switch (value) {
      case 0:
        updatedPhases = [{ batch_size: 100, ...phaseStart }];
        break;
      case 1:
        updatedPhases = [{ batch_size: minBatch, delay: 2, delayUnit: 'hours', ...phaseStart }, {}];
        break;
      default:
        // have to create a deep copy of the array to prevent overwriting, due to nested objects in the array
        updatedPhases = JSON.parse(JSON.stringify(value));
        break;
    }
    setDeploymentSettings({ ...deploymentObject, phases: updatedPhases });
  };

  const numberDevices = deploymentDeviceCount ? deploymentDeviceCount : deploymentDeviceIds ? deploymentDeviceIds.length : 0;
  const start_time = phases && phases.length ? phases[0].start_ts : null;
  const customPattern = phases && phases.length > 1 ? 1 : 0;

  const previousPhaseOptions =
    previousPhases.length > 0
      ? previousPhases.map((previousPhaseSetting, index) => (
          <MenuItem key={`previousPhaseSetting-${index}`} value={previousPhaseSetting}>
            {previousPhaseSetting.reduce((accu, phase) => {
              const phaseDescription = phase.delay ? `${phase.batch_size}% > ${phase.delay} ${phase.delayUnit || 'hours'} >` : `${phase.batch_size}%`;
              return `${accu} ${phaseDescription}`;
            }, `${previousPhaseSetting.length} phases:`)}
          </MenuItem>
        ))
      : [
          <MenuItem key="noPreviousPhaseSetting" disabled={true} style={{ opacity: '0.4' }}>
            No recent patterns
          </MenuItem>
        ];

  const deploymentTimeNotification = (
    <Tooltip
      title="This time is relative to the server only – each device’s time zone will not be taken into account. Devices across different time zones will receive the update at the same time."
      placement="top"
    >
      <InfoIcon className="fadeIn" fontSize="small" />
    </Tooltip>
  );

  const canSchedule = isEnterprise || plan === 'professional';
  const startTime = moment(start_time);
  return (
    <form className="flexbox column  margin margin-top-none" style={{ overflow: 'visible', minHeight: 300 }}>
      <div className="deployment-scheduling-view">
        <FormControl style={{ ...styles.pickerStyle, marginBottom: isPickerOpen || start_time ? 0 : 30 }}>
          <h4>Select a start time</h4>
          <Select onChange={handleStartChange} value={start_time ? 'custom' : 0} style={styles.textField}>
            <MenuItem value={0}>Start immediately</MenuItem>
            <MenuItem value="custom">Schedule the start date &amp; time</MenuItem>
          </Select>
        </FormControl>
        <div />
        {isPickerOpen || start_time ? (
          <>
            <FormControl className="margin-bottom" style={styles.pickerStyle}>
              <DateTimePicker
                ampm={false}
                open={isPickerOpen}
                onOpen={() => setIsPickerOpen(true)}
                onClose={() => setIsPickerOpen(false)}
                label={canSchedule ? 'Set the start time' : 'Starting at'}
                value={startTime}
                style={styles.textField}
                minDateTime={moment()}
                disabled={!canSchedule}
                onChange={date => handleStartTimeChange(date.toISOString())}
                renderInput={renderInput}
              />
            </FormControl>
            {deploymentTimeNotification}
          </>
        ) : null}
        <FormControl style={{ ...styles.pickerStyle, maxWidth: 515 }}>
          <h4>Select a rollout pattern</h4>
          <Select onChange={handlePatternChange} value={customPattern} style={styles.textField} disabled={!isEnterprise}>
            <MenuItem value={0}>Single phase: 100%</MenuItem>
            {(numberDevices > 1 || filterId) && [
              <MenuItem key="customPhaseSetting" divider={true} value={1}>
                Custom
              </MenuItem>,
              <ListSubheader key="phaseSettingsSubheader">Recent patterns</ListSubheader>,
              ...previousPhaseOptions
            ]}
          </Select>
        </FormControl>
        {customPattern ? deploymentTimeNotification : <div />}
      </div>
      <EnterpriseNotification isEnterprise={isEnterprise} benefit="choose to roll out deployments in multiple phases" />
      {customPattern ? <PhaseSettings classNames="margin-bottom-small" disabled={disableSchedule} numberDevices={numberDevices} {...props} /> : null}
    </form>
  );
};

export default ScheduleRollout;
