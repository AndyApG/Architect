import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import Select from '../../components/Form/Fields/Select';
import withAssets from './withAssets';
import Asset from './Asset';

const ASSET_TYPES = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Network', value: 'network' },
];

const Assets = ({
  type,
  assets,
  assetType,
  onUpdateAssetFilter,
  onSelect,
  onDelete,
}) => {
  const renderedAssets = assets.map(asset => (
    <div className="asset-browser-assets__asset" key={asset.id}>
      <Asset
        {...asset}
        onClick={onSelect}
        onDelete={onDelete}
      />
    </div>
  ));

  const selectProps = {
    options: ASSET_TYPES,
    input: {
      onChange: onUpdateAssetFilter,
      value: assetType,
      placeholder: 'Filter by asset type...',
    },
  };

  return (
    <div className="asset-browser-assets">
      { !type &&
        <div className="asset-browser-assets__controls">
          <Select {...selectProps} />
        </div>
      }

      <div className="asset-browser-assets__assets">
        {renderedAssets}
      </div>
    </div>
  );
};

Assets.propTypes = {
  type: PropTypes.string,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
};

Assets.defaultProps = {
  type: null,
  onSelect: () => {},
  onDelete: null,
};

export default compose(
  withAssets,
)(Assets);
