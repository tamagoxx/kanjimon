import { describe, it, expect } from 'vitest';
import { getNextOpponent, getRandomOpponent, canGoNextChapter, POST_BATTLE_ACTIONS } from './postBattleActions';

const opponents = [
  { id: 'sensei', name: 'Sensei Bot', level: 1 },
  { id: 'ninja', name: 'Ninja Bot', level: 5 },
  { id: 'samurai', name: 'Samurai Bot', level: 10 },
  { id: 'shogun', name: 'Shogun Bot', level: 20 },
  { id: 'dragon', name: 'Dragon Bot', level: 35 },
];

describe('getNextOpponent', () => {
  it('returns the next opponent in the list', () => {
    expect(getNextOpponent(opponents[0], opponents)?.id).toBe('ninja');
    expect(getNextOpponent(opponents[1], opponents)?.id).toBe('samurai');
    expect(getNextOpponent(opponents[3], opponents)?.id).toBe('dragon');
  });

  it('returns null when current opponent is the last one', () => {
    expect(getNextOpponent(opponents[4], opponents)).toBeNull();
  });

  it('returns null when current opponent is not in the list', () => {
    const unknown = { id: 'alien', name: 'Alien', level: 99 };
    expect(getNextOpponent(unknown, opponents)).toBeNull();
  });
});

describe('canGoNextChapter', () => {
  it('returns true when there is a next opponent', () => {
    expect(canGoNextChapter(opponents[0], opponents)).toBe(true);
    expect(canGoNextChapter(opponents[3], opponents)).toBe(true);
  });

  it('returns false when current opponent is the last one', () => {
    expect(canGoNextChapter(opponents[4], opponents)).toBe(false);
  });
});

describe('getRandomOpponent', () => {
  it('returns an opponent that is not the current one', () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandomOpponent(opponents[0], opponents);
      expect(result).not.toBeNull();
      expect(result?.id).not.toBe('sensei');
    }
  });

  it('returns null when the list has only one opponent (or only the current one)', () => {
    const singleList = [{ id: 'lone', name: 'Lone Bot', level: 1 }];
    expect(getRandomOpponent(singleList[0], singleList)).toBeNull();
  });

  it('returns an opponent from the list', () => {
    const result = getRandomOpponent(opponents[0], opponents);
    expect(opponents.find((o) => o.id === result?.id)).toBeDefined();
  });
});

describe('getRandomOpponent (boss-shaped)', () => {
  // Boss interface only requires id (and optionally name) per OpponentRef —
  // getRandomOpponent should work for any {id, ...} shape.
  const bosses = [
    { id: 'boss_onyx', name: 'Onyx Boss', level: 1 },
    { id: 'boss_blaze', name: 'Blaze Boss', level: 5 },
    { id: 'boss_arctic', name: 'Arctic Boss', level: 10 },
  ];

  it('returns a boss that is not the current one', () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandomOpponent(bosses[0], bosses);
      expect(result).not.toBeNull();
      expect(result?.id).not.toBe('boss_onyx');
    }
  });

  it('returns null when there is only one boss available', () => {
    const single = [{ id: 'boss_lone', name: 'Lone Boss', level: 1 }];
    expect(getRandomOpponent(single[0], single)).toBeNull();
  });
});

describe('POST_BATTLE_ACTIONS', () => {
  it('exposes 4 actions in correct order', () => {
    expect(POST_BATTLE_ACTIONS.map((a) => a.id)).toEqual([
      'restart',
      'play-again',
      'next-chapter',
      'back',
    ]);
  });

  it('all actions have id, label, and emoji', () => {
    POST_BATTLE_ACTIONS.forEach((action) => {
      expect(action.id).toBeTruthy();
      expect(action.label).toBeTruthy();
      expect(action.emoji).toBeTruthy();
    });
  });
});
