import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { store } from '../../store'
import axios from 'axios'
import EditAmap from './EditAmap'
import Toaster from '../Toaster'
import Loader from '../Loader/Loader'
import { BiEdit, BiTrash, BiAddToQueue } from 'react-icons/bi'
import './amaps.css'

const Amaps = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading } = globalContext.state
	const [amaps, setAmaps] = useState([])
	const [displayModal, setDisplayModal] = useState(false)
	const [amapToEdit, setAmapToEdit] = useState()

	const deleteAmap = async (id, name) => {
		if (
			window.confirm(
				`Es-tu sûr de vouloir supprimer les données de ${name} ?`
			)
		) {
			dispatch({ type: 'LOADING' })

			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.delete(
					`${process.env.REACT_APP_API_URL}/api/amaps/${id}`,
					config
				)
				console.log(data)
				dispatch({
					type: 'MESSAGE',
					payload: data.message,
					messageType: 'success',
				})
			} catch (error) {
				console.log(error)
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
	}

	const addAmap = () => {
		setDisplayModal(true)
		const amap = {
			_id: '',
			name: '',
			contact: {
				emails: [],
				tel: '',
				address: { street: '', city: '', postalCode: '' },
			},
			groupement: '',
		}
		setAmapToEdit(amap)
	}

	const editAmap = (amap) => {
		setDisplayModal(true)
		setAmapToEdit(amap)
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
						error.response && error.response.data.error
							? error.response.data.error
							: error.message,
					messageType: 'error',
				})
			}
		}
		getAmaps()
	}, [dispatch, user.token, message])

	return (
		<div className='flex column' style={{ flexGrow: '1' }}>
			{displayModal && (
				<EditAmap amap={amapToEdit} setDisplayModal={setDisplayModal} />
			)}
			{message && <Toaster message={message} type={messageType} />}
			{loading ? (
				<Loader />
			) : (
				amaps && (
					<table>
						<thead>
							<tr>
								<th>Groupement</th>
								<th>Nom</th>
								<th>Lieu</th>
								<th>Contacts</th>
								<th>Code d'accès</th>
								<th
									className='rowEnd'
									colSpan='2'
									style={{ padding: '0.3em' }}
								>
									<div
										className='action'
										onClick={() => addAmap()}
									>
										<BiAddToQueue />
										<p>Ajouter</p>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{amaps.map((amap) => {
								return (
									<tr key={amap._id}>
										<td>
											<b>{amap.groupement}</b>
										</td>
										<td>
											<b>{amap.name}</b>
										</td>
										<td>
											{amap.contact.address.street}
											<br />
											{
												amap.contact.address.postalCode
											}{' '}
											{amap.contact.address.city}
										</td>
										<td>
											{amap.contact.emails.map(
												(email) => {
													return (
														<div key={email._id}>
															<a
																href={`mailto:${email.email}`}
															>
																{email.email}
															</a>
															<br />
														</div>
													)
												}
											)}
										</td>
										<td>{amap.accessCode}</td>
										<td className='rowEnd'>
											<BiEdit
												className='action'
												onClick={() => {
													editAmap(amap)
												}}
											/>
										</td>
										<td className='rowEnd'>
											<BiTrash
												className='action'
												onClick={() => {
													deleteAmap(
														amap._id,
														amap.name
													)
												}}
											/>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				)
			)}
		</div>
	)
}

export default Amaps
