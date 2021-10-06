import { useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'
import './editProduct.css'

const EditProduct = ({ product, setDisplayModal, products, setProducts }) => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user } = globalContext.state

	const [id] = useState(product._id)
	const [title, setTitle] = useState(product.title)
	const [pricePerKg, setpricePerKg] = useState(product.pricePerKg)
	const [isAvailable, setisAvailable] = useState(product.isAvailable)

	const saveProduct = async () => {
		dispatch({ type: 'LOADING' })
		const config = {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		}
		if (id.length > 0) {
			try {
				const { data } = await axios.put(
					`${process.env.REACT_APP_API_URL}/api/products`,
					{
						id,
						title,
						pricePerKg,
						isAvailable,
					},
					config
				)
				setDisplayModal(false)
				dispatch({
					type: 'MESSAGE',
					payload: 'Produit mis à jour avec succès !',
					messageType: 'success',
				})
				dispatch({ type: 'FINISHED_LOADING' })
				let newArrayofProducts = products.filter((product) => {
					return product._id !== data._id
				})
				newArrayofProducts.unshift(data)
				setProducts(newArrayofProducts)
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
					`${process.env.REACT_APP_API_URL}/api/products`,
					{
						id,
						title,
						pricePerKg,
						isAvailable,
					},
					config
				)
				setDisplayModal(false)
				dispatch({
					type: 'MESSAGE',
					payload: 'Produit créé avec succès !',
					messageType: 'success',
				})
				dispatch({ type: 'FINISHED_LOADING' })
				setProducts([data, ...products])
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
			<div className='modal flex column product'>
				<h1>{id.length > 0 ? 'Modifier' : 'Ajouter'}</h1>
				<form>
					<div className='field'>
						<input
							type='text'
							name='title'
							className='input'
							value={title}
							autoComplete='off'
							onChange={(e) => setTitle(e.target.value)}
						/>
						<label htmlFor='groupement' className='label'>
							Titre
						</label>
					</div>
					<div className='field'>
						<input
							type='number'
							step='0.1'
							name='pricePerKg'
							className='input'
							value={pricePerKg}
							autoComplete='off'
							onChange={(e) => setpricePerKg(e.target.value)}
						/>
						<label htmlFor='name' className='label'>
							Prix au Kg
						</label>
					</div>
					<br />
					<div className='field'>
						<input
							type='checkbox'
							name='isAvailable'
							className='input'
							checked={isAvailable}
							onChange={(e) => setisAvailable(!isAvailable)}
						/>
						<label htmlFor='rue' className='label'>
							Disponible
						</label>
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
						onClick={() => setDisplayModal(false)}
					>
						ANNULER
					</button>
					<button className='button' onClick={() => saveProduct()}>
						ENREGISTRER
					</button>
				</div>
			</div>
		</>
	)
}

export default EditProduct
