export interface Chapter { id: string; title: string; order: number; content: string }
export interface Book { id: string; slug: string; title: string; subtitle?: string; author: string; writtenAt?: string | null; hasChapters?: boolean; summary: string; status: '完結' | '連載中' | '試閱'; tags: string[]; primaryTag: string; shelfOrder: number; chapters: Chapter[]; demo: boolean }
