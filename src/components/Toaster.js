import { useContext } from 'react'
import { store } from '../store'
import './toaster.css'

const Toaster = ({ message, type = 'error' }) => {
	const globalState = useContext(store)
	const { dispatch } = globalState

	const dismissMessage = () => {
		dispatch({
			type: 'RESET_MESSAGE',
		})
		dispatch({
			type: 'FINISHED_LOADING',
		})
	}
	return (
		<div className={`toast ${type}`} onClick={dismissMessage}>
			{type === 'error' ? (
				<h1>😬</h1>
			) : type === 'success' ? (
				<h1>😁</h1>
			) : (
				<h1>🧐</h1>
			)}
			<p>{message}</p>
		</div>
	)
}

export default Toaster
