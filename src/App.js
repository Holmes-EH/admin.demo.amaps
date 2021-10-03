import Login from './components/Login'
import Layout from './components/backOffice/Layout'
import { store } from './store'
import { useContext } from 'react'

import './App.css'

function App() {
	const globalState = useContext(store)
	const { user } = globalState.state

	return (
		<div className='main flex column'>
			{!user.token ? (
				<Login />
			) : user.isAdmin ? (
				<Layout />
			) : (
				<p>redirect</p>
			)}
		</div>
	)
}

export default App
