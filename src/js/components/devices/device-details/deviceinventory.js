import React from 'react';

import { extractSoftware } from '../../../helpers';
import { TwoColumnDataMultiple } from '../../common/configurationobject';
import DeviceDataCollapse from './devicedatacollapse';
import DeviceInventoryLoader from './deviceinventoryloader';

export const DeviceInventory = ({ device, docsVersion, setSnackbar }) => {
  const { attributes = {} } = device;

  const { device_type, ...remainingAttributes } = attributes;

  const { nonSoftware } = extractSoftware(attributes);
  const keyAttributeCount = Object.keys(attributes).length - Object.keys(remainingAttributes).length;
  const { deviceInventory, keyContent } = nonSoftware
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, attribute, index) => {
        if (attribute[0] === 'device_type') {
          return accu;
        }
        const attributeValue = Array.isArray(attribute[1]) ? attribute[1].join(',') : attribute[1];
        if (index < keyAttributeCount) {
          accu.keyContent[attribute[0]] = attributeValue;
        } else {
          accu.deviceInventory[attribute[0]] = attributeValue;
        }
        return accu;
      },
      { deviceInventory: {}, keyContent: { device_type } }
    );

  const waiting = !Object.values(attributes).some(i => i);
  return (
    <DeviceDataCollapse
      header={
        waiting ? (
          <DeviceInventoryLoader docsVersion={docsVersion} />
        ) : (
          <TwoColumnDataMultiple config={keyContent} setSnackbar={setSnackbar} style={{ marginBottom: 5 }} />
        )
      }
      title="Device inventory"
    >
      <TwoColumnDataMultiple config={deviceInventory} setSnackbar={setSnackbar} />
    </DeviceDataCollapse>
  );
};

export default DeviceInventory;
