const MessageModal = ({
	messageObject,
	setMessageObject,
	messageBody,
	setMessageBody,
	sendMessage,
	amapName,
	amapId,
	setDisplayMessageModal,
}) => {
	return (
		<div className='modal flex column'>
			<h1>Email à envoyer à {amapName}</h1>
			<form className='flex column' style={{ padding: '10px' }}>
				<div>
					<label htmlFor='object'>Objet :</label>
					<input
						type='text'
						name='object'
						value={messageObject}
						onChange={(e) => setMessageObject(e.target.value)}
						style={{ width: '100%' }}
					/>
				</div>
				<div>
					<label htmlFor='body'>Message :</label>
					<textarea
						cols='80'
						rows='20'
						name='body'
						value={messageBody}
						style={{ width: '100%' }}
						onChange={(e) => setMessageBody(e.target.value)}
					></textarea>
				</div>
			</form>
			<div
				className='flex'
				style={{ width: '100%', justifyContent: 'space-evenly' }}
			>
				<button
					className='button danger'
					onClick={() => setDisplayMessageModal(false)}
				>
					ANNULER
				</button>
				<button className='button' onClick={() => sendMessage(amapId)}>
					ENVOYER
				</button>
			</div>
		</div>
	)
}

export default MessageModal
