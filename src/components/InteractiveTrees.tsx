import React, { useState } from 'react';
import { soundEffects } from '../services/soundEffects';
import { ParticleTrigger } from './ParticleCanvas';

interface TreeData {
  id: string;
  x: number; // percentage
  y: number; // percentage (base of trunk anchored to ground)
  imageSrc: string;
  widthPercent: string;
  sizeClass: string;
  breezeDuration: string;
  breezeDelay: string;
  zIndex: number;
}

// 7 authentic trees placed exactly according to user layout
const TREES_CONFIG: TreeData[] = [
  // West edge meadow (retained)
  {
    id: 'tree-w2',
    x: 17.2,
    y: 73.0,
    imageSrc: '/trees/arbol_03.png',
    widthPercent: '5.2%',
    sizeClass: 'w-9 sm:w-12',
    breezeDuration: '6.0s',
    breezeDelay: '1.1s',
    zIndex: 14,
  },

  // West road edge (raised up hill behind Beato)
  {
    id: 'tree-nw1',
    x: 20.0,
    y: 36.0,
    imageSrc: '/trees/arbol_05.png',
    widthPercent: '5.6%',
    sizeClass: 'w-11 sm:w-15',
    breezeDuration: '6.4s',
    breezeDelay: '0.5s',
    zIndex: 15,
  },

  // North-central road curve above castle (moved from top hill via arrow)
  {
    id: 'tree-nw2',
    x: 45.0,
    y: 37.0,
    imageSrc: '/trees/arbol_01.png',
    widthPercent: '5.2%',
    sizeClass: 'w-9 sm:w-12',
    breezeDuration: '5.5s',
    breezeDelay: '1.8s',
    zIndex: 16,
  },

  // Central-east meadow below upper road (moved down via arrow)
  {
    id: 'tree-nc2',
    x: 63.5,
    y: 46.0,
    imageSrc: '/trees/arbol_03.png',
    widthPercent: '5.4%',
    sizeClass: 'w-10 sm:w-13',
    breezeDuration: '5.4s',
    breezeDelay: '1.6s',
    zIndex: 13,
  },

  // Central-south open meadow (moved from bottom-left edge via long arrow) - REDUCED SIZE
  {
    id: 'tree-w3',
    x: 58.0,
    y: 70.0,
    imageSrc: '/trees/arbol_02.png',
    widthPercent: '2.6%',
    sizeClass: 'w-2.5 sm:w-3.5',
    breezeDuration: '4.8s',
    breezeDelay: '2.0s',
    zIndex: 14,
  },

  // Center courtyard in the maze (scaled down for the maze plaza)
  {
    id: 'tree-sw1',
    x: 33.4,
    y: 70.3,
    imageSrc: '/trees/arbol_03.png',
    widthPercent: '3.8%',
    sizeClass: 'w-7 sm:w-9',
    breezeDuration: '5.8s',
    breezeDelay: '1.4s',
    zIndex: 14,
  },
  {
    id: 'tree-sw2',
    x: 39.6,
    y: 92.5,
    imageSrc: '/trees/arbol_02.png',
    widthPercent: '3.6%',
    sizeClass: 'w-4.5 sm:w-6',
    breezeDuration: '4.9s',
    breezeDelay: '2.5s',
    zIndex: 14,
  },
];

interface InteractiveTreesProps {
  particleTriggerRef?: React.RefObject<ParticleTrigger | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveTrees: React.FC<InteractiveTreesProps> = ({
  particleTriggerRef,
  containerRef,
}) => {
  const [rustlingTreeId, setRustlingTreeId] = useState<string | null>(null);

  const handleTreeTap = (tree: TreeData, e: React.MouseEvent) => {
    e.stopPropagation();

    // Sound: soft leaf rustle
    soundEffects.playLeafRustle();

    // Trigger canvas shower of small falling autumn leaves
    if (particleTriggerRef?.current && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      particleTriggerRef.current.burstTreeLeaves(clientX, clientY);
    }

    // Elastic rustle shake on tree crown
    setRustlingTreeId(tree.id);
    setTimeout(() => {
      setRustlingTreeId((current) => (current === tree.id ? null : current));
    }, 650);
  };

  return (
    <>
      {TREES_CONFIG.map((tree) => {
        const isRustling = rustlingTreeId === tree.id;

        return (
          <div
            key={tree.id}
            onClick={(e) => handleTreeTap(tree, e)}
            style={{
              left: `${tree.x}%`,
              top: `${tree.y}%`,
              zIndex: tree.zIndex,
              width: tree.widthPercent || '5.4%',
            }}
            className="absolute -translate-x-1/2 -translate-y-[92%] select-none cursor-pointer origin-bottom group"
            title="¡Toca el árbol para hacer caer pequeñas hojas de otoño!"
          >
            {/* Tree Container with Gentle Breeze Sway or Shake Rustle */}
            <div
              style={{
                animationDuration: tree.breezeDuration,
                animationDelay: tree.breezeDelay,
              }}
              className={`origin-bottom select-none transition-transform duration-200 group-hover:brightness-110 ${
                isRustling ? 'animate-treeRustle' : 'animate-treeBreeze'
              }`}
            >
              <img
                src={tree.imageSrc}
                alt="Árbol de otoño"
                className="w-full h-auto object-contain pointer-events-none select-none filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)]"
                loading="eager"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
