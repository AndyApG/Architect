/* eslint-env jest */

import fse from 'fs-extra';
import path from 'path';
import { APP_SCHEMA_VERSION } from '@app/config';
import { extract, archive } from '@app/utils/protocols/lib/archive';
import pruneProtocolAssets from '@app/utils/pruneProtocolAssets';
import migrateProtocol from '@app/protocol-validation/migrations/migrateProtocol';
import { pruneProtocol } from '@app/utils/prune';
import {
  checkSchemaVersion,
  importNetcanvas,
  migrateNetcanvas,
  saveNetcanvas,
  schemaVersionStates,
  utils,
} from '../netcanvasFile';
import {
  commitNetcanvas,
  deployNetcanvas,
  getTempDir,
  readProtocol,
  revertNetcanvas,
  writeProtocol,
} from '../lib';
import { errors } from '../errors';
import {
  mockProtocolPath,
  mockProtocol,
  mockAndLog,
} from './helpers';

jest.mock('fs-extra');
jest.mock('@app/utils/protocols/lib/archive');
jest.mock('@app/protocol-validation/migrations/migrateProtocol');
jest.mock('@app/utils/pruneProtocolAssets');
jest.mock('@app/utils/prune');
jest.mock('../lib');

const {
  createNetcanvasExport,
  verifyNetcanvas,
} = utils;

describe('netcanvasFile/netcanvasFile', () => {
  beforeEach(() => {
    archive.mockReset();
    extract.mockReset();
    pruneProtocol.mockReset();
    pruneProtocolAssets.mockReset();
    fse.access.mockReset();
    getTempDir.mockReset();
    writeProtocol.mockReset();
    deployNetcanvas.mockReset();
    revertNetcanvas.mockReset();
    commitNetcanvas.mockReset();
    readProtocol.mockReset();
    createNetcanvasExport.mockReset();

    fse.access.mockResolvedValue(Promise.resolve());
    archive.mockImplementation(() => Promise.resolve());
    extract.mockImplementation(() => Promise.resolve());
    pruneProtocol.mockImplementation((protocol = {}) => Promise.resolve(protocol));
    let count = 0;
    getTempDir.mockImplementation(() => {
      count += 1;
      return Promise.resolve(`/dev/null/working/path/${count}`);
    });
    writeProtocol.mockResolvedValue();
    deployNetcanvas.mockImplementation((sourcePath, savePath) => Promise.resolve({
      savePath,
      backupPath: `${savePath}.backup`,
    }));
    revertNetcanvas.mockImplementation(({ savePath }) => Promise.resolve(savePath));
    commitNetcanvas.mockImplementation(({ savePath }) => Promise.resolve(savePath));
    readProtocol.mockResolvedValue(mockProtocol);
    createNetcanvasExport.mockImplementation(() =>
      Promise.resolve('/dev/null/export/working/path'),
    );

  });

  it.todo('errors');
  it.todo('schemaVersionStates');

  it.todo('createNetcanvas()');

  describe('migrateNetcanvas()', () => {
    it('resolves to new file path', async () => {
      readProtocol
        .mockResolvedValueOnce({ ...mockProtocol, schemaVersion: 2 })
        .mockResolvedValueOnce({ ...mockProtocol, schemaVersion: 4 });

      migrateProtocol.mockResolvedValueOnce(
        [{ ...mockProtocol, schemaVersion: 4 }, []],
      );

      const result = await migrateNetcanvas('/dev/null/original/path', '/dev/null/destination/path2');

      expect(result).toBe('/dev/null/destination/path2');
    });
  });

  describe('checkSchemaVersion(protocol, schemaVersion [optional])', () => {
    it('returns errors.MissingSchemaVersion if no schema version in protocol', async () => {
      readProtocol.mockResolvedValueOnce({});

      await expect(checkSchemaVersion('/dev/null/netcanvas/file'))
        .rejects.toEqual(errors.MissingSchemaVersion);
    });

    it('returns [, schemaVersionStates.OK] if protocol is a match', async () => {
      readProtocol.mockResolvedValueOnce({ schemaVersion: 3 });

      await expect(checkSchemaVersion('/dev/null/netcanvas/file', 3))
        .resolves.toEqual([3, schemaVersionStates.OK]);
    });

    it('returns [, schemaVersionStates.UPGRADE_PROTOCOL] if protocol can upgrade', async () => {
      readProtocol.mockResolvedValueOnce({ schemaVersion: 2 });

      await expect(checkSchemaVersion('/dev/null/netcanvas/file', 3))
        .resolves.toEqual([2, schemaVersionStates.UPGRADE_PROTOCOL]);
    });

    it('returns [, schemaVersionStates.UPGRADE_AGG] if protocol cannot upgrade', async () => {
      readProtocol.mockResolvedValueOnce({ schemaVersion: 4 });

      await expect(checkSchemaVersion('/dev/null/netcanvas/file', 3))
        .resolves.toEqual([4, schemaVersionStates.UPGRADE_APP]);
    });

    it('defaults to APP_SCHEMA_VERSION', async () => {
      readProtocol.mockResolvedValueOnce({ schemaVersion: APP_SCHEMA_VERSION });

      await expect(checkSchemaVersion('/dev/null/netcanvas/file'))
        .resolves.toEqual([APP_SCHEMA_VERSION, schemaVersionStates.OK]);
    });
  });

  describe('saveNetcanvas(workingPath, protocol, filePath)', () => {
    it('successful save', async () => {
      const result = await saveNetcanvas(
        '/dev/null/existing/working/path',
        mockProtocol,
        '/dev/null/save/destination/path',
      );

      expect(result).toBe('/dev/null/save/destination/path');

      expect(createNetcanvasExport.mock.calls).toEqual([[
        '/dev/null/existing/working/path',
        mockProtocol,
      ]]);
      expect(deployNetcanvas.mock.calls).toEqual([[
        '/dev/null/export/working/path',
        '/dev/null/save/destination/path',
      ]]);
      expect(commitNetcanvas.mock.calls).toEqual([[{
        backupPath: '/dev/null/save/destination/path.backup',
        savePath: '/dev/null/save/destination/path',
      }]]);
      expect(revertNetcanvas.mock.calls).toHaveLength(0);
    });

    it('if export fails at verifyNetcanvas it reverts the file', async () => {
      readProtocol.mockResolvedValue({});

      await expect(
        saveNetcanvas(
          '/dev/null/existing/working/path',
          mockProtocol,
          '/dev/null/save/destination/path',
        ),
      ).rejects.toThrow();

      expect(deployNetcanvas.mock.calls).toEqual([[
        '/dev/null/export/working/path',
        '/dev/null/save/destination/path',
      ]]);
      expect(commitNetcanvas.mock.calls).toHaveLength(0);
      expect(revertNetcanvas.mock.calls).toEqual([[{
        backupPath: '/dev/null/save/destination/path.backup',
        savePath: '/dev/null/save/destination/path',
      }]]);
    });

    it('if deployNetcanvas fails it aborts the save', async () => {
      deployNetcanvas.mockRejectedValue(new Error('oh no'));

      await expect(
        saveNetcanvas(
          '/dev/null/existing/working/path',
          mockProtocol,
          '/dev/null/save/destination/path',
        ),
      ).rejects.toThrow();

      expect(deployNetcanvas.mock.calls).toEqual([[
        '/dev/null/export/working/path',
        '/dev/null/save/destination/path',
      ]]);
      expect(commitNetcanvas.mock.calls).toHaveLength(0);
      expect(revertNetcanvas.mock.calls).toHaveLength(0);
    });

    describe('when path does not already exist', () => {
      beforeEach(() => {
        deployNetcanvas.mockImplementation((sourcePath, savePath) => Promise.resolve({
          savePath,
          backupPath: null,
        }));
      });

      it('successful save', async () => {
        const result = await saveNetcanvas(
          '/dev/null/existing/working/path',
          mockProtocol,
          '/dev/null/save/destination/path',
        );

        expect(result).toBe('/dev/null/save/destination/path');

        expect(createNetcanvasExport.mock.calls).toEqual([[
          '/dev/null/existing/working/path',
          mockProtocol,
        ]]);
        expect(deployNetcanvas.mock.calls).toEqual([[
          '/dev/null/export/working/path',
          '/dev/null/save/destination/path',
        ]]);
        expect(commitNetcanvas.mock.calls).toEqual([[{
          backupPath: null,
          savePath: '/dev/null/save/destination/path',
        }]]);
        expect(revertNetcanvas.mock.calls).toHaveLength(0);
      });

      it('when verifyNetcanvas fails, throws but does not revert', async () => {
        readProtocol.mockResolvedValue({});

        await expect(
          saveNetcanvas(
            '/dev/null/existing/working/path',
            mockProtocol,
            '/dev/null/save/destination/path',
          ),
        ).rejects.toThrow();

        expect(deployNetcanvas.mock.calls).toEqual([[
          '/dev/null/export/working/path',
          '/dev/null/save/destination/path',
        ]]);
        expect(commitNetcanvas.mock.calls).toHaveLength(0);
        expect(revertNetcanvas.mock.calls).toEqual([[{
          backupPath: null,
          savePath: '/dev/null/save/destination/path',
        }]]);
      });

      it('if deployNetcanvas fails it aborts the save', async () => {
        deployNetcanvas.mockRejectedValue(new Error('oh no'));

        await expect(
          saveNetcanvas(
            '/dev/null/existing/working/path',
            mockProtocol,
            '/dev/null/save/destination/path',
          ),
        ).rejects.toThrow();

        expect(deployNetcanvas.mock.calls).toEqual([[
          '/dev/null/export/working/path',
          '/dev/null/save/destination/path',
        ]]);
        expect(commitNetcanvas.mock.calls).toHaveLength(0);
        expect(revertNetcanvas.mock.calls).toHaveLength(0);
      });
    });
  });


  describe.only('createNetcanvasExport(workingPath, protocol)', () => {
    const workingPath = path.join('dev', 'null');
    const circularProtocol = {};
    circularProtocol.a = { b: circularProtocol };

    it('resolves to a uuid path in temp', async () => {
      fse.readJson.mockResolvedValueOnce({});
      fse.writeJson.mockResolvedValue(true);
      pruneProtocolAssets.mockResolvedValueOnce(true);
      pruneProtocol.mockReturnValueOnce({});
      archive.mockResolvedValueOnce(true);

      await expect(createNetcanvasExport(workingPath, {}))
        .resolves.toEqual('/dev/null/get/electron/path/architect/exports/809895df-bbd7-4c76-ac58-e6ada2625f9b');
    });
  });

  describe('importNetcanvas(filePath)', () => {
    it('rejects with a readable error when permissions are wrong', async () => {
      const accessError = new Error();
      accessError.code = 'EACCES';

      fse.access.mockRejectedValueOnce(accessError);

      await expect(() => importNetcanvas(mockProtocolPath))
        .rejects.toMatchObject({ friendlyCode: errors.IncorrectPermissions });
    });

    it('rejects with a readable error when it cannot extract a protocol', async () => {
      fse.access.mockResolvedValueOnce(true);
      extract.mockRejectedValueOnce(new Error());

      await expect(importNetcanvas(mockProtocolPath))
        .rejects.toMatchObject({ friendlyCode: errors.OpenFailed });
    });

    it('resolves to a uuid path in temp', async () => {
      fse.access.mockResolvedValueOnce(true);
      extract.mockResolvedValueOnce(true);
      await expect(importNetcanvas(mockProtocolPath))
        .resolves.toEqual('/dev/null/get/electron/path/architect/protocols/809895df-bbd7-4c76-ac58-e6ada2625f9b');
    });
  });


  describe('verifyNetcanvas(filePath)', () => {
    beforeEach(() => {
      pruneProtocol.mockImplementation(p => Promise.resolve(p));
    });

    it('Rejects with a human readable error when verification fails', async () => {
      fse.access.mockResolvedValue(true);
      extract.mockResolvedValue(true);
      fse.readJson.mockResolvedValue({ schemaVersion: 4 });

      await expect(verifyNetcanvas(mockProtocolPath, {}))
        .rejects.toMatchObject({ friendlyCode: errors.VerificationFailed });
    });

    it('Resolves to filePath if validation passes', async () => {
      fse.access.mockResolvedValue(true);
      extract.mockResolvedValue(true);
      fse.readJson.mockResolvedValue({ schemaVersion: 4 });

      await expect(verifyNetcanvas(mockProtocolPath, { schemaVersion: 4 }))
        .resolves.toEqual(mockProtocolPath);
    });
  });
});
