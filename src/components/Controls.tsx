import { useContext, useEffect, useState } from 'react';
import { handleInput } from '../event-handlers';
import { runVisualizer } from '../visualizer';
import { ConfigurationContext, RunOptionsContext } from '../app';
import { useForm } from 'react-hook-form';
import { IControlsConfiguration } from '../models';
import { VisualizerFactory, Visualizers, visualizers } from '../visualizer-factory';
import { Algorithms } from '../algorithm-factory';

type FormData = Omit<IControlsConfiguration, 'visualizer'> & { visualizer: Visualizers };

export function Controls() {
    const { register, watch, getValues } = useForm<FormData>();
    const runOptions = useContext(RunOptionsContext);
    const configuration = useContext(ConfigurationContext);
    const [visRunning, setVisRunning] = useState(false);

    const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        handleInput(event, configuration.controls);
    };

    const handleStart = async () => {
        setVisRunning(true);
        await runVisualizer(runOptions, configuration);
        setVisRunning(false);
    };

    const setConfigurationControls = (data: FormData) => {
        configuration.controls = {
            ...data,
            visualizer: VisualizerFactory.visualizer(data.visualizer)
        };
        configuration.emitValues();
    };

    useEffect(() => {
        const { unsubscribe } = watch(data => {
            setConfigurationControls({ ...getValues(), ...data });
        });
        return unsubscribe;
    }, [watch]);
    useEffect(() => {
        setConfigurationControls(getValues());
    }, []);

    return (
        <div className="controls-container" onChange={handleOnChange}>
            <div className="tabs">
                <div id="tab-controls" className="tab active">
                    <span className="tab-text">Controls</span>
                </div>
                <div id="tab-presentation" className="tab">
                    <span className="tab-text">Presentation</span>
                </div>
            </div>
            <div className="controls-content">
                <div id="config-controls" className="controls-sections">
                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Audio</span>
                            <input
                                className="controls-input"
                                id="audio"
                                type="checkbox"
                                defaultChecked
                                {...register('audio')}
                            />
                        </label>
                    </div>

                    <hr className="controls-divider" />

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Show Algorithm name</span>
                            <input
                                className="controls-input"
                                id="show-algo"
                                type="checkbox"
                                defaultChecked
                                {...register('showAlgoName')}
                            />
                        </label>
                    </div>

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Show Accesses</span>
                            <input
                                className="controls-input"
                                id="show-accesses"
                                type="checkbox"
                                defaultChecked
                                {...register('showAccesses')}
                            />
                        </label>
                    </div>

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Show Comparisons</span>
                            <input
                                className="controls-input"
                                id="show-comparisons"
                                type="checkbox"
                                defaultChecked
                                {...register('showComparisons')}
                            />
                        </label>
                    </div>

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Show FPS</span>
                            <input
                                className="controls-input"
                                id="show-fps"
                                type="checkbox"
                                defaultChecked
                                {...register('showFps')}
                            />
                        </label>
                    </div>

                    <hr className="controls-divider" />

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Colors</span>
                            <input
                                className="controls-input"
                                id="color"
                                type="checkbox"
                                defaultChecked
                                {...register('colors')}
                            />
                        </label>
                        <label className="controls-label">
                            <span className="label-text">Visualizer</span>
                            <select
                                className="controls-input"
                                id="visualizer-input"
                                {...register('visualizer')}
                            >
                                {visualizers.map(visualizer => (
                                    <option value={visualizer} key={visualizer}>
                                        {visualizer}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="controls-label">
                            <span className="label-text">Animate shuffle</span>
                            <input
                                className="controls-input"
                                id="anim-shuffle"
                                type="checkbox"
                                {...register('animateShuffle')}
                            />
                        </label>
                    </div>

                    <hr className="controls-divider" />

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Speed</span>
                            <input
                                className="controls-input"
                                id="speed"
                                type="number"
                                defaultValue="1"
                                min="1"
                                step="1"
                                {...register('speed')}
                            />
                        </label>
                        <label className="controls-label">
                            <span className="label-text">Delay (ms)</span>
                            <input
                                className="controls-input"
                                id="delay"
                                type="number"
                                defaultValue="4"
                                min="4"
                                step="1"
                                {...register('waitDelay')}
                            />
                        </label>
                        <label className="controls-label">
                            <span className="label-text">Max sample size</span>
                            <input
                                className="controls-input"
                                id="maxSampleSize"
                                type="number"
                                defaultValue="0"
                                min="0"
                                {...register('maxSampleSize')}
                            />
                        </label>
                    </div>

                    <hr className="controls-divider" />

                    <div className="controls-section">
                        <label className="controls-label">
                            <span className="label-text">Algorithm</span>
                            <select
                                className="controls-input"
                                name="algoSelect"
                                id="algoSelect"
                                {...register('algorithm')}
                            >
                                {Object.entries(Algorithms).map(([key, name]) => (
                                    <option value={key} key={key}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="controls-label">
                            <span className="label-text">List length</span>
                            <input
                                className="controls-input"
                                id="listLength"
                                type="number"
                                defaultValue="200"
                                min="0"
                                step="1"
                                {...register('listLength')}
                            />
                        </label>
                        <div>
                            <button
                                className="controls-button"
                                id="button-start"
                                onClick={handleStart}
                                disabled={visRunning}
                            >
                                Start
                            </button>
                        </div>
                    </div>
                </div>
                <div id="config-presentation" className="controls-container tab-hidden">
                    <p>Not yet implemented</p>
                </div>
            </div>
        </div>
    );
}
