import User from '../models/UserSchema.mjs';
import DriversLicense from '../models/DriverLicenseSchema.mjs';

export const getUserInfo = async (req, res) => {
	try {
		console.log('🔐 req.user:', req.user);
		const userId = req.user.id;
		const user = await User.findById(userId);
		const license = await DriversLicense.findOne({ user: userId });

		if (!user) {
			return res.status(404).json({ message: 'User' });
		}

		const userInfo = {
			selfie: user.selfie || null,
			firstName: license?.firstName || '',
			lastName: license?.lastName || '',
			email: user.email,
			phoneNumber: user.phoneNumber || '',
			hasLicense: !!license,
		};

		res.json(userInfo);
	} catch (err) {
		console.error('❌ Error in getUserInfo:', err.message);
		res.status(500).json({ message: 'Server error in getUserInfo' });
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
