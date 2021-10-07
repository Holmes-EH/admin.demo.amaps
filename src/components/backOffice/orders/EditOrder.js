import { useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'

import { BiCaretRight } from 'react-icons/bi'

const EditOrder = ({ order, setDisplayModal, orders, setOrders }) => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user } = globalContext.state

	const [id] = useState(order._id)
	const [details, setDetails] = useState(order.details)
	const [orderIndex] = useState(order.index)

	const setQuantity = (quantity, index) => {
		let newDetails = [...details]
		newDetails[index].quantity = quantity
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
				{details.map((detail, index) => {
					return (
						<div
							className='field'
							key={detail._id}
							style={{ width: '40%' }}
						>
							<input
								type='number'
								step='0.1'
								name={detail.product.title}
								className='input'
								value={detail.quantity}
								autoComplete='off'
								onChange={(e) =>
									setQuantity(e.target.value, index)
								}
							/>
							<label
								htmlFor={detail.product.title}
								className='label'
							>
								{detail.product.title}
							</label>
						</div>
					)
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
