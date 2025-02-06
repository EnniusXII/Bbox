import mongoose from 'mongoose';

const greenCardSchema = new mongoose.Schema({
  referenceId: {type: String, required: true, unique: true}, 
  insured: {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  vehicle: {
    registrationNumber: { type: String, required: true },
    category: { type: String, required: true },
  },
  insurance:{ 
    companyName: { type: String, required: true },
  },
  validity: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  contriesCovered: { type: [String], required: true },
  hash: { type: String, required: true },
  fileId: { type: mongoose.Types.ObjectId, required: true },
  transactionHash: { type: String, default: null }
});

greenCardSchema.pre('save', function(next) {
  this.validity.from = formatDate(this.validity.from);
  this.validity.to = formatDate(this.validity.to);
  next();
})

function formatDate(date){
  return new Date(date.toISOString().split('T')[0]);
}

export default mongoose.model('GreenCard', greenCardSchema);