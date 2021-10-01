import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { StateProvider } from './store'

ReactDOM.render(
	<StateProvider>
		<App />
	</StateProvider>,
	document.getElementById('root')
)
