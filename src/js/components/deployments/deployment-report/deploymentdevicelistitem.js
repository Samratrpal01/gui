import React from 'react';
import { Link } from 'react-router-dom';

// material ui
import { Button, LinearProgress, TableCell, TableRow } from '@mui/material';

import { deploymentSubstates } from '../../../constants/deploymentConstants';
import { rootfsImageVersion as rootfsImageVersionAttribute } from '../../../constants/releaseConstants';
import { formatTime } from '../../../helpers';
import DeviceIdentityDisplay from '../../common/deviceidentity';
import { MaybeTime } from '../../common/time';

const stateTitleMap = {
  noartifact: 'No compatible artifact found',
  'already-installed': 'Already installed',
  'pause-before-installing': 'Paused before installing',
  'pause-before-rebooting': 'Paused before rebooting',
  'pause-before-committing': 'Paused before committing'
};

const determinedStateMap = {
  'noartifact': 0,
  'aborted': 100,
  'already-installed': 100,
  'failure': 100,
  'success': 100
};

const undefinedStates = [deploymentSubstates.pending, deploymentSubstates.decommissioned, deploymentSubstates.alreadyInstalled];

const DeploymentDeviceListItem = ({ device, idAttribute, userCapabilities, viewLog }) => {
  const { attempts, attributes = {}, created, finished, id = 'id', log, retries, substate, status = '' } = device;
  const { canReadReleases } = userCapabilities;

  const { artifact_name, device_type: deviceTypes = [], [rootfsImageVersionAttribute]: rootfsImageVersion } = attributes;
  const softwareName = rootfsImageVersion || artifact_name;
  const encodedArtifactName = encodeURIComponent(softwareName);
  const currentArtifactLink = softwareName ? (
    canReadReleases ? (
      <Link style={{ fontWeight: 'initial' }} to={`/releases/${encodedArtifactName}`}>
        {softwareName}
      </Link>
    ) : (
      softwareName
    )
  ) : (
    '-'
  );

  const statusTitle = stateTitleMap[status] || status;

  const devicePercentage = determinedStateMap[status];

  const progressColor = statusTitle && (statusTitle.toLowerCase() === 'failure' || statusTitle.toLowerCase() === 'aborted') ? 'secondary' : 'primary';

  return (
    <TableRow>
      <TableCell>
        <Link style={{ fontWeight: 'initial', opacity: idAttribute === 'name' ? 0.6 : 1 }} to={`/devices?id=${id}`}>
          <DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} />
        </Link>
      </TableCell>
      <TableCell>{deviceTypes.length ? deviceTypes.join(',') : '-'}</TableCell>
      <TableCell>{currentArtifactLink}</TableCell>
      <TableCell>{<MaybeTime value={formatTime(created)} />}</TableCell>
      <TableCell>{<MaybeTime value={formatTime(finished)} />}</TableCell>
      {retries ? (
        <TableCell>
          {attempts || 1}/{retries + 1}
        </TableCell>
      ) : null}
      <TableCell style={{ paddingRight: '0px', position: 'relative', minWidth: 200 }}>
        {substate ? (
          <div className="flexbox">
            <div className="capitalized-start" style={{ verticalAlign: 'top' }}>{`${statusTitle}: `}</div>
            <div className="substate">{substate}</div>
          </div>
        ) : (
          statusTitle
        )}
        {!undefinedStates.includes(status.toLowerCase()) && (
          <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <LinearProgress color={progressColor} value={devicePercentage} variant={devicePercentage !== undefined ? 'determinate' : 'indeterminate'} />
          </div>
        )}
      </TableCell>
      <TableCell>{log ? <Button onClick={() => viewLog(id)}>View log</Button> : null}</TableCell>
    </TableRow>
  );
};

export default DeploymentDeviceListItem;
