import { useContext, useEffect, useState } from 'react'
import { store } from '../../../store'
import { useParams } from 'react-router-dom'

import axios from 'axios'

import Loader from '../../Loader/Loader'
import './labels.css'

const Labels = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, loading } = globalContext.state
	const [orders, setOrders] = useState([])

	const { amap, session } = useParams()

	const getOrderTotal = (total, detail) => {
		return total + detail.quantity * detail.product.pricePerKg
	}

	const getRecapTotalWeight = (total, product) => {
		if (product.product.title.toLowerCase() !== 'mangues') {
			return total + product.quantity
		} else {
			return total
		}
	}

	useEffect(() => {
		const getOrders = async () => {
			dispatch({ type: 'LOADING' })
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/orders?session=${session}&amap=${amap}`,
					config
				)
				setOrders(data.allOrders)
				dispatch({ type: 'FINISHED_LOADING' })
			} catch (error) {
				dispatch({
					type: 'MESSAGE',
					payload:
						error.response && error.response.data.message
							? error.response.data.message
							: error.message,
					messageType: 'error',
				})
				dispatch({ type: 'FINISHED_LOADING' })
			}
		}
		getOrders()
	}, [dispatch, user.token, session, amap])

	return (
		<div>
			{loading ? (
				<Loader />
			) : (
				<div className='tablesContainer'>
					{orders.map((order, index) => {
						return (
							<table className='etiquette' key={order._id}>
								<tbody>
									<tr>
										<th colSpan={order.details.length}>
											{order.client.name}
										</th>
										<td>{order.paid ? 'P' : 'NP'}</td>
									</tr>

									<tr>
										{order.details.map((detail) => {
											return (
												<td key={`title-${detail._id}`}>
													{detail.product.title.toLowerCase() ===
													'mangues'
														? 'Mg'
														: detail.product.title.toLowerCase() ===
														  'mandarines'
														? 'Md'
														: detail.product.title.substring(
																0,
																2
														  )}
												</td>
											)
										})}
										<td>
											{order.details
												.reduce(getOrderTotal, 0)
												.toFixed(2)}
										</td>
									</tr>
									<tr>
										{order.details.map((detail) => {
											return (
												<td key={`qty-${detail._id}`}>
													{detail.quantity}
												</td>
											)
										})}
										<td>
											{order.details.reduce(
												getRecapTotalWeight,
												0
											)}
										</td>
									</tr>
									<tr style={{ height: '5px' }}></tr>
								</tbody>
							</table>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default Labels
