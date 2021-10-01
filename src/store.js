import { createContext, useReducer } from 'react'

const userFromStorage = JSON.parse(localStorage.getItem('user')) || {}

const initialState = { user: userFromStorage }
const store = createContext(initialState)
const { Provider } = store

const StateProvider = ({ children }) => {
	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'USER_LOGIN':
				return { user: action.payload }
			case 'RESET_USER_LOGIN':
				return { user: {} }
			case 'ERROR':
				return { ...state, error: action.payload }
			default:
				throw new Error()
		}
	}, initialState)
	return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }
