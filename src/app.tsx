import './styling/global.scss';
import { createContext, useState } from 'react';
import { CanvasView } from './components/CanvasView';
import { Toolbar } from './components/Toolbar';
import { Controls } from './components/Controls';
import { Configuration } from './configuration';
import { RunOptions } from './models';
import { AsyncListVisualizer } from './async-list-visualizer';

export const ConfigurationContext = createContext<Configuration>(null);
export const RunOptionsContext = createContext<RunOptions>(null);

export function App() {
    const [configuration] = useState<Configuration>(new Configuration());
    const [runOptionsState] = useState<RunOptions>({
        list: new AsyncListVisualizer(),
        canvasInfo: {
            canvas: null,
            webglCanvas: null,
            height: 0,
            width: 0
        },
        canvasOverlay: null
    });
    return (
        <ConfigurationContext.Provider value={configuration}>
            <RunOptionsContext.Provider value={runOptionsState}>
                <div className="page-container">
                    <Toolbar />
                    <div id="visualizer">
                        <CanvasView />
                        <Controls />
                    </div>
                </div>
            </RunOptionsContext.Provider>
        </ConfigurationContext.Provider>
    );
}
