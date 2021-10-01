import { useState } from 'react'
import axios from 'axios'
import Lemon from './Lemon'
import './login.css'

const Login = () => {
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
		const config = {
			headers: {
				'Content-Type': 'application/json',
			},
		}
		const { data } = await axios.post(
			'https://api-juju2fruits.netlify.app/api/users/login',
			{ email, password },
			config
		)
		console.log(data)
	}

	return (
		<div className='flex login'>
			<div className='logo'>
				<Lemon />
			</div>

			<h2>BACK OFFICE</h2>
			<form>
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
		</div>
	)
}

export default Login
