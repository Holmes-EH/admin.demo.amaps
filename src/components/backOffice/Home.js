import { useContext, useEffect, useState } from 'react'
import { store } from '../../store'
import axios from 'axios'

import Toaster from '../Toaster'
import Loader from '../Loader/Loader'

import './home.css'

import { BiChevronLeft, BiChevronRight, BiPurchaseTagAlt } from 'react-icons/bi'

const Home = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products } =
		globalContext.state
	const [recaps, setRecaps] = useState([])
	const [sessions, setSessions] = useState([])
	const [selectedMonth, setSelectedMonth] = useState(new Date())
	const [receptionDate, setReceptionDate] = useState(selectedMonth)

	const decrementDate = () => {
		setSelectedMonth(
			new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1))
		)
		setReceptionDate(selectedMonth)
	}
	const incrementDate = () => {
		setSelectedMonth(
			new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1))
		)
		setReceptionDate(selectedMonth)
	}

	const getRecapTotalWeight = (total, product) => {
		return (
			product.product.title.toLowerCase() !== 'mangues' &&
			total + product.quantity
		)
	}

	const getSessionTotalWeight = () => {
		let totalWeight = 0
		recaps.forEach((recap) => {
			totalWeight += recap.products.reduce(getRecapTotalWeight, 0)
		})
		return totalWeight
	}
	const getSessionTotalWeightPerProduct = (product) => {
		let totalWeightPerProduct = 0
		recaps.forEach((recap) => {
			let productInRecap = recap.products.filter(
				(detail) => detail.product._id === product._id
			)
			productInRecap.length > 0 &&
				(totalWeightPerProduct += productInRecap[0].quantity)
		})
		return totalWeightPerProduct
	}

	const addNewSession = async () => {
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
			const { data } = await axios.post(
				`${process.env.REACT_APP_API_URL}/api/sessions`,
				{ session: selectedSession, isOpen: true },
				config
			)
			dispatch({ type: 'FINISHED_LOADING' })
			setSessions(data.sessions)
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

	const setRecapDelivery = async (_id, date) => {
		if (date.length > 0) {
			if (
				window.confirm(
					`En changeant la date de livraison, les clients de cette amap ayant commandé ce mois-ci recevront un email de notification.\nEst-ce la bonne date ?\n
                ${new Date(date).toLocaleDateString('fr-FR', {
					weekday: 'long',
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				})}`
				)
			) {
				dispatch({ type: 'LOADING' })
				try {
					const config = {
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					}
					await axios.put(
						`${process.env.REACT_APP_API_URL}/api/orders/recaps/update`,
						{ _id, date },
						config
					)
					const recapToUpdate = recaps.filter(
						(recap) => recap._id === _id
					)
					recapToUpdate[0].delivery = date
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
		}
	}

	const generateLabels = async (amap) => {
		console.log(amap)
	}

	useEffect(() => {
		const getRecapsBySession = async () => {
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
					`${process.env.REACT_APP_API_URL}/api/orders/recaps/${selectedSession}`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setRecaps(data.sessionRecaps)
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
		getRecapsBySession()
	}, [dispatch, user.token, selectedMonth])

	useEffect(() => {
		const getSession = async () => {
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
					`${process.env.REACT_APP_API_URL}/api/sessions?session=${selectedSession}`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setSessions(data)
			} catch (error) {
				setSessions([])
			}
		}
		getSession()
	}, [dispatch, user.token, selectedMonth])

	return (
		<div className='flex column container recap'>
			{message && <Toaster message={message} type={messageType} />}
			{sessions && sessions.length === 0 ? (
				<h1 className='stop'>Commandes non autorisées...</h1>
			) : (
				<>
					<h1 className='go'>Commandes autorisées</h1>
				</>
			)}

			<div className='recapMonthSelect'>
				<BiChevronLeft className='changeDate' onClick={decrementDate} />
				<div style={{ minWidth: '200px', textAlign: 'center' }}>
					{selectedMonth.toLocaleDateString('fr-FR', {
						month: 'long',
						year: 'numeric',
					})}
				</div>
				<BiChevronRight
					className='changeDate'
					onClick={incrementDate}
				/>
			</div>
			{loading && <Loader />}
			{sessions && sessions.length === 0 ? (
				<div
					className='button'
					style={{
						padding: '0.3em 1em',
						borderRadius: '5px',
					}}
					onClick={addNewSession}
				>
					Autoriser les commandes
				</div>
			) : recaps && recaps.length === 0 ? (
				<p style={{ textAlign: 'center' }}>
					Aucune commande trouvée pour le moment
				</p>
			) : (
				<>
					<h3>Total toutes amaps :</h3>
					<table
						style={{
							minWidth: '780px',

							margin: '0 auto',
							marginBottom: '2em',
						}}
					>
						<thead>
							<tr>
								{products.map((product) => {
									return (
										<th key={product._id}>
											<b>
												{product.title}{' '}
												{product.title.toLowerCase() ===
												'mangues'
													? '(pcs)'
													: '(kg)'}
											</b>
										</th>
									)
								})}
								<th>Poids Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								{products.map((product) => {
									return (
										<td key={`total-${product._id}`}>
											{getSessionTotalWeightPerProduct(
												product
											)}
										</td>
									)
								})}
								<td>
									<b>{getSessionTotalWeight()} kg</b>
								</td>
							</tr>
						</tbody>
					</table>
					<div className='flex dateInput'>
						<label htmlFor='dateDeReception'>
							Date de réception des fruits :
						</label>
						<input
							type='date'
							name='dateDeReception'
							value={`${receptionDate.getFullYear()}-${(
								'0' +
								(receptionDate.getMonth() + 1)
							).slice(-2)}-${(
								'0' + receptionDate.getDate()
							).slice(-2)}`}
							min={`${selectedMonth.getFullYear()}-${(
								'0' +
								(selectedMonth.getMonth() + 1)
							).slice(-2)}-01`}
							onChange={(e) =>
								setReceptionDate(new Date(e.target.value))
							}
						/>
						<div
							className='button'
							style={{
								marginLeft: '1em',
								padding: '0.3em 1em',
								borderRadius: '5px',
							}}
						>
							ENREGISTRER
						</div>
					</div>
					<h3>Détail par amap :</h3>
					<table
						style={{
							minWidth: '780px',

							margin: '0 auto',
						}}
					>
						<thead>
							<tr>
								<th>Groupement</th>
								<th>Amap</th>
								{products.map((product) => {
									return (
										<th key={product._id}>
											<b>
												{product.title}{' '}
												{product.title.toLowerCase() ===
												'mangues'
													? '(pcs)'
													: '(kg)'}
											</b>
										</th>
									)
								})}
								<th>
									Poids Total
									<br />
									<i>par Amap</i>
								</th>
								<th className='rowEnd recapRowEnd'>
									Date de livraison :
								</th>
							</tr>
						</thead>
						<tbody>
							{recaps.map((recap) => {
								return (
									<tr
										key={recap._id}
										className='clickableRow'
									>
										<td>{recap.amap.groupement}</td>
										<td>{recap.amap.name}</td>
										{products.map((product) => {
											const detailToDisplay =
												recap.products.filter(
													(detail) =>
														detail.product._id ===
														product._id
												)
											if (detailToDisplay.length > 0) {
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
														key={`${product._id}-notIn-${recap._id}`}
													>
														0
													</td>
												)
											}
										})}
										<td>
											<b>
												{recap.products.reduce(
													getRecapTotalWeight,
													0
												)}{' '}
												kg
											</b>
										</td>
										<td className='rowEnd recapRowEnd'>
											<input
												type='date'
												name='dateDeLivraison'
												value={
													recap.delivery
														? `${new Date(
																recap.delivery
														  ).getFullYear()}-${(
																'0' +
																(new Date(
																	recap.delivery
																).getMonth() +
																	1)
														  ).slice(-2)}-${(
																'0' +
																new Date(
																	recap.delivery
																).getDate()
														  ).slice(-2)}`
														: ''
												}
												onChange={(e) =>
													setRecapDelivery(
														recap._id,
														e.target.value
													)
												}
											/>
										</td>
										<td className='rowEnd recapRowEnd'>
											<div
												className='button'
												onClick={() =>
													generateLabels(
														recap.amap._id
													)
												}
											>
												<BiPurchaseTagAlt />
											</div>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</>
			)}
		</div>
	)
}

export default Home
