import User from '../models/UserSchema.mjs';
import DriversLicense from '../models/DriverLicenseSchema.mjs';

export const getUserInfo = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		const license = await DriversLicense.findOne({ user: userId });

		if (!user || !license) {
			return res
				.status(404)
				.json({ message: 'User or license data was not found.' });
		}

		const userInfo = {
			selfie: user.selfie || null,
			firstName: license.firstName,
			lastName: license.lastName,
			email: user.email,
			phoneNumber: user.phoneNumber || '',
		};

		res.json(userInfo);
	} catch (err) {
		console.error('Error fetching user info: ', err);
		res.status(500).json({ message: 'Server error.' });
	}
};

export const updateUserInfo = async (req, res) => {
	const { phoneNumber, selfie } = req.body;

	try {
		const userId = req.user.id;

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ phoneNumber, selfie },
			{ new: true }
		);

		res.json({
			message: 'User info updated successfully',
			phoneNumber: updatedUser.phoneNumber,
			selfie: updatedUser.selfie,
		});
	} catch (err) {
		res.status(500).json({ message: 'Error updating user information.' });
	}
};
