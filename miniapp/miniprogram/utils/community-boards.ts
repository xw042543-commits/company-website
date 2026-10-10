export type CommunityCategory = 'GENERAL' | 'NEWCOMER' | 'HOUSING' | 'MARKETPLACE' | 'STUDY' | 'MEETUP';
export const COMMUNITY_BOARDS: readonly { code: CommunityCategory; label: string }[] = [
  { code: 'GENERAL', label: '日常交流' }, { code: 'NEWCOMER', label: '新生报到' },
  { code: 'HOUSING', label: '租房室友' }, { code: 'MARKETPLACE', label: '二手闲置' },
  { code: 'STUDY', label: '学习求助' }, { code: 'MEETUP', label: '周末搭子' },
];
export function isCommunityCategory(value: unknown): value is CommunityCategory {
  return COMMUNITY_BOARDS.some((board) => board.code === value);
}
