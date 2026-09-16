import React from 'react';
import PricingForm from './PricingForm';

const EditPricingTemplate = (props) => {
  const { branches, packages } = props;

  return (
    <PricingForm
      pricingValues={props}
      branches={branches}
      packages={packages}
    />
  );
};

export default EditPricingTemplate;
