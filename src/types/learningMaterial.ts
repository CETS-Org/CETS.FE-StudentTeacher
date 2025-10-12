export interface LearningMaterial {
  id: string;
  createdBy: string;
  classMeetingID?: string;
  title: string;
  fileName?: string;
  contentType?: string;
  storeUrl?: string;
  createdAt: string;
  updatedAt?: string;
  uploaderName?: string;
  classMeetingDate?: string;
  classMeetingSlot?: string;
}

