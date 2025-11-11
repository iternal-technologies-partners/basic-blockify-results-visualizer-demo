// Libraries
import React from 'react';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';

// CSS
import './App.css';
import './output.css';
import './static/css/iternal.css';

// Pages
import Chat from './pages/Chat';

import params from './params';

// Initialize Styletron
const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

// App: Main application component
function App() {
	return (
		<div className="App">
			<StyletronProvider value={engine}>
				<Chat pageParams={params} />
			</StyletronProvider>
		</div>
	);
}

export default App;
