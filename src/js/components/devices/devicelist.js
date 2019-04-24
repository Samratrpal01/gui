import React from 'react';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

// material ui
import Checkbox from '@material-ui/core/Checkbox';

import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';

import AppActions from '../../actions/app-actions';
import Loader from '../common/loader';
import DeviceListItem from './devicelistitem';

export default class DeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expandRow: null
    };
  }

  componentDidUpdate(prevProps) {
    var self = this;
    const { group } = self.props;

    if (prevProps.group !== group) {
      self.setState({ textfield: group ? decodeURIComponent(group) : 'All devices' });
    }
  }

  _expandRow(event, rowNumber) {
    const self = this;
    if (event.target.closest('input') && event.target.closest('input').hasOwnProperty('checked')) {
      return;
    }
    AppActions.setSnackbar('');
    if (self.state.expandRow === rowNumber) {
      rowNumber = null;
    }
    self.setState({ expandRow: rowNumber });
  }

  _isSelected(index) {
    return this.props.onSelect && this.props.selectedRows.indexOf(index) !== -1;
  }

  _onRowSelection(selectedRow) {
    const self = this;
    const { onSelect, selectedRows } = self.props;
    const selectedIndex = selectedRows.indexOf(selectedRow);
    let updatedSelection = [];
    if (selectedIndex === -1) {
      updatedSelection = updatedSelection.concat(selectedRows, selectedRow);
    } else {
      selectedRows.splice(selectedIndex, 1);
      updatedSelection = selectedRows;
    }
    onSelect(updatedSelection);
  }

  onSelectAllClick() {
    const self = this;
    let selectedRows = Array.apply(null, { length: this.props.devices.length }).map(Number.call, Number);
    if (self.props.selectedRows.length && self.props.selectedRows.length <= self.props.devices.length) {
      selectedRows = [];
    }
    self.props.onSelect(selectedRows);
  }

  onPageChange(page) {
    this.props.onPageChange(page);
    this.setState({ expandRow: null });
  }

  render() {
    const self = this;
    const { columnHeaders, devices, pageLength, pageLoading, pageNo, pageTotal, onSelect, selectedRows } = self.props;
    const { sortCol, sortDown, expandRow } = self.state;
    const columnWidth = `${100 / columnHeaders.length}%`;
    const numSelected = (selectedRows || []).length;
    return (
      <div>
        <div className="flexbox inventoryTable" style={{ padding: '0 12px' }}>
          {onSelect ? (
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < devices.length}
              checked={numSelected === devices.length}
              onChange={() => self.onSelectAllClick()}
              style={{ marginRight: 12 }}
            />
          ) : null}

          {columnHeaders.map(item => (
            <div className="columnHeader" key={item.name} style={{ width: item.width || columnWidth, paddingRight: 12 }}>
              {item.title}
              {item.sortable ? <SortIcon className={`sortIcon ${sortCol === item.name ? 'selected' : ''} ${sortDown.toString()}`} /> : null}
              {item.customize ? <SettingsIcon onClick={item.customize} style={{ fontSize: 16, marginLeft: 'auto' }} /> : null}
            </div>
          ))}
          <div style={{ width: 48 }} />
        </div>
        {devices.map((device, index) => (
          <DeviceListItem
            {...self.props}
            device={device}
            expanded={expandRow === index}
            key={`device-${index}`}
            selectable={!!onSelect}
            selected={self._isSelected(index)}
            onClick={event => self._expandRow(event, index)}
            onRowSelect={() => self._onRowSelection(index)}
          />
        ))}
        <div className="margin-top">
          <Pagination locale={_en_US} simple pageSize={pageLength} current={pageNo} total={pageTotal} onChange={e => self.onPageChange(e)} />
          {pageLoading ? (
            <div className="smallLoaderContainer">
              <Loader show={true} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
