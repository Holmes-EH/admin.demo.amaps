import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { useContext } from 'react'
import { store } from '../../store'
import Amaps from './Amaps'
import Lemon from '../Lemon'
import './layout.css'

const Layout = () => {
	const globalContext = useContext(store)
	const { user } = globalContext.state
	return (
		<Router>
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
							<li>
								<Link to='/produits'>Produits</Link>
							</li>
							<li>
								<Link to='/amaps'>Amaps</Link>
							</li>
							<li>
								<Link to='/commandes'>Commandes</Link>
							</li>
							<li>
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
		</Router>
	)
}

export default Layout
