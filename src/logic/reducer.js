import { createStore, combineReducers } from 'redux';
import { runCalculation, requiredFormParamsPresent } from './utils';
import storage from './local-storage';

// Action types
const SET_CHAT_HISTORY = 'SET_CHAT_HISTORY';
const ADD_MESSAGE = 'ADD_MESSAGE';
const SET_CHAT_SETTINGS = 'SET_CHAT_SETTINGS';
const SET_ERROR = 'SET_ERROR';

// Action creators
export const setChatHistory = (history) => ({
	type: SET_CHAT_HISTORY,
	payload: history
});

export const addMessage = (message) => ({
	type: ADD_MESSAGE,
	payload: message
});

export const setChatSettings = (settings) => ({
	type: SET_CHAT_SETTINGS,
	payload: settings
});

export const setError = (error) => ({
	type: SET_ERROR,
	payload: error
});

// Initial state
const initialChatState = {
	history: [],
	settings: {
		messageLayout: 'default',
		systemPrompt: 'You are a helpful assistant.',
		apiModel: 'gpt-4o',
	},
	error: null
};

// Chat reducer
const chatReducer = (state = initialChatState, action) => {
	switch (action.type) {
		case SET_CHAT_HISTORY:
			return {
				...state,
				history: action.payload
			};
		case ADD_MESSAGE:
			return {
				...state,
				history: [...state.history, action.payload]
			};
		case SET_CHAT_SETTINGS:
			return {
				...state,
				settings: {
					...state.settings,
					...action.payload
				}
			};
		case SET_ERROR:
			return {
				...state,
				error: action.payload
			};
		default:
			return state;
	}
};

// Initial state for other parts of the app
const initialEstimateParams = {
	jobRole: '',
	industry: '',
	numberOfPCs: '',
	avgSalary: '',
	timeLost: '',
	additionalInfo: '',
	solutionOptions: [],
	solutionSelectedOptions: [],
	contactInfoForm: false,
};

// Estimate params reducer (for backward compatibility)
const estimateParamsReducer = (state = initialEstimateParams, action) => {
	switch (action.type) {
		case 'SET_ESTIMATE_PARAM':
			return {
				...state,
				[action.paramName]: action.paramValue
			};
		default:
			return state;
	}
};

// Combine reducers
const rootReducer = combineReducers({
	chat: chatReducer,
	estimateParams: estimateParamsReducer,
	estimateResults: (state = {}, action) => state,
	formComplete: (state = false, action) => state,
	outputURL: (state = '', action) => state,
});

// Create store
const store = createStore(
	rootReducer,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
