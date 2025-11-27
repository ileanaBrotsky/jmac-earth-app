import { useMutation } from '@tanstack/react-query';
import type { ProcessProjectResponse } from '@app/types';
import { apiClient } from '@services/api';

export const useProjectCreation = () => {
  return useMutation<ProcessProjectResponse, Error, FormData>({
    mutationFn: (data) =>
      apiClient.post<ProcessProjectResponse>('/projects', data).then((response) => response.data)
  });
};
