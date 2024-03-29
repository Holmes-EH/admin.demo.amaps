import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

import Toaster from '../../Toaster'
import Loader from '../../Loader/Loader'

const SingleClient = () => {
	const history = useNavigate()
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading } = globalContext.state
	const [currentUser, setCurrentUser] = useState({
		name: '',
		email: '',
		amap: '',
		isAdmin: false,
	})
	const [amaps, setAmaps] = useState([])
	const { userId } = useParams()
	const setValue = (field, value) => {
		let newUserData = { ...currentUser }
		switch (field) {
			case 'name':
				newUserData.name = value
				setCurrentUser(newUserData)
				break
			case 'email':
				newUserData.email = value
				setCurrentUser(newUserData)
				break
			case 'amap':
				newUserData.amap = value
				setCurrentUser(newUserData)
				break
			case 'isAdmin':
				newUserData.isAdmin = !newUserData.isAdmin
				setCurrentUser(newUserData)
				break
			default:
				break
		}
	}

	const saveUser = async () => {
		dispatch({ type: 'LOADING' })
		const config = {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		}
		try {
			await axios.put(
				`${process.env.REACT_APP_API_URL}/api/users`,
				{
					_id: currentUser._id,
					name: currentUser.name,
					email: currentUser.email,
					amap: currentUser.amap,
					isAdmin: currentUser.isAdmin,
				},
				config
			)

			dispatch({
				type: 'MESSAGE',
				payload: 'Utilisateur mis à jour avec succès !',
				messageType: 'success',
			})
			dispatch({ type: 'FINISHED_LOADING' })
			history.goBack()
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
		const getUser = async () => {
			dispatch({ type: 'LOADING' })
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/users/${userId}`,
					config
				)
				dispatch({ type: 'FINISHED_LOADING' })
				setCurrentUser(data)
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
		getUser()
		getAmaps()
	}, [dispatch, user.token, userId])

	return (
		<div className='flex column container'>
			{message && <Toaster message={message} type={messageType} />}
			{loading ? (
				<Loader />
			) : (
				<>
					<h1>Client</h1>
					<form
						style={{
							minWidth: '310px',
							margin: '0 auto',
						}}
					>
						<div className='field'>
							<input
								type='text'
								name='name'
								className='input'
								value={currentUser.name}
								autoComplete='off'
								onChange={(e) =>
									setValue(e.target.name, e.target.value)
								}
							/>
							<label htmlFor='name' className='label'>
								Nom
							</label>
						</div>
						<div className='field'>
							<input
								type='text'
								name='email'
								className='input'
								value={currentUser.email}
								autoComplete='off'
								onChange={(e) =>
									setValue(e.target.name, e.target.value)
								}
							/>
							<label htmlFor='email' className='label'>
								Email
							</label>
						</div>
						<div className='field noBorder'>
							<select
								name='amap'
								style={{
									margin: 'auto',
									border: 'none',
									display: 'block',
								}}
								value={currentUser.amap}
								onChange={(e) =>
									setValue(e.target.name, e.target.value)
								}
							>
								{amaps.map((amap) => {
									return (
										<option value={amap._id} key={amap._id}>
											{amap.name}
										</option>
									)
								})}
							</select>
						</div>
						<div className='field noBorder'>
							<label htmlFor='isAdmin' className='label'>
								Administrateur du site
							</label>
							<input
								type='checkbox'
								name='isAdmin'
								className='input bigCheckbox'
								checked={currentUser.isAdmin}
								onChange={(e) =>
									setValue(e.target.name, e.target.value)
								}
							/>
						</div>
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
							onClick={() => history.goBack()}
						>
							ANNULER
						</button>
						<button className='button' onClick={() => saveUser()}>
							ENREGISTRER
						</button>
					</div>
				</>
			)}
		</div>
	)
}

export default SingleClient
