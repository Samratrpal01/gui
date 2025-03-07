import React, { useEffect, useState } from 'react';

// material ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import { TIMEOUTS } from '../../../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../../../constants/deviceConstants';
import Loader from '../../common/loader';
import Pagination from '../../common/pagination';
import DeploymentDeviceListItem from './deploymentdevicelistitem';

const { page: defaultPage } = DEVICE_LIST_DEFAULTS;

const deviceListColumns = ['Device type', 'Current software', 'Started', 'Finished', 'Attempts', 'Deployment status', ''];

export const DeploymentDeviceList = ({
  deployment,
  getDeploymentDevices,
  getDeviceAuth,
  getDeviceById,
  idAttribute,
  selectedDeviceIds,
  selectedDevices,
  userCapabilities,
  viewLog
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [loadingDone, setLoadingDone] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const { device_count = 0, retries, totalDeviceCount: totalDevices } = deployment;
  const totalDeviceCount = totalDevices ?? device_count;

  useEffect(() => {
    setCurrentPage(defaultPage);
  }, [perPage]);

  useEffect(() => {
    // only update those that have changed & lack data
    const lackingData = selectedDevices.reduce((accu, device) => {
      if (!device.identity_data || !device.attributes || Object.keys(device.attributes).length === 0) {
        accu.push(device.id);
      }
      return accu;
    }, []);
    // get device artifact, inventory and identity details not listed in schedule data
    lackingData.map(deviceId => Promise.all([getDeviceById(deviceId), getDeviceAuth(deviceId)]));
  }, [selectedDeviceIds]);

  useEffect(() => {
    if (!(deployment.id && loadingDone)) {
      return;
    }
    getDeploymentDevices(deployment.id, { page: currentPage, perPage });
  }, [currentPage, deployment.status, deployment.stats, loadingDone]);

  useEffect(() => {
    setTimeout(() => setLoadingDone(true), TIMEOUTS.oneSecond);
  }, []);

  return (
    <>
      <Loader show={!loadingDone} />
      {!!totalDeviceCount && (
        <div>
          <Table style={{ minHeight: '10vh', maxHeight: '40vh', overflowX: 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell>{idAttribute}</TableCell>
                {deviceListColumns.map((content, index) =>
                  content != 'Attempts' || retries ? <TableCell key={`device-list-header-${index + 1}`}>{content}</TableCell> : null
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedDevices.map(device => (
                <DeploymentDeviceListItem key={device.id} device={device} idAttribute={idAttribute} userCapabilities={userCapabilities} viewLog={viewLog} />
              ))}
            </TableBody>
          </Table>
          <Pagination count={totalDeviceCount} rowsPerPage={perPage} onChangePage={setCurrentPage} onChangeRowsPerPage={setPerPage} page={currentPage} />
        </div>
      )}
    </>
  );
};

export default DeploymentDeviceList;
