/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { find, reduce } from 'lodash';

const propStageId = (_, props) => props.stageId;
const activeProtocolId = state => state.session.activeProtocol;
const protocolsMeta = state => state.protocols;

export const getProtocol = state => state.protocol.present;
export const getExternalData = state => state.protocol.present.externalData;
export const getVariableRegistry = state => state.protocol.present.variableRegistry;

export const getActiveProtocolMeta = createSelector(
  protocolsMeta,
  activeProtocolId,
  (meta, id) => find(meta, ['id', id]),
);

export const makeGetStage = () =>
  createSelector(
    getProtocol,
    propStageId,
    (protocol, stageId) => find(protocol.stages, ['id', stageId]),
  );

export const getExternalDataSources = createSelector(
  getExternalData,
  externalData =>
    reduce(
      externalData,
      (memo, dataSource, name) => {
        if (!Object.prototype.hasOwnProperty.call(dataSource, 'nodes')) { return memo; }

        return [...memo, name];
      },
      [],
    ),
);

