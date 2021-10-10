import { useContext } from 'react'
import { store } from '../../store'

import Toaster from '../Toaster'
import Loader from '../Loader/Loader'

const Home = () => {
	const globalContext = useContext(store)

	const { message, messageType, loading } = globalContext.state

	return (
		<div className='flex column container'>
			{message && <Toaster message={message} type={messageType} />}
			{loading && <Loader />}
		</div>
	)
}

export default Home
