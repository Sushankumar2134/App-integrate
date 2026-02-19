export interface SystemModule {
  id: string;
  moduleLabel: string;
  displayName: string;
  parentModuleId: string | null;
  priority: number;
  icon: string;
  fileUrl: string;
  pageName: string;
  type: string;
  accessFor: string;
  isActive: boolean;
  isDeleted?: boolean;
}
