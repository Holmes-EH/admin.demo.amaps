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
	const { message, loading, messageType } = globalState.state

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
		dispatch({
			type: 'LOADING',
		})
		try {
			const { data } = await axios.post(
				`${process.env.REACT_APP_API_URL}/api/users/login`,
				{ email, password }
			)
			localStorage.setItem('user', JSON.stringify(data))
			dispatch({ type: 'USER_LOGIN', payload: data })
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

	const validateOnEnter = (e) => {
		if (
			e.key === 'Enter' &&
			!e.shiftKey &&
			email.length > 0 &&
			password.length > 0
		) {
			login()
		}
	}

	const resetPassword = () => {
		console.log('reset password')
	}

	return (
		<div className='flex login'>
			{message && <Toaster message={message} type={messageType} />}
			{loading ? (
				<Loader />
			) : (
				<>
					<div className='logo'>
						<Lemon />
					</div>

					<h2>BACK OFFICE</h2>
					<form onKeyPress={validateOnEnter}>
						<div className='field'>
							<input
								type='email'
								name='email'
								className='input'
								placeholder=''
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
					<p
						className='forgotPassword'
						onClick={() => resetPassword()}
					>
						Mot de passe oublié ?
					</p>
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
