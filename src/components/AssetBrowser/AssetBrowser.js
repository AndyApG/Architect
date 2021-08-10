import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import fse from 'fs-extra';
import { remote } from 'electron';
import { Section } from '@components/EditorLayout';
import Assets from './Assets';
import NewAsset from './NewAsset';
import Preview from './Preview';
import withAssetActions from './withAssetActions';

const AssetBrowser = ({
  type,
  selected,
  onSelect,
  onDelete,
  disableDelete,
}) => {
  const handleCreate = useCallback((assetIds) => {
    if (assetIds.length !== 1) { return; } // if multiple files were uploaded
    if (!assetIds[0]) { return; } // if a single invalid file was uploaded
    onSelect(assetIds[0]);
  }, [onSelect]);

  const [showPreview, setShowPreview] = useState(null);

  const handleShowPreview = setShowPreview;

  const handleClosePreview = useCallback(
    () => setShowPreview(null),
    [setShowPreview],
  );

  const handleDownload = useCallback(
    (assetPath, meta) => {
      remote.dialog.showSaveDialog(
        {
          buttonLabel: 'Save Asset',
          nameFieldLabel: 'Save As:',
          properties: ['saveFile'],
          defaultPath: meta.source,
        },
        remote.getCurrentWindow(),
      )
        .then(({ canceled, filePath }) => {
          if (canceled) { return; }
          fse.copy(assetPath, filePath);
        });
    },
    [],
  );

  return (
    <>
      <Section>
        <NewAsset
          onCreate={handleCreate}
          type={type}
        />
      </Section>
      <Section>
        <h3>
          Resource library
          { type && (
          <span>
            (showing type:
            {type}
            )
          </span>
          )}
        </h3>
        <Assets
          onSelect={onSelect}
          onPreview={handleShowPreview}
          onDownload={handleDownload}
          onDelete={onDelete}
          disableDelete={disableDelete}
          selected={selected}
          type={type}
        />
      </Section>
      { showPreview && (
        <Preview
          id={showPreview}
          onDownload={handleDownload}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};

AssetBrowser.propTypes = {
  type: PropTypes.string,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
  disableDelete: PropTypes.bool,
};

AssetBrowser.defaultProps = {
  type: null,
  selected: null,
  onSelect: () => {},
  onDelete: () => {},
  disableDelete: false,
};

export default compose(
  withAssetActions,
)(AssetBrowser);
