import { useState } from 'react';
import {
	createGreenCard,
	confirmGreenCard,
} from '../services/BlockchainServices';
import { toast } from 'react-toastify';
import '../styles/CreateGreenCard.css';

const CreateGreenCard = () => {
	const [formData, setFormData] = useState({
		insured: { name: '', address: '' },
		vehicle: { registrationNumber: '', category: '' },
		insurance: { companyName: '' },
		validity: { from: '', to: '' },
		countriesCovered: [],
	});

	const [referenceId, setReferenceId] = useState(null);
	const [newCountry, setNewCountry] = useState('');
	const [hash, setHash] = useState(null);
	const [created, setCreated] = useState(false);
	const [confirming, setConfirming] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === 'countriesCovered') {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		} else {
			const keys = name.split('.');
			setFormData((prev) => {
				let updatedForm = { ...prev };
				let ref = updatedForm;

				for (let i = 0; i < keys.length - 1; i++) {
					ref = ref[keys[i]];
				}

				ref[keys[keys.length - 1]] = value;
				return { ...updatedForm };
			});
		}
	};

	const handleAddCountry = (e) => {
		if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
			e.preventDefault();

			if (!newCountry.trim()) {
				toast.error('Country name cannot be empty.');
				return;
			}

			if (formData.countriesCovered.includes(newCountry.trim())) {
				toast.error('Country already added.');
				return;
			}

			setFormData((prev) => ({
				...prev,
				countriesCovered: [...prev.countriesCovered, newCountry.trim()],
			}));

			setNewCountry('');
		}
	};

	const handleRemoveCountry = (index) => {
		setFormData((prev) => ({
			...prev,
			countriesCovered: prev.countriesCovered.filter(
				(_, i) => i !== index
			),
		}));
	};

	const handleCreateGreenCard = async () => {
		try {
			const formattedData = {
				insured: {
					name: formData.insured.name,
					address: formData.insured.address,
				},
				vehicle: {
					registrationNumber: formData.vehicle.registrationNumber,
					category: formData.vehicle.category,
				},
				insurance: {
					companyName: formData.insurance.companyName,
				},
				validity: {
					from: formData.validity.from.split('T')[0],
					to: formData.validity.to.split('T')[0],
				},
				countriesCovered: formData.countriesCovered,
			};

			const response = await createGreenCard(formattedData);
			setReferenceId(response.referenceId);
			setHash(response.hash);
			setCreated(true);
			toast.success('Green Card created successfully!');
		} catch (error) {
			toast.error('Failed to create Green Card.');
			console.error('Error:', error);
		}
	};

	const handleConfirmGreenCard = async () => {
		if (!referenceId || !hash) {
			toast.error('Reference ID and hash are missing.');
			return;
		}

		try {
			setConfirming(true);
			const txHash = await confirmGreenCard(referenceId, hash);
			toast.success(`Green Card confirmed! TX: ${txHash}`);
		} catch (error) {
			toast.error('Failed to confirm Green Card.');
			console.error('Error:', error);
		} finally {
			setConfirming(false);
			setConfirmed(true);
		}
	};

	return (
		<div className='green-card-container'>
			<h2>Create Green Card</h2>

			{!created ? (
				<>
					<div className='form-container'>
						<div className='insured-control'>
							<div className='form-control'>
								<label htmlFor='insured.name'>Name: </label>
								<input
									type='text'
									name='insured.name'
									value={formData.insured.name}
									onChange={handleChange}
									placeholder='Insured Name'
								/>
							</div>
							<div className='form-control'>
								<label htmlFor='insured.address'>
									Address:{' '}
								</label>
								<input
									type='text'
									name='insured.address'
									value={formData.insured.address}
									onChange={handleChange}
									placeholder='Insured Address'
								/>
							</div>
						</div>

						<div className='vehicle-control'>
							<div className='form-control'>
								<label htmlFor='vehicle.registrationNumber'>
									Registration Number:{' '}
								</label>
								<input
									type='text'
									name='vehicle.registrationNumber'
									value={formData.vehicle.registrationNumber}
									onChange={handleChange}
									placeholder='Registration Number'
								/>
							</div>
							<div className='form-control'>
								<label htmlFor='vehicle.category'>
									Vehicle Category:{' '}
								</label>
								<input
									type='text'
									name='vehicle.category'
									value={formData.vehicle.category}
									onChange={handleChange}
									placeholder='Vehicle Category'
								/>
							</div>
						</div>

						<div className='insurance-control'>
							<div className='form-control'>
								<label htmlFor='insurance.companyName'>
									Insurance Company:{' '}
								</label>
								<input
									type='text'
									name='insurance.companyName'
									value={formData.insurance.companyName}
									onChange={handleChange}
									placeholder='Insurance Company'
								/>
							</div>
						</div>

						<div className='validity-control'>
							<div className='form-control'>
								<label htmlFor='validity.from'>
									Valid From:{' '}
								</label>
								<input
									type='date'
									name='validity.from'
									value={formData.validity.from}
									onChange={handleChange}
								/>
							</div>
							<div className='form-control'>
								<label htmlFor='insured.name'>Valid To: </label>
								<input
									type='date'
									name='validity.to'
									value={formData.validity.to}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className='countries-control'>
							<div className='form-control'>
								<label>Countries Covered:</label>
								<input
									type='text'
									value={newCountry}
									onChange={(e) =>
										setNewCountry(e.target.value)
									}
									onKeyDown={handleAddCountry}
									placeholder='Add a country'
								/>
							</div>
							<button
								className='country-btn'
								onClick={handleAddCountry}
							>
								Add Country
							</button>
						</div>

						<div className='countries-covered'>
							{formData.countriesCovered.length > 0 && (
								<ul>
									{formData.countriesCovered.map(
										(country, index) => (
											<li
												key={index}
												className='covered-list'
												style={{
													display: 'flex',
													alignItems: 'center',
												}}
											>
												<button
													className='covered-btn'
													onClick={() =>
														handleRemoveCountry(
															index
														)
													}
												>
													<p>{country}</p>
													<p>❌</p>
												</button>
											</li>
										)
									)}
								</ul>
							)}
						</div>

						<button onClick={handleCreateGreenCard}>
							Create Green Card
						</button>
					</div>
				</>
			) : (
				<div>
					<h3>Green Card Created!</h3>
					<p>
						<strong>Reference ID:</strong> {referenceId}
					</p>
					<p>
						<strong>Hash:</strong> {hash}
					</p>
					<button
						onClick={handleConfirmGreenCard}
						disabled={confirming}
					>
						{confirming
							? 'Confirming...'
							: 'Confirm & Store on Blockchain'}
					</button>
				</div>
			)}
		</div>
	);
};

export default CreateGreenCard;
