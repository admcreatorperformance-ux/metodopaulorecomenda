export type VideoProvider = "youtube" | "vimeo" | "panda" | "bunny";
export type Role = "aluno" | "mentor" | "moderador" | "admin";

export interface Lesson {
  id: string;
  moduleId: string;
  position: number;
  title: string;
  description: string;
  videoProvider: VideoProvider;
  videoId: string | null;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  published?: boolean;
}

export interface Module {
  id: string;
  position: number;
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
  published?: boolean;
}

export interface LessonProgress {
  lessonId: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface LiveSession {
  id: string;
  title: string;
  hostName: string;
  startsAt: string;
  status: "agendada" | "ao_vivo" | "encerrada";
  joinUrl: string | null;
  recordingProvider: VideoProvider | null;
  recordingVideoId: string | null;
  recordingThumbnailUrl: string | null;
  description?: string;
  published?: boolean;
}

export interface Member {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  online: boolean;
  /** Módulo em que o aluno está (para a lista da comunidade). */
  currentModulePosition: number | null;
}

export interface Viewer {
  id: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
}

export interface AreaData {
  viewer: Viewer;
  modules: Module[];
  progress: Record<string, LessonProgress>;
  lives: LiveSession[];
  reminders: string[];
  members: Member[];
  communityUrl: string | null;
}

export interface AdminMember {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  enrollmentStatus: "active" | "canceled" | "refunded" | "expired" | null;
  expiresAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface LessonMaterial {
  id: string;
  lessonId: string;
  title: string;
  kind: "link" | "file";
  url: string | null;
  storagePath: string | null;
  position: number;
}

export interface LessonComment {
  id: string;
  lessonId: string;
  userId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: Role;
}

export interface Certificate {
  id: string;
  fullName: string;
  lessonsCompleted: number;
  issuedAt: string;
}
