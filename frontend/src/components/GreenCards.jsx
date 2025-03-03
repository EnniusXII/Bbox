import React from 'react';

export const GreenCards = ({ greenCards = [] }) => {
	return (
		<div>
			<h2>Green Cards</h2>
			{greenCards.length > 0 ? (
				greenCards.map((card) => (
					<div className='card' key={card._id}>
						<p>Reference ID: {card.referenceId}</p>
						<p>Insured: {card.insured?.name}</p>
						<p>Address: {card.insured?.address}</p>
						<p>
							Registration Number:{' '}
							{card.vehicle?.registrationNumber}
						</p>
						<p>Category: {card.vehicle?.category}</p>
						<p>Company: {card.insurance?.companyName}</p>
						<p>
							Valid: {card.validity?.from} - {card.validity?.to}
						</p>
						<div>
							<p>Countries Covered:</p>
							{card.countriesCovered?.length > 0 ? (
								<ul>
									{card.countriesCovered?.map(
										(country, index) => (
											<li key={index}>
												{country || 'Unkown'}
											</li>
										)
									)}
								</ul>
							) : (
								<p>No countries listed.</p>
							)}
						</div>
					</div>
				))
			) : (
				<p>No Green Cards found.</p>
			)}
		</div>
	);
};
