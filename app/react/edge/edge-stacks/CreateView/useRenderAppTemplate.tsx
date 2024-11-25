import { SetStateAction, useEffect, useState } from 'react';

import { renderTemplate } from '@/react/portainer/custom-templates/components/utils';
import { useAppTemplate } from '@/react/portainer/templates/app-templates/queries/useAppTemplates';
import { useAppTemplateFile } from '@/react/portainer/templates/app-templates/queries/useAppTemplateFile';
import { TemplateViewModel } from '@/react/portainer/templates/app-templates/view-model';

import { DeploymentType } from '../types';
import { getDefaultStaggerConfig } from '../components/StaggerFieldset.types';

import { DockerFormValues, FormValues } from './types';

/**
 * useRenderAppTemplate fetches the app template (file and data) and returns it
 * as a TemplateViewModel.
 *
 * It also renders the template file and updates the form values.
 */
export function useRenderAppTemplate(
  templateValues: DockerFormValues['templateValues'],
  setValues: (values: SetStateAction<DockerFormValues>) => void
) {
  const templateQuery = useAppTemplate(templateValues.templateId, {
    enabled: templateValues.type === 'app',
  });

  const template = templateQuery.data;

  const templateFileQuery = useAppTemplateFile(templateValues.templateId, {
    enabled: templateValues.type === 'app',
  });
  const [renderedFile, setRenderedFile] = useState<string>('');

  useEffect(() => {
    if (templateFileQuery.data) {
      const newFile = renderTemplate(
        templateFileQuery.data,
        templateValues.variables,
        []
      );

      if (newFile !== renderedFile) {
        setRenderedFile(newFile);
        setValues((values) => ({
          ...values,
          fileContent: newFile,
        }));
      }
    }
  }, [
    renderedFile,
    setValues,
    template,
    templateFileQuery.data,
    templateValues.variables,
  ]);

  const [currentTemplateId, setCurrentTemplateId] = useState<
    number | undefined
  >(templateValues.templateId);

  useEffect(() => {
    if (template?.Id !== currentTemplateId) {
      setCurrentTemplateId(template?.Id);
      setValues((values) => ({
        ...values,
        ...getValuesFromAppTemplate(template),
      }));
    }
  }, [currentTemplateId, setValues, template]);

  return {
    appTemplate: template,
    isInitialLoading:
      templateQuery.isInitialLoading || templateFileQuery.isInitialLoading,
  };
}

function getValuesFromAppTemplate(
  template: TemplateViewModel | undefined
): Partial<FormValues> {
  if (!template) {
    return {};
  }

  return {
    deploymentType: DeploymentType.Compose,
    ...(template
      ? {
          prePullImage: false,
          retryDeploy: false,
          staggerConfig: getDefaultStaggerConfig(),
        }
      : {}),
  };
}
