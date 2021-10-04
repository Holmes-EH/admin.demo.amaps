import { Switch, Route, Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { store } from '../../store'
import Amaps from './Amaps'
import Lemon from '../Lemon'
import { BiLogOut } from 'react-icons/bi'
import './layout.css'

const Layout = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user } = globalContext.state

	const disconnectUser = () => {
		localStorage.removeItem('user')
		dispatch({ type: 'RESET_USER_LOGIN' })
	}

	const curUrl = useLocation().pathname

	return (
		<>
			<div
				style={{ position: 'fixed', top: '0', left: '0', zIndex: '11' }}
			>
				<nav>
					<ul>
						<li className='logoLink'>
							<Link to='/'>
								<Lemon />
							</Link>
							<p>B'jour {user.name}</p>
							<div
								className='disconnect'
								onClick={disconnectUser}
							>
								<BiLogOut style={{ marginRight: '1em' }} />
								Déconnexion
							</div>
						</li>
						<div
							className='flex'
							style={{
								justifyContent: 'space-between',
								margin: 'auto 4em auto auto',
								flexGrow: '1',
								maxWidth: '80ch',
							}}
						>
							<li
								className={
									curUrl === '/produits' ? 'active' : ''
								}
							>
								<Link to='/produits'>Produits</Link>
							</li>
							<li className={curUrl === '/amaps' ? 'active' : ''}>
								<Link to='/amaps'>Amaps</Link>
							</li>
							<li
								className={
									curUrl === '/commandes' ? 'active' : ''
								}
							>
								<Link to='/commandes'>Commandes</Link>
							</li>
							<li
								className={
									curUrl === '/clients' ? 'active' : ''
								}
							>
								<Link to='/clients'>Clients</Link>
							</li>
						</div>
					</ul>
				</nav>
			</div>
			<Switch>
				<Route path='/amaps'>
					<Amaps />
				</Route>
			</Switch>
		</>
	)
}

export default Layout
