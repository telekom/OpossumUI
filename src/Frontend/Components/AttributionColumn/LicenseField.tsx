// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement } from 'react';
import { InputElementProps } from '../InputElements/shared';
import { FrequentLicenseName } from '../../../shared/shared-types';
import { AutoComplete } from '../InputElements/AutoComplete';

function isPresentInOptions(
  inputValue: string,
  frequentLicenseNames: Array<FrequentLicenseName>
): boolean {
  const matchesValue = (licenseName: FrequentLicenseName): boolean =>
    licenseName.shortName === inputValue || licenseName.fullName === inputValue;
  return frequentLicenseNames.some(matchesValue);
}

function combineLicenseNames(licenseName: FrequentLicenseName): string {
  return licenseName.shortName + ' - ' + licenseName.fullName;
}

function getFormattedLicenseNamesToShortNameMapping(
  frequentLicenseNames: Array<FrequentLicenseName>
): {
  [key: string]: string;
} {
  return Object.fromEntries(
    frequentLicenseNames.map((option: FrequentLicenseName) => [
      combineLicenseNames(option),
      option.shortName,
    ])
  );
}

interface LicenseFieldProps extends InputElementProps {
  frequentLicenseNames: Array<FrequentLicenseName>;
  endAdornmentText?: string;
}

export function LicenseField(props: LicenseFieldProps): ReactElement {
  const formattedLicenseNamesToShortNameMapping =
    getFormattedLicenseNamesToShortNameMapping(props.frequentLicenseNames);

  function formatOptionForDisplay(option: string): string {
    return formattedLicenseNamesToShortNameMapping[option]
      ? formattedLicenseNamesToShortNameMapping[option]
      : option;
  }

  const inputValue = props.text || '';
  const inputValueIsInOptions = isPresentInOptions(
    inputValue,
    props.frequentLicenseNames
  );

  return (
    <AutoComplete
      isEditable={props.isEditable}
      sx={props.sx}
      title={props.title}
      handleChange={props.handleChange}
      isHighlighted={props.isHighlighted}
      options={Object.keys(formattedLicenseNamesToShortNameMapping)}
      endAdornmentText={props.endAdornmentText}
      inputValue={inputValue}
      showTextBold={inputValueIsInOptions}
      formatOptionForDisplay={formatOptionForDisplay}
    />
  );
}