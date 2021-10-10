import Login from './components/Login'
import Layout from './components/backOffice/Layout'
import axios from 'axios'
import { store } from './store'
import { useContext, useEffect } from 'react'

import './App.css'

function App() {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, products } = globalContext.state

	useEffect(() => {
		const getProducts = async () => {
			dispatch({ type: 'LOADING' })
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/products`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				dispatch({
					type: 'SET_PRODUCT_LIST',
					payload: data,
				})
			} catch (error) {
				dispatch({
					type: 'MESSAGE',
					payload:
						error.response && error.response.data.message
							? error.response.data.message
							: error.message,
					messageType: 'error',
				})
			}
		}
		if (
			(user.token && !products) ||
			(user.token && products.length === 0)
		) {
			getProducts()
		}
	}, [dispatch, user.token, products])

	return (
		<div className='main flex column' style={{ paddingTop: '65px' }}>
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
