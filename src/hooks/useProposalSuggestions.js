import { useMemo } from 'react';
import { getFinalConfigExpanded } from '../config/commercialConditionsConfigExpanded';

export const useProposalSuggestions = (businessType, segment) => {
  return useMemo(() => {
    const config = getFinalConfigExpanded('HYBRID', segment);

    return {
      config,
      suggestedProposalType: config.proposalTypeSuggestion,
      visibleSections: config.sections,
      wording: config.wording,
      suggestedDefaults: config.defaults,
      suggestedCatalogItems: config.suggestedItems,
    };
  }, [businessType, segment]);
};
