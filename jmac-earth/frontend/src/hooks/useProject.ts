import { useMutation, useQuery } from '@tanstack/react-query';
import type { ProcessProjectResponse, ProjectSummary, ProjectsListResponse } from '@app/types';
import { apiClient } from '@services/api';

export const useProjectCreation = () => {
  return useMutation<ProcessProjectResponse, Error, FormData>({
    mutationFn: (data) =>
      apiClient.post<ProcessProjectResponse>('/projects', data).then((response) => response.data)
  });
};

export const useProjectsList = () =>
  useQuery<ProjectSummary[]>({
    queryKey: ['projects'],
    initialData: [] as ProjectSummary[],
    queryFn: async () => {
      const response = await apiClient.get<ProjectsListResponse | ProcessProjectResponse>('/projects');
      const payload = response.data as ProjectsListResponse & ProcessProjectResponse;
      const projects = payload.data ?? payload.projects ?? (Array.isArray(payload) ? (payload as unknown as ProjectSummary[]) : []);
      return projects ?? [];
    },
    staleTime: 1000 * 30
  });
