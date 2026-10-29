import React, { useEffect, useRef } from 'react';
import { ThreeSceneManager, CameraPreset } from '../three/ThreeScene';
import { GameState } from '../types/game';

interface ThreeCanvasProps {
  gameState: GameState;
  cameraPreset: CameraPreset;
  onRoomClick: (roomId: number) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  gameState,
  cameraPreset,
  onRoomClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<ThreeSceneManager | null>(null);
  const onRoomClickRef = useRef(onRoomClick);

  useEffect(() => {
    onRoomClickRef.current = onRoomClick;
  }, [onRoomClick]);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new ThreeSceneManager(mountRef.current, (roomId) => {
      onRoomClickRef.current?.(roomId);
    });
    sceneManagerRef.current = manager;

    // Initial state pass
    manager.updateGameState(gameState);
    manager.setCameraPreset(cameraPreset);

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync state changes to 3D scene
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateGameState(gameState);
    }
  }, [gameState]);

  // Sync camera preset changes
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 overflow-hidden select-none"
      style={{ backgroundColor: '#070c18' }}
    />
  );
};
