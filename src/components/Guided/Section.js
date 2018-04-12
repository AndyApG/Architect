import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

const Section = ({ children, isActive, show, className, ...props }) => {
  const sectionClasses = cx(
    className,
    'guided-section',
    {
      'guided-section--is-active': isActive,
      'guided-section--hide': !show,
    },
  );

  return (
    <div
      className={sectionClasses}
      {...props}
    >
      {
        React.Children.toArray(children)
          .map((child, index) => React.cloneElement(child, { isActive, key: index }))
      }
    </div>
  );
};

Section.propTypes = {
  children: PropTypes.node,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  show: PropTypes.bool,
};

Section.defaultProps = {
  children: null,
  isActive: false,
  show: true,
  className: '',
};

export default Section;
