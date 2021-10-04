import { useState } from 'react'
import { useContext } from 'react'
import { store } from '../../store'
import axios from 'axios'
import './editAmap.css'

const EditAmap = ({ amap, setDisplayModal, amaps, setAmaps }) => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user } = globalContext.state

	const [id] = useState(amap._id)
	const [groupement, setGroupement] = useState(amap.groupement)
	const [name, setName] = useState(amap.name)
	const [street, setStreet] = useState(amap.contact.address.street)
	const [city, setCity] = useState(amap.contact.address.city)
	const [postalCode, setPostalCode] = useState(
		amap.contact.address.postalCode
	)
	const [tel, setTel] = useState(amap.contact.tel)
	const [emails, setEmails] = useState(
		JSON.parse(JSON.stringify(amap.contact.emails))
	)

	const addEmailAddress = () => {
		setEmails([...emails, { email: '' }])
	}
	const handleEmailChange = (emailValue, index) => {
		let newEmailArray = [...emails]
		newEmailArray[index]['email'] = emailValue
		setEmails(newEmailArray)
	}
	const saveAmap = async () => {
		dispatch({ type: 'LOADING' })
		const config = {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		}
		if (id.length) {
			try {
				const { data } = await axios.put(
					`${process.env.REACT_APP_API_URL}/api/amaps`,
					{
						id,
						name,
						contact: {
							emails,
							tel,
							address: {
								street,
								city,
								postalCode,
							},
						},
						groupement,
					},
					config
				)
				setDisplayModal(false)
				dispatch({
					type: 'MESSAGE',
					payload: 'Amap mise à jour avec succès !',
					messageType: 'success',
				})
				dispatch({ type: 'FINISHED_LOADING' })
				let newArrayOfAmaps = amaps.filter((amap) => {
					return amap._id !== data._id
				})
				newArrayOfAmaps.push(data)
				setAmaps(newArrayOfAmaps)
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
		} else {
			try {
				const { data } = await axios.post(
					`${process.env.REACT_APP_API_URL}/api/amaps`,
					{
						id,
						name,
						contact: {
							emails,
							tel,
							address: {
								street,
								city,
								postalCode,
							},
						},
						groupement,
					},
					config
				)
				setDisplayModal(false)
				dispatch({
					type: 'MESSAGE',
					payload: 'Amap créée avec succès !',
					messageType: 'success',
				})
				dispatch({ type: 'FINISHED_LOADING' })
				setAmaps([...amaps, data])
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

	return (
		<>
			<div className='modal flex column'>
				<form>
					<div className='field'>
						<input
							type='text'
							name='groupement'
							className='input'
							value={groupement}
							autoComplete='off'
							onChange={(e) => setGroupement(e.target.value)}
						/>
						<label htmlFor='groupement' className='label'>
							Groupement
						</label>
					</div>
					<div className='field'>
						<input
							type='text'
							name='name'
							className='input'
							value={name}
							autoComplete='off'
							onChange={(e) => setName(e.target.value)}
						/>
						<label htmlFor='name' className='label'>
							Nom de l'Amap
						</label>
					</div>
					<br />
					<h3>Adresse</h3>
					<div className='field'>
						<input
							type='text'
							name='rue'
							className='input'
							value={street}
							autoComplete='off'
							onChange={(e) => setStreet(e.target.value)}
						/>
						<label htmlFor='rue' className='label'>
							N° et rue
						</label>
					</div>
					<div className='field'>
						<input
							type='string'
							name='codePostal'
							className='input'
							value={postalCode}
							autoComplete='off'
							onChange={(e) => setPostalCode(e.target.value)}
						/>
						<label htmlFor='codePostal' className='label'>
							Code postal
						</label>
					</div>
					<div className='field'>
						<input
							type='text'
							name='city'
							className='input'
							value={city}
							autoComplete='off'
							onChange={(e) => setCity(e.target.value)}
						/>
						<label htmlFor='city' className='label'>
							Ville
						</label>
					</div>
					<br />
					<h3>Contacts</h3>
					<div className='field'>
						<input
							type='tel'
							name='tel'
							className='input'
							value={tel}
							autoComplete='off'
							onChange={(e) => setTel(e.target.value)}
						/>
						<label htmlFor='city' className='label'>
							N° de téléphone
						</label>
					</div>
					<div className='action' onClick={addEmailAddress}>
						Ajouter une adresse mail
					</div>
					{emails.length > 0 &&
						emails.map((email, index) => {
							return (
								<div key={index} className='field'>
									<input
										type='email'
										name='email'
										className='input'
										value={email.email}
										autoComplete='off'
										onChange={(e) =>
											handleEmailChange(
												e.target.value,
												index
											)
										}
									/>
									<label htmlFor='email' className='label'>
										Email n° {index + 1}
									</label>
								</div>
							)
						})}
				</form>
				<div
					className='flex'
					style={{ width: '100%', justifyContent: 'space-evenly' }}
				>
					<button
						className='button danger'
						style={{ border: 'none' }}
						onClick={() => setDisplayModal(false)}
					>
						ANNULER
					</button>
					<button className='button' onClick={() => saveAmap()}>
						ENREGISTRER
					</button>
				</div>
			</div>
		</>
	)
}

export default EditAmap
