import { useContext } from 'react';
import { RunOptionsContext } from '../app';

export function Toolbar() {
    const runOptions = useContext(RunOptionsContext);

    const togglePause = () => {
        runOptions.list.paused = !runOptions.list.paused;
    };
    const handleStep = () => {
        runOptions.list.step = true;
    };

    return (
        <div className="toolbar">
            <h1 className="main-title">Beep Sort</h1>
            <div className="toolbar-buttons">
                <button className="controls-button" onClick={togglePause}>
                    {runOptions.list.paused ? 'Resume' : 'Pause'}
                </button>
                <button className="controls-button" onClick={handleStep}>
                    Step
                </button>
            </div>
        </div>
    );
}
