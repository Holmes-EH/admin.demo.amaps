import { useContext, useEffect, useState } from 'react'
import { store } from '../../store'
import axios from 'axios'

import Toaster from '../Toaster'
import Loader from '../Loader/Loader'

import { useHistory } from 'react-router-dom'

import './home.css'

import { BiChevronLeft, BiChevronRight, BiPurchaseTagAlt } from 'react-icons/bi'

const Home = () => {
	const history = useHistory()
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products, selectedMonth } =
		globalContext.state
	const [recaps, setRecaps] = useState([])
	const [sessions, setSessions] = useState([])

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
			dispatch({
				type: 'SET_SELECTED_MONTH',
				payload: new Date(
					selectedMonth.setMonth(selectedMonth.getMonth())
				),
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

	const setRecapDelivery = async (_id, date) => {
		if (date.length > 0) {
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

	const updateNews = async (_id) => {
		dispatch({ type: 'LOADING' })
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
			const { data } = await axios.put(
				`${process.env.REACT_APP_API_URL}/api/sessions`,
				{ _id, news: sessions.news },
				config
			)
			setSessions(data)
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

	const saveReceptionDate = async (_id, date) => {
		dispatch({ type: 'LOADING' })
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
			const { data } = await axios.put(
				`${process.env.REACT_APP_API_URL}/api/sessions`,
				{ _id, lastOrderDate: new Date(date) },
				config
			)
			setSessions(data)
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

	const generateLabels = async (amap) => {
		const selectedSession =
			selectedMonth.getFullYear().toString() +
			('0' + (selectedMonth.getMonth() + 1)).slice(-2)
		history.push(`/etiquettes/${amap}/${selectedSession}`)
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
				setRecaps(data.sessionRecaps)
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
				setSessions(data)
				dispatch({ type: 'FINISHED_LOADING' })
			} catch (error) {
				setSessions([])
				dispatch({ type: 'FINISHED_LOADING' })
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
					<div className='topSection flex'>
						<div
							className='flex column'
							style={{ margin: 'auto', marginRight: '1em' }}
						>
							<h3>Infos du mois :</h3>
							<textarea
								name='news'
								cols='60'
								rows='10'
								value={sessions.news}
								onChange={(e) =>
									setSessions(() => {
										let sessionsToUpdate = { ...sessions }
										sessionsToUpdate.news = e.target.value
										return { ...sessionsToUpdate }
									})
								}
							></textarea>
							<button
								className='button save'
								onClick={() => updateNews(sessions._id)}
							>
								Enregistrer
							</button>
						</div>
						<div
							className='flex column'
							style={{
								height: '100%',
								justifyContent: 'space-around',
							}}
						>
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
												<td
													key={`total-${product._id}`}
												>
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
									Date limite de commande :
								</label>
								<input
									type='date'
									name='dateDeReception'
									value={
										sessions.lastOrderDate
											? `${new Date(
													sessions.lastOrderDate
											  ).getFullYear()}-${(
													'0' +
													(new Date(
														sessions.lastOrderDate
													).getMonth() +
														1)
											  ).slice(-2)}-${(
													'0' +
													new Date(
														sessions.lastOrderDate
													).getDate()
											  ).slice(-2)}`
											: ''
									}
									min={`${selectedMonth.getFullYear()}-${(
										'0' +
										(selectedMonth.getMonth() + 1)
									).slice(-2)}-01`}
									onChange={(e) => {
										saveReceptionDate(
											sessions._id,
											e.target.value
										)
									}}
								/>
							</div>
						</div>
					</div>
					<hr style={{ width: '100%' }} />
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
