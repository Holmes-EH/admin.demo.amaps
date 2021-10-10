import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'

import EditOrder from './EditOrder'
import Toaster from '../../Toaster'
import Loader from '../../Loader/Loader'
import Pagination from '../../Pagination'

import {
	BiEdit,
	BiChevronLeft,
	BiChevronRight,
	BiCheckCircle,
	BiMinusCircle,
} from 'react-icons/bi'

import './orders.css'

const Orders = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products } =
		globalContext.state
	const [orders, setOrders] = useState([])
	const [selectedMonth, setSelectedMonth] = useState(new Date())
	const [orderToEdit, setOrderToEdit] = useState({})
	const [pageNumber, setPageNumber] = useState(1)
	const [pages, setPages] = useState(1)

	const [displayModal, setDisplayModal] = useState(false)

	const getOrderTotal = (orderDetails) => {
		let orderTotal = 0
		orderDetails.forEach((detail) => {
			orderTotal += detail.quantity * detail.product.pricePerKg
		})
		return orderTotal
	}

	const decrementDate = () => {
		setPageNumber(1)
		setSelectedMonth(
			new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1))
		)
	}
	const incrementDate = () => {
		setPageNumber(1)
		setSelectedMonth(
			new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1))
		)
	}

	const editOrder = (index, order) => {
		order.index = index
		setOrderToEdit(order)
		setDisplayModal(true)
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
			await axios.put(
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
					`${process.env.REACT_APP_API_URL}/api/orders/session/${selectedSession}?pageNumber=${pageNumber}`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setPageNumber(data.page)
				setPages(data.pages)
				setOrders(data.sessionOrders)
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
	}, [dispatch, user.token, selectedMonth, pageNumber])

	return (
		<div className='flex column container'>
			<h1>Commandes</h1>
			{displayModal && (
				<EditOrder
					order={orderToEdit}
					setDisplayModal={setDisplayModal}
					orders={orders}
					setOrders={setOrders}
				/>
			)}
			{displayModal && <div>Display modal to edit</div>}
			{message && <Toaster message={message} type={messageType} />}
			{loading && <Loader />}
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
									<td className='rowEnd'>
										<BiEdit
											className='action'
											onClick={() => {
												editOrder(index, order)
											}}
										/>
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
			<Pagination
				pages={pages}
				pageNumber={pageNumber}
				setPageNumber={setPageNumber}
			/>
		</div>
	)
}

export default Orders