declare module '@/contexts/AuthContext' {
  export interface User {
    id: number;
    fullName: string;
    email: string;
    functionalGroup: string;
    projectNames: string[];
    phone?: string;
    location?: string;
  }

  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (fullName: string, email: string, phone: string, location: string, password: string) => Promise<void>;
    logout: () => void;
  }

  export function useAuth(): AuthContextType;
}

declare module '@/hooks/useTeammatesData' {
  export interface Teammate {
    id: number;
    name: string;
    role: string;
    department: string;
    email: string;
    location: string;
    isAvailable: boolean;
  }

  export interface TeammatesApiResponse {
    totalTeammatesCount: number;
    teammates: Teammate[];
  }

  export function useTeammatesData(): {
    data: TeammatesApiResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@/hooks/useTasksData' {
  export interface BackendTask {
    id: number;
    name: string;
    taskNumber: string;
    description: string;
    status: string;
    taskType: string;
    parentId?: number;
    parentTaskTitle?: string;
    parentTaskFormattedNumber?: string;
    receivedDate: string;
    developmentStartDate: string;
    dueDate: string;
    assignedDeveloperIds: number[];
    assignedDeveloperNames: string[];
    assignedTesterIds: number[];
    assignedTesterNames: string[];
    developerName?: string;
    testerName?: string;
    priority: string;
    projectId: number;
    projectName: string;
    documentPath?: string;
    commitId?: string;
    developmentDueHours?: number;
    testingDueHours?: number;
  }

  export interface TasksApiResponse {
    totalTasksCount: number;
    tasks: BackendTask[];
  }

  export function useTasksData(): {
    data: TasksApiResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@/lib/utils' {
  export function cn(...classes: (string | undefined | null | false)[]): string;
}

declare module '@/services/apiClient' {
  import { AxiosInstance } from 'axios';
  
  const apiClient: AxiosInstance;
  export default apiClient;
}

declare module '@/hooks/use-toast' {
  export interface ToastOptions {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }

  export function toast(options: ToastOptions): void;
} 