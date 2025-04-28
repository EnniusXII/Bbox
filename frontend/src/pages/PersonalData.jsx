import React, { useState } from 'react';

export const PersonalData = () => {
	const [visibleForm, setVisibleForm] = useState(null);
	const [formData, setFormData] = useState({
        registerExtract: {
			personalNumber: '',
			gender: '',
			birthPlace: '',
			swedishCitizen: false,
			firstName: '',
			lastName: '',
			address: '',
			postalCode: '',
			city: '',
			registeredPartner: false,
            partnerName: '',
			propertyName: '',
			propertyType: '',
			estimatedValue: '',
			location: '',
		},
	});

	const toggleForm = (formName) => {
		setVisibleForm(visibleForm === formName ? null : formName);
	};

	const handleInputChange = (e, category) => {
		const { name, value, type, checked } = e.target;

		setFormData({
			...formData,
			[category]: {
				...formData[category],
				[name]: type === 'checkbox' ? checked : value,
			},
		});
	};

	return (
		<div className='container flex flex-column'>
			<h1 className='pageheader'>Add Personal Data</h1>

            <button onClick={() => toggleForm('registerExtract')}>Registerutdrag</button>

			{visibleForm === 'registerExtract' && (
                <>
                <button>Hämta data</button>
				<form className='forms'>
					<label>Personnummer:</label>
					<input type='text' name='personalNumber' value={formData.registerExtract.personalNumber} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Kön:</label>
					<input type='text' name='gender' value={formData.registerExtract.gender} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Födelseort:</label>
					<input type='text' name='birthPlace' value={formData.registerExtract.birthPlace} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>
						<input type='checkbox' name='swedishCitizen' checked={formData.registerExtract.swedishCitizen} onChange={(e) => handleInputChange(e, 'registerExtract')} />
						Svensk Medborgare
					</label>

					<label>Förnamn:</label>
					<input type='text' name='firstName' value={formData.registerExtract.firstName} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Efternamn:</label>
					<input type='text' name='lastName' value={formData.registerExtract.lastName} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Adress:</label>
					<input type='text' name='address' value={formData.registerExtract.address} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Postnummer:</label>
					<input type='text' name='postalCode' value={formData.registerExtract.postalCode} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Postort:</label>
					<input type='text' name='city' value={formData.registerExtract.city} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>
						<input type='checkbox' name='registeredPartner' checked={formData.registerExtract.registeredPartner} onChange={(e) => handleInputChange(e, 'registerExtract')} />
						Registrerad Partner
					</label>

                    <label>Namn:</label>
					<input type='text' name='partnerName' value={formData.registerExtract.partnerName} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Fastighet:</label>
					<input type='text' name='propertyName' value={formData.registerExtract.propertyName} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Typ av fastighet:</label>
					<input type='text' name='propertyType' value={formData.registerExtract.propertyType} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Taxeringsvärde:</label>
					<input type='number' name='estimatedValue' value={formData.registerExtract.estimatedValue} onChange={(e) => handleInputChange(e, 'registerExtract')} />

					<label>Belägenhet:</label>
					<input type='text' name='location' value={formData.registerExtract.location} onChange={(e) => handleInputChange(e, 'registerExtract')} />
				</form>
                </>
			)}
		</div>
	);
};
