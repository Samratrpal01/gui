import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import OrgDataEntry from './orgdata-entry';

describe('Login Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<OrgDataEntry classes={{ orgData: 'test' }} data={{}} setSnackbar={jest.fn} onSubmit={jest.fn} recaptchaSiteKey="test" />);
    const view = baseElement.getElementsByTagName('div')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
