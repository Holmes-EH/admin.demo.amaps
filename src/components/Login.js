import { useContext, useState } from 'react'
import axios from 'axios'
import { store } from '../store'
import Loader from './Loader/Loader'
import Lemon from './Lemon'
import Toaster from './Toaster'
import './login.css'

const Login = () => {
	const globalState = useContext(store)
	const { dispatch } = globalState
	const { error } = globalState.state

	const [loading, setIsLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const inputChange = (e) => {
		switch (e.target.name) {
			case 'email':
				setEmail(e.target.value)
				break
			case 'password':
				setPassword(e.target.value)
				break
			default:
				break
		}
	}

	const login = async () => {
		setIsLoading(true)
		try {
			const { data } = await axios.post(
				'https://api-juju2fruits.netlify.app/api/users/login',
				{ email, password }
			)
			localStorage.setItem('user', JSON.stringify(data))
			dispatch({ type: 'USER_LOGIN', payload: data })
		} catch (error) {
			dispatch({
				type: 'ERROR',
				payload:
					error.response && error.response.data.message
						? error.response.data.message
						: error.message,
			})
		}
	}

	const onKeyUp = (e) => {
		if (
			e.key === 'Enter' &&
			!e.shiftKey &&
			email.length > 0 &&
			password.length > 0
		) {
			login()
		}
	}

	return (
		<div className='flex login'>
			{error && <Toaster message={error} type='error' />}
			{loading ? (
				<Loader />
			) : (
				<>
					<div className='logo'>
						<Lemon />
					</div>

					<h2>BACK OFFICE</h2>
					<form onKeyPress={onKeyUp}>
						<div className='field'>
							<input
								type='email'
								name='email'
								className='input'
								placeholder=''
								autoComplete='off'
								onChange={(e) => inputChange(e)}
							/>
							<label htmlFor='email' className='label'>
								Email
							</label>
						</div>
						<div className='field'>
							<input
								type='password'
								name='password'
								className='input'
								placeholder=''
								onChange={(e) => inputChange(e)}
							/>
							<label htmlFor='password' className='label'>
								Mot de Passe
							</label>
						</div>
					</form>
					<div className='flex'>
						<button className='button' onClick={() => login()}>
							CONNEXION
						</button>
					</div>
				</>
			)}
		</div>
	)
}

export default Login
