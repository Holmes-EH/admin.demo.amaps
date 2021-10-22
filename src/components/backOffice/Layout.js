import { Switch, Route, Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { store } from '../../store'

import Home from './Home'
import Amaps from './amaps/Amaps'
import Products from './products/Products'
import Orders from './orders/Orders'
import Users from './users/Users'
import SingleClient from './users/SingleClient'
import Labels from './labels/Labels'
import Lemon from '../Lemon'
import { BiLogOut } from 'react-icons/bi'
import './layout.css'

const Layout = () => {
	const globalContext = useContext(store)
	const { dispatch } = globalContext
	const { user } = globalContext.state

	const disconnectUser = () => {
		localStorage.removeItem('juju2fruits_user')
		dispatch({ type: 'RESET_USER_LOGIN' })
	}

	const curUrl = useLocation().pathname

	return (
		<>
			<div
				style={{ position: 'fixed', top: '0', left: '0', zIndex: '20' }}
			>
				<nav>
					<ul>
						<li className='logoLink'>
							<Link to='/'>
								<Lemon />
							</Link>
							<div className='user'>
								<p>B'jour {user.name}</p>
								<div
									className='disconnect'
									onClick={disconnectUser}
								>
									<BiLogOut style={{ marginRight: '1em' }} />
									Déconnexion
								</div>
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
								<Link to='/clients'>Utilisateurs</Link>
							</li>
						</div>
					</ul>
				</nav>
			</div>
			<Switch>
				<Route path='/produits'>
					<Products />
				</Route>
				<Route path='/amaps'>
					<Amaps />
				</Route>
				<Route path='/etiquettes/:amap/:session'>
					<Labels />
				</Route>
				<Route path='/commandes'>
					<Orders />
				</Route>
				<Route path='/clients/:userId'>
					<SingleClient />
				</Route>
				<Route path='/clients'>
					<Users />
				</Route>
				<Route path='/'>
					<Home />
				</Route>
			</Switch>
		</>
	)
}

export default Layout
