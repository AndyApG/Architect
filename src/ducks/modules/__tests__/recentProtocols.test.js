/* eslint-env jest */

import { createStore } from 'redux';
import fs from 'fs';
import { actionCreators as loadActions } from '../protocols/load';
import { actionCreators as exportActions } from '../protocols/export';
import reducer, { actionCreators } from '../recentProtocols';

describe('recentProtocols', () => {
  describe('reducer', () => {
    let store;

    beforeEach(() => {
      store = createStore(reducer);
    });

    it('LOAD_PROTOCOL_SUCCESS updates timestamp and sorts recent protocols', (done) => {
      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/1'));
      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/2'));
      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/3'));

      store.subscribe(() => {
        const state = store.getState();
        expect(state.length).toBe(3);
        expect(state[0]).toMatchObject({ filePath: '/dev/null/mock/recent/path/2' });
        expect(state[1]).toMatchObject({ filePath: '/dev/null/mock/recent/path/3' });
        expect(state[2]).toMatchObject({ filePath: '/dev/null/mock/recent/path/1' });

        done();
      });

      setTimeout(() => {
        store.dispatch(loadActions.loadProtocolSuccess({
          filePath: '/dev/null/mock/recent/path/2',
        }));
      }, 2);
    });

    it('EXPORT_PROTOCOL_SUCCESS adds to recentProtocolsList', (done) => {
      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/1'));

      store.subscribe(() => {
        const state = store.getState();

        expect(state.length).toBe(2);
        expect(state[0]).toMatchObject({ filePath: '/dev/null/mock/recent/path/2' });
        expect(state[1]).toMatchObject({ filePath: '/dev/null/mock/recent/path/1' });

        done();
      });

      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/2'));
    });

    it('CLEAR_DEAD_LINKS', (done) => {
      // Assume first file doesn't exist
      fs.existsSync.mockImplementationOnce(() => false);

      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/1'));
      store.dispatch(exportActions.exportProtocolSuccess('/dev/null/mock/recent/path/2'));

      const initialState = store.getState();

      expect(initialState.length).toBe(2);

      store.subscribe(() => {
        const state = store.getState();

        expect(state.length).toBe(1);
        expect(state[0]).toMatchObject({ filePath: '/dev/null/mock/recent/path/1' });

        done();
      });

      store.dispatch(actionCreators.clearDeadLinks());
    });
  });
});
