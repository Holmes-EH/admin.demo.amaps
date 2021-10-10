import { useContext, useState, useEffect } from 'react'
import { store } from '../../store'
import axios from 'axios'
import Toaster from '../Toaster'
import Loader from '../Loader/Loader'

const Home = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products } =
		globalContext.state

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
		if (!products || products.length === 0) {
			getProducts()
		}
	}, [dispatch, user.token, products])

	return (
		<div className='flex column container'>
			{message && <Toaster message={message} type={messageType} />}
			{loading && <Loader />}
		</div>
	)
}

export default Home
