import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'

import Toaster from '../../Toaster'
import Loader from '../../Loader/Loader'
import {
	BiChevronLeft,
	BiChevronRight,
	BiCheckCircle,
	BiMinusCircle,
} from 'react-icons/bi'

import './orders.css'

const Orders = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading } = globalContext.state
	const [orders, setOrders] = useState([])
	const [products, setProducts] = useState([])
	const [selectedMonth, setSelectedMonth] = useState(new Date())

	const [displayModal, setDisplayModal] = useState(false)

	const getOrderTotal = (orderDetails) => {
		let orderTotal = 0
		orderDetails.forEach((detail) => {
			orderTotal += detail.quantity * detail.product.pricePerKg
		})
		return orderTotal
	}

	const decrementDate = () => {
		setSelectedMonth(
			new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1))
		)
	}
	const incrementDate = () => {
		setSelectedMonth(
			new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1))
		)
	}

	const changePaidStatus = async (index) => {
		const orderToUpdate = orders[index]
		orderToUpdate.paid = !orderToUpdate.paid
		try {
			dispatch({ type: 'LOADING' })
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
			const { data } = await axios.put(
				`${process.env.REACT_APP_API_URL}/api/orders`,
				{
					order: {
						_id: orderToUpdate._id,
						client: orderToUpdate.client,
						details: orderToUpdate.details,
						amap: orderToUpdate.amap,
						session: orderToUpdate.session,
						paid: orderToUpdate.paid,
					},
				},
				config
			)
			dispatch({ type: 'FINISHED_LOADING' })
		} catch (error) {
			dispatch({
				type: 'MESSAGE',
				payload:
					error.response && error.response.data.error
						? error.response.data.error
						: error.message,
				messageType: 'error',
			})
		}
	}

	useEffect(() => {
		const getOrdersBySession = async () => {
			dispatch({ type: 'LOADING' })
			const selectedSession =
				selectedMonth.getFullYear().toString() +
				('0' + (selectedMonth.getMonth() + 1)).slice(-2)
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/orders/session/${selectedSession}`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setOrders(data)
			} catch (error) {
				dispatch({
					type: 'MESSAGE',
					payload:
						error.response && error.response.data.error
							? error.response.data.error
							: error.message,
					messageType: 'error',
				})
			}
		}
		const getProducts = async () => {
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
				setProducts(data)
			} catch (error) {
				dispatch({
					type: 'MESSAGE',
					payload:
						error.response && error.response.data.error
							? error.response.data.error
							: error.message,
					messageType: 'error',
				})
			}
		}

		getOrdersBySession()
		getProducts()
	}, [dispatch, user.token, selectedMonth])

	return (
		<div className='flex column container'>
			<h1>Commandes</h1>
			<div className='monthSelect'>
				<BiChevronLeft className='changeDate' onClick={decrementDate} />
				{selectedMonth.toLocaleDateString('fr-FR', {
					month: 'long',
					year: 'numeric',
				})}
				<BiChevronRight
					className='changeDate'
					onClick={incrementDate}
				/>
			</div>
			{displayModal && <div>Display modal to edit</div>}
			{message && <Toaster message={message} type={messageType} />}
			{loading && <Loader />}
			{orders && (
				<table
					style={{
						minWidth: '780px',
						maxWidth: '1100px',
						margin: '0 auto',
					}}
				>
					<thead>
						<tr>
							<th>Amap</th>
							<th>Nom</th>
							{products.map((product) => {
								return (
									<th key={product._id}>
										<b>{product.title}</b>
										<br />
										<i>{product.pricePerKg.toFixed(2)}</i>
									</th>
								)
							})}
							<th>Total</th>
							<th>Payé ?</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order, index) => {
							return (
								<tr key={order._id}>
									<td>
										<b>{order.amap.name}</b>
									</td>

									<td>
										<a
											href={`/clients/${order.client._id}`}
										>
											{order.client.name}
										</a>
									</td>

									{products.map((product) => {
										return order.details.map((detail) => {
											if (
												detail.product.title ===
												product.title
											) {
												return (
													<td key={order._id}>
														{detail.quantity}
													</td>
												)
											} else return null
										})
									})}

									<td>
										<b>
											{getOrderTotal(
												order.details
											).toFixed(2)}{' '}
											€
										</b>
									</td>
									<td
										className={
											order.paid
												? 'available'
												: 'unavailable'
										}
										style={{
											textAlign: 'center',
											fontSize: '1.5em',
										}}
									>
										{order.paid ? (
											<BiCheckCircle
												className='paidStatus'
												onClick={() =>
													changePaidStatus(index)
												}
											/>
										) : (
											<BiMinusCircle
												className='paidStatus'
												onClick={() =>
													changePaidStatus(index)
												}
											/>
										)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			)}
			{orders.length === 0 && (
				<p style={{ textAlign: 'center' }}>
					Aucune Commande trouvée pour ce mois-ci
				</p>
			)}
		</div>
	)
}

export default Orders
