import { useState, useEffect, useCallback } from 'react';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, setDefaultTemplate } from '../shared/services/api';

export const useProposalTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const create = async (templateData) => {
    const created = await createTemplate(templateData);
    await loadTemplates();
    return created;
  };

  const update = async (id, templateData) => {
    const updated = await updateTemplate(id, templateData);
    await loadTemplates();
    return updated;
  };

  const remove = async (id) => {
    await deleteTemplate(id);
    await loadTemplates();
  };

  const setDefault = async (id) => {
    await setDefaultTemplate(id);
    await loadTemplates();
  };

  const defaultTemplate = templates.find(t => t.isDefault) || null;

  return {
    templates,
    loading,
    error,
    defaultTemplate,
    create,
    update,
    remove,
    setDefault,
    refresh: loadTemplates,
  };
};
