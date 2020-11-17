/* eslint-env jest */

import configureStore from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';
import reducer, { actionCreators } from '../session';
import { actionCreators as protocolActions } from '../protocol';
import { actionCreators as stageActions } from '../protocol/stages';
import {
  actionCreators as codebookActions,
  testing as codebookTesting,
} from '../protocol/codebook';
import { testing as assetManifestTesting } from '../protocol/assetManifest';
import { rootEpic } from '../../modules/root';
import {
  createNetcanvasImport,
  readProtocol,
  netcanvasExport,
} from '../../../utils/netcanvasFile';

jest.mock('../../../utils/netcanvasFile');

const epics = createEpicMiddleware(rootEpic);
const middlewares = [epics, thunk];
const mockStore = configureStore(middlewares);

const itTracksActionAsChange = (action) => {
  const store = mockStore({});

  store.dispatch(action);

  const actions = store.getActions();

  expect(actions.pop()).toEqual({ type: 'SESSION/PROTOCOL_CHANGED' });
};

describe('session module', () => {
  describe('reducer', () => {
    it('initial state', () => {
      expect(reducer(undefined))
        .toEqual({
          lastSaved: 0,
          lastChanged: 0,
          filePath: null,
          workingPath: null,
          backupPath: null,
        });
    });

    it('SESSION/PROTOCOL_CHANGED', () => {
      const result = reducer(
        undefined,
        actionCreators.protocolChanged(),
      );

      expect(result.lastChanged > 0).toBe(true);
    });

    it('SESSION/OPEN_NETCANVAS_SUCCESS', () => {
      const initialState = reducer(undefined);
      const action = {
        type: 'SESSION/OPEN_NETCANVAS_SUCCESS',
        payload: {
          protocol: {},
          filePath: '/dev/null/mock.netcanvas',
          workingPath: '/dev/null/working/path',
        },
      };
      expect(reducer(initialState, action))
        .toMatchObject({
          lastSaved: 0,
          lastChanged: 0,
          filePath: '/dev/null/mock.netcanvas',
          workingPath: '/dev/null/working/path',
        });
    });

    it('SESSION/SAVE_NETCANVAS_SUCCESS', () => {
      const initialState = reducer({
        lastSaved: 0,
        lastChanged: 0,
        filePath: '/dev/null/mock.netcanvas',
        workingPath: '/dev/null/working/path',
      });

      const action = {
        type: 'SESSION/SAVE_NETCANVAS_SUCCESS',
        payload: {
          savePath: '/dev/null/mock.netcanvas',
          backupPath: '/dev/null/mock.netcanvas.backup',
        },
      };

      const resultState = reducer(initialState, action);

      expect(resultState)
        .toMatchObject({
          filePath: '/dev/null/mock.netcanvas',
          backupPath: '/dev/null/mock.netcanvas.backup',
        });

      const aSecondAgo = new Date().getTime() - 1000;
      expect(resultState.lastSaved).toBeGreaterThan(aSecondAgo);
    });
  });

  describe('actions', () => {

    it('open netcanvas dispatches the correct actions and side-effects', async () => {
      const store = mockStore();
      createNetcanvasImport.mockResolvedValueOnce('/dev/null/working/path');
      readProtocol.mockResolvedValueOnce({});

      await store.dispatch(actionCreators.openNetcanvas('/dev/null/mock.netcanvas'));
      const actions = store.getActions();

      expect(createNetcanvasImport.mock.calls).toEqual([
        ['/dev/null/mock.netcanvas'],
      ]);

      expect(readProtocol.mock.calls).toEqual([
        ['/dev/null/working/path'],
      ]);

      expect(actions).toEqual([
        {
          type: 'SESSION/OPEN_NETCANVAS',
          payload: {
            filePath: '/dev/null/mock.netcanvas',
          },
        },
        {
          type: 'SESSION/OPEN_NETCANVAS_SUCCESS',
          payload: {
            protocol: {},
            filePath: '/dev/null/mock.netcanvas',
            workingPath: '/dev/null/working/path',
          },
        },
      ]);
    });

    it('save netcanvas dispatches the correct actions and side-effects', async () => {
      const store = mockStore({
        session: {
          workingPath: '/dev/null/working/path',
          filePath: '/dev/null/user/file/path.netcanvas',
        },
        protocol: { schemaVersion: 4 },
      });
      netcanvasExport.mockReset();
      netcanvasExport.mockImplementation((
        workingPath,
        protocol,
        savePath,
      ) =>
        Promise.resolve({
          savePath,
          backupPath: `${savePath}.backup`,
        }),
      );

      await store.dispatch(actionCreators.saveNetcanvas());
      const actions = store.getActions();

      expect(netcanvasExport.mock.calls).toEqual([
        [
          '/dev/null/working/path',
          { schemaVersion: 4 },
          '/dev/null/user/file/path.netcanvas',
        ],
      ]);

      expect(actions).toEqual([
        {
          payload: {
            workingPath: '/dev/null/working/path',
            filePath: '/dev/null/user/file/path.netcanvas',
          },
          type: 'SESSION/SAVE_NETCANVAS',
        },
        {
          payload: {
            backupPath: '/dev/null/user/file/path.netcanvas.backup',
            savePath: '/dev/null/user/file/path.netcanvas',
          },
          type: 'SESSION/SAVE_NETCANVAS_SUCCESS',
        },
      ]);
    });

    it('saveAs netcanvas dispatches the correct actions and side-effects', async () => {
      const store = mockStore({
        session: {
          workingPath: '/dev/null/working/path',
          filePath: '/dev/null/user/file/path.netcanvas',
        },
        protocol: { schemaVersion: 4 },
      });
      netcanvasExport.mockReset();
      netcanvasExport.mockImplementation((
        workingPath,
        protocol,
        savePath,
      ) =>
        Promise.resolve({
          savePath,
          backupPath: `${savePath}.backup`,
        }),
      );

      await store.dispatch(
        actionCreators.saveAsNetcanvas('/dev/null/user/file/new_path.netcanvas'),
      );
      const actions = store.getActions();

      expect(netcanvasExport.mock.calls).toEqual([
        [
          '/dev/null/working/path',
          { schemaVersion: 4 },
          '/dev/null/user/file/new_path.netcanvas',
        ],
      ]);

      expect(actions).toEqual([
        {
          payload: {
            workingPath: '/dev/null/working/path',
            filePath: '/dev/null/user/file/new_path.netcanvas',
          },
          type: 'SESSION/SAVE_NETCANVAS_COPY',
        },
        {
          payload: {
            backupPath: '/dev/null/user/file/new_path.netcanvas.backup',
            savePath: '/dev/null/user/file/new_path.netcanvas',
          },
          type: 'SESSION/SAVE_NETCANVAS_COPY_SUCCESS',
        },
      ]);
    });
  });

  describe('epics', () => {
    it('tracks actions as changes', () => {
      const actions = [
        [stageActions.updateStage, [{}]],
        [stageActions.moveStage, [0, 0]],
        [stageActions.deleteStage, [0]],
        [protocolActions.updateOptions, [{}]],
        [codebookActions.createType],
        [codebookActions.updateType],
        [codebookTesting.deleteType],
        [codebookTesting.createVariable],
        [codebookTesting.updateVariable],
        [codebookTesting.deleteVariable],
        [assetManifestTesting.importAssetComplete],
        [assetManifestTesting.deleteAsset],
      ];

      actions.forEach(([action, args = []]) => {
        itTracksActionAsChange(action(...args));
      });
    });
  });
});
