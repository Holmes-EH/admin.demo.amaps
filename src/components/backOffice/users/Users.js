import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { store } from '../../../store'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

import Toaster from '../../Toaster'
import Loader from '../../Loader/Loader'
import Pagination from '../../Pagination'

import './users.css'

import {
	BiEdit,
	BiTrash,
	BiCheckCircle,
	BiMinusCircle,
	BiSearchAlt2,
	BiX,
} from 'react-icons/bi'

const Users = () => {
	const history = useHistory()
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user, message, messageType, loading } = globalContext.state
	const [users, setUsers] = useState([])
	const [tempKeyword, setTempKeyword] = useState('')
	const [keyword, setKeyword] = useState('')
	const [pageNumber, setPageNumber] = useState(1)
	const [pages, setPages] = useState(1)

	const search = (e) => {
		e.preventDefault()
		setKeyword(tempKeyword)
	}
	const resetSearch = (e) => {
		e.preventDefault()
		setTempKeyword('')
		setKeyword('')
	}

	const deleteUser = async (userToDelete) => {
		if (
			window.confirm(
				`Es-tu sûr de vouloir supprimer le profil de\n${userToDelete.name} et toutes ses commandes ?`
			)
		) {
			dispatch({ type: 'LOADING' })
			let newArrayOfUsers = users.filter((user) => {
				return user._id !== userToDelete._id
			})
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
				const { data } = await axios.delete(
					`${process.env.REACT_APP_API_URL}/api/users/${userToDelete._id}`,
					config
				)
				dispatch({
					type: 'MESSAGE',
					payload: data.message,
					messageType: 'success',
				})
				setUsers(newArrayOfUsers)
				dispatch({ type: 'FINISHED_LOADING' })
			} catch (error) {
				dispatch({
					type: 'MESSAGE',
					payload:
						error.response && error.response.data.error
							? error.response.data.error
							: error.message,
					messageType: 'error',
				})
				dispatch({ type: 'FINISHED_LOADING' })
			}
		}
	}

	useEffect(() => {
		dispatch({ type: 'LOADING' })
		const config = {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		}
		const getUsers = async () => {
			dispatch({ type: 'LOADING' })
			try {
				const { data } = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/users?keyword=${keyword}&pageNumber=${pageNumber}`,
					config
				)
				setPageNumber(data.page)
				setPages(data.pages)
				setUsers(data.users)
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
		getUsers()
	}, [dispatch, user.token, keyword, pageNumber])

	return (
		<div className='flex column container'>
			{message && <Toaster message={message} type={messageType} />}
			{loading ? (
				<Loader />
			) : (
				<>
					<div className='userSearch'>
						<form className='flex searchForm'>
							<button
								onClick={(e) => search(e)}
								className='searchButton'
							>
								<BiSearchAlt2 />
							</button>
							<input
								type='text'
								name='search'
								placeholder='Rechercher par nom'
								value={tempKeyword}
								onChange={(e) => setTempKeyword(e.target.value)}
								style={{ margin: 'auto', border: 'none' }}
							/>
							<button
								className='resetSearch'
								onClick={(e) => resetSearch(e)}
							>
								<BiX />
							</button>
						</form>
					</div>
					<h1>Utilisateurs</h1>
					<table>
						<thead>
							<tr>
								<th>Nom</th>
								<th>Email</th>
								<th>Groupement</th>
								<th>Amap</th>
								<th>Admin</th>
								<th>Date de création</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => {
								return (
									<tr key={user._id}>
										<td>{user.name}</td>
										<td>{user.email}</td>
										<td>
											{user.amap
												? user.amap.groupement
												: ''}
										</td>
										<td>
											{user.amap ? user.amap.name : ''}
										</td>
										<td
											className={
												user.isAdmin
													? 'available'
													: 'unavailable'
											}
											style={{
												textAlign: 'center',
												fontSize: '1.5em',
											}}
										>
											{user.isAdmin ? (
												<BiCheckCircle />
											) : (
												<BiMinusCircle />
											)}
										</td>
										<td>
											{new Date(
												user.createdAt
											).toLocaleDateString('fr-FR', {
												day: 'numeric',
												month: 'numeric',
												year: 'numeric',
											})}
										</td>
										<td className='rowEnd'>
											<BiEdit
												className='action'
												onClick={() => {
													history.push(
														`/clients/${user._id}`
													)
												}}
											/>
										</td>
										<td className='rowEnd'>
											<BiTrash
												className='action'
												onClick={() => {
													deleteUser(user)
												}}
											/>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
					<Pagination
						pages={pages}
						pageNumber={pageNumber}
						setPageNumber={setPageNumber}
					/>
				</>
			)}
		</div>
	)
}

export default Users
