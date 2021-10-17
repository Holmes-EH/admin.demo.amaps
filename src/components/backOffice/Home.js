import { useContext, useEffect, useState } from 'react'
import { store } from '../../store'
import axios from 'axios'

import Toaster from '../Toaster'
import Loader from '../Loader/Loader'
import Pagination from '../Pagination'

import './home.css'

import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'

const Home = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading, products } =
		globalContext.state
	const [recaps, setRecaps] = useState([])
	const [selectedMonth, setSelectedMonth] = useState(new Date())
	const [pageNumber, setPageNumber] = useState(1)
	const [pages, setPages] = useState(1)

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

	const getRecapTotalWeight = (total, product) => {
		return total + product.quantity
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
			productInRecap.length > 0 && console.log(productInRecap[0].quantity)
			productInRecap.length > 0 &&
				(totalWeightPerProduct += productInRecap[0].quantity)
		})
		return totalWeightPerProduct
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
					`${process.env.REACT_APP_API_URL}/api/orders/recaps/${selectedSession}?pageNumber=${pageNumber}`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setPageNumber(data.page)
				setPages(data.pages)
				setRecaps(data.sessionRecaps)
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
		getRecapsBySession()
	}, [dispatch, user.token, selectedMonth, pageNumber])

	return (
		<div className='flex column container recap'>
			{message && <Toaster message={message} type={messageType} />}
			<h1>Récapitulatifs</h1>
			<h2>pour le mois de :</h2>
			<div className='recapMonthSelect'>
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
			{loading && <Loader />}

			{recaps && recaps.length === 0 ? (
				<p style={{ textAlign: 'center' }}>
					Aucun Récap trouvé pour ce mois-ci
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
									<b>{getSessionTotalWeight()}</b>
								</td>
							</tr>
						</tbody>
					</table>
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
							</tr>
						</thead>
						<tbody>
							{recaps.map((recap) => {
								return (
									<tr key={recap._id}>
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
									</tr>
								)
							})}
						</tbody>
					</table>
				</>
			)}
			<Pagination
				pages={pages}
				pageNumber={pageNumber}
				setPageNumber={setPageNumber}
			/>
		</div>
	)
}

export default Home
