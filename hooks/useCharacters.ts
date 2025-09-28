
import { useState, useCallback } from 'react';
import { Character } from '../types';

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const spawnCharacter = useCallback((type: Character['type']) => {
    const characterNames = {
      player: ['Hero', 'Warrior', 'Adventurer', 'Champion'],
      enemy: ['Goblin', 'Orc', 'Skeleton', 'Bandit'],
      npc: ['Merchant', 'Guard', 'Villager', 'Blacksmith'],
      pet: ['Companion', 'Buddy', 'Friend', 'Sidekick'],
      boss: ['Dragon', 'Demon Lord', 'Ancient Evil', 'Dark King'],
    };

    const names = characterNames[type];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const getCharacterStats = (type: Character['type']) => {
      switch (type) {
        case 'player':
          return { health: 100, maxHealth: 100, speed: 5 };
        case 'enemy':
          return { health: 50, maxHealth: 50, speed: 3 };
        case 'npc':
          return { health: 75, maxHealth: 75, speed: 2 };
        case 'pet':
          return { health: 60, maxHealth: 60, speed: 6 };
        case 'boss':
          return { health: 300, maxHealth: 300, speed: 2 };
        default:
          return { health: 100, maxHealth: 100, speed: 3 };
      }
    };

    const stats = getCharacterStats(type);
    
    const newCharacter: Character = {
      id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: randomName,
      position: { 
        x: Math.random() * 10 - 5, // Random position between -5 and 5
        y: Math.random() * 10 - 5, 
      },
      rotation: Math.random() * 360,
      scale: { x: 1, y: 1 },
      color: '#0066FF',
      selected: false,
      ...stats,
    };

    setCharacters(prev => {
      const updated = prev.map(character => ({ ...character, selected: false }));
      return [...updated, { ...newCharacter, selected: true }];
    });
    
    setSelectedCharacterId(newCharacter.id);
    console.log('Spawned new character:', newCharacter);
  }, []);

  const selectCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.map(character => ({
      ...character,
      selected: character.id === id
    })));
    setSelectedCharacterId(id);
    console.log('Selected character:', id);
  }, []);

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(character => 
      character.id === id ? { ...character, ...updates } : character
    ));
    console.log('Updated character:', id, updates);
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(character => character.id !== id));
    if (selectedCharacterId === id) {
      setSelectedCharacterId(null);
    }
    console.log('Deleted character:', id);
  }, [selectedCharacterId]);

  const clearSelection = useCallback(() => {
    setCharacters(prev => prev.map(character => ({ ...character, selected: false })));
    setSelectedCharacterId(null);
  }, []);

  const getSelectedCharacter = useCallback(() => {
    return characters.find(character => character.id === selectedCharacterId) || null;
  }, [characters, selectedCharacterId]);

  const duplicateCharacter = useCallback((id: string) => {
    const characterToDuplicate = characters.find(character => character.id === id);
    if (!characterToDuplicate) return;

    const newCharacter: Character = {
      ...characterToDuplicate,
      id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${characterToDuplicate.name} Copy`,
      position: {
        x: characterToDuplicate.position.x + 2,
        y: characterToDuplicate.position.y + 2,
      },
      selected: false,
    };

    setCharacters(prev => {
      const updated = prev.map(character => ({ ...character, selected: false }));
      return [...updated, { ...newCharacter, selected: true }];
    });
    
    setSelectedCharacterId(newCharacter.id);
    console.log('Duplicated character:', newCharacter);
  }, [characters]);

  const moveCharacter = useCallback((id: string, delta: { x: number; y: number }) => {
    setCharacters(prev => prev.map(character => 
      character.id === id ? {
        ...character,
        position: {
          x: character.position.x + delta.x,
          y: character.position.y + delta.y,
        }
      } : character
    ));
  }, []);

  const rotateCharacter = useCallback((id: string, delta: number) => {
    setCharacters(prev => prev.map(character => 
      character.id === id ? {
        ...character,
        rotation: (character.rotation + delta) % 360,
      } : character
    ));
  }, []);

  const scaleCharacter = useCallback((id: string, delta: { x: number; y: number }) => {
    setCharacters(prev => prev.map(character => 
      character.id === id ? {
        ...character,
        scale: {
          x: Math.max(0.1, character.scale.x + delta.x),
          y: Math.max(0.1, character.scale.y + delta.y),
        }
      } : character
    ));
  }, []);

  const healCharacter = useCallback((id: string, amount: number) => {
    setCharacters(prev => prev.map(character => 
      character.id === id ? {
        ...character,
        health: Math.min(character.maxHealth, character.health + amount),
      } : character
    ));
  }, []);

  const damageCharacter = useCallback((id: string, amount: number) => {
    setCharacters(prev => prev.map(character => 
      character.id === id ? {
        ...character,
        health: Math.max(0, character.health - amount),
      } : character
    ));
  }, []);

  const resetCharacterTransform = useCallback((id: string) => {
    updateCharacter(id, {
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
    });
  }, [updateCharacter]);

  const loadCharacters = useCallback((newCharacters: Character[]) => {
    setCharacters(newCharacters);
    setSelectedCharacterId(null);
    console.log('Loaded characters from project:', newCharacters.length);
  }, []);

  const clearAllCharacters = useCallback(() => {
    setCharacters([]);
    setSelectedCharacterId(null);
    console.log('Cleared all characters');
  }, []);

  const getCharactersByType = useCallback((type: Character['type']) => {
    return characters.filter(character => character.type === type);
  }, [characters]);

  const getAliveCharacters = useCallback(() => {
    return characters.filter(character => character.health > 0);
  }, [characters]);

  return {
    characters,
    selectedCharacterId,
    spawnCharacter,
    selectCharacter,
    updateCharacter,
    deleteCharacter,
    clearSelection,
    getSelectedCharacter,
    duplicateCharacter,
    moveCharacter,
    rotateCharacter,
    scaleCharacter,
    healCharacter,
    damageCharacter,
    resetCharacterTransform,
    loadCharacters,
    clearAllCharacters,
    getCharactersByType,
    getAliveCharacters,
  };
};
