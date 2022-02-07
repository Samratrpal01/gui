import React, { Fragment, useState } from 'react';

import copy from 'copy-to-clipboard';

// material ui
import { Tooltip } from '@mui/material';
import { FileCopyOutlined as CopyToClipboardIcon } from '@mui/icons-material';

const ValueColumn = ({ value, setSnackbar }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const onClick = () => {
    if (setSnackbar) {
      let copyable = value;
      if (React.isValidElement(value)) {
        copyable = value.props.value;
      }
      copy(copyable);
      setSnackbar('Value copied to clipboard');
    }
  };
  return (
    <div
      className={`flexbox ${setSnackbar ? 'clickable' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {value}
      {setSnackbar && (
        <Tooltip title={'Copy to clipboard'} placement="top" open={tooltipVisible}>
          <CopyToClipboardIcon color="primary" className={`margin-left-small ${tooltipVisible ? 'fadeIn' : 'fadeOut'}`} fontSize="small"></CopyToClipboardIcon>
        </Tooltip>
      )}
    </div>
  );
};

export const TwoColumnData = ({ className = '', compact, chipLikeKey = true, config, setSnackbar, style }) => {
  return (
    <div className={`break-all two-columns column-data ${compact ? 'compact' : ''} ${className}`} style={style}>
      {Object.entries(config).map(([key, value]) => (
        <Fragment key={key}>
          <div className={`align-right ${chipLikeKey ? 'key' : ''} muted`}>
            <b>{key}</b>
          </div>
          <ValueColumn setSnackbar={setSnackbar} value={value} />
        </Fragment>
      ))}
    </div>
  );
};

export const TwoColumnDataMultiple = ({ className = '', config, style, ...props }) => (
  <div className={`two-columns-multiple ${className}`} style={{ ...style }}>
    {Object.entries(config).map(([key, value]) => (
      <TwoColumnData className="multiple" config={{ [key]: value }} key={key} compact {...props} />
    ))}
  </div>
);

export const ConfigurationObject = ({ config, ...props }) => {
  const content = Object.entries(config).reduce((accu, [key, value]) => {
    accu[key] = `${value}`;
    return accu;
  }, {});
  return <TwoColumnData {...props} config={content} />;
};

export default ConfigurationObject;
