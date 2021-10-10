import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'

import { BiCaretRight } from 'react-icons/bi'

const EditOrder = ({ order, setDisplayModal, orders, setOrders }) => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, products } = globalContext.state

	const [id] = useState(order._id)
	const [details, setDetails] = useState(order.details)
	const [orderIndex] = useState(order.index)

	const setQuantity = (product, quantity) => {
		let newDetails = [...details]
		let detail = newDetails.filter(
			(detail) => detail.product._id === product._id
		)
		if (detail.length > 0) {
			const detailIndex = details.findIndex(
				(detail) => detail.product._id === product._id
			)
			newDetails[detailIndex].quantity = quantity
		} else {
			newDetails.push({ product, quantity })
		}
		setDetails(newDetails)
	}

	const displayDate = (isoDateTime) => {
		const date = new Date(Date.parse(isoDateTime))
		return date.toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	const saveOrder = async () => {
		dispatch({ type: 'LOADING' })
		const config = {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		}
		try {
			details.forEach((detail) => {
				let productId = detail.product._id
				delete detail.product
				detail.product = productId
			})

			const { data } = await axios.put(
				`${process.env.REACT_APP_API_URL}/api/orders`,
				{
					order: {
						_id: id,
						details,
					},
				},
				config
			)
			setDisplayModal(false)
			dispatch({
				type: 'MESSAGE',
				payload: 'Commande mise à jour avec succès !',
				messageType: 'success',
			})
			dispatch({ type: 'FINISHED_LOADING' })
			let newArrayofOrders = orders.filter((order) => {
				return order._id !== data._id
			})
			newArrayofOrders.splice(orderIndex, 0, data)
			setOrders(newArrayofOrders)
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

	useEffect(() => {}, [details])

	return (
		<div className='modal flex column'>
			<h1>
				{order.client.name} - <i>{order.amap.name}</i>
			</h1>
			<h2>Session : {order.session}</h2>
			<h4
				style={{
					display: 'flex',
					width: '100%',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				Date de la commande <BiCaretRight style={{ fontSize: '2em' }} />{' '}
				{displayDate(order.createdAt)}
			</h4>
			<form>
				{products.map((product) => {
					const detailToDisplay = details.filter(
						(detail) => detail.product._id === product._id
					)
					if (detailToDisplay.length !== 0) {
						return (
							<div
								className='field'
								key={detailToDisplay[0].product._id}
								style={{ width: '40%' }}
							>
								<input
									type='number'
									step='0.1'
									name={detailToDisplay[0].product.title}
									className='input'
									value={detailToDisplay[0].quantity}
									autoComplete='off'
									onChange={(e) =>
										setQuantity(
											detailToDisplay[0].product,
											e.target.value
										)
									}
								/>
								<label
									htmlFor={detailToDisplay[0].product.title}
									className='label'
								>
									{detailToDisplay[0].product.title}
								</label>
							</div>
						)
					} else {
						return (
							<div
								className='field'
								key={`new-${product._id}-In-${order._id}`}
								style={{ width: '40%' }}
							>
								<input
									type='number'
									step='0.1'
									name={product.title}
									className='input'
									value='0'
									autoComplete='off'
									onChange={(e) =>
										setQuantity(product, e.target.value)
									}
								/>
								<label
									htmlFor={product.title}
									className='label'
								>
									{product.title}
								</label>
							</div>
						)
					}
				})}
			</form>
			<div
				className='flex'
				style={{
					width: '100%',
					justifyContent: 'space-evenly',
					marginBottom: 'auto',
				}}
			>
				<button
					className='button danger'
					style={{ border: 'none' }}
					onClick={() => setDisplayModal(false)}
				>
					ANNULER
				</button>
				<button className='button' onClick={() => saveOrder()}>
					ENREGISTRER
				</button>
			</div>
		</div>
	)
}

export default EditOrder
