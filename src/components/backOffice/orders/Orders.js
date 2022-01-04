import { useContext, useEffect, useState } from 'react'
import { store } from '../../../store'
import axios from 'axios'

import EditOrder from './EditOrder'
import Toaster from '../../Toaster'
import Loader from '../../Loader/Loader'

import {
	BiEdit,
	BiTrash,
	BiSearchAlt2,
	BiX,
	BiChevronLeft,
	BiChevronRight,
	BiCheckCircle,
	BiMinusCircle,
} from 'react-icons/bi'

import './orders.css'

const Orders = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products, selectedMonth } =
		globalContext.state
	const [orders, setOrders] = useState([])
	const [orderToEdit, setOrderToEdit] = useState({})

	const [amaps, setAmaps] = useState([])
	const [amap, setAmap] = useState('')
	const [tempName, setTempName] = useState('')
	const [clientName, setClientName] = useState('')

	const [displayModal, setDisplayModal] = useState(false)

	const search = (e) => {
		e.preventDefault()
		setClientName(tempName)
	}
	const resetSearch = (e) => {
		e.preventDefault()
		setTempName('')
		setClientName('')
	}

	const getOrderTotal = (total, detail) => {
		return total + detail.quantity * detail.product.pricePerKg
	}

	const decrementDate = () => {
		dispatch({
			type: 'SET_SELECTED_MONTH',
			payload: new Date(
				selectedMonth.setMonth(selectedMonth.getMonth() - 1)
			),
		})
	}
	const incrementDate = () => {
		dispatch({
			type: 'SET_SELECTED_MONTH',
			payload: new Date(
				selectedMonth.setMonth(selectedMonth.getMonth() + 1)
			),
		})
	}

	const editOrder = (index, order) => {
		order.index = index
		setOrderToEdit(order)
		setDisplayModal(true)
	}

	const deleteOrder = async (orderId) => {
		if (window.confirm('Es-tu sûr de vouloir supprimer cette commande ?')) {
			dispatch({ type: 'LOADING' })
			let newArrayOfOrders = orders.filter((order) => {
				return order._id !== orderId
			})
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.delete(
					`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`,
					config
				)
				dispatch({
					type: 'MESSAGE',
					payload: data.message,
					messageType: 'success',
				})
				setOrders(newArrayOfOrders)
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
				dispatch({ type: 'FINISHED_LOADING' })
			}
		}
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
		const getAmaps = async () => {
			dispatch({ type: 'LOADING' })
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/amaps`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setAmaps(data)
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
					`${process.env.REACT_APP_API_URL}/api/orders?session=${selectedSession}&clientName=${clientName}&amap=${amap}`,
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
			}
		}
		getAmaps()
		getOrdersBySession()
	}, [dispatch, user.token, selectedMonth, clientName, amap])

	return (
		<div className='flex column container'>
			<div className='flex column orderSearch'>
				<form className='flex searchForm'>
					<button onClick={(e) => search(e)} className='searchButton'>
						<BiSearchAlt2 />
					</button>
					<input
						type='text'
						name='search'
						placeholder='Rechercher par nom'
						value={tempName}
						onChange={(e) => setTempName(e.target.value)}
						style={{ margin: 'auto', border: 'none' }}
					/>
					<button
						className='resetSearch'
						onClick={(e) => resetSearch(e)}
					>
						<BiX />
					</button>
				</form>
				<form
					className='flex searchForm'
					style={{ width: '100%', justifyContent: 'space-around' }}
					onChange={(e) => setAmap(e.target.value)}
				>
					<p style={{ margin: 'auto' }}>Amap :</p>
					<select
						name='amap'
						style={{
							margin: 'auto',
							border: 'none',
							maxWidth: '60%',
						}}
					>
						<option value=''>Toutes</option>
						{amaps.map((amap) => {
							return (
								<option value={amap._id} key={amap._id}>
									{amap.name}
								</option>
							)
						})}
					</select>
				</form>
			</div>
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
			{loading ? (
				<Loader />
			) : (
				<>
					<div className='monthSelect'>
						<BiChevronLeft
							className='changeDate'
							onClick={decrementDate}
						/>
						{selectedMonth.toLocaleDateString('fr-FR', {
							month: 'long',
							year: 'numeric',
						})}
						<BiChevronRight
							className='changeDate'
							onClick={incrementDate}
						/>
					</div>
					{orders && orders.length !== 0 ? (
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
												<i>
													{product.pricePerKg.toFixed(
														2
													)}
												</i>
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
												const detailToDisplay =
													order.details.filter(
														(detail) =>
															detail.product
																._id ===
															product._id
													)

												if (
													detailToDisplay.length !== 0
												) {
													return (
														<td
															key={
																detailToDisplay[0]
																	._id
															}
														>
															{
																detailToDisplay[0]
																	.quantity
															}
														</td>
													)
												} else {
													return (
														<td
															key={`${product._id}-notIn-${order._id}`}
														>
															0
														</td>
													)
												}
											})}

											<td>
												<b>
													{order.details
														.reduce(
															getOrderTotal,
															0
														)
														.toFixed(2)}
													&nbsp;€
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
															changePaidStatus(
																index
															)
														}
													/>
												) : (
													<BiMinusCircle
														className='paidStatus'
														onClick={() =>
															changePaidStatus(
																index
															)
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
											<td className='rowEnd'>
												<BiTrash
													className='action'
													onClick={() => {
														deleteOrder(order._id)
													}}
												/>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					) : (
						<p style={{ textAlign: 'center' }}>
							Aucune Commande trouvée...
						</p>
					)}
				</>
			)}
		</div>
	)
}

export default Orders
