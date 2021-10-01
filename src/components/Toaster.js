import React from 'react'
import './toaster.css'

const Toaster = ({ message, type = 'error' }) => {
	return (
		<div className={`toast ${type}`}>
			{type === 'error' ? (
				<h1>Oops</h1>
			) : type === 'success' ? (
				<h1>Yay !</h1>
			) : (
				<h1>Info</h1>
			)}
			<p>{message}</p>
		</div>
	)
}

export default Toaster
