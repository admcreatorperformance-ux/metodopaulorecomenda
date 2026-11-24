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
}

export interface Module {
  id: string;
  position: number;
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
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
