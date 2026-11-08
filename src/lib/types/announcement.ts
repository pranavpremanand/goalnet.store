export type AnnouncementBar = {
  text: string;
  isActive: boolean;
  updatedAt: string | null;
};

export type AnnouncementBarInput = Pick<AnnouncementBar, "text" | "isActive">;
