import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'

import './pagination.css'

const Pagination = ({ pages, pageNumber, setPageNumber }) => {
	const castPagesToArray = (pages) => {
		let array = []
		for (let index = 0; index < pages; index++) {
			array.push(index + 1)
		}
		return array
	}

	const chevronClickHandler = (direction) => {
		switch (direction) {
			case 'up':
				if (pageNumber < pages) {
					setPageNumber(pageNumber + 1)
				}
				break
			case 'down':
				if (pageNumber > 1) {
					setPageNumber(pageNumber - 1)
				}
				break
			default:
				break
		}
	}

	return (
		pages > 1 && (
			<div className='pagination'>
				<BiChevronLeft
					className='changePage'
					onClick={() => chevronClickHandler('down')}
				/>
				{castPagesToArray(pages).map((pageIndex) => {
					return (
						<div
							key={`page-${pageIndex + 1}`}
							onClick={() => setPageNumber(pageIndex)}
							className={pageIndex === pageNumber ? 'active' : ''}
						>
							{pageIndex}
						</div>
					)
				})}
				<BiChevronRight
					className='changePage'
					onClick={() => chevronClickHandler('up')}
				/>
			</div>
		)
	)
}

export default Pagination
