import Login from './components/Login'
import { store } from './store'
import { useContext } from 'react'

import './App.css'

function App() {
	const globalState = useContext(store)
	const { user } = globalState.state

	return (
		<div className='main flex'>
			{!user.token ? <Login /> : <div>Enter the Back Office</div>}
		</div>
	)
}

export default App
