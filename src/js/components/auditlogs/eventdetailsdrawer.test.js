import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import EventDetailsDrawer from './eventdetailsdrawer';

describe('EventDetailsDrawer Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<EventDetailsDrawer eventItem={defaultState.organization.auditlog.events[0]} onClose={jest.fn} open={true} />);
    const view = baseElement.getElementsByClassName('MuiDrawer-paper')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
