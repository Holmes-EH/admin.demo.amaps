import { useContext, useState } from 'react'
import { store } from '../../../store'
import Toaster from '../../Toaster'
import Loader from '../../Loader/Loader'
import EditProduct from './EditProduct'
import {
	BiEdit,
	BiAddToQueue,
	BiCheckCircle,
	BiMinusCircle,
} from 'react-icons/bi'

const Products = () => {
	const globalContext = useContext(store)
	const { message, messageType, loading, products } = globalContext.state
	const [displayModal, setDisplayModal] = useState(false)
	const [productToEdit, setProductToEdit] = useState()

	const addProduct = () => {
		setDisplayModal(true)
		const product = {
			_id: '',
			title: '',
			pricePerKg: 0,
			isAvailable: false,
			unitOnly: false,
		}
		setProductToEdit(product)
	}

	const editProduct = (index, product) => {
		product.index = index
		setProductToEdit(product)
		setDisplayModal(true)
	}

	return (
		<div className='flex column container'>
			<h1>Produits</h1>
			{displayModal && (
				<EditProduct
					product={productToEdit}
					setDisplayModal={setDisplayModal}
				/>
			)}
			{message && <Toaster message={message} type={messageType} />}
			{loading ? (
				<Loader />
			) : (
				products && (
					<table
						style={{
							minWidth: '780px',
							maxWidth: '1100px',
							margin: '0 auto',
						}}
					>
						<thead>
							<tr>
								<th>Fruit</th>
								<th>
									Prix au kg
									<br />
									<i>Ou à l'unité</i>
								</th>
								<th>Disponible</th>
								<th>Vendu à l'unité</th>
								<th
									className='rowEnd'
									colSpan='2'
									style={{ padding: '0.3em' }}
								>
									<div
										className='action'
										onClick={() => addProduct()}
									>
										<BiAddToQueue />
										<p>Ajouter</p>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product, index) => {
								return (
									<tr key={product._id}>
										<td>{product.title}</td>
										<td style={{ textAlign: 'center' }}>
											{product.pricePerKg}
										</td>
										<td
											className={
												product.isAvailable
													? 'available'
													: 'unavailable'
											}
											style={{
												textAlign: 'center',
												fontSize: '1.4em',
											}}
										>
											{product.isAvailable ? (
												<BiCheckCircle />
											) : (
												<BiMinusCircle />
											)}
										</td>
										<td
											className={
												product.unitOnly
													? 'available'
													: 'unavailable'
											}
											style={{
												textAlign: 'center',
												fontSize: '1.4em',
											}}
										>
											{product.unitOnly ? (
												<BiCheckCircle />
											) : (
												<BiMinusCircle />
											)}
										</td>
										<td className='rowEnd'>
											<BiEdit
												className='action'
												onClick={() => {
													editProduct(index, product)
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

export default Products
