"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VOCAB_DICTIONARY } from "@/constants/dictionary";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { addArcadePoints } from "@/actions/user-progress";
import Matter from "matter-js";
import confetti from "canvas-confetti";
import { Zap, Heart, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type WordData = {
    pt: string;
    en: string;
    category: string;
};

type ActiveMeteor = {
    id: number;
    word: WordData;
    body: Matter.Body;
};

// Physics Constants
const GAME_WIDTH = 400; // Fixed logic width mapped to screen
const GAME_HEIGHT = 650;
const SENSOR_Y = GAME_HEIGHT - 20;

export default function MeteorGame() {
    const router = useRouter();
    const { playClick, playReward, playPop, playFahh } = useUISounds();

    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);

    const [status, setStatus] = useState<'playing' | 'gameover'>('playing');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    
    // State sync of active bodies so we can render HTML overlays on top of Matter bodies
    const [activeMeteors, setActiveMeteors] = useState<ActiveMeteor[]>([]);
    
    // Bottom interaction options based on currently lowest meteor
    const [options, setOptions] = useState<string[]>([]);
    const [targetMeteorId, setTargetMeteorId] = useState<number | null>(null);

    // Dynamic difficulty refs to bypass stale closures
    const scoreRef = useRef(0);
    const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    // Update bottom interactable buttons based on lowest actual meteor
    useEffect(() => {
        if (status !== 'playing' || activeMeteors.length === 0) {
            setOptions([]);
            setTargetMeteorId(null);
            return;
        }

        // Find the lowest meteor (max Y)
        const lowestMeteor = activeMeteors.reduce((lowest, current) => {
            return (current.body.position.y > lowest.body.position.y) ? current : lowest;
        });

        // Don't reconstruct options if we are already targeting this meteor
        if (targetMeteorId === lowestMeteor.id) return;

        setTargetMeteorId(lowestMeteor.id);

        const correctPt = lowestMeteor.word.pt;
        const category = lowestMeteor.word.category;
        
        let fakes = VOCAB_DICTIONARY.filter(w => w.category === category && w.pt !== correctPt);
        if (fakes.length < 2) {
            fakes = VOCAB_DICTIONARY.filter(w => w.pt !== correctPt);
        }

        // Shuffle and pick 2 fakes
        const shuffledFakes = [...fakes].sort(() => 0.5 - Math.random()).slice(0, 2);
        
        // Final options array shuffled
        const finalOptions = [correctPt, shuffledFakes[0].pt, shuffledFakes[1].pt].sort(() => 0.5 - Math.random());
        setOptions(finalOptions);

    }, [activeMeteors, status, targetMeteorId]);


    // INIT PHYSICS ENGINE
    useEffect(() => {
        if (!sceneRef.current) return;

        // Reset
        const engine = Matter.Engine.create();
        const world = engine.world;
        engineRef.current = engine;

        // Configure dynamic gravity start
        engine.gravity.y = 0.5;

        // Custom render to sync with React instead of drawing on Canvas directly
        // We will just use the Engine to calculate math, and react state for visual rendering.
        // But for debug/bounding boxes we can mount a hidden render or wireframe one.
        // Actually, rendering a transparent canvas is good for bounding constraints mapping.
        const render = Matter.Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                wireframes: false,
                background: 'transparent',
                // We hide the bodies in the native canvas because we'll render custom HTML divs on top
                showAngleIndicator: false,
            }
        });
        renderRef.current = render;

        // Boundaries
        const leftWall = Matter.Bodies.rectangle(-25, GAME_HEIGHT/2, 50, GAME_HEIGHT, { isStatic: true });
        const rightWall = Matter.Bodies.rectangle(GAME_WIDTH + 25, GAME_HEIGHT/2, 50, GAME_HEIGHT, { isStatic: true });
        
        // Bottom Sensor (The lava)
        const sensor = Matter.Bodies.rectangle(GAME_WIDTH/2, SENSOR_Y + 50, GAME_WIDTH * 2, 100, {
            isStatic: true,
            isSensor: true,
            label: "lava"
        });

        Matter.World.add(world, [leftWall, rightWall, sensor]);

        // Collision Event
        Matter.Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const bodyA = pairs[i].bodyA;
                const bodyB = pairs[i].bodyB;

                if (bodyA.label === 'lava' || bodyB.label === 'lava') {
                    const meteorBody = bodyA.label === 'lava' ? bodyB : bodyA;
                    
                    // Meteor hit the bottom!
                    playFahh();
                    
                    // Remove from physics world
                    Matter.World.remove(world, meteorBody);
                    
                    // Remove from react state and lose a life
                    setActiveMeteors((prev) => {
                        const newMeteors = prev.filter(m => m.id !== meteorBody.id);
                        return newMeteors;
                    });

                    setLives(prev => {
                        const p = prev - 1;
                        if (p <= 0) setStatus('gameover');
                        return p;
                    });
                }
            }
        });

        // Sync physics body positions to React State for 60fps rendering
        Matter.Events.on(engine, 'afterUpdate', () => {
            // Force a react state update to paint new coords
            setActiveMeteors(prev => [...prev]);
        });

        const runner = Matter.Runner.create();
        runnerRef.current = runner;
        
        Matter.Runner.run(runner, engine);
        
        return () => {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
            if (render.canvas) render.canvas.remove();
            Matter.World.clear(world, false);
            Matter.Engine.clear(engine);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Game Spawner Loop
    useEffect(() => {
        if (status !== 'playing' || !engineRef.current) return;

        const spawnMeteor = () => {
            if (status !== 'playing') return;

            const engine = engineRef.current;
            if (!engine) return;

            // Difficulty: spawn interval gets faster, gravity gets heavier
            const currentScore = scoreRef.current;
            engine.world.gravity.y = 0.5 + (currentScore / 100);
            
            const randomSource = VOCAB_DICTIONARY[Math.floor(Math.random() * VOCAB_DICTIONARY.length)];
            
            // Random X between 50 and 350
            const startX = 60 + Math.random() * (GAME_WIDTH - 120);

            // We make the body transparent in native canvas because React renders it above
            const body = Matter.Bodies.rectangle(startX, -50, 140, 60, {
                restitution: 0.2, // bounciness
                frictionAir: 0.05, // drag (keeps them slightly floating)
                label: "meteor",
                render: { visible: false } // Hidden in canvas, rendered in HTML
            });

            // Initial Spin
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

            Matter.World.add(engine.world, body);

            setActiveMeteors(prev => [...prev, { id: body.id, word: randomSource, body }]);

            // Next spawn
            const nextInterval = Math.max(800, 3000 - (currentScore * 15));
            spawnTimerRef.current = setTimeout(spawnMeteor, nextInterval);
        };

        spawnMeteor();

        return () => {
            if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        };
    }, [status]);



    // Interaction
    const handleButtonClick = (selectedPt: string) => {
        if (status !== 'playing' || !targetMeteorId) return;

        const targetMeteor = activeMeteors.find(m => m.id === targetMeteorId);
        if (!targetMeteor) return;

        if (targetMeteor.word.pt === selectedPt) {
            // Correct Hit!
            playReward();
            
            const x = targetMeteor.body.position.x;
            const y = targetMeteor.body.position.y;
            
            // Map coordinates to viewport roughly
            const rect = sceneRef.current?.getBoundingClientRect();
            if (rect) {
                const confOriginX = (rect.left + x) / window.innerWidth;
                const confOriginY = (rect.top + y) / window.innerHeight;
                
                confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { x: confOriginX, y: confOriginY },
                    colors: ['#58CC02', '#FFC800', '#1CB0F6']
                });
            }

            // Remove from physicist world
            if (engineRef.current) {
                Matter.World.remove(engineRef.current.world, targetMeteor.body);
            }

            // Remove from state
            setActiveMeteors(prev => prev.filter(m => m.id !== targetMeteorId));
            
            setScore(prev => prev + 1);
            addArcadePoints(1).catch(console.error);
        } else {
            // Wrong hit! Lose life early? For now just shake or lose life.
             playFahh();
             setLives(prev => {
                const p = prev - 1;
                if (p <= 0) setStatus('gameover');
                return p;
            });
        }
    };


    if (status === 'gameover') {
        return (
            <div className="max-w-md mx-auto py-10 px-4 min-h-[85vh] flex flex-col justify-center items-center">
                <div className="bg-sky-100 border-2 border-sky-300 border-b-8 rounded-3xl p-8 w-full flex flex-col items-center shadow-sm">
                    <ShieldAlert className="h-20 w-20 text-sky-500 fill-sky-200 mb-6 drop-shadow-md" />
                    <h1 className="text-4xl font-black text-sky-700 uppercase mb-2 text-center leading-none tracking-tight">Escudos Destruídos</h1>
                    
                    <div className="bg-white rounded-2xl w-full p-6 flex flex-col items-center border-2 border-sky-200 border-b-4 mb-8 mt-6">
                        <span className="text-stone-400 font-bold uppercase tracking-wider text-sm mb-2">Meteoros Destruídos</span>
                        <span className="text-6xl font-black text-sky-500">{score}</span>
                    </div>

                    <button
                        onClick={() => router.push('/arcade')}
                        className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-xl uppercase tracking-widest rounded-2xl border-2 border-sky-600 border-b-8 active:border-b-2 active:translate-y-[6px] transition-all"
                    >
                        Voltar à Base
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[400px] mx-auto py-4 px-2 flex flex-col h-[85vh] md:h-[90vh] overflow-hidden select-none">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10 px-2 shrink-0">
                <button 
                    onClick={() => router.push('/arcade')}
                    className="text-stone-400 hover:text-stone-600 font-bold uppercase text-sm tracking-wider"
                >
                    &larr; Sair
                </button>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1 bg-rose-100 text-rose-500 px-3 py-1.5 rounded-xl border-2 border-rose-200">
                        <Heart className="h-4 w-4 fill-rose-500" />
                        <span className="font-black text-lg">{lives}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-500 px-3 py-1.5 rounded-xl border-2 border-amber-200">
                        <Zap className="h-4 w-4 fill-amber-500" />
                        <span className="font-black text-lg">{score}</span>
                    </div>
                </div>
            </div>

            {/* Matter.js Arena */}
            <div 
                className="flex-1 relative bg-stone-900 rounded-3xl border-2 border-stone-800 border-b-8 overflow-hidden shadow-inner flex flex-col"
                style={{ width: '100%', maxWidth: `${GAME_WIDTH}px` }}
            >   
                {/* Starry background effect */}
                <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-20 pointer-events-none" />
                
                {/* Sensor Line (Lava visual) */}
                <div className="absolute bottom-4 inset-x-0 h-4 bg-rose-500/50 blur-md pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-4 bg-rose-500 border-t-2 border-rose-400 pointer-events-none" />


                {/* The React-Rendered Meteor Bodies over the Matter.js Engine */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" ref={sceneRef}>
                    {activeMeteors.map(meteor => (
                        <div
                            key={meteor.id}
                            className="absolute bg-white border-2 border-[#1CB0F6] border-b-4 rounded-xl flex items-center justify-center p-2 text-[#1CB0F6] font-black uppercase shadow-lg"
                            style={{
                                width: '140px',
                                height: '60px',
                                left: meteor.body.position.x,
                                top: meteor.body.position.y,
                                transform: `translate(-50%, -50%) rotate(${meteor.body.angle}rad)`,
                            }}
                        >
                            <span className="text-xl tracking-tight truncate w-full text-center">{meteor.word.en}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Control Buttons (The Missiles) */}
            <div className="h-32 mt-4 shrink-0 grid grid-cols-3 gap-2 px-1">
                {options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleButtonClick(opt)}
                        className="bg-white border-2 border-stone-200 border-b-8 rounded-2xl flex items-center justify-center p-2 hover:bg-stone-50 hover:border-stone-300 active:border-b-2 active:translate-y-[6px] transition-all"
                    >
                        <span className="text-stone-600 font-bold text-sm md:text-base break-words text-center leading-tight">
                            {opt}
                        </span>
                    </button>
                ))}
                {options.length === 0 && (
                    <div className="col-span-3 flex items-center justify-center text-stone-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                        Aguardar radar...
                    </div>
                )}
            </div>
            
        </div>
    );
}
