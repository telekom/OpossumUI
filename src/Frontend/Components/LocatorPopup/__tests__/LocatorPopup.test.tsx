// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  createTestAppStore,
  renderComponentWithStore,
} from '../../../test-helpers/render-component-with-store';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { getLocatePopupSelectedCriticality } from '../../../state/selectors/locate-popup-selectors';
import { clickOnButton } from '../../../test-helpers/general-test-helpers';
import { setLocatePopupSelectedCriticality } from '../../../state/actions/resource-actions/locate-popup-actions';
import {
  Criticality,
  FrequentLicenses,
  SelectedCriticality,
} from '../../../../shared/shared-types';
import { getLicenseNames, LocatorPopup } from '../LocatorPopup';
import { getLocatePopupSelectedLicenses } from '../../../state/selectors/locate-popup-selectors';
import { expectElementsInAutoCompleteAndSelectFirst } from '../../../test-helpers/general-test-helpers';
import {
  setExternalData,
  setFrequentLicenses,
} from '../../../state/actions/resource-actions/all-views-simple-actions';
import {
  Attributions,
  PackageInfo,
  ResourcesToAttributions,
} from '../../../../shared/shared-types';
import { setLocatePopupSelectedLicenses } from '../../../state/actions/resource-actions/locate-popup-actions';
import { getResourcesWithLocatedAttributions } from '../../../state/selectors/all-views-resource-selectors';

describe('Locator popup ', () => {
  jest.useFakeTimers();

  it('renders', () => {
    renderComponentWithStore(<LocatorPopup />);
    expect(
      screen.getByText('Locate Signals', { exact: true }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Criticality')).toBeInTheDocument();
    expect(screen.getByText('Any')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'License' }),
    ).toBeInTheDocument();
  });

  it('selects criticality values using the dropdown', () => {
    const testStore = createTestAppStore();
    renderComponentWithStore(<LocatorPopup />, { store: testStore });

    fireEvent.mouseDown(screen.getByText('Any').childNodes[0] as Element);

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    fireEvent.click(screen.getByText('High').parentNode as Element);

    expect(getLocatePopupSelectedCriticality(testStore.getState())).toBe(
      SelectedCriticality.Any,
    );

    clickOnButton(screen, 'Apply');

    expect(getLocatePopupSelectedCriticality(testStore.getState())).toBe(
      SelectedCriticality.High,
    );
  });

  it('resets criticality using the Clear button', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(
      setLocatePopupSelectedCriticality(SelectedCriticality.Medium),
    );
    renderComponentWithStore(<LocatorPopup />, { store: testStore });

    expect(screen.getByText('Medium')).toBeInTheDocument();

    clickOnButton(screen, 'Clear');

    expect(screen.getByText('Any')).toBeInTheDocument();
    expect(screen.queryByText('Medium')).not.toBeInTheDocument();

    expect(getLocatePopupSelectedCriticality(testStore.getState())).toBe(
      SelectedCriticality.Any,
    );
  });

  it('sets state if license selected', () => {
    const testStore = createTestAppStore();
    // add external attribution with license MIT to see it
    const testExternalAttribution: PackageInfo = {
      packageName: 'jQuery',
      packageVersion: '16.0.0',
      licenseName: 'MIT',
      comment: 'ManualPackage',
    };
    const testExternalAttributions: Attributions = {
      uuid_1: testExternalAttribution,
    };
    const testResourcesToExternalAttributions: ResourcesToAttributions = {
      '/root/': ['uuid_1'],
    };

    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testResourcesToExternalAttributions,
      ),
    );
    const licenseSet = new Set(['MIT']);
    const expectedLocatedResources = {
      resourcesWithLocatedChildren: new Set(['/']),
      locatedResources: new Set(['/root/']),
    };

    renderComponentWithStore(<LocatorPopup />, { store: testStore });

    expectElementsInAutoCompleteAndSelectFirst(screen, ['MIT']);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }) as Element);
    expect(getLocatePopupSelectedLicenses(testStore.getState())).toEqual(
      licenseSet,
    );
    expect(getResourcesWithLocatedAttributions(testStore.getState())).toEqual(
      expectedLocatedResources,
    );
  });

  it('clears license field if clear button pressed', () => {
    const testStore = createTestAppStore();

    const licenseSet = new Set(['MIT']);
    testStore.dispatch(setLocatePopupSelectedLicenses(licenseSet));

    renderComponentWithStore(<LocatorPopup />, { store: testStore });

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }) as Element);
    expect(getLocatePopupSelectedLicenses(testStore.getState())).toEqual(
      new Set(),
    );
    expect(getResourcesWithLocatedAttributions(testStore.getState())).toEqual({
      resourcesWithLocatedChildren: new Set(),
      locatedResources: new Set(),
    });
  });

  it('shows license if selected beforehand', () => {
    const testStore = createTestAppStore();

    const licenseSet = new Set(['MIT']);
    testStore.dispatch(setLocatePopupSelectedLicenses(licenseSet));

    renderComponentWithStore(<LocatorPopup />, { store: testStore });
    expect(screen.getByDisplayValue('MIT')).toBeInTheDocument();
  });
});

describe('getLicenseNamesFromExternalAttributions', () => {
  it('collects the correct license names', () => {
    const testExternalMITAttribution: PackageInfo = {
      licenseName: 'MIT',
    };
    const testExternalApacheAttribution: PackageInfo = {
      licenseName: 'Apache-2.0',
    };

    const testExternalAttributions: Attributions = {
      uuid_1: testExternalMITAttribution,
      uuid_2: testExternalApacheAttribution,
    };

    const licenseNames = getLicenseNames(testExternalAttributions);
    const expectedLicenseNames = ['MIT', 'Apache-2.0'];
    expect(licenseNames).toEqual(expectedLicenseNames);
  });
});

describe('locateResourcesByCriticalityAndLicense', () => {
  const testAttributions: Attributions = {
    MITHighAttribution: {
      licenseName: 'MIT',
      criticality: Criticality.High,
    },
    MITMediumAttribution: {
      licenseName: 'MIT',
      criticality: Criticality.Medium,
    },
    ApacheHighAttribution: {
      licenseName: 'Apache-2.0',
      criticality: Criticality.High,
    },
    ApacheMediumAttribution: {
      licenseName: 'Apache-2.0',
      criticality: Criticality.Medium,
    },
    GPLMediumAttribution: {
      licenseName: 'General Public License',
      criticality: Criticality.Medium,
    },
  };
  const testResourcesToAttributions: ResourcesToAttributions = {
    '/pathToMITHigh/': ['MITHighAttribution'],
    '/pathToMITHigh/pathToMITMedium': ['MITMediumAttribution'],
    '/pathToApacheHigh': ['ApacheHighAttribution'],
    '/pathToApacheMedium': ['ApacheMediumAttribution'],
    '/pathToGPLMedium': ['GPLMediumAttribution'],
  };
  const testFrequentLicenses: FrequentLicenses = {
    nameOrder: [
      {
        shortName: 'GPL',
        fullName: 'General Public License',
      },
    ],
    texts: {
      GPL: 'GPL license text',
      'General Public License': 'GPL license text',
    },
  };

  it('locates attribution and parent if criticality and licenses are set', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(
      setExternalData(testAttributions, testResourcesToAttributions),
    );
    testStore.dispatch(setFrequentLicenses(testFrequentLicenses));

    const criticality = SelectedCriticality.Medium;
    const licenseNames = new Set(['MIT']);
    testStore.dispatch(setLocatePopupSelectedCriticality(criticality));
    testStore.dispatch(setLocatePopupSelectedLicenses(licenseNames));

    renderComponentWithStore(<LocatorPopup />, { store: testStore });
    clickOnButton(screen, 'Apply');

    const expectedLocatedResources = {
      resourcesWithLocatedChildren: new Set(['/', '/pathToMITHigh/']),
      locatedResources: new Set(['/pathToMITHigh/pathToMITMedium']),
    };
    expect(getResourcesWithLocatedAttributions(testStore.getState())).toEqual(
      expectedLocatedResources,
    );
  });

  it('locates attribution and parent if only licenses set', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(
      setExternalData(testAttributions, testResourcesToAttributions),
    );
    testStore.dispatch(setFrequentLicenses(testFrequentLicenses));

    const licenseNames = new Set(['MIT']);
    testStore.dispatch(setLocatePopupSelectedLicenses(licenseNames));

    renderComponentWithStore(<LocatorPopup />, { store: testStore });
    clickOnButton(screen, 'Apply');

    const expectedLocatedResources = {
      resourcesWithLocatedChildren: new Set(['/', '/pathToMITHigh/']),
      locatedResources: new Set([
        '/pathToMITHigh/',
        '/pathToMITHigh/pathToMITMedium',
      ]),
    };
    expect(getResourcesWithLocatedAttributions(testStore.getState())).toEqual(
      expectedLocatedResources,
    );
  });

  it('locates attribution and parent if only criticality is set', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(
      setExternalData(testAttributions, testResourcesToAttributions),
    );
    testStore.dispatch(setFrequentLicenses(testFrequentLicenses));

    const criticality = SelectedCriticality.Medium;
    testStore.dispatch(setLocatePopupSelectedCriticality(criticality));

    renderComponentWithStore(<LocatorPopup />, { store: testStore });
    clickOnButton(screen, 'Apply');

    const expectedLocatedResources = {
      resourcesWithLocatedChildren: new Set(['/', '/pathToMITHigh/']),
      locatedResources: new Set([
        '/pathToMITHigh/pathToMITMedium',
        '/pathToApacheMedium',
        '/pathToGPLMedium',
      ]),
    };
    expect(getResourcesWithLocatedAttributions(testStore.getState())).toEqual(
      expectedLocatedResources,
    );
  });

  it('locates full name attribution if license is set to frequent license', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(
      setExternalData(testAttributions, testResourcesToAttributions),
    );
    testStore.dispatch(setFrequentLicenses(testFrequentLicenses));

    const criticality = SelectedCriticality.Medium;
    const licenseNames = new Set(['GPL']);
    testStore.dispatch(setLocatePopupSelectedCriticality(criticality));
    testStore.dispatch(setLocatePopupSelectedLicenses(licenseNames));

    renderComponentWithStore(<LocatorPopup />, { store: testStore });
    clickOnButton(screen, 'Apply');

    const expectedLocatedResources = {
      resourcesWithLocatedChildren: new Set(['/']),
      locatedResources: new Set(['/pathToGPLMedium']),
    };

    expect(getResourcesWithLocatedAttributions(testStore.getState())).toEqual(
      expectedLocatedResources,
    );
  });
});