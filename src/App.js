import Login from './components/Login'
import Layout from './components/backOffice/Layout'
import axios from 'axios'
import { store } from './store'
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './App.css'

function App() {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, products } = globalContext.state
	const history = useNavigate()

	useEffect(() => {
		let mounted = true
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
				if (mounted) {
					dispatch({
						type: 'SET_PRODUCT_LIST',
						payload: data,
					})
				}
			} catch (error) {
				if (error.response.status === 401) {
					localStorage.removeItem('juju2fruits_user')
					dispatch({ type: 'RESET_USER_LOGIN' })
					dispatch({
						type: 'MESSAGE',
						payload:
							error.response && error.response.data.message
								? error.response.data.message
								: error.message,
						messageType: 'error',
					})
				} else {
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
		}
		if (
			(user.token && !products) ||
			(user.token && products.length === 0)
		) {
			getProducts()
		}
		return () => (mounted = false)
	}, [dispatch, user.token, products])

	return (
		<div className='main flex column' style={{ paddingTop: '72px' }}>
			{!user.token ? (
				<Login />
			) : user.isAdmin ? (
				<Layout />
			) : (
				history.push('https://juju2fruits.com')
			)}
		</div>
	)
}

export default App
