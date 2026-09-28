import React, { useState } from 'react';
import { soundEffects } from '../services/soundEffects';
import { ParticleTrigger } from './ParticleCanvas';

interface TreeData {
  id: string;
  x: number; // percentage
  y: number; // percentage (base of trunk anchored to ground)
  imageSrc: string;
  sizeClass: string;
  breezeDuration: string;
  breezeDelay: string;
  zIndex: number;
}

// 16 authentic trees distributed across grass zones (grama)
// using all 5 tree variants provided by the user
const TREES_CONFIG: TreeData[] = [
  // Zone 1: Far West Grass (graveyard edge & left meadow)
  {
    id: 'tree-w1',
    x: 5.5,
    y: 44.0,
    imageSrc: '/trees/arbol_01.png',
    sizeClass: 'w-10 sm:w-13',
    breezeDuration: '5.2s',
    breezeDelay: '0.2s',
    zIndex: 14,
  },
  {
    id: 'tree-w2',
    x: 9.0,
    y: 73.0,
    imageSrc: '/trees/arbol_03.png',
    sizeClass: 'w-11 sm:w-14',
    breezeDuration: '6.0s',
    breezeDelay: '1.1s',
    zIndex: 14,
  },
  {
    id: 'tree-w3',
    x: 3.5,
    y: 76.5,
    imageSrc: '/trees/arbol_02.png',
    sizeClass: 'w-8 sm:w-10',
    breezeDuration: '4.8s',
    breezeDelay: '2.0s',
    zIndex: 14,
  },

  // Zone 2: Northwest Lawn & Ridge (above left street)
  {
    id: 'tree-nw1',
    x: 26.5,
    y: 19.5,
    imageSrc: '/trees/arbol_05.png',
    sizeClass: 'w-15 sm:w-20',
    breezeDuration: '6.4s',
    breezeDelay: '0.5s',
    zIndex: 12,
  },
  {
    id: 'tree-nw2',
    x: 34.0,
    y: 15.0,
    imageSrc: '/trees/arbol_01.png',
    sizeClass: 'w-11 sm:w-14',
    breezeDuration: '5.5s',
    breezeDelay: '1.8s',
    zIndex: 12,
  },
  {
    id: 'tree-nw3',
    x: 20.0,
    y: 28.0,
    imageSrc: '/trees/arbol_04.png',
    sizeClass: 'w-9 sm:w-12',
    breezeDuration: '5.0s',
    breezeDelay: '0.9s',
    zIndex: 13,
  },

  // Zone 3: Southwest Lawn (grass near AG Decoraciones)
  {
    id: 'tree-sw1',
    x: 28.5,
    y: 88.0,
    imageSrc: '/trees/arbol_03.png',
    sizeClass: 'w-11 sm:w-14',
    breezeDuration: '5.8s',
    breezeDelay: '1.4s',
    zIndex: 14,
  },
  {
    id: 'tree-sw2',
    x: 37.0,
    y: 92.5,
    imageSrc: '/trees/arbol_02.png',
    sizeClass: 'w-8 sm:w-11',
    breezeDuration: '4.9s',
    breezeDelay: '2.5s',
    zIndex: 14,
  },

  // Zone 4: North Central Ridge (behind bridge and river)
  {
    id: 'tree-nc1',
    x: 57.5,
    y: 14.5,
    imageSrc: '/trees/arbol_05.png',
    sizeClass: 'w-16 sm:w-21',
    breezeDuration: '6.6s',
    breezeDelay: '0.7s',
    zIndex: 12,
  },
  {
    id: 'tree-nc2',
    x: 65.5,
    y: 16.0,
    imageSrc: '/trees/arbol_03.png',
    sizeClass: 'w-12 sm:w-15',
    breezeDuration: '5.4s',
    breezeDelay: '1.6s',
    zIndex: 12,
  },

  // Zone 5: Northeast Meadow (grass between trail and Clarks)
  {
    id: 'tree-ne1',
    x: 77.0,
    y: 21.5,
    imageSrc: '/trees/arbol_01.png',
    sizeClass: 'w-11 sm:w-14',
    breezeDuration: '5.7s',
    breezeDelay: '0.4s',
    zIndex: 13,
  },
  {
    id: 'tree-ne2',
    x: 84.0,
    y: 27.5,
    imageSrc: '/trees/arbol_04.png',
    sizeClass: 'w-9 sm:w-12',
    breezeDuration: '5.1s',
    breezeDelay: '2.2s',
    zIndex: 13,
  },

  // Zone 6: Far East Border Grass
  {
    id: 'tree-e1',
    x: 94.5,
    y: 34.0,
    imageSrc: '/trees/arbol_02.png',
    sizeClass: 'w-8 sm:w-11',
    breezeDuration: '4.7s',
    breezeDelay: '1.3s',
    zIndex: 14,
  },
  {
    id: 'tree-e2',
    x: 97.0,
    y: 73.0,
    imageSrc: '/trees/arbol_03.png',
    sizeClass: 'w-11 sm:w-14',
    breezeDuration: '5.9s',
    breezeDelay: '0.8s',
    zIndex: 14,
  },

  // Zone 7: Southeast Meadow (riverbank grass)
  {
    id: 'tree-se1',
    x: 72.0,
    y: 91.0,
    imageSrc: '/trees/arbol_04.png',
    sizeClass: 'w-10 sm:w-13',
    breezeDuration: '5.3s',
    breezeDelay: '1.9s',
    zIndex: 14,
  },
  {
    id: 'tree-se2',
    x: 83.5,
    y: 86.5,
    imageSrc: '/trees/arbol_05.png',
    sizeClass: 'w-14 sm:w-18',
    breezeDuration: '6.2s',
    breezeDelay: '1.0s',
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
              width: '5.4%',
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
