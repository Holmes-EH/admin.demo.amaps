import { useContext, useEffect, useState } from 'react'
import { store } from '../../store'
import axios from 'axios'

import MessageModal from './MessageModal'
import Toaster from '../Toaster'
import Loader from '../Loader/Loader'

import { useHistory } from 'react-router-dom'

import './home.css'

import {
	BiChevronLeft,
	BiChevronRight,
	BiPurchaseTagAlt,
	BiEnvelope,
	BiEnvelopeOpen,
} from 'react-icons/bi'

const Home = () => {
	const history = useHistory()
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products, selectedMonth } =
		globalContext.state
	const [recaps, setRecaps] = useState([])
	const [sessions, setSessions] = useState([])
	const [messageObject, setMessageObject] = useState('')
	const [messageBody, setMessageBody] = useState('')
	const [selectedAmapId, setSelectedAmapId] = useState('')
	const [amapName, setAmapName] = useState('')
	const [displayMessageModal, setdisplayMessageModal] = useState(false)

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
	const elision = (productTitle) => {
		const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'h']
		if (vowels.includes(productTitle.slice(0, 1).toLowerCase())) {
			return `d'${productTitle.toLowerCase()}`
		} else {
			return `de ${productTitle.toLowerCase()}`
		}
	}

	const getRecapTotalWeight = (total, product) => {
		if (product.product.title.toLowerCase() !== 'mangues') {
			return total + product.quantity
		} else {
			return total
		}
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

	const deleteSession = async (id) => {
		if (
			window.confirm(
				`Est-tu sûr ?\nAucune autre commande ne pourra être passée pour le mois de : ${selectedMonth.toLocaleDateString(
					'fr-FR',
					{ month: 'long', year: 'numeric' }
				)}`
			)
		) {
			dispatch({ type: 'LOADING' })
			try {
				const { data } = await axios.delete(
					`${process.env.REACT_APP_API_URL}/api/sessions`,
					{
						data: { _id: id },
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					}
				)
				setRecaps([])
				setSessions([])
				dispatch({ type: 'FINISHED_LOADING' })
				dispatch({
					type: 'MESSAGE',
					payload: data.message,
					messageType: 'success',
				})
			} catch (error) {
				dispatch({ type: 'FINISHED_LOADING' })
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
				recapToUpdate[0].notificationSent = false
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
	const displayEmailMessage = (amapId, amapName) => {
		setdisplayMessageModal(true)
		setAmapName(amapName)
		setSelectedAmapId(amapId)
		const amapRecap = recaps.filter((recap) => recap.amap._id === amapId)[0]
		setMessageObject(
			`Agrumes ${selectedMonth.toLocaleDateString('fr-FR', {
				month: 'long',
			})}`
		)
		setMessageBody(
			`Bonjour amateurs et amatrices d’agrumes !\nC’est reparti pour le mois ${elision(
				selectedMonth.toLocaleDateString('fr-FR', {
					month: 'long',
				})
			)}, vos commandes sont à passer jusqu’au ${new Date(
				sessions.lastOrderDate
			).toLocaleDateString('fr-FR', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			})}.\nPour une livraison le ${new Date(
				amapRecap.delivery
			).toLocaleDateString('fr-FR', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			})} vers ${amapRecap.amap.deliveryTime} sur ${
				amapRecap.amap.name
			}.\n\nVous pouvez passer vos commandes directement à l’adresse: <a href="https://juju2fruits.com">juju2fruits.com</a> avec votre code Amap: ${
				amapRecap.amap.accessCode
			}.\n\nBonne journée,\nJulien F`
		)
	}
	const notifyAmap = async (amapId) => {
		dispatch({ type: 'LOADING' })
		setdisplayMessageModal(false)
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
			const { data } = await axios.post(
				`${process.env.REACT_APP_API_URL}/api/amaps/sendMail`,
				{
					amapId: selectedAmapId,
					sessionId: sessions._id,
					messageObject,
					messageBody,
				},
				config
			)
			const newRecaps = [...recaps]
			const index = newRecaps.findIndex(
				(recap) => recap._id === data.orderRecap._id
			)
			newRecaps[index] = data.orderRecap
			setRecaps(newRecaps)

			dispatch({
				type: 'MESSAGE',
				payload: data.message,
				messageType: 'success',
			})
			dispatch({ type: 'FINISHED_LOADING' })
		} catch (error) {
			console.log(error)
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
			{loading ? (
				<Loader />
			) : sessions && sessions.length === 0 ? (
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
					{displayMessageModal && (
						<MessageModal
							messageObject={messageObject}
							setMessageObject={setMessageObject}
							messageBody={messageBody}
							setMessageBody={setMessageBody}
							sendMessage={notifyAmap}
							amapName={amapName}
							setDisplayMessageModal={setdisplayMessageModal}
						/>
					)}
					<div className='topSection flex'>
						<div
							className='flex column'
							style={{
								margin: 'auto',
								marginRight: '1em',
								width: '100%',
							}}
						>
							<h3>Infos du mois :</h3>
							<textarea
								style={{ width: '100%' }}
								name='news'
								cols='20'
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
										{recap.delivery && (
											<td className='rowEnd recapRowEnd'>
												<div
													className={`button ${
														recap.notificationSent &&
														'disable'
													}`}
													onClick={() =>
														displayEmailMessage(
															recap.amap._id,
															recap.amap.name
														)
													}
												>
													{recap.notificationSent ? (
														<BiEnvelopeOpen />
													) : (
														<BiEnvelope />
													)}
												</div>
											</td>
										)}
									</tr>
								)
							})}
						</tbody>
					</table>
					<button
						className='button danger'
						style={{ border: 'none' }}
						onClick={() => deleteSession(sessions._id)}
					>
						SUPPRIMER
					</button>
				</>
			)}
		</div>
	)
}

export default Home
