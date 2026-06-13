import { describe, it, expect, beforeEach } from 'vitest';
import { useBossBattleStore } from './bossBattleStore';

const reset = () => {
  useBossBattleStore.setState({
    highestCleared: 0,
    lastCleared: 0,
    totalVictories: 0,
    totalDefeats: 0,
  });
};

describe('bossBattleStore', () => {
  beforeEach(reset);

  it('initial state has zero progress', () => {
    const state = useBossBattleStore.getState();
    expect(state.highestCleared).toBe(0);
    expect(state.lastCleared).toBe(0);
    expect(state.totalVictories).toBe(0);
    expect(state.totalDefeats).toBe(0);
  });

  describe('recordVictory', () => {
    it('increments totalVictories', () => {
      useBossBattleStore.getState().recordVictory(5);
      expect(useBossBattleStore.getState().totalVictories).toBe(1);
    });

    it('sets lastCleared to the cleared level', () => {
      useBossBattleStore.getState().recordVictory(5);
      expect(useBossBattleStore.getState().lastCleared).toBe(5);
    });

    it('updates highestCleared when clearing a new high', () => {
      useBossBattleStore.getState().recordVictory(5);
      expect(useBossBattleStore.getState().highestCleared).toBe(5);
      useBossBattleStore.getState().recordVictory(10);
      expect(useBossBattleStore.getState().highestCleared).toBe(10);
    });

    it('does not lower highestCleared when clearing lower level', () => {
      useBossBattleStore.getState().recordVictory(10);
      useBossBattleStore.getState().recordVictory(5);
      expect(useBossBattleStore.getState().highestCleared).toBe(10);
    });

    it('handles level 300 (max)', () => {
      useBossBattleStore.getState().recordVictory(300);
      expect(useBossBattleStore.getState().highestCleared).toBe(300);
    });

    it('replays the same level still counts as victory', () => {
      useBossBattleStore.getState().recordVictory(50);
      useBossBattleStore.getState().recordVictory(50);
      expect(useBossBattleStore.getState().totalVictories).toBe(2);
    });
  });

  describe('recordDefeat', () => {
    it('increments totalDefeats', () => {
      useBossBattleStore.getState().recordDefeat(20);
      expect(useBossBattleStore.getState().totalDefeats).toBe(1);
    });

    it('does not change highestCleared', () => {
      useBossBattleStore.getState().recordVictory(15);
      useBossBattleStore.getState().recordDefeat(20);
      expect(useBossBattleStore.getState().highestCleared).toBe(15);
    });

    it('does not change lastCleared', () => {
      useBossBattleStore.getState().recordVictory(15);
      useBossBattleStore.getState().recordDefeat(20);
      expect(useBossBattleStore.getState().lastCleared).toBe(15);
    });
  });

  describe('resetProgress', () => {
    it('resets all progress to zero', () => {
      useBossBattleStore.getState().recordVictory(50);
      useBossBattleStore.getState().recordDefeat(60);
      useBossBattleStore.getState().resetProgress();
      const state = useBossBattleStore.getState();
      expect(state.highestCleared).toBe(0);
      expect(state.lastCleared).toBe(0);
      expect(state.totalVictories).toBe(0);
      expect(state.totalDefeats).toBe(0);
    });
  });
});
