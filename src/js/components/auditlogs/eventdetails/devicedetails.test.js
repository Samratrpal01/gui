import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceDetails from './devicedetails';

describe('DeviceDetails Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <DeviceDetails device={defaultState.devices.byId.a1} item={defaultState.organization.auditlog.events[2]} onClose={jest.fn} />
    );

    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
