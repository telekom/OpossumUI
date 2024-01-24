// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import MuiBox from '@mui/material/Box';
import { ReactElement } from 'react';

import { DisplayPackageInfo } from '../../../shared/shared-types';
import { setTemporaryDisplayPackageInfo } from '../../state/actions/resource-actions/all-views-simple-actions';
import { useAppDispatch } from '../../state/hooks';
import { isImportantAttributionInformationMissing } from '../../util/is-important-attribution-information-missing';
import { Confirm } from '../ConfirmationDialog/ConfirmationDialog';
import { TextBox } from '../InputElements/TextBox';
import { attributionColumnClasses } from './shared-attribution-column-styles';

interface CopyrightSubPanelProps {
  displayPackageInfo: DisplayPackageInfo;
  showHighlight?: boolean;
  onEdit?: Confirm;
}

export function CopyrightSubPanel({
  displayPackageInfo,
  onEdit,
  showHighlight,
}: CopyrightSubPanelProps): ReactElement {
  const dispatch = useAppDispatch();

  return (
    <MuiBox sx={attributionColumnClasses.panel}>
      <TextBox
        isEditable={!!onEdit}
        sx={attributionColumnClasses.textBox}
        title={'Copyright'}
        text={displayPackageInfo.copyright}
        minRows={3}
        maxRows={10}
        multiline={true}
        handleChange={({ target: { value } }) =>
          onEdit?.(() =>
            dispatch(
              setTemporaryDisplayPackageInfo({
                ...displayPackageInfo,
                copyright: value,
                wasPreferred: undefined,
              }),
            ),
          )
        }
        isHighlighted={
          showHighlight &&
          isImportantAttributionInformationMissing(
            'copyright',
            displayPackageInfo,
          )
        }
      />
    </MuiBox>
  );
}
