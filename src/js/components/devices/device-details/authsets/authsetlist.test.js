import React from 'react';

import { DEVICE_STATES } from '../../../../constants/deviceConstants';
import { undefineds } from '../../../../../../tests/mockData';
import { render } from '../../../../../../tests/setupTests';
import AuthsetList from './authsetlist';

describe('AuthsetList Component', () => {
  it('renders correctly', async () => {
    const authset = {
      id: '123',
      identity_data: { mac: '24:7d:30:90:21:a8' },
      pubkey: `-----BEGIN PUBLIC KEY-----
MIIBoj
-----END PUBLIC KEY-----
`,
      ts: '2020-09-21T12:42:34.571Z',
      status: 'accepted'
    };
    const authSets = Object.keys(DEVICE_STATES).reduce((accu, status, index) => {
      accu.push({ ...authset, id: `${status}-${index}`, status, ts: `2020-09-21T12:${42 + index - 5}:34.571Z` });
      accu.push({ ...authset, id: `${status}-${index}`, status, ts: `2020-09-21T12:${42 + index}:34.571Z` });
      accu.push({ ...authset, id: `${status}-${index}`, status, ts: `2020-09-21T12:${42 + index + 5}:34.571Z` });
      return accu;
    }, []);
    const device = {
      id: 'a7503dcc-afb6-4926-897e-3b1346d1600f',
      attributes: { device_type: [], artifact_name: '' },
      updated_ts: '2020-09-21T12:42:38.751Z',
      identity_data: { mac: '24:7d:30:90:21:a8', status: 'accepted' },
      status: 'accepted',
      created_ts: '2020-09-21T12:42:34.567Z',
      auth_sets: authSets
    };

    const { baseElement } = render(<AuthsetList device={device} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
