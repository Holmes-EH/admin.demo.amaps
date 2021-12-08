import Lemon from '../Lemon'
import './loader.css'

const Loader = () => {
	return (
		<div
			className='flex'
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
				height: '100%',
			}}
		>
			<div className='loading'>
				<Lemon />
			</div>
		</div>
	)
}

export default Loader
