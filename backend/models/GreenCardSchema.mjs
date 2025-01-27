import mongoose from 'mongoose';

const greenCardSchema = new mongoose.Schema({
  insured: {
    name: { type: String, required: true }, // Insured person's name
  },
  validity: {
    from: { type: Date, required: true }, // Validity start date
    to: { type: Date, required: true },   // Validity end date
  },
  hash: { type: String, required: true }, // Hash of the Green Card data
  fileId: { type: mongoose.Types.ObjectId, required: true }, // Reference to the PDF in GridFS
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