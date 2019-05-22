import path from 'path';
import unbundleProtocol from '../../../other/protocols/unbundleProtocol';
import loadProtocolConfiguration from '../../../other/protocols/loadProtocolConfiguration';
import { actionCreators as registerActions } from './register';
import { actionCreators as dialogActions } from '../dialogs';
import validateProtocol from '../../../utils/validateProtocol';

const IMPORT_PROTOCOL = 'PROTOCOLS/IMPORT';
const IMPORT_PROTOCOL_SUCCESS = 'PROTOCOLS/IMPORT_SUCCESS';
const IMPORT_PROTOCOL_ERROR = 'PROTOCOLS/IMPORT_ERROR';

const importProtocol = filePath => ({
  type: IMPORT_PROTOCOL,
  filePath,
});

const importProtocolSuccess = ({ filePath, workingPath }) => ({
  type: IMPORT_PROTOCOL_SUCCESS,
  filePath,
  workingPath,
});

const importProtocolError = (error, filePath) => ({
  type: IMPORT_PROTOCOL_ERROR,
  filePath,
  error,
});

const importProtocolThunk = filePath =>
  (dispatch) => {
    dispatch(importProtocol(filePath));

    return unbundleProtocol(filePath)
      .then(workingPath =>
        // check we can open the protocol file
        loadProtocolConfiguration(workingPath)
          // it loaded okay, check the protocol is valid
          .then(validateProtocol)
          .then(() => {
            // all was well
            dispatch(importProtocolSuccess({ filePath, workingPath }));
            return dispatch(registerActions.registerProtocol({ filePath, workingPath }));
          }),
      )
      .catch((e) => {
        dispatch(importProtocolError(e, filePath));

        e.friendlyMessage = `Something went wrong when '${path.basename(filePath)}' was imported.`;
        dispatch(dialogActions.openDialog({
          type: 'Error',
          title: 'Protocol could not be imported',
          error: e,
        }));
      });
  };

const actionCreators = {
  importProtocol: importProtocolThunk,
  importProtocolSuccess,
};

const actionTypes = {
  IMPORT_PROTOCOL,
  IMPORT_PROTOCOL_SUCCESS,
  IMPORT_PROTOCOL_ERROR,
};

export {
  actionCreators,
  actionTypes,
};

